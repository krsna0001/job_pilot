import OpenAI from "openai";
import { createInsforgeServer } from "./insforge-server";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
});

export interface CompanyDossier {
  company_name: string;
  business_summary: string;
  tech_stack: string[];
  culture_signals: string[];
  interview_tips: string[];
  talking_points: string[];
}

export async function generateCompanyDossier(
  companyName: string,
  jobTitle: string,
  jobDescription: string,
): Promise<CompanyDossier> {
  const prompt = `You are an expert tech company researcher and interview coach. 
Generate a comprehensive research dossier for the company "${companyName}" based on the job role "${jobTitle}" and its description.

Job Description:
${jobDescription}

Perform deep synthesis of your knowledge about ${companyName}.
Return ONLY a valid JSON object matching the following structure (do not include markdown wrapping or extra comments):
{
  "company_name": "${companyName}",
  "business_summary": "Provide a concise (2-3 sentences) description of ${companyName}'s core business model, products, and mission.",
  "tech_stack": ["Array of key technologies, tools, and frameworks likely used at the company or explicitly mentioned in the job"],
  "culture_signals": ["Array of cultural traits, engineering values, and workplace environment signals"],
  "interview_tips": ["Array of practical, actionable tips for succeeding in their interview process (e.g., core themes, focus areas)"],
  "talking_points": ["Array of highly relevant discussion points, questions to ask, or how to position your skills for this specific company"]
}

Rules:
- Be highly specific and accurate to ${companyName} if it is a well-known company, or extrapolate reasonably from the job description if it is lesser-known.
- Keep array items concise and impact-driven.
- Ensure the output is strictly valid JSON. Limit each list array to at most 5 elements.`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENROUTER_CHAT_MODEL ?? "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a precise developer job researcher. Return only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 600,
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    // Strip possible markdown JSON code blocks if present
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    
    return {
      company_name: parsed.company_name || companyName,
      business_summary: parsed.business_summary || "No business summary available.",
      tech_stack: Array.isArray(parsed.tech_stack) ? parsed.tech_stack : [],
      culture_signals: Array.isArray(parsed.culture_signals) ? parsed.culture_signals : [],
      interview_tips: Array.isArray(parsed.interview_tips) ? parsed.interview_tips : [],
      talking_points: Array.isArray(parsed.talking_points) ? parsed.talking_points : [],
    };
  } catch (e) {
    console.error("Failed to parse company dossier JSON:", e, raw);
    return {
      company_name: companyName,
      business_summary: "Failed to generate company dossier.",
      tech_stack: [],
      culture_signals: [],
      interview_tips: [],
      talking_points: [],
    };
  }
}

export async function generateAndSaveDossier(
  savedJobId: string,
  userId: string,
): Promise<CompanyDossier | { error: string }> {
  const insforge = await createInsforgeServer();

  const { data: savedJob } = await insforge.database
    .from("saved_jobs")
    .select("*")
    .eq("id", savedJobId)
    .single();

  if (!savedJob) {
    return { error: "Saved job not found" };
  }

  const runStart = Date.now();

  const { data: run } = await insforge.database
    .from("agent_runs")
    .insert([
      {
        user_id: userId,
        agent_name: "company-researcher",
        status: "running",
        input: { saved_job_id: savedJobId },
      },
    ])
    .select()
    .single();

  const runId = (run as { id: string } | undefined)?.id;

  const jobData = savedJob.job_data as { title: string; company: { display_name: string }; description: string };
  const companyName = jobData.company?.display_name ?? "the company";
  const jobTitle = jobData.title ?? "Software Engineer";

  const result = await generateCompanyDossier(
    companyName,
    jobTitle,
    jobData.description,
  );

  const durationMs = Date.now() - runStart;

  if (runId) {
    await insforge.database.from("agent_runs").update({
      status: "completed",
      output: result,
      completed_at: new Date().toISOString(),
      duration_ms: durationMs,
    }).eq("id", runId);

    await insforge.database.from("agent_logs").insert([
      {
        run_id: runId,
        user_id: userId,
        step_name: "generate-dossier",
        level: "info",
        message: `Generated dossier for ${companyName}`,
        metadata: result,
        duration_ms: durationMs,
      },
    ]);
  }

  await insforge.database
    .from("saved_jobs")
    .update({ company_dossier: result })
    .eq("id", savedJobId);

  return result;
}
