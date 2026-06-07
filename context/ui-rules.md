# UI Rules — JobPilot

## Component Patterns

- Server components by default, client components only when interactivity is needed
- Client components go in `components/` subdirectory of their route
- Use `'use client'` directive only when necessary

## Layout Conventions

- Max width containers: `max-w-6xl` or `max-w-7xl`
- Padding: `px-6 py-16` for page content
- Card sections: `rounded-[2rem] border border-border bg-surface p-10 shadow-sm`
- Small cards: `rounded-[1.75rem] border border-border bg-surface p-6`

## Typography

- Headings: `text-4xl font-semibold text-text-darkest`
- Section labels: `text-xs uppercase tracking-[0.3em] text-accent`
- Body: `text-base text-text-secondary`
- Buttons: `text-sm font-medium`

## Navigation

- Authenticated pages use `AuthenticatedHeader` component
- Marketing page has its own inline header
- "Start for free" / "Get started" buttons link to `/login`
