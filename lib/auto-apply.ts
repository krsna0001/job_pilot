import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
});

export interface AutoApplyInput {
  job: {
    title: string;
    company: string;
    description: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    redirect_url?: string;
  };
  profile: {
    name?: string;
    headline?: string;
    bio?: string;
    skills: string[];
    experience: { title?: string; company?: string; description?: string }[];
    education: { degree?: string; field?: string; school?: string }[];
    github_url?: string;
    linkedin_url?: string;
  };
}

export interface AutoApplyResult {
  cover_letter: string;
  talking_points: string[];
  suggested_answers: { question: string; answer: string }[];
  key_skills: string[];
}

export async function generateAutoApply(
  input: AutoApplyInput,
): Promise<AutoApplyResult> {
  const { job, profile } = input;

  const skillsText = profile.skills.join(", ");
  const expText = profile.experience
    .map((e) => `- ${e.title} at ${e.company}: ${e.description}`)
    .join("\n");
  const eduText = profile.education
    .map((e) => `- ${e.degree} in ${e.field}, ${e.school}`)
    .join("\n");

  const prompt = `You are an expert career coach and application strategist.

Given a job description and a candidate's profile, generate a tailored application package.

JOB:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || "N/A"}
Salary: ${job.salary_min ? `$${job.salary_min.toLocaleString()}` : "N/A"} - ${job.salary_max ? `$${job.salary_max.toLocaleString()}` : "N/A"}
Description: ${job.description}

CANDIDATE PROFILE:
Name: ${profile.name || "Candidate"}
Title: ${profile.headline || "N/A"}
Bio: ${profile.bio || "N/A"}
Skills: ${skillsText}
Experience:
${expText || "N/A"}
Education:
${eduText || "N/A"}
GitHub: ${profile.github_url || "N/A"}
LinkedIn: ${profile.linkedin_url || "N/A"}

Generate a JSON object with:
1. "cover_letter": A professional, tailored cover letter (3-4 paragraphs). Use the candidate's voice, reference specific skills and experiences that match the job requirements, and show enthusiasm for the role and company.
2. "talking_points": An array of 5 key talking points the candidate should emphasize in interviews.
3. "suggested_answers": An array of 3 objects with "question" and "answer" — likely interview questions and strong sample answers based on the profile.
4. "key_skills": An array of the candidate's skills most relevant to this job.

Return ONLY valid JSON.`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENROUTER_CHAT_MODEL ?? "openai/gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a career coach generating tailored job application materials. Return only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 2500,
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as AutoApplyResult;

  return {
    cover_letter: parsed.cover_letter || "",
    talking_points: parsed.talking_points || [],
    suggested_answers: parsed.suggested_answers || [],
    key_skills: parsed.key_skills || [],
  };
}
