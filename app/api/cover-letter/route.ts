import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { generateCoverLetterOnly } from "@/lib/resume-optimize";

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

  const { data: savedJob } = await insforge.database
    .from("saved_jobs")
    .select("job_data")
    .eq("id", savedJobId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!savedJob) {
    return NextResponse.json({ error: "Saved job not found" }, { status: 404 });
  }

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("name, skills, experience")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  try {
    const result = await generateCoverLetterOnly({
      job: savedJob.job_data,
      profile: {
        name: profile.name,
        skills: profile.skills || [],
        experience: profile.experience || [],
      },
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
