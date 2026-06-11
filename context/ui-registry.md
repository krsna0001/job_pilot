# UI Registry — JobPilot

## Registered Components

| Component | Path | Type | Status |
|-----------|------|------|--------|
| AuthCallbackHandler | `app/components/AuthCallbackHandler.tsx` | Client | Stable |
| AuthenticatedHeader | `app/components/AuthenticatedHeader.tsx` | Client | Stable | Nav items now include Salary, Alerts |
| Navbar | `app/components/Navbar.tsx` | Client | Stable |
| PosthogPageView | `app/components/PosthogPageView.tsx` | Client | Stable |
| SignOutButton | `app/components/SignOutButton.tsx` | Client | Stable |
| LoginError | `app/login/error.tsx` | Client | Stable |
| LoginCard | `app/login/LoginCard.tsx` | Client | Stable |
| ProfileAttentionBanner | `app/profile/components/ProfileAttentionBanner.tsx` | Client | Stable |
| ConnectedAccounts | `app/profile/components/ConnectedAccounts.tsx` | Client | Stable |
| ResumeSection | `app/profile/components/ResumeSection.tsx` | Client | Stable |
| ProfileForm | `app/profile/components/ProfileForm.tsx` | Client | Stable | forwardRef with ProfileFormHandle (applyExtracted) |
| ProfilePageClient | `app/profile/components/ProfilePageClient.tsx` | Client | Stable |
| ResumePreviewClient | `app/profile/resume-preview/ResumePreviewClient.tsx` | Client | Stable |
| JobSearchForm | `app/find-jobs/components/JobSearchForm.tsx` | Client | Stable |
| JobCard | `app/find-jobs/components/JobCard.tsx` | Client | Stable |
| JobResults | `app/find-jobs/components/JobResults.tsx` | Client | Stable | Deprecated |
| SearchDashboard | `app/find-jobs/components/SearchDashboard.tsx` | Client | Stable | Best Match composite scoring, Create Alert button on results |
| DonutChart | `app/components/DonutChart.tsx` | Client | Stable |
| EmptyState | `app/components/EmptyState.tsx` | Client | Stable |
| MatchScoreGauge | `app/components/MatchScoreGauge.tsx` | Client | Stable |
| SavedJobsList | `app/saved-jobs/SavedJobsList.tsx` | Client | Stable | Board/List toggle, kanban columns, inline auto-apply |
| JobDetailsClient | `app/find-jobs/[id]/JobDetailsClient.tsx` | Client | Stable | Quick Apply, Resume Tips, Cover Letter Gen, Auto-Apply cards in sidebar |
| AlertsPageClient | `app/alerts/AlertsPageClient.tsx` | Client | Stable | Create/toggle/delete alerts with frequency options |

## Page Registry

| Route | Path | Type | Status |
|-------|------|------|--------|
| Landing | `app/page.tsx` | Server | Stable |
| Login | `app/login/page.tsx` | Server | Stable |
| Dashboard | `app/dashboard/page.tsx` | Server | Stable | Stats cards, pipeline bar, charts, salary insights, activity timeline |
| Profile | `app/profile/page.tsx` | Server | Stable |
| Find Jobs | `app/find-jobs/page.tsx` | Server | Stable |
| Saved Jobs | `app/saved-jobs/page.tsx` | Server | Stable |
| Job Details | `app/find-jobs/[id]/page.tsx` | Server | Stable |
| Salary Insights | `app/salary-insights/page.tsx` | Server | Stable | Role-by-role salary breakdown, range overview |
| Alerts | `app/alerts/page.tsx` | Server | Stable |

## Edge Functions

| Slug | Source | Status |
|------|--------|--------|
| jobs-search | `functions/jobs-search.ts` | Active |

## Database Tables

| Table | Status | Notes |
|-------|--------|-------|
| saved_jobs | Active | RLS: owner-only. +cover_letter, +applied_at columns |
| profiles | Active | RLS: owner-only |
| jobs | Active | Public read |
| agent_runs | Active | RLS: owner-only |
| agent_logs | Active | RLS: owner-only |
| alerts | Active | RLS: owner-only. query, location, frequency, active, last_checked |

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/score-job` | POST | AI match scoring for a saved job |
| `/api/batch-score-jobs` | POST | Batch AI match scoring for search results |
| `/api/extract-skills` | POST | Skills extraction & comparison |
| `/api/extract-profile` | POST | Resume-to-profile extraction |
| `/api/company-dossier` | POST | Company research dossier |
| `/api/auto-apply` | POST | Generate cover letter + application materials, mark as applied |
| `/api/cover-letter` | POST | Standalone cover letter generation |
| `/api/resume-optimize` | POST | Resume optimization suggestions per job |
| `/api/upload-resume-preview` | POST | Save resume preview text |

## Visual Patterns — Session 28 (Theme Polish)

### JobCard

File: `app/find-jobs/components/JobCard.tsx`
Last updated: 2026-06-10 (Session 29)

| Property | Class |
|---|---|
| Card container | `rounded-xl border border-border bg-surface overflow-hidden` |
| Card hover | `hover:shadow-lg hover:border-accent/20 hover:-translate-y-0.5` |
| Left accent bar | `absolute left-0 w-[3px] bg-accent/0 group-hover:bg-accent` |
| Company avatar | `h-11 w-11 rounded-xl bg-accent/5 border-accent/10 text-accent text-sm font-bold` |
| Text — title | `text-[15px] font-semibold text-text-darkest tracking-tight` |
| Text — company | `text-sm text-text-secondary font-medium truncate` |
| Location meta | `text-xs text-text-secondary` with icon `text-text-muted` |
| Salary chip | `rounded-full bg-accent/5 border-accent/10 font-mono text-[11px] font-semibold text-accent` |
| Freshness — fresh | `text-success` with `animate-ping` live dot |
| Source badge | `text-[10px] font-semibold text-accent` on `bg-accent/[0.04]` |
| Match score badge | Stacked layout: `rounded-lg border` with `text-base font-bold tabular-nums` + `text-[9px] match label` — semantic color (success/warning/error) |
| Description preview | `text-xs text-text-muted line-clamp-2 opacity-0 group-hover:opacity-100` transition |
| Save button | `rounded-lg px-3 py-1.5 text-xs font-semibold` — active: `bg-accent/10 text-accent border-accent/15`, inactive: `border text-text-secondary hover:border-accent` |
| View button | `rounded-lg border px-3 py-1.5 text-xs font-semibold text-text-secondary` with eye icon |
| Apply link | `text-[10px] font-medium text-text-muted hover:text-accent` |
| Transitions | `transition-all duration-300` on card, `duration-200` on buttons |
| Skeleton loading | `skeleton-shimmer rounded-lg` for score badge |

**Pattern notes:**
- Cards now have a company initial avatar (hidden on mobile)
- Left accent border glows on hover for visual feedback
- Match score is a vertical stacked badge (number + "match" label)
- Description preview slides in on hover via `max-h-0 → max-h-12` + opacity transition
- Fresh posts (≤1 day old) show a pulsing green dot
- Salary shown as a rounded-full chip with accent coloring

### SearchDashboard — Filters Sidebar

File: `app/find-jobs/components/SearchDashboard.tsx`
Last updated: 2026-06-10

| Property | Class |
|---|---|
| Sidebar container | `rounded-xl border border-border bg-surface p-5 shadow-sm` |
| Section labels | `text-[11px] font-semibold uppercase tracking-wider text-text-secondary` |
| Checkbox labels | `text-sm text-text-dark` with `group-hover:text-text-primary` |
| Checkbox input | `rounded border-border text-accent focus:ring-accent/30 h-4 w-4` |
| Range slider | `w-full accent-accent` |
| Clear button | `text-xs font-medium text-accent hover:text-accent-dark` |
| Section divider | `border-b border-border` with `py-3` spacing |

**Pattern notes:**
- Filters use `text-[11px] uppercase` for labels instead of `text-xs`
- Sections spaced with `py-3` (tighter than `py-4`)
- All interactive elements use `transition-colors` or `transition-all duration-200`

### SearchDashboard — Hero Search

| Property | Class |
|---|---|
| Container | `rounded-xl border border-border bg-surface p-6 md:p-10 shadow-sm` |
| Heading | `text-2xl md:text-4xl font-semibold text-text-darkest tracking-tight` |
| Subtitle | `text-sm text-text-secondary` |
| Popular chips | `rounded-md border border-border bg-surface px-2.5 py-1 text-xs` hover: `hover:border-accent hover:text-accent` |
| Mode toggle | `rounded-lg border border-border bg-surface p-0.5` with inner buttons as `rounded-md` |

### SearchDashboard — Results Area

| Property | Class |
|---|---|
| Result count | `text-sm text-text-secondary` with `font-medium text-text-primary` for the number |
| Sort select | `rounded-lg border border-border bg-surface px-3 py-1.5 text-xs` |
| Create Alert link | `rounded-lg border-accent/20 bg-accent/5 text-accent` hover: `hover:bg-accent hover:text-accent-foreground` |
| Pagination page | `w-8 h-8 rounded-lg text-xs font-medium` — active: `bg-accent text-accent-foreground shadow-sm`, inactive: `border bg-surface text-text-secondary` |
| Skeleton card | `rounded-xl border border-border bg-surface p-5 sm:p-6` with company avatar, meta, and button placeholders |

### SearchDashboard — Realtime Jobs Toast

| Property | Class |
|---|---|
| Toast container | `rounded-xl border-accent/30 bg-accent/5 px-4 py-3 text-sm font-semibold text-accent` |
| Live dot | `animate-ping` + `relative flex h-2.5 w-2.5 rounded-full bg-accent` |
| Hover | `hover:bg-accent/10` |
| Entry animation | `animate-fade-in-down` |

### JobDetailsClient — Sidebar Cards

File: `app/find-jobs/[id]/JobDetailsClient.tsx`
Last updated: 2026-06-10

| Property | Class |
|---|---|
| Card container | `rounded-xl border border-border bg-surface p-5 shadow-sm` |
| Card section label | `text-xs uppercase tracking-[0.2em] font-semibold text-text-muted` |
| Card body text | `text-sm text-text-secondary` |
| Action buttons | `rounded-lg` with `px-4 py-2.5 text-xs font-semibold` |
| Primary button | `bg-accent text-accent-foreground hover:bg-accent-dark shadow-sm hover:shadow` |
| Secondary button | `border border-border bg-surface text-text-secondary hover:border-accent hover:text-accent` |
| Save inactive | `border border-border bg-surface text-text-secondary hover:border-accent hover:text-accent hover:bg-accent/[0.02]` |
| Save active | `border border-accent/30 bg-accent/5 text-accent hover:bg-accent/10` |
| Spinner | `animate-spin h-4 w-4` with `opacity-25 circle` + `opacity-75 path` |

### JobDetailsClient — Hero Header

| Property | Class |
|---|---|
| Container | `rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm` |
| Title | `text-2xl sm:text-3xl font-semibold text-text-darkest tracking-tight` |
| Company name | `text-base text-text-secondary font-medium` |
| Meta row | `text-sm text-text-muted` with `gap-x-5 gap-y-2` |
| Source badge | `font-mono text-[10px] tracking-widest text-text-muted uppercase border bg-surface-muted px-2 py-0.5 rounded` |

### SavedJobsList — View Toggle

File: `app/saved-jobs/SavedJobsList.tsx`
Last updated: 2026-06-10

| Property | Class |
|---|---|
| Segmented control | `rounded-lg border border-border bg-surface p-0.5` |
| Active segment | `rounded-md bg-accent text-accent-foreground shadow-sm` |
| Inactive segment | `text-xs font-medium text-text-secondary hover:text-text-primary` |
| Status filter | `rounded-md px-3 py-1.5 text-xs font-medium` — active: `bg-accent text-accent-foreground shadow-sm`, inactive: `border bg-surface text-text-secondary` |

### SavedJobsList — List View Card

| Property | Class |
|---|---|
| Card container | `rounded-xl border border-border bg-surface p-5 shadow-sm` |
| Card hover | `hover:shadow-md hover:-translate-y-0.5` |
| Title | `text-base font-semibold text-text-darkest hover:text-accent` |
| Company | `text-sm text-text-secondary` |
| Description | `mt-3 line-clamp-2 text-sm leading-relaxed text-text-dark` |
| Action buttons | `rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium` hover: `hover:border-accent hover:text-accent` |
| Auto-apply button | `rounded-lg border border-accent/20 bg-accent/5 text-accent` hover: `hover:bg-accent hover:text-accent-foreground` |
| Entry animation | `animate-fade-in-up` with staggered delay via `style={{ animationDelay: ... }}` |

### SavedJobsList — Kanban Board

| Property | Class |
|---|---|
| Column container | `rounded-xl border border-border bg-surface shadow-sm overflow-hidden` |
| Column header | `border-l-[3px]` with color per status, `px-4 py-3` |
| Column header label | `text-sm font-semibold text-text-darkest` |
| Column count badge | `rounded-md bg-surface-muted px-2 py-0.5 text-[11px]` |
| Card container | `rounded-lg border border-border bg-surface-muted p-3` hover: `hover:shadow-sm` |
| Card title | `text-sm font-semibold text-text-darkest leading-snug line-clamp-2` |
| Card company | `text-xs text-text-secondary` |
| Status select | `rounded-md border border-border bg-surface px-2 py-1 text-[11px]` |
| Apply button | `rounded-md border border-accent/20 bg-accent/5 text-accent` hover: `hover:bg-accent hover:text-accent-foreground` |

### Dashboard — Stats Cards

File: `app/dashboard/page.tsx`
Last updated: 2026-06-10

| Property | Class |
|---|---|
| Card container | `rounded-xl border border-border bg-surface p-5 shadow-sm` |
| Stat value | `text-2xl font-bold` — default: `text-text-darkest`, applied: `text-accent`, interview: `text-warning` |
| Stat label | `text-[11px] uppercase tracking-[0.2em] font-semibold text-text-muted` |
| Entry animation | `animate-fade-in-up` with `delay-1` through `delay-4` staggering |
| Chart card | `rounded-xl border border-border bg-surface p-5 shadow-sm` |

### Dashboard — Quick Action Cards

| Property | Class |
|---|---|
| Card container | `rounded-xl border border-border bg-surface p-5 text-center shadow-sm` |
| Hover | `hover:border-accent hover:bg-surface-secondary hover:shadow` |
| Transition | `transition-all duration-200` |
| Number value | `text-2xl font-bold text-accent` (or `text-info`) |
| Label | `text-[11px] uppercase tracking-[0.2em] font-semibold text-text-muted` |

### Salary Insights

File: `app/salary-insights/page.tsx`
Last updated: 2026-06-10

| Property | Class |
|---|---|
| Stat card | `rounded-xl border border-border bg-surface p-5 shadow-sm text-center` |
| Stat value | `text-2xl font-bold` — accent for average, `text-text-darkest` for min/max |
| Stat label | `text-[11px] uppercase tracking-[0.2em] font-semibold text-text-muted` |
| Section card | `rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm` |
| Role card | `rounded-lg border border-border bg-surface-muted p-4` |
| Listing row | `rounded-lg border border-border px-4 py-3` with `hover:bg-surface-muted` |
| Entry animation | `animate-fade-in-up` with staggered delays |

### Global Animations

Defined in: `app/globals.css`

| Animation | Keyframes | Duration | Use |
|---|---|---|---|
| `animate-fade-in` | opacity 0→1 | 0.3s | Page mount, card entrance |
| `animate-fade-in-up` | opacity 0 + translateY(8px) → 0 | 0.35s | Staggered list items |
| `animate-fade-in-down` | opacity 0 + translateY(-4px) → 0 | 0.25s | Error messages, realtime toast |
| `animate-scale-in` | opacity 0 + scale(0.97) → 1 | 0.3s | Modal/pop-in effects |
| `animate-slide-in-left` | opacity 0 + translateX(-16px) + scale(0.98) → 0 | 0.4s | Realtime job entries |
| `animate-bounce-in` | scale(0.9) → scale(1.02) → 1 | 0.5s | New item highlight |
| `animate-pulse-border` | pulsing box-shadow + border | 2s infinite | Realtime highlight ring |
| `skeleton-shimmer` | shimmer gradient sweep | 1.5s infinite | Loading skeletons |
| `job-card-enter` | fade-in-up with CSS var `--entrance-delay` | 0.4s | Search results stagger |
| `realtime-new` | bounce-in + pulse-border×2 | combined | New realtime job highlight |

Delay helpers: `.delay-1` through `.delay-10` (50ms–500ms in 50ms steps).

**Pattern notes:**
- All animations use `cubic-bezier(0.4, 0, 0.2, 1)` easing (Material-inspired smooth curve)
- `job-card-enter` uses a CSS custom property `--entrance-delay` for per-item stagger
- Skeletons use `skeleton-shimmer` class instead of `animate-pulse` for a modern shimmer effect

## Library Modules

| Module | Purpose |
|--------|---------|
| `lib/score-job.ts` | Match scoring (scoreJobAgainstProfile, scoreAndSaveJob, batchScoreJobs) |
| `lib/extract-skills.ts` | Skills extraction & comparison |
| `lib/extract-profile.ts` | Resume-to-profile extraction |
| `lib/company-dossier.ts` | Company research dossier |
| `lib/auto-apply.ts` | AI auto-apply (cover letter, talking points, interview Q&A) |
| `lib/resume-optimize.ts` | Resume optimization + standalone cover letter generation |
| `lib/parse-resume.ts` | PDF text extraction |
