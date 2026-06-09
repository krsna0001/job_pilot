import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { extractSkillsFromJob } from "@/lib/extract-skills";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { savedJobId } = body;

  if (!savedJobId) {
    return NextResponse.json({ error: "savedJobId is required" }, { status: 400 });
  }

  const insforge = await createInsforgeServer();
  const { data: userData, error: authError } = await insforge.auth.getCurrentUser();

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: savedJob } = await insforge.database
    .from("saved_jobs")
    .select("*")
    .eq("id", savedJobId)
    .single();

  if (!savedJob) {
    return NextResponse.json({ error: "Saved job not found" }, { status: 404 });
  }

  const jobData = savedJob.job_data as { title: string; description: string };

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("skills")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  const userSkills: string[] = Array.isArray(profile?.skills) ? profile.skills : [];

  const result = await extractSkillsFromJob(
    jobData.description,
    jobData.title,
    userSkills,
  );

  const runStart = Date.now();
  const { data: run } = await insforge.database
    .from("agent_runs")
    .insert([{
      user_id: userData.user.id,
      agent_name: "skills-extractor",
      status: "completed",
      input: { saved_job_id: savedJobId },
      output: result,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - runStart,
    }])
    .select()
    .single();

  const runId = (run as { id: string } | undefined)?.id;
  if (runId) {
    await insforge.database.from("agent_logs").insert([{
      run_id: runId,
      user_id: userData.user.id,
      step_name: "extract-skills",
      level: "info",
      message: `Extracted ${result.job_skills.length} skills for ${jobData.title}`,
      metadata: result,
      duration_ms: Date.now() - runStart,
    }]);
  }

  return NextResponse.json(result);
}
