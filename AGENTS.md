<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-overview.md
2. context/architecture.md
3. context/ui-tokens.md
4. context/ui-rules.md
5. context/ui-registry.md
6. context/code-standards.md
7. context/library-docs.md
8. context/build-plan.md
9. context/progress-tracker.md

## Rules That Never Change

Always Use:

- atro, tailwind-4-docs, web-design-guidelines these 3 skills for this project
- DESIGN.md for this project design
- Never use hardcoded hex values or raw Tailwind color classes
- Update `progress-tracker.md` and `ui-registry.md` after every feature
- Before any third party library — load its installed skill first,
  then read `context/library-docs.md` for project-specific rules
- If the same problem persists after one corrective prompt —
  stop immediately and run /recover

## Available Skills

- `/architect` — before any complex feature. Think before building.
- `/imprint` — after any new UI component. Capture patterns.
- `/review` — before demo or when something feels off.
- `/recover` — when something breaks after one failed correction.
- `/remember save` — when a feature spans multiple sessions.
- `/remember restore` — when returning after a multi-session feature.

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **JSM_JobPilot** (API base `https://59m666gk.ap-southeast.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.

## Never Solve These Again

### OAuth PKCE code_verifier stored in sessionStorage — server callbacks can't read it

The `@insforge/sdk` stores the PKCE code_verifier in `sessionStorage` during `signInWithOAuth`. A server-side callback route (`/api/auth/callback`) cannot read `sessionStorage`, so `exchangeOAuthCode(code)` fails with "PKCE code verifier not found".

**Fix:** Set `redirectTo` to a client-side page (e.g., `/login`). The SDK's `detectAuthCallback()` runs automatically on page load, reads the verifier from the same tab's `sessionStorage`, and exchanges the code. After exchange, poll `getCurrentUser()` to detect auth and redirect.

**Files to check:** `app/login/LoginCard.tsx` — `redirectTo` must point to a client-rendered page, not a server route.

### Middleware cookie names must match SDK cookie names

The SDK (`@insforge/sdk/ssr`) sets cookies named `insforge_access_token` and `insforge_refresh_token` (via `setAuthCookies`). If middleware checks for different cookie names (e.g., `sb-access-token`), it will always redirect unauthenticated users to `/login` even after successful login.

**Fix:** Keep `middleware.ts` cookie constants in sync with the SDK:
```
insforge_access_token  (not sb-access-token)
insforge_refresh_token (not sb-refresh-token)
```

### ProfileAttentionBanner (piechart) doesn't update after profile save

The banner receives boolean props (`hasSkills`, `hasExperience`, etc.) from the server component at page render time. When `ProfileForm` saves data client-side, the server props are stale.

**Fix:** Wire `onSaveSuccess` on `ProfileForm` to call `router.refresh()` in the parent client wrapper (`ProfilePageClient.tsx`). This triggers a server re-render and fresh props.

### Page layout inconsistencies

Different pages use different `max-w` values (6xl vs 7xl) and some pages are missing `animate-theme-transition`. Standardize to `max-w-7xl` across all pages for consistent content width.

### Stale .next cache causes "Cannot read properties of undefined (reading 'call')"

After modifying server components, API routes, or middleware, the `.next` build cache can become inconsistent. Next.js 13.5 does not always invalidate the cache properly during hot reloads or partial rebuilds, resulting in `TypeError: Cannot read properties of undefined (reading 'call')` at `__webpack_require__` in the production runtime.

**Fix:** Delete `.next` and rebuild:
```powershell
Remove-Item -Recurse -Force ".next"
npm run build
```

**Prevention:** Always delete `.next` before a production build (`npm run build`) after changing server-rendered files (server components, API routes, middleware, page props).

### Image paths in page.tsx don't match public/ file locations

The `<Image>` components in `app/page.tsx` reference images at `/images/name.png` (e.g., `/images/dashboard-demo.png`) but the actual files are directly in `public/` (e.g., `public/dashboard-demo.png`). This causes all page images (dashboard preview, jobs list, agent log, user icon) to 404.

**Fix:** Either move files from `public/` to `public/images/` or update all `src` paths in `app/page.tsx` to remove the `/images/` prefix.

### Tailwind v4 @source paths must be correct

In `app/globals.css`, the `@source` directives tell Tailwind v4's JIT compiler where to scan for class names. If these paths don't cover a component's directory, utility classes used in those components won't be generated.

**Fix:** Verify `@source` paths resolve correctly from `app/globals.css`:
```css
@source "../app/**/*.{ts,tsx,js,jsx}";      /* covers app/ and app/*/ */
@source "../components/**/*.{ts,tsx,js,jsx}"; /* covers root components/ */
```

### Next.js 13.5 dev server sometimes fails to compile CSS

During `next dev`, the development server may serve an older cached CSS file. The first page load after starting the dev server can show unstyled HTML.

**Fix:** Hard refresh (Ctrl+F5) in the browser. If the issue persists, stop the dev server, delete `.next`, and restart.
<!-- INSFORGE:END -->
