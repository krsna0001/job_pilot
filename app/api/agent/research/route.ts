import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Stagehand } from "@browserbasehq/stagehand";
import Browserbase from "@browserbasehq/sdk";
import OpenAI from "openai";
import { z } from "zod";
import { capture } from "@/lib/posthog";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key",
});

const browserbase = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY || "dummy_key",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { savedJobId, jobId } = body;

    const idToUse = savedJobId || jobId;

    if (!idToUse) {
      return NextResponse.json({ error: "jobId or savedJobId is required" }, { status: 400 });
    }

    const insforge = await createInsforgeServer();
    const { data: userData, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = userData.user.id;

    // 1. Load job data from DB
    const { data: job, error: jobError } = await insforge.database
      .from("saved_jobs")
      .select("*")
      .eq("id", idToUse)
      .eq("user_id", userId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found in saved_jobs" }, { status: 404 });
    }

    // 2. Load user profile from DB
    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 3. Derive company homepage URL
    const jobData = job.job_data as any;
    const companyName = jobData.company?.display_name || "Unknown Company";
    const redirectUrl = jobData.redirect_url || jobData.url || "";
    const jobDescription = jobData.description || "";
    const skillsBreakdown = job.skills_breakdown || {};

    let rootDomain = "";
    let finalUrl = "";

    try {
      if (redirectUrl) {
        // Resolve redirect using Browserbase Fetch API instead of standard fetch
        const fetchRes = await fetch(redirectUrl, { redirect: "follow" }); // fallback
        const realUrl = fetchRes.url;
        const parsedUrl = new URL(realUrl);
        // Strip subdomains if possible
        const parts = parsedUrl.hostname.split(".");
        rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : parsedUrl.hostname;
        finalUrl = `https://${rootDomain}`;
        
        if (realUrl.includes("adzuna.com")) {
          finalUrl = `https://www.${companyName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}.com`;
        }
      } else {
        finalUrl = `https://www.${companyName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}.com`;
      }
    } catch (err) {
      finalUrl = `https://www.${companyName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}.com`;
    }

    // 4. Open Single Browserbase Session with Stagehand
    const stagehandData = {
      homepage: null as any,
      subPages: [] as any[]
    };

    let browserSuccess = false;

    if (process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID) {
      try {
        const stagehand = new Stagehand({
          env: "BROWSERBASE",
          apiKey: process.env.BROWSERBASE_API_KEY,
          projectId: process.env.BROWSERBASE_PROJECT_ID,
        });

        const sh = stagehand as any;
        await sh.init();
        await sh.page.goto(finalUrl, { waitUntil: "domcontentloaded" });

        const homepageResult = (await sh.extract({
          instruction: "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
          schema: z.object({
            oneLiner: z.string().describe("What the company does in one sentence"),
            productSummary: z.string().describe("What they build/sell and who it's for"),
            signals: z.array(z.string()).describe("Funding, notable customers, scale, mission, recent news"),
            pageLinks: z.array(
              z.object({
                url: z.string(),
                kind: z.enum(["about", "careers", "blog", "engineering", "product", "team", "other"]),
              })
            ).describe("Internal links to research the company"),
          }),
        })) as any;

        stagehandData.homepage = homepageResult;

        if (homepageResult.oneLiner && homepageResult.productSummary) {
          browserSuccess = true;
          // Sub-page extraction (max 3 pages - prefer about/blog/engineering/product over careers)
          const priorityKinds = ["about", "engineering", "product", "blog", "team", "careers", "other"];
          
          const linksToVisit = (homepageResult.pageLinks || [])
            .sort((a: any, b: any) => priorityKinds.indexOf(a.kind) - priorityKinds.indexOf(b.kind))
            .slice(0, 3);

          for (const link of linksToVisit) {
            try {
              await sh.page.goto(link.url, { waitUntil: "domcontentloaded" });
              const pageResult = (await sh.extract({
                instruction: "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
                schema: z.object({
                  keyPoints: z.array(z.string()),
                  technologies: z.array(z.string()).describe("Specific languages, frameworks, tools, platforms"),
                  valuesOrCulture: z.array(z.string()).describe("Stated values, working style, team norms"),
                  notable: z.array(z.string()).describe("Customers, funding, scale, projects, awards"),
                }),
              })) as any;
              stagehandData.subPages.push({ url: link.url, ...pageResult });
            } catch (err) {
              console.error(`Failed to extract sub-page ${link.url}`, err);
            }
          }
        }

        await sh.close();
      } catch (err) {
        console.error("Stagehand extraction failed:", err);
      }
    }

    // 5. GPT-4o synthesis
    const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role.
You are given (a) research collected from the company's own website, (b) the job posting,
and (c) the candidate's profile. Produce a concise, concrete briefing that gives this
specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent
funding, customers, headcount, or facts. If research was thin, infer carefully from
the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this
company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly
and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind
of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this schema exactly:
{
  "companyOverview": "string",
  "techStack": ["string"],
  "culture": ["string"],
  "whyThisRole": "string",
  "yourEdge": ["string"],
  "gapsToAddress": ["string"],
  "smartQuestions": ["string"],
  "interviewPrep": ["string"],
  "sources": ["string"]
}`;

    const userPrompt = `Data Sources:
1. Company Research: ${browserSuccess ? JSON.stringify(stagehandData) : "Research failed/empty, rely on job description."}
2. Job Posting: Company Name: ${companyName}\nDescription: ${jobDescription}\nSkills required: ${JSON.stringify(skillsBreakdown)}
3. User Profile: Skills: ${JSON.stringify(profile.skills || [])}\nExperience: ${profile.experience || ""}\nHeadline: ${profile.headline || ""}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const responseContent = completion.choices[0].message.content;
    let dossierData = {};
    if (responseContent) {
      try {
        dossierData = JSON.parse(responseContent);
      } catch (e) {
        console.error("Failed to parse GPT-4o response as JSON:", e);
      }
    }

    // Ensure all schema fields exist
    const finalDossier = {
      companyOverview: "Not provided",
      techStack: [],
      culture: [],
      whyThisRole: "Not provided",
      yourEdge: [],
      gapsToAddress: [],
      smartQuestions: [],
      interviewPrep: [],
      sources: browserSuccess ? [finalUrl, ...stagehandData.subPages.map(p => p.url)] : [],
      ...dossierData
    };

    // 6. Save complete dossier
    // Per requirements: saves it to jobs.company_research
    try {
      await insforge.database
        .from("jobs")
        .update({ company_research: finalDossier })
        .eq("id", job.job_data.id || job.source_id);
    } catch (e) {
      console.error("Failed to update jobs table:", e);
    }
    
    try {
      await insforge.database
        .from("saved_jobs")
        .update({ company_research: finalDossier })
        .eq("id", idToUse);
    } catch (e) {
      console.error("Failed to update saved_jobs table:", e);
    }

    // Log progress / track event if server-side is needed, but client will also track
    
    return NextResponse.json(finalDossier);
  } catch (error: any) {
    console.error("API /api/agent/research error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
