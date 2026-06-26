import OpenAI from "openai";
import { createInsforgeServer } from "./insforge-server";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
});

interface JobInput {
  title: string;
  company: string;
  description: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
}

interface ProfileInput {
  skills: string[];
  experience: { title?: string; company?: string; description?: string }[];
  education: { degree?: string; field?: string; school?: string }[];
  headline?: string;
  bio?: string;
}

export async function scoreJobAgainstProfile(
  job: JobInput,
  profile: ProfileInput,
): Promise<{ score: number; reasoning: string }> {
  const skillsText = profile.skills.length > 0 ? profile.skills.join(", ") : "Not specified";
  const experienceText =
    profile.experience.length > 0
      ? profile.experience.map((e) => `${e.title ?? "Unknown role"} at ${e.company ?? "Unknown company"}${e.description ? `: ${e.description}` : ""}`).join("\n")
      : "Not specified";
  const educationText =
    profile.education.length > 0
      ? profile.education.map((e) => `${e.degree ?? "Degree"} in ${e.field ?? "Unknown field"} from ${e.school ?? "Unknown school"}`).join("\n")
      : "Not specified";

  const prompt = `You are a job match analyst. Compare the following job against the candidate's profile and return a match score from 0 to 100.

Job:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location ?? "Not specified"}
- Salary: ${job.salary_min && job.salary_max ? `£${job.salary_min} - £${job.salary_max}` : "Not specified"}
- Description: ${job.description}

Candidate Profile:
- Headline: ${profile.headline ?? "Not specified"}
- Bio: ${profile.bio ?? "Not specified"}
- Skills: ${skillsText}
- Experience:
${experienceText}
- Education:
${educationText}

Return ONLY a JSON object with two fields:
{
  "score": <number 0-100>,
  "reasoning": "<one sentence explaining the score>"
}`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENROUTER_CHAT_MODEL ?? "openai/gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a precise job match analyst. Return only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 200,
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content ?? '{"score": 0, "reasoning": "Unable to analyze"}';

  try {
    const parsed = JSON.parse(raw);
    return {
      score: Math.min(100, Math.max(0, Math.round(parsed.score ?? 0))),
      reasoning: parsed.reasoning ?? "No reasoning provided",
    };
  } catch {
    return { score: 0, reasoning: "Failed to parse AI response" };
  }
}

export async function batchScoreJobs(
  jobs: { id: string; title: string; company: string; description: string; location?: string; salary_min?: number; salary_max?: number }[],
  profile: ProfileInput,
): Promise<Record<string, number>> {
  if (jobs.length === 0) return {};

  const skillsText = profile.skills.length > 0 ? profile.skills.join(", ") : "Not specified";
  const experienceText =
    profile.experience.length > 0
      ? profile.experience.map((e) => `${e.title ?? "Unknown role"} at ${e.company ?? "Unknown company"}${e.description ? `: ${e.description}` : ""}`).join("\n")
      : "Not specified";
  const educationText =
    profile.education.length > 0
      ? profile.education.map((e) => `${e.degree ?? "Degree"} in ${e.field ?? "Unknown field"} from ${e.school ?? "Unknown school"}`).join("\n")
      : "Not specified";

  const jobsList = jobs.map((j, i) =>
    `Job ${i + 1} (id: "${j.id}"):
- Title: ${j.title}
- Company: ${j.company}
- Location: ${j.location ?? "Not specified"}
- Salary: ${j.salary_min && j.salary_max ? `${j.salary_min} - ${j.salary_max}` : "Not specified"}
- Description: ${j.description.slice(0, 300)}`
  ).join("\n\n");

  const prompt = `You are a job match analyst. Compare each job below against the candidate's profile and return a match score from 0 to 100 for each job.

Candidate Profile:
- Headline: ${profile.headline ?? "Not specified"}
- Bio: ${profile.bio ?? "Not specified"}
- Skills: ${skillsText}
- Experience:
${experienceText}
- Education:
${educationText}

${jobsList}

Return ONLY a JSON object mapping job IDs to scores like this:
{
  "job-id-1": 85,
  "job-id-2": 42
}`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENROUTER_CHAT_MODEL ?? "openai/gpt-4o",
    messages: [
      { role: "system", content: "You are a precise job match analyst. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 400 + jobs.length * 50,
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(raw);
    const scores: Record<string, number> = {};
    for (const job of jobs) {
      const rawScore = parsed[job.id];
      scores[job.id] = rawScore !== undefined
        ? Math.min(100, Math.max(0, Math.round(rawScore)))
        : 0;
    }
    return scores;
  } catch {
    return Object.fromEntries(jobs.map((j) => [j.id, 0]));
  }
}

export async function scoreAndSaveJob(savedJobId: string, userId: string): Promise<{ score: number; reasoning: string } | { error: string }> {
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
        agent_name: "match-scorer",
        status: "running",
        input: { saved_job_id: savedJobId },
      },
    ])
    .select()
    .single();

  const runId = (run as { id: string } | undefined)?.id;

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("skills, experience, education, headline, bio")
    .eq("user_id", userId)
    .maybeSingle();

  const job = (savedJob as { job_data: JobInput }).job_data;
  const profileData = profile as ProfileInput | null;

  const result = await scoreJobAgainstProfile(
    job,
    profileData ?? { skills: [], experience: [], education: [] },
  );

  const durationMs = Date.now() - runStart;

  if (runId) {
    await insforge.database.from("agent_runs").update({
      status: "completed",
      output: { score: result.score, reasoning: result.reasoning },
      completed_at: new Date().toISOString(),
      duration_ms: durationMs,
    }).eq("id", runId);

    await insforge.database.from("agent_logs").insert([
      {
        run_id: runId,
        user_id: userId,
        step_name: "score-job",
        level: "info",
        message: `Scored ${job.title} at ${result.score}/100`,
        metadata: { score: result.score, reasoning: result.reasoning },
        duration_ms: durationMs,
      },
    ]);
  }

  await insforge.database
    .from("saved_jobs")
    .update({ match_score: result.score, match_reasoning: result.reasoning })
    .eq("id", savedJobId);

  return { score: result.score, reasoning: result.reasoning };
}
