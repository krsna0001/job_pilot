# Build Plan — JobPilot

## Feature Status Key
- ✅ Done
- 🔧 In Progress
- ⏳ Planned
- ❌ Blocked

---

## Phase 1: Foundation (Complete)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1.1 | Landing/Marketing Page | ✅ | Hero, features, testimonials, CTA |
| 1.2 | Auth — OAuth (Google + GitHub) | ✅ | LoginCard, AuthCallbackHandler |
| 1.3 | Auth — Middleware | ✅ | Cookie-based route protection |
| 1.4 | Auth — Profile Page | ✅ | Shows user info, sign out |
| 1.5 | Dashboard (skeleton) | ✅ | Basic nav cards |
| 1.6 | PostHog Analytics (page views) | ✅ | PosthogPageView component |
| 1.7 | Find Jobs (placeholder) | ✅ | Basic page, no functionality |

## Phase 2: Core Backend (Complete)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 2.1 | `saved_jobs` DB table | ✅ | Migration with RLS |
| 2.2 | Adzuna edge function | ✅ | Deployed, active |
| 2.3 | Job search UI | ✅ | Search form, results, pagination |
| 2.4 | Save / unsave jobs | ✅ | Optimistic UI |
| 2.5 | Dashboard — saved jobs | ✅ | Count + recent jobs |
| 2.6 | PostHog — search/save events | ✅ | Custom event tracking |
| 2.7 | `profiles` table | ✅ | Extended user profile |
| 2.8 | `jobs` table | ✅ | Master job catalog + AI enrichment |
| 2.9 | `agent_runs` table | ✅ | AI execution tracking |
| 2.10 | `agent_logs` table | ✅ | Audit trail |
| 2.11 | Job status tracking UI | ✅ | saved → applied → interviewing → rejected |

## Phase 3: AI Features

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 3.1 | AI match scoring | ✅ | Compare jobs vs user profile via OpenRouter |
| 3.2 | Skills breakdown | ✅ | Extract skills from job + profile |
| 3.3 | Company dossiers | ✅ | AI research briefs from public pages |
| 3.4 | Profile enrichment | ✅ | Upload resume, extract skills |

## Phase 4: Polish & Deploy

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 4.1 | Error boundaries | ✅ | |
| 4.2 | Loading states | ✅ | Next.js loading.tsx files added to core routes |
| 4.3 | Responsive audit | ✅ | Final mobile pass complete |
| 4.4 | Vercel deploy | ✅ | Remote deployment build issues resolved |
| 4.5 | Performance audit | ✅ | Next.js optimizations verified |

## Phase 5: Post-Launch

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 5.1 | Realtime notifications | ✅ | InsForge realtime subscriptions for `alert_notifications` |
| 5.2 | Email alerts | ✅ | Daily/weekly cron jobs |
| 5.3 | Payments / subscriptions | ✅ | Stripe via InsForge |
