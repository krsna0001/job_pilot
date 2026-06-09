import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: Do NOT attempt to exchange the OAuth code here server-side.
// The InsForge SDK uses PKCE: the code verifier is stored in sessionStorage during
// signInWithOAuth(). sessionStorage is browser-only — it does not exist on the server.
// Calling exchangeOAuthCode() here will always fail with PKCE_VERIFIER_MISSING.
//
// The correct flow:
//   1. OAuth provider redirects here with ?insforge_code=xxx
//   2. We forward ?insforge_code=xxx to the /login client page
//   3. The browser SDK's detectAuthCallback() fires automatically on /login page load,
//      reads the verifier from sessionStorage, exchanges the code, sets cookies,
//      and the AuthCallbackHandler redirects to /dashboard.

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    console.warn("OAuth callback error from provider:", oauthError);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(oauthError)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  // Pass the code to the client page where the SDK can exchange it with sessionStorage access
  return NextResponse.redirect(new URL(`/login?insforge_code=${encodeURIComponent(code)}`, request.url));
}
