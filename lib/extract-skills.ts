import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export interface SkillsBreakdown {
  job_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  match_percentage: number;
}

export async function extractSkillsFromJob(
  jobDescription: string,
  jobTitle: string,
  userSkills: string[],
): Promise<SkillsBreakdown> {
  const userSkillsText = userSkills.length > 0 ? userSkills.join(", ") : "None specified";

  const prompt = `You are a technical skills analyst. Extract the technical and professional skills mentioned in the following job description, then compare them against the candidate's existing skills.

Job Title: ${jobTitle}
Job Description:
${jobDescription}

Candidate's Skills: ${userSkillsText}

Return ONLY a valid JSON object with these fields:
{
  "job_skills": ["list of all skills mentioned in the job description"],
  "matched_skills": ["skills from job_skills that the candidate has"],
  "missing_skills": ["skills from job_skills that the candidate is missing"]
}

Rules:
- Be specific: "React" not "Frontend frameworks"
- Normalize skill names for comparison (e.g., "react.js" → "React", "typescript" → "TypeScript")
- A skill is a match if the candidate has it or a very close variant
- If the candidate has no skills listed, all job_skills go into missing_skills and matched_skills is empty
- Return at most 15 job_skills (the most important ones)`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENROUTER_CHAT_MODEL ?? "openai/gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a precise technical skills analyst. Return only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 300,
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content ?? '{"job_skills":[],"matched_skills":[],"missing_skills":[]}';

  try {
    const parsed = JSON.parse(raw);
    const jobSkills: string[] = Array.isArray(parsed.job_skills) ? parsed.job_skills : [];
    const matched: string[] = Array.isArray(parsed.matched_skills) ? parsed.matched_skills : [];
    const missing: string[] = Array.isArray(parsed.missing_skills) ? parsed.missing_skills : [];
    const matchPercentage = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0;

    return {
      job_skills: jobSkills,
      matched_skills: matched,
      missing_skills: missing,
      match_percentage: matchPercentage,
    };
  } catch {
    return { job_skills: [], matched_skills: [], missing_skills: [], match_percentage: 0 };
  }
}
