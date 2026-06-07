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
