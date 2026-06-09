import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { scoreAndSaveJob } from "@/lib/score-job";

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

  const result = await scoreAndSaveJob(savedJobId, userData.user.id);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ score: result.score });
}
