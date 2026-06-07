# Memory — Find Jobs Backend + Full Context Setup

Last updated: 2026-06-08 (Session 3)

## What was built

### Context files (created)
- All 9 files in `context/` directory (project-overview, architecture, ui-tokens, ui-rules, ui-registry, code-standards, library-docs, build-plan, progress-tracker)

### Database — 5 tables total
- `saved_jobs` — user bookmarks with status tracking
- `profiles` — extended user profile (headline, bio, skills JSONB, experience JSONB, education JSONB, resume, github, linkedin)
- `jobs` — master job catalog (deduplicated by source_id), with AI enrichment columns (match_score, skills_breakdown JSONB, company_dossier JSONB)
- `agent_runs` — AI agent execution sessions (agent_name, status, input/output JSONB, duration_ms, error_message)
- `agent_logs` — step-by-step audit trail for agent executions (run_id FK, step_name, level debug/info/warn/error, message, metadata JSONB, duration_ms)
- All tables have RLS, indexes, and FK references to auth.users where appropriate

### Edge function
- `functions/jobs-search.ts` — Adzuna API proxy, accepts GET/POST with what/where/page/country/results_per_page. Reads ADZUNA_APP_ID and ADZUNA_API_KEY from Deno env. Deployed as `jobs-search` at `https://59m666gk.functions.insforge.app`

### Find Jobs UI
- `app/find-jobs/components/JobSearchForm.tsx` — search form with title + location inputs
- `app/find-jobs/components/JobCard.tsx` — job result card with save button
- `app/find-jobs/components/JobResults.tsx` — search state, edge function calls, pagination, save/unsave with optimistic UI
- `app/find-jobs/page.tsx` — rewritten from placeholder

### Dashboard update
- Shows saved job count + recent 5 saved jobs with status badges

### PostHog events
- `job_search`, `job_saved`, `job_unsaved` — custom events firing client-side

## Decisions made

- **InsForge CLI integration**: Authenticated with user API key, project linked
- **Functions directory excluded from tsconfig**: Edge functions use Deno (not Node/Next.js), so `functions/` is excluded from Next.js build
- **`saved_jobs` job_data stored as JSONB**: Full Adzuna job payload is stored so the saved job card can render without re-fetching. JSONB also supports future queries and indexing
- **PostHog wired but InsForge dashboard connection pending**: The `posthog-js` SDK is in place and capturing events. The InsForge dashboard side needs browser OAuth authorization (CLI is polling for it)

## Problems solved

- Edge function deploy required delete + recreate for code updates (update via deploy slug failed with "already exists")
- `functions/` directory caused TypeScript compilation errors (Deno globals in Next.js) — excluded in tsconfig.json
- SDK `.filter()` method didn't exist for JSONB queries — switched to `.eq('job_data->>id', jobId)`

## Current state

- Build: clean (0 errors)
- `saved_jobs` table: created, RLS applied, verified
- Edge function: deployed, active
- Find Jobs page: search form, results with pagination, save/unsave working
- Dashboard: shows saved jobs count + recent entries
- PostHog: client-side events firing. InsForge dashboard connection still pending (open the browser URL that was printed)
- Adzuna credentials: placeholder secrets stored (need real keys)
- PostHog InsForge dashboard integration: needs browser OAuth completion

## Next session starts with

1. **Set Adzuna API credentials** — sign up at developer.adzuna.com, then:
   - `npx @insforge/cli secrets update ADZUNA_APP_ID --value <app_id>`
   - `npx @insforge/cli secrets update ADZUNA_API_KEY --value <api_key>`
2. **Complete PostHog OAuth** in browser (URL was printed by `posthog setup`)
3. **Begin Phase 3: AI features** — start with `npx @insforge/cli ai setup` for OpenRouter
4. **Build job status management UI** — list saved jobs with status filters

## Open questions

- Adzuna API credentials needed
- PostHog browser OAuth not completed
- Job status management page not built
- OpenRouter key not configured for AI features
