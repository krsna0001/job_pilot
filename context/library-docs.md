# Library Documentation — JobPilot

## InsForge SDK (`@insforge/sdk`)

- Client SDK for database, auth, functions, storage, AI, realtime, email, payments
- Import from `@insforge/sdk` for browser, `@insforge/sdk/ssr` for Next.js SSR
- All methods return `{ data, error }`
- Database inserts require array format: `insert([{...}])`

## InsForge CLI (`@insforge/cli`)

- Never install globally; always use `npx @insforge/cli`
- Backend infrastructure: migrations, functions, secrets, config
- Project linked: JSM_JobPilot (490c9a22-4fbe-4294-8821-732d866f0da7)

## PostHog (`posthog-js`)

- Client-side analytics
- Initialized in `lib/posthog.ts`
- `capture(event, props)` for custom events
- `PosthogPageView` component fires `page_view` on mount

## Tailwind CSS v4

- Uses `@import "tailwindcss"` syntax
- `@theme` block for design tokens
- `@source` directives for content paths
- No `@apply` in component files
