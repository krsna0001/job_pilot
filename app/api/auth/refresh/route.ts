import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // This endpoint is called by the InsForge SDK to refresh the session
  // For now, just return a 200 response - the SDK should handle this
  return NextResponse.json({ success: true });
}
