import { NextRequest, NextResponse } from "next/server";

// These names MUST match DEFAULT_ACCESS_TOKEN_COOKIE / DEFAULT_REFRESH_TOKEN_COOKIE
// in @insforge/sdk/dist/ssr.js — do not change without verifying the SDK source.
const ACCESS_TOKEN_COOKIE = "insforge_access_token";
const REFRESH_TOKEN_COOKIE = "insforge_refresh_token";

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/saved-jobs", "/alerts", "/salary-insights"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtected) {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    // Allow through if either token is present — the SDK will refresh if access token is expired
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/find-jobs/:path*",
    "/saved-jobs/:path*",
    "/alerts/:path*",
    "/salary-insights/:path*",
  ],
};
