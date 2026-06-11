# Progress Tracker — JobPilot

**Current Phase:** Phase 3 — AI Features

**Last updated:** 2026-06-10 (Session 29 — job UI redesign + realtime)

---

## Phase 1: Foundation ✅ (Complete)

| # | Feature | Status | Completed | Notes |
|---|---------|--------|-----------|-------|
| 1.1 | Landing/Marketing Page | ✅ | Session 1 | Hero, features, testimonials, stats |
| 1.2 | Auth — OAuth (Google + GitHub) | ✅ | Session 1 | LoginCard with provider buttons |
| 1.3 | Auth — Middleware | ✅ | Session 2 | Cookie check, no SDK import |
| 1.4 | Auth — Profile Page | ✅ | Session 1 | User info display, sign out |
| 1.5 | Dashboard (skeleton) | ✅ | Session 1 | Nav cards linking to features |
| 1.6 | PostHog Analytics | ✅ | Session 2 | Page view tracking, posthog-js |
| 1.7 | Find Jobs (placeholder) | ✅ | Session 1 | Replaced with full UI in Session 3 |

## Phase 2: Core Backend ✅ (Complete)

| # | Feature | Status | Started | Notes |
|---|---------|--------|---------|-------|
| 2.1 | `saved_jobs` DB table | ✅ | Session 3 | Migration + RLS applied |
| 2.2 | Adzuna edge function | ✅ | Session 3 | `jobs-search` deployed. Needs ADZUNA_APP_ID + ADZUNA_API_KEY |
| 2.3 | Job search UI | ✅ | Session 3 | SearchForm, JobCard, JobResults with pagination |
| 2.4 | Save / unsave jobs | ✅ | Session 3 | Optimistic UI |
| 2.5 | Dashboard — saved jobs | ✅ | Session 3 | Count + recent jobs with status |
| 2.6 | PostHog — search/save events | ✅ | Session 3 | `job_search`, `job_saved`, `job_unsaved` |
| 2.7 | `profiles` table | ✅ | Session 3 | Extended user profile (skills, experience, education, resume) |
| 2.8 | `jobs` table | ✅ | Session 3 | Master job catalog with dedup, AI enrichment columns |
| 2.9 | `agent_runs` table | ✅ | Session 3 | AI agent execution tracking |
| 2.10 | `agent_logs` table | ✅ | Session 3 | Step-by-step agent audit trail |
| 2.11 | Resumes storage bucket | ✅ | Session 3 | `resumes` bucket with owner-only RLS |
| 2.12 | Resume upload UI | ✅ | Session 3 | Upload/remove on Profile page (Upgraded to Drag-drop in Session 6) |
| 2.13 | PostHog — resume events | ✅ | Session 3 | `resume_uploaded`, `resume_removed` |
| 2.15 | Profile completeness & form UI | ✅ | Session 6 | Completed ProfileForm (5 sections), ConnectedAccounts (LinkedIn), and ProfileAttentionBanner components |
| 2.16 | LinkedIn OAuth & Donut Chart Fixes | ✅ | Session 7 | Enabled LinkedIn OAuth backend/frontend, linked integrations in profile page, fixed NaN and empty states in DonutChart |
| 2.14 | Job status tracking UI | ✅ | Session 7 | List/manage saved jobs page |

## Phase 3: AI Features

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 3.1 | AI match scoring | ✅ | Session 7 | OpenRouter GPT-4o, score stored on save |
| 3.2 | Skills breakdown | ✅ | Session 8 | Extract skills from job description, compare against user profile, show matched/missing on saved-jobs page |
| 3.3 | Company dossiers | ✅ | Session 15 | AI-generated company research dossiers via OpenRouter, cached in database, premium accordion layout in saved-jobs page |
| 3.4 | Profile enrichment | ✅ | Session 9 / 13 / 15 | Server action downloads resume, extracts text via pdf-parse v2, sends to GPT-4o-mini for structured extraction, upserts to profile. Session 15: switched to gpt-4o-mini for 2x faster extraction, reduced prompt tokens 60%, made agent logging fire-and-forget, compacted UI to single centered column |

## Phase 4: Polish & Deploy ✅

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 4.1 | Error boundaries | ✅ | Sessions 15-21 | Route-level error.tsx on all pages (root, find-jobs, saved-jobs, dashboard, profile) + global-error.tsx with full layout |
| 4.2 | Loading states | ✅ | Sessions 15-21 | Skeleton loaders on all routes (find-jobs, saved-jobs, dashboard, profile) with animate-pulse + matched skeleton shapes |
| 4.3 | Responsive audit | ✅ | Session 22 | Mobile hamburger menu with drawer in AuthenticatedHeader, responsive padding (px-4 sm:px-6, py-8 sm:py-16) across all pages, SavedJobsList cards stack on mobile, dashboard grid 2-col, profile loading skeleton fixed (removed stale ConnectedAccounts block) |
| 4.4 | Vercel deploy | ✅ | Session 23 | Live at https://59m666gk.insforge.site via InsForge deployments |
| 4.5 | Performance audit | ✅ | Session 23 | Build output JS size is ~81KB (shared) + dynamic import of heavy PDF libraries + external pdfjs‑dist |
| 4.6 | Resume preview upload & PDF download | ✅ | Session 20 | SSR "Node is not defined" crash fixed via dynamic import of dom-to-image-more and jspdf inside click handler. pixelRatio lowered to 2 for better text alignment. Upload persists via API route to profiles.resume_preview_text column. Removed unused html2canvas dep. |
| 4.7 | Middleware logout fix | ✅ | Session 16 | Updated NextResponse handling to prevent logout on hot reload |
| 4.8 | Overhauled Find Jobs UI (Feature 09) | ✅ | Session 21 | Upgraded page layout with a premium hero search card, popular search tags, filters sidebar (keyword search, Job Type, Experience, Work Mode, Min Salary slider, Clear All), sorting dropdown, and client-side logic. Added edge function mock jobs fallback. |
| 4.9 | Job Details Page (Feature 10) | ✅ | Session 24 | Implemented dynamic route /find-jobs/[id] and JobDetailsClient with Vercel design language, interactive tracking, and background AI match scoring, skills extraction, and company dossiers. |
| 4.10 | Global job sources (Remotive + Arbeitnow) | ✅ | Session 26 | Added free global job APIs to the jobs-search edge function. Remotive (remote jobs, no auth) + Arbeitnow (EU/global, no auth). Combined results deduplicated by title+company. Source badges shown on JobCard. |
| 4.11 | Batch match scoring on search results | ✅ | Session 26 | New `/api/batch-score-jobs` endpoint scores all visible jobs against user profile in a single AI call. MatchScoreGauge visual component replaces plain text. Freshness badges + source star ratings on JobCard. |
| 4.12 | Location Intelligence | ✅ | Session 26 | Location mode toggle (Remote/Hybrid/On-site) with profile-driven defaults. Syncs to work mode sidebar filter. Profile city auto-populates "where" field. Profile location chips shown below search. ExtractedProfile extended with country/city. Location mode passed to edge function. |
| 4.13 | AI Auto-Apply | ✅ | Session 27 | `/api/auto-apply` generates cover letter, talking points, interview Q&A, key skills. Saves to saved_jobs.cover_letter. Button in job details + saved jobs. Tracks via agent_runs/logs. |
| 4.14 | Dashboard & Analytics | ✅ | Session 27 | Overhauled dashboard with stats cards, pipeline bar, match score distribution chart, top companies, salary insights (min/avg/max), activity timeline, quick actions. |
| 4.15 | Salary Insights | ✅ | Session 27 | Dedicated `/salary-insights` page with salary range overview, role-by-role breakdown, visual bars. Nav link added. |
| 4.16 | Application Tracking (Kanban) | ✅ | Session 27 | Board/List toggle on saved-jobs. 4-column kanban with compact cards, inline status changes, quick action buttons. |
| 4.17 | Smart Alerts | ✅ | Session 27 | `/alerts` management page with create/toggle/delete. Frequency options (realtime/daily/weekly). "Create Alert" button on search results. |
| 4.18 | Quick Apply | ✅ | Session 27 | One-click Quick Apply button — saves job, generates cover letter, marks applied, opens external link. |
| 4.19 | Resume Optimization | ✅ | Session 27 | `/api/resume-optimize` + sidebar card suggesting headline rewrites, keywords, resume tweaks per job. |
| 4.20 | Cover Letter Gen | ✅ | Session 27 | Standalone `/api/cover-letter` + sidebar card to generate and copy cover letter without applying. |
| 4.21 | Best Match Sorting | ✅ | Session 27 | Composite quality score ranking by match score (50%), source reputation, salary data, description detail, freshness, company name, redirect URL. |

## Context Files Status

| File | Status | Notes |
|------|--------|-------|
| project-overview.md | ✅ | Created Session 3 |
| architecture.md | ✅ | Created Session 3 |
| ui-tokens.md | ✅ | Created Session 3 |
| ui-rules.md | ✅ | Created Session 3 |
| ui-registry.md | ✅ | Updated Session 21 |
| code-standards.md | ✅ | Created Session 3 |
| library-docs.md | ✅ | Created Session 3 |
| build-plan.md | ✅ | Created Session 3 |
| progress-tracker.md | ✅ | Updated Session 28 |

### Session 28 — Theme Polish (2026-06-10)

| # | Change | Files |
|---|--------|-------|
| 5.1 | Added global animations (fade-in, fade-in-up, scale-in, shimmer skeleton) | `app/globals.css` |
| 5.2 | Redesigned JobCard — compact match badge, rounded-xl, hover lift, skeleton-shimmer | `app/find-jobs/components/JobCard.tsx` |
| 5.3 | Redesigned hero search — cleaner title, rounded-xl, tighter spacing, staggered animations | `app/find-jobs/components/SearchDashboard.tsx` |
| 5.4 | Redesigned filters sidebar — text-[11px] labels, tighter sections, cleaner checkboxes | `app/find-jobs/components/SearchDashboard.tsx` |
| 5.5 | Redesigned results area — skeleton-shimmer loading, staggered card entry, pagination page numbers | `app/find-jobs/components/SearchDashboard.tsx` |
| 5.6 | Redesigned JobDetailsClient — fixed token violation (bg-text-darkest), hero+sidebar rounded-xl, cleaner spacing, entrance animations | `app/find-jobs/[id]/JobDetailsClient.tsx` |
| 5.7 | Redesigned SavedJobsList — segmented control toggle, cleaner kanban cards, polished list view with staggered entrance, fixed duplicate code | `app/saved-jobs/SavedJobsList.tsx` |
| 5.8 | Redesigned Dashboard — rounded-xl cards, text-[11px] labels, staggered animation delays, cleaner quick actions | `app/dashboard/page.tsx` |
| 5.9 | Redesigned Salary Insights — rounded-xl cards, text-[11px] labels, staggered animations, better hover on listings | `app/salary-insights/page.tsx` |
| 5.10 | Updated ui-registry.md with visual pattern entries for all redesigned components | `context/ui-registry.md` |

**Design system decisions:**
- Standardized card radius from `rounded-[1.75rem]` → `rounded-xl` for all cards
- Standardized label size from `text-xs uppercase tracking-[0.2em]` → `text-[11px] uppercase tracking-[0.2em]` on stat labels and section headers
- Removed `MatchScoreGauge` from JobCard — replaced with compact badge pill
- Replaced `animate-pulse` skeletons → `skeleton-shimmer` class (gradient shimmer)
- No emoji in interactive elements (replaced ✨, ✅ with clean text)
- All hover effects now use `transition-all duration-200` for consistency
- Entry animations use `animate-fade-in-up` with staggered `delay-*` classes

### Session 29 — Job UI Redesign + Realtime (2026-06-10)

| # | Change | Files |
|---|--------|-------|
| 5.11 | Fixed "No matching results" bug — work mode filter no longer auto-sets from profile on page load | `app/find-jobs/components/SearchDashboard.tsx` |
| 5.12 | Redesigned JobCard — company avatar, stacked match score badge, salary accent chip, hover description preview, left accent border glow, pulsing live dot for fresh posts, icon buttons | `app/find-jobs/components/JobCard.tsx` |
| 5.13 | Added realtime job detection via 30s polling of jobs table for new cached entries | `app/find-jobs/components/SearchDashboard.tsx` |
| 5.14 | Added "N new jobs found" toast notification with pulsing accent dot and merge function | `app/find-jobs/components/SearchDashboard.tsx` |
| 5.15 | Upgraded loading skeletons to match new JobCard layout (avatar, meta, buttons) | `app/find-jobs/components/SearchDashboard.tsx` |
| 5.16 | Added CSS custom property stagger (`--entrance-delay` / `job-card-enter`) for card entrance | `app/globals.css`, `SearchDashboard.tsx` |
| 5.17 | Added new animation keyframes: slide-in-left, bounce-in, pulse-border, realtime-new | `app/globals.css` |
| 5.18 | Extended delay helpers from delay-6 to delay-10 (50ms–500ms) | `app/globals.css` |
| 5.19 | Updated ui-registry.md with new JobCard patterns and animation catalog | `context/ui-registry.md` |

**Design system decisions:**
- JobCard left accent bar uses `bg-accent/0 → bg-accent` on hover for directional feedback
- Match score badge changed from horizontal pill to vertical stacked (number + "match" label)
- Salary chips use `rounded-full bg-accent/5` instead of border-based mono pill
- Fresh posts (≤1 day) show `animate-ping` live dot in success green
- Description preview uses `max-h-0 → max-h-12` + opacity for smooth reveal on hover
- Work mode filters no longer auto-activate — prevents empty-state false positives

### Session 30 — Job Details Polish & Wiring (2026-06-11)

| # | Change | Files |
|---|--------|-------|
| 5.20 | Removed deprecated `sessionStorage` fallback in favor of direct database queries for job loading | `app/find-jobs/[id]/JobDetailsClient.tsx` |
| 5.21 | Wired up Quick Apply button in sticky bottom bar alongside standard Apply | `app/find-jobs/[id]/JobDetailsClient.tsx` |
| 5.22 | Added Save Job toggle button to header card | `app/find-jobs/[id]/JobDetailsClient.tsx` |
| 5.23 | Standardized Match Score badge colors to match SearchDashboard (Green ≥80, Blue ≥60, Orange <60) | `app/find-jobs/[id]/JobDetailsClient.tsx` |
| 5.24 | Extracted and formatted Job Type from `raw_data` instead of hardcoded placeholder | `app/find-jobs/[id]/JobDetailsClient.tsx` |
| 5.25 | Fixed Quick Apply & Standard Apply redirect URLs by adding fallback to original `raw_data.redirect_url` and `raw_data.url` for exact post matching | `app/find-jobs/[id]/JobDetailsClient.tsx` |

### Session 31 — Feature 13 Company Research Agent (2026-06-11)

| # | Change | Files |
|---|--------|-------|
| 5.26 | Implemented Company Research Agent with Browserbase + Stagehand | `app/api/agent/research/route.ts` |
| 5.27 | Split Company Research UI components | `app/find-jobs/[id]/CompanyResearch.tsx`, `ResearchCompanyButton.tsx`, `JobDetailsClient.tsx` |
| 5.28 | Added dossier strict types and PostHog tracking events | `types/dossier.ts`, `lib/posthog.ts` |
| 5.29 | Database migration for jobs.company_research | `migrations/20260612000000_rename_company_dossier.sql` |

### Session 32 — Phase 5.3 Payments & Subscriptions

| # | Change | Files |
|---|--------|-------|
| 5.30 | Implemented Pricing page with Pro tier checkout via Stripe | `app/pricing/page.tsx`, `app/pricing/PricingClient.tsx` |
| 5.31 | Added Stripe checkout success page | `app/pricing/success/page.tsx` |
| 5.32 | Added Billing section in Profile page for Stripe Customer Portal | `app/profile/page.tsx`, `ManageSubscriptionButton.tsx` |
| 5.33 | Added global Upgrade to Pro CTA in AuthenticatedHeader | `app/components/AuthenticatedHeader.tsx` |
