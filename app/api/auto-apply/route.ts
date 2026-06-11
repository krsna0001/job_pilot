import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { generateAutoApply } from "@/lib/auto-apply";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { savedJobId } = body;

  if (!savedJobId) {
    return NextResponse.json({ error: "Missing savedJobId" }, { status: 400 });
  }

  const insforge = await createInsforgeServer();
  const { data: userData, error: authError } = await insforge.auth.getCurrentUser();
  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;

  const { data: savedJob, error: fetchError } = await insforge.database
    .from("saved_jobs")
    .select("job_data")
    .eq("id", savedJobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError || !savedJob) {
    return NextResponse.json({ error: "Saved job not found" }, { status: 404 });
  }

  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const insforgeServer = await createInsforgeServer();
  await insforgeServer.database.from("agent_runs").insert([
    {
      user_id: userId,
      agent_name: "auto-apply",
      status: "running",
      input: { savedJobId },
    },
  ]);

  try {
    const result = await generateAutoApply({
      job: savedJob.job_data,
      profile: {
        name: profile.name,
        headline: profile.headline,
        bio: profile.bio,
        skills: profile.skills || [],
        experience: profile.experience || [],
        education: profile.education || [],
        github_url: profile.github_url,
        linkedin_url: profile.linkedin_url,
      },
    });

    await insforge.database
      .from("saved_jobs")
      .update({
        cover_letter: result.cover_letter,
        applied_at: new Date().toISOString(),
        status: "applied",
      })
      .eq("id", savedJobId);

    await insforgeServer.database
      .from("agent_runs")
      .update({ status: "completed", output: { key_skills: result.key_skills } })
      .eq("agent_name", "auto-apply")
      .eq("user_id", userId)
      .is("completed_at", null);

    await insforgeServer.database.from("agent_logs").insert([
      {
        user_id: userId,
        agent_name: "auto-apply",
        level: "info",
        message: `Auto-apply generated for ${savedJob.job_data.title} at ${savedJob.job_data.company}`,
        data: { talking_points_count: result.talking_points.length },
      },
    ]);

    return NextResponse.json(result);
  } catch (err: any) {
    await insforgeServer.database
      .from("agent_runs")
      .update({ status: "failed", error: err.message })
      .eq("agent_name", "auto-apply")
      .eq("user_id", userId)
      .is("completed_at", null);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
