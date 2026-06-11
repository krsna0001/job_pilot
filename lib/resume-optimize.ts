import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export interface ResumeOptimizeInput {
  job: { title: string; company: string; description: string };
  profile: {
    name?: string;
    headline?: string;
    bio?: string;
    skills: string[];
    experience: { title?: string; company?: string; description?: string }[];
    education: { degree?: string; field?: string; school?: string }[];
  };
}

export interface ResumeOptimizeResult {
  suggested_headline: string;
  resume_tweaks: { section: string; original: string; suggested: string; reason: string }[];
  keywords_to_add: string[];
  achievements_to_highlight: string[];
  formatting_tips: string[];
}

export async function optimizeResume(input: ResumeOptimizeInput): Promise<ResumeOptimizeResult> {
  const skillsText = input.profile.skills.join(", ");
  const expText = input.profile.experience.map((e) => `- ${e.title} at ${e.company}: ${e.description}`).join("\n");
  const eduText = input.profile.education.map((e) => `- ${e.degree} in ${e.field}, ${e.school}`).join("\n");

  const prompt = `You are a senior resume reviewer. Given a job description and a candidate profile, suggest specific resume optimizations to improve the candidate's chances.

JOB:
Title: ${input.job.title}
Company: ${input.job.company}
Description: ${input.job.description}

CANDIDATE:
Name: ${input.profile.name || "Candidate"}
Title: ${input.profile.headline || "N/A"}
Bio: ${input.profile.bio || "N/A"}
Skills: ${skillsText}
Experience:
${expText || "N/A"}
Education:
${eduText || "N/A"}

Return JSON with:
1. "suggested_headline": A better headline/title tailored to this job
2. "resume_tweaks": Array of 5 objects with "section" (which part of resume), "original" (current text), "suggested" (rewritten text), "reason" (why this helps)
3. "keywords_to_add": Array of 5-8 keywords from the job description missing from the resume
4. "achievements_to_highlight": Array of 3-5 specific achievements or experiences to emphasize
5. "formatting_tips": Array of 3-5 formatting or structural suggestions

Return ONLY valid JSON.`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENROUTER_CHAT_MODEL ?? "openai/gpt-4o",
    messages: [
      { role: "system", content: "You are a senior resume reviewer providing specific, actionable feedback. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 2000,
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as ResumeOptimizeResult;
}

export async function generateCoverLetterOnly(input: {
  job: { title: string; company: string; description: string };
  profile: { name?: string; skills: string[]; experience: { title?: string; company?: string; description?: string }[] };
}): Promise<{ cover_letter: string }> {
  const skillsText = input.profile.skills.join(", ");
  const expText = input.profile.experience.map((e) => `- ${e.title} at ${e.company}: ${e.description}`).join("\n");

  const prompt = `Write a professional, tailored cover letter for the following job application.

JOB:
Title: ${input.job.title}
Company: ${input.job.company}
Description: ${input.job.description}

CANDIDATE:
Name: ${input.profile.name || "Candidate"}
Skills: ${skillsText}
Experience:
${expText || "N/A"}

Write a 3-paragraph cover letter that:
- Opens with enthusiasm for the role and company
- Highlights 2-3 specific skills/experiences that match the job requirements
- Closes with a call to action
Use a professional but warm tone.

Return JSON: { "cover_letter": "..." }`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENROUTER_CHAT_MODEL ?? "openai/gpt-4o",
    messages: [
      { role: "system", content: "You are a professional cover letter writer. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 1200,
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as { cover_letter: string };
}
