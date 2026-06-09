import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { extractProfileFromResume, type ExtractedProfile } from "@/lib/extract-profile";
import { extractTextFromPdf } from "@/lib/parse-resume";

export async function POST(_request: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await insforge.database
      .from("profiles")
      .select("resume_key")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (!profile?.resume_key) {
      return NextResponse.json({ error: "No resume found on your profile" }, { status: 400 });
    }

    const { data: downloadData, error: downloadError } =
      await insforge.storage.from("resumes").download(profile.resume_key);

    if (downloadError || !downloadData) {
      return NextResponse.json(
        { error: downloadError?.message ?? "Failed to download resume" },
        { status: 500 },
      );
    }

    let buffer;
    try {
      const ab = await downloadData.arrayBuffer();
      buffer = Buffer.from(ab);
    } catch (e: any) {
      console.error("step1-buffer error:", e);
      return NextResponse.json({ error: `Buffer step failed: ${e.message}` }, { status: 500 });
    }

    let text;
    try {
      text = await extractTextFromPdf(buffer);
    } catch (e: any) {
      console.error("step2-pdf error:", e);
      return NextResponse.json({ error: `PDF parse step failed: ${e.message}`, stack: e.stack }, { status: 500 });
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract any text from the resume PDF" }, { status: 422 });
    }

    const runStart = Date.now();

    let extracted;
    try {
      extracted = await extractProfileFromResume(text);
    } catch (e: any) {
      console.error("step3-ai error:", e);
      return NextResponse.json({ error: `AI extraction step failed: ${e.message}`, stack: e.stack }, { status: 500 });
    }

    const userId = userData.user.id;
    (async () => {
      try {
        const { data: run } = await insforge.database
          .from("agent_runs")
          .insert([{
            user_id: userId,
            agent_name: "profile-extractor",
            status: "completed",
            input: { resume_key: profile.resume_key },
            output: extracted,
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - runStart,
          }])
          .select()
          .single();

        const runId = (run as { id: string } | undefined)?.id;
        if (runId) {
          await insforge.database.from("agent_logs").insert([{
            run_id: runId,
            user_id: userId,
            step_name: "extract-profile",
            level: "info",
            message: `Extracted profile: ${extracted.skills.length} skills, ${extracted.experience.length} experiences, ${extracted.education.length} educations`,
            metadata: extracted,
            duration_ms: Date.now() - runStart,
          }]);
        }
      } catch (logErr) {
        console.error("Failed to log agent run (non-fatal):", logErr);
      }
    })();

    return NextResponse.json({ data: extracted });
  } catch (err: any) {
    console.error("extractProfile error:", err);
    console.error("extractProfile stack:", err?.stack);
    return NextResponse.json(
      { error: err.message ?? "Failed to extract profile from resume", stack: err?.stack },
      { status: 500 },
    );
  }
}
