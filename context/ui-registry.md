# UI Registry — JobPilot

## Registered Components

| Component | Path | Type | Status |
|-----------|------|------|--------|
| AuthCallbackHandler | `app/components/AuthCallbackHandler.tsx` | Client | Stable |
| AuthenticatedHeader | `app/components/AuthenticatedHeader.tsx` | Client | Stable |
| Navbar | `app/components/Navbar.tsx` | Client | Stable |
| PosthogPageView | `app/components/PosthogPageView.tsx` | Client | Stable |
| SignOutButton | `app/components/SignOutButton.tsx` | Client | Stable |
| LoginError | `app/login/error.tsx` | Client | Stable |
| LoginCard | `app/login/LoginCard.tsx` | Client | Stable |
| ProfileAttentionBanner | `app/profile/components/ProfileAttentionBanner.tsx` | Client | Stable |
| ConnectedAccounts | `app/profile/components/ConnectedAccounts.tsx` | Client | Stable |
| ResumeSection | `app/profile/components/ResumeSection.tsx` | Client | Stable |
| ProfileForm | `app/profile/components/ProfileForm.tsx` | Client | Stable | forwardRef with ProfileFormHandle (applyExtracted) |
| ProfilePageClient | `app/profile/components/ProfilePageClient.tsx` | Client | Stable | Thin client wrapper bridging ResumeSection → ProfileForm ref |
| ResumePreviewClient | `app/profile/resume-preview/ResumePreviewClient.tsx` | Client | Stable | Handles resume preview, PDF download (dom-to-image-more + jspdf, dynamic import), text upload (POST /api/upload-resume-preview) |
| JobSearchForm | `app/find-jobs/components/JobSearchForm.tsx` | Client | Stable | Unified search card with search & location inputs and popular searches |
| JobCard | `app/find-jobs/components/JobCard.tsx` | Client | Stable |
| JobResults | `app/find-jobs/components/JobResults.tsx` | Client | Stable | Deprecated (replaced by SearchDashboard list) |
| SearchDashboard | `app/find-jobs/components/SearchDashboard.tsx` | Client | Stable | Overhauled dashboard with hero search, sidebar filters, sorting, and client-side logic |
| DonutChart | `app/components/DonutChart.tsx` | Client | Stable |
| SavedJobsList | `app/saved-jobs/SavedJobsList.tsx` | Client | Stable |

## Page Registry

| Route | Path | Type | Status |
|-------|------|------|--------|
| Landing | `app/page.tsx` | Server | Stable |
| Login | `app/login/page.tsx` | Server | Stable |
| Dashboard | `app/dashboard/page.tsx` | Server | Stable |
| Profile | `app/profile/page.tsx` | Server | Stable |
| Find Jobs | `app/find-jobs/page.tsx` | Server | Stable |
| Saved Jobs | `app/saved-jobs/page.tsx` | Server | Stable |

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

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/score-job` | POST | Trigger AI match scoring for a saved job |
| `/api/extract-skills` | POST | Extract and compare skills from job vs profile |
| `/api/extract-profile` | POST | Download resume from storage, extract PDF text, parse with GPT-4o into structured profile, log to agent_runs |
| `/api/company-dossier` | POST | Trigger AI company research dossier generation |
| `/api/upload-resume-preview` | POST | Save resume preview text to profiles.resume_preview_text using server admin client |

## Library Modules

| Module | Purpose |
|--------|---------|
| `lib/score-job.ts` | OpenRouter-based match scoring (scoreJobAgainstProfile, scoreAndSaveJob) |
| `lib/extract-skills.ts` | OpenRouter-based skills extraction & comparison (extractSkillsFromJob) |
| `lib/extract-profile.ts` | OpenRouter-based resume-to-profile extraction (extractProfileFromResume) |
| `lib/company-dossier.ts` | OpenRouter-based company research & dossier generation (generateCompanyDossier, generateAndSaveDossier) |
| `lib/parse-resume.ts` | pdfjs-dist wrapper — extracts plain text from PDF buffers |
