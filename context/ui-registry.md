# UI Registry — JobPilot

## Registered Components

| Component | Path | Type | Status |
|-----------|------|------|--------|
| AuthCallbackHandler | `app/components/AuthCallbackHandler.tsx` | Client | Stable |
| AuthenticatedHeader | `app/components/AuthenticatedHeader.tsx` | Client | Stable |
| PosthogPageView | `app/components/PosthogPageView.tsx` | Client | Stable |
| SignOutButton | `app/components/SignOutButton.tsx` | Client | Stable |
| LoginCard | `app/login/LoginCard.tsx` | Client | Stable |
| ResumeUpload | `app/profile/components/ResumeUpload.tsx` | Client | Stable |
| JobSearchForm | `app/find-jobs/components/JobSearchForm.tsx` | Client | Stable |
| JobCard | `app/find-jobs/components/JobCard.tsx` | Client | Stable |
| JobResults | `app/find-jobs/components/JobResults.tsx` | Client | Stable |

## Page Registry

| Route | Path | Type | Status |
|-------|------|------|--------|
| Landing | `app/page.tsx` | Server | Stable |
| Login | `app/login/page.tsx` | Server | Stable |
| Dashboard | `app/dashboard/page.tsx` | Server | Stable |
| Profile | `app/profile/page.tsx` | Server | Stable |
| Find Jobs | `app/find-jobs/page.tsx` | Server | Stable |

## Edge Functions

| Slug | Source | Status |
|------|--------|--------|
| jobs-search | `functions/jobs-search.ts` | Active |

## Database Tables

| Table | Status | Notes |
|-------|--------|-------|
| saved_jobs | Active | RLS: owner-only access. User job bookmarks with status tracking |
| profiles | Active | RLS: owner-only access. Extended user profile (skills, experience, education, resume) |
| jobs | Active | Public read. Master job catalog with AI enrichment columns |
| agent_runs | Active | RLS: owner-only access. AI agent execution tracking |
| agent_logs | Active | RLS: owner-only access. Step-by-step agent audit trail |
