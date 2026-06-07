# Code Standards — JobPilot

## General

- TypeScript everywhere, strict mode
- No `any` unless absolutely unavoidable
- No inline comments — code should be self-documenting
- Functions under 50 lines where possible

## React / Next.js

- Prefer server components; use `'use client'` only for interactivity
- Server components handle data fetching, client components handle state/effects
- Use `async` server components with `await` data fetching
- Never import browser-only modules (`posthog-js`, etc.) in server components

## Data Access

- Use InsForge SDK for all database/auth operations
- Server: `createInsforgeServer()` from `lib/insforge-server.ts`
- Client: `insforge` from `lib/insforge-client.ts`
- Edge functions invoked via `insforge.functions.invoke()`

## Styling

- Tailwind CSS v4 with `@theme` tokens
- No hardcoded hex values or raw color classes
- Use token classes: `bg-background`, `text-text-primary`, `border-border`
- Responsive: mobile-first with `sm:`, `lg:` breakpoints

## Imports

- Use `@/` path alias for src-relative imports
- Group: React/Next → third-party → local
