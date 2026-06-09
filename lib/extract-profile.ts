import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export interface ExtractedProfile {
  name: string;
  headline: string;
  bio: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    location: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    current: boolean;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    current: boolean;
  }[];
  github_url: string;
  linkedin_url: string;
  job_preferences: {
    roleTitle: string;
    locations: string[];
    jobTypes: string[];
    salaryExpectation: string;
  };
}

export async function extractProfileFromResume(
  resumeText: string,
): Promise<ExtractedProfile> {
  const prompt = `Extract structured profile data from this resume. Return ONLY valid JSON matching this schema:
{
  "name": "Full name",
  "headline": "Current title",
  "bio": "Summary (2-3 sentences)",
  "skills": ["skill1", "skill2"],
  "experience": [{ "title": "", "company": "", "location": "", "startMonth": "", "startYear": "", "endMonth": "", "endYear": "", "current": false, "description": "" }],
  "education": [{ "school": "", "degree": "", "field": "", "startMonth": "", "startYear": "", "endMonth": "", "endYear": "", "current": false }],
  "github_url": "",
  "linkedin_url": "",
  "job_preferences": { "roleTitle": "", "locations": [], "jobTypes": [], "salaryExpectation": "" }
}

Rules: Extract all info accurately. Use empty string for missing strings, empty array for missing arrays. Normalize months (Jan→January).`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENROUTER_CHAT_MODEL ?? "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a precise resume parser. Return only valid JSON.",
      },
      { role: "user", content: prompt + "\n\n---\n\n" + resumeText },
    ],
    max_completion_tokens: 1500,
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    return JSON.parse(raw) as ExtractedProfile;
  } catch {
    return {
      name: "",
      headline: "",
      bio: "",
      skills: [],
      experience: [],
      education: [],
      github_url: "",
      linkedin_url: "",
      job_preferences: {
        roleTitle: "",
        locations: [],
        jobTypes: [],
        salaryExpectation: "",
      },
    };
  }
}
