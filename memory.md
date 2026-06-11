# Memory — Feature 17 (PostHog Dashboard Charts)

Last updated: 2026-06-12T03:05:00+05:30

## What was built

- **Feature 17**: Completely wired up the dashboard charts to actual PostHog data.
- **`lib/posthog-server.ts`**: Created a singleton module with a natively-scoped `fetch` wrapper (`runHogQLQuery`) to securely query `https://app.posthog.com/api/projects/@current/query/` using a Personal API Key.
- **`app/dashboard/page.tsx`**: Replaced mock data by querying `job_found` (cumulative rolling total and bucketed match scores) and `company_researched` counts.
- **`app/alerts/page.tsx`**: Standardized the container wrapper to `max-w-7xl` for design consistency.

## Decisions made

- **Caching Strategy**: Selected server-side data fetching coupled with Next.js `unstable_cache` (5-minute TTL / `revalidate: 300`) over client-side fetching. This keeps the PostHog Personal API Key securely out of the browser, guarantees an instant dashboard load, and circumvents API rate limits.
- **Data Bucketing**: Added a `< 50%` bucket in the `multiIf()` HogQL logic for the Match Score Distribution chart so no trailing job matches are lost from the visualization.

## Problems solved

- **Browserbase Dependency**: Added the `encoding` package to `devDependencies` to fix the `Module not found: Can't resolve 'encoding'` error breaking local builds.

## Current state

- Feature 17 is fully implemented, and local builds (`npm run build`) complete successfully (`✓ Compiled successfully`).
- The dashboard is currently functional provided `POSTHOG_PERSONAL_API_KEY` is present in `.env.local`.
- Remote deployments (InsForge / Vercel) are currently failing with an exit code 1.

## Next session starts with

- Diagnosing and resolving the remote deployment build failure so the latest changes can be pushed live.

## Open questions

- What specifically is causing the remote build to fail when the local Next.js production build succeeds cleanly? (Needs logs reviewed via InsForge dashboard or CLI).
