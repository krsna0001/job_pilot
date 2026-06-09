# Memory — Session 23: Vercel Deployment via CLI

Last updated: 2026-06-09

## What was built

- **InsForge Deployment** — Deployed the Next.js application to Vercel/InsForge Host using the CLI:
  - Created a node helper `scratch/deploy.js` to stringify and pass environment variables from `.env.local` to avoid PowerShell quotes-stripping issue.
  - Successfully triggered the deployment `aa59e21a-79c6-4c0b-8147-c3ddd09b21f4` on Vercel.
  - The project is fully compiled, ready, and live at: `https://59m666gk.insforge.site`
- **Edge Browser Integration** — Launched the live URL directly in the user's Microsoft Edge browser using `start msedge`.

## Decisions made

- Used `npx @insforge/cli deployments deploy --env <JSON>` to deploy, bypassing browser login requirements for the automated sandbox browser.
- Double-serialized JSON environment variables in Node script to prevent PowerShell shell-parsing corruption.

## Problems solved

- **Invalid --env JSON** — PowerShell stripping double quotes when invoking node commands directly. Fixed by writing a small script `scratch/deploy.js` to execute via `child_process.execSync` with natively formatted arguments.

## Current state

- Deployed and live at: `https://59m666gk.insforge.site`
- Local dev server still active.
- Phase 4 status:
  - 4.1 Error boundaries ✅
  - 4.2 Loading states ✅
  - 4.3 Responsive audit ✅
  - 4.4 Vercel deploy ✅
  - 4.5 Performance audit ⏳ (next priority)

## Next session starts with

1. Performance audit (Feature 4.5) — check bundle size, image optimization, and Lighthouse score/web vitals.
