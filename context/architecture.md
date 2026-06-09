# Architecture — JobPilot

## Directory Structure

```
app/
  page.tsx              # Landing / marketing page
  layout.tsx            # Root layout (Inter font, PostHog, AuthCallback)
  globals.css           # Tailwind v4 + @theme tokens
  login/
    page.tsx            # Login page (server)
    LoginCard.tsx       # OAuth provider buttons (client)
  dashboard/
    page.tsx            # Dashboard (server)
  profile/
    page.tsx            # Profile display (server)
  find-jobs/
    page.tsx            # Job search (server wrapper)
    components/         # Client components for search
  components/
    AuthCallbackHandler.tsx  # OAuth callback handler (client)
    AuthenticatedHeader.tsx  # Nav header for authed pages
    PosthogPageView.tsx      # Page view tracking (client)
    SignOutButton.tsx        # Sign out button (client)
  api/                  # API routes (if needed)

lib/
  insforge-client.ts    # Browser InsForge SDK client
  insforge-server.ts    # Server InsForge SDK client (SSR)
  posthog.ts            # PostHog client init

context/                # Project documentation
middleware.ts           # Auth redirect for protected routes
```

## Data Flow

1. **Auth**: OAuth redirect → InsForge callback → cookie-based session
2. **Database**: InsForge Postgres (saved_jobs, etc.) via SDK
3. **Edge Functions**: Adzuna proxy runs as InsForge edge function
4. **Analytics**: PostHog captures events client-side

## Route Protection

- `/dashboard`, `/profile`, `/find-jobs` — protected by middleware (cookie check)
- `/login` — redirects to `/profile` if already authenticated
- `/` — public

---

## ⚠️ Auth Contract — READ BEFORE TOUCHING AUTH CODE

These rules encode known bugs that were painful to debug. Breaking any of them will silently re-introduce the same issues.

### 1. OAuth redirect URL & PKCE flow
**Files:** `app/login/LoginCard.tsx`, `app/api/auth/callback/route.ts`

The InsForge SDK uses **PKCE**: when `signInWithOAuth()` is called, it generates a code verifier and stores it in **`sessionStorage`** (browser-only). This means:

- ❌ **Server-side code exchange will ALWAYS fail** — `sessionStorage` is `undefined` on the server, so `exchangeOAuthCode()` throws `PKCE_VERIFIER_MISSING`.
- ✅ **Exchange must happen client-side**, using `insforge.auth.detectAuthCallback()`.

**Correct flow:**
```
1. LoginCard → signInWithOAuth(provider, { redirectTo: /api/auth/callback })
2. Browser stores PKCE verifier in sessionStorage, redirects to OAuth provider
3. Provider → /api/auth/callback?insforge_code=xxx  (server)
4. Server passes through → /login?insforge_code=xxx  (client)
5. LoginCard useEffect → detectAuthCallback() reads code + sessionStorage verifier, exchanges
6. On success: POST /api/auth/session to sync cookies, redirect to /dashboard
```

**Do NOT** move step 5 to the server. It will silently fail every time.

```ts
// LoginCard.tsx — correct redirectTo:
redirectTo: `${window.location.origin}/api/auth/callback`
// /api/auth/callback MUST be in insforge.toml allowed_redirect_urls
```

### 2. Cookie names in middleware
**File:** `middleware.ts`

```ts
const ACCESS_TOKEN_COOKIE = "insforge_access_token";
const REFRESH_TOKEN_COOKIE = "insforge_refresh_token";
```

These names are the SDK defaults from `@insforge/sdk/dist/ssr.js`:
```
DEFAULT_ACCESS_TOKEN_COOKIE = "insforge_access_token"
DEFAULT_REFRESH_TOKEN_COOKIE = "insforge_refresh_token"
```
If they drift, authenticated users get redirected to `/login` even with valid sessions.
**Do not change these without checking the SDK source first.**

### 3. Middleware checks BOTH tokens
Middleware allows through if **either** access OR refresh token is present. The SDK refreshes access tokens automatically. Checking only the access token causes false logouts after token expiry.

### 4. InsForge allowed_redirect_urls (dashboard setting)
The following URLs MUST be in the InsForge dashboard allowlist for each environment:
- `http://localhost:3000/api/auth/callback` (dev)
- `https://<your-domain>/api/auth/callback` (prod)

To update: InsForge dashboard → Project → Auth → Allowed Redirect URLs.
The local `insforge.toml` is the source of truth to sync from.

---

## ⚠️ CSS Contract — READ BEFORE TOUCHING globals.css

**File:** `app/globals.css`

Tailwind v4 uses `@source` directives instead of a `content` array. Every directory containing Tailwind utility classes MUST be listed or classes will be purged (styles disappear at runtime).

Current required sources:
```css
@source "../app/**/*.{ts,tsx,js,jsx}";
@source "../components/**/*.{ts,tsx,js,jsx}";  /* root-level components */
@source "../lib/**/*.{ts,tsx,js,jsx}";
```

**If you add a new top-level directory with TSX/JSX files, add a corresponding `@source` line here.**

