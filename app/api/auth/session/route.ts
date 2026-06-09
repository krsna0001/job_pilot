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
    // Ensure cookies persist across dev reloads / hot‑reloads
    response.cookies.set({
      name: 'insforge_access_token',
      value: accessToken,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    response.cookies.set({
      name: 'insforge_refresh_token',
      value: refreshToken,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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
