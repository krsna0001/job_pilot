import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { generateAndSaveDossier } from "@/lib/company-dossier";

export async function POST(request: NextRequest) {
  try {
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

    const result = await generateAndSaveDossier(savedJobId, userData.user.id);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/company-dossier error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
