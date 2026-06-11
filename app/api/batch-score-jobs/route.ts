import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { batchScoreJobs } from "@/lib/score-job";

interface JobItem {
  id: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { jobs } = body as { jobs?: JobItem[] };

  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return NextResponse.json({ scores: {} });
  }

  if (jobs.length > 30) {
    return NextResponse.json({ error: "Maximum 30 jobs per request" }, { status: 400 });
  }

  const insforge = await createInsforgeServer();
  const { data: userData, error: authError } = await insforge.auth.getCurrentUser();

  if (authError || !userData?.user) {
    return NextResponse.json({ scores: {} });
  }

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("skills, experience, education, headline, bio")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  const profileData = profile as {
    skills?: string[];
    experience?: { title?: string; company?: string; description?: string }[];
    education?: { degree?: string; field?: string; school?: string }[];
    headline?: string;
    bio?: string;
  } | null;

  const scores = await batchScoreJobs(jobs, {
    skills: profileData?.skills ?? [],
    experience: profileData?.experience ?? [],
    education: profileData?.education ?? [],
    headline: profileData?.headline,
    bio: profileData?.bio,
  });

  return NextResponse.json({ scores });
}
