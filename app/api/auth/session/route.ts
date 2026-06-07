import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies, clearAuthCookies } from "@insforge/sdk/ssr";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();

    const response = NextResponse.json({ success: true });

    // Set the authentication cookies on the response
    setAuthCookies(response.cookies as any, {
      accessToken,
      refreshToken,
    });

    return response;
  } catch (error) {
    console.error("Error setting session cookies:", error);
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true });

    // Clear the authentication cookies
    clearAuthCookies(response.cookies as any);

    return response;
  } catch (error) {
    console.error("Error clearing session cookies:", error);
    return NextResponse.json({ error: "Failed to clear session" }, { status: 500 });
  }
}
