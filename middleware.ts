import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "insforge_access_token";
const REFRESH_TOKEN_COOKIE = "insforge_refresh_token";

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/find-jobs"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const hasCode = request.nextUrl.searchParams.has("insforge_code");

  if (isProtected && !hasCode) {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!accessToken && !refreshToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/find-jobs/:path*"],
};
