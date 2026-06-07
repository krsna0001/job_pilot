# UI Tokens — JobPilot

Defined in `app/globals.css` via Tailwind v4 `@theme`.

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| `bg-background` | `#f6f7fb` | Page background |
| `bg-surface` | `#ffffff` | Card backgrounds |
| `bg-surface-secondary` | `#f9fafb` | Muted card backgrounds |
| `bg-surface-tertiary` | `#f2f5f7` | Tertiary surfaces |
| `bg-surface-muted` | `#f4f5fb` | Very muted backgrounds |
| `border-border` | `#e7eaf3` | Default borders |
| `border-border-light` | `#e5e7eb` | Light borders |
| `text-text-primary` | `#101828` | Primary text |
| `text-text-secondary` | `#6a7282` | Secondary text |
| `text-text-muted` | `#99a1af` | Muted text |
| `text-text-dark` | `#364153` | Dark text |
| `text-text-darkest` | `#111827` | Headings |
| `bg-accent` | `#7c5cfc` | Primary accent (purple) |
| `bg-accent-dark` | `#5e4cff` | Accent hover |
| `bg-accent-light` | `#f3e8ff` | Accent backgrounds |
| `text-accent-foreground` | `#ffffff` | Text on accent |
| `bg-success` | `#10b981` | Success states |
| `bg-info` | `#61a8ff` | Info states |
| `bg-warning` | `#ff8904` | Warning states |
| `bg-error` | `#ef4444` | Error states |

## Typography

- **Font**: Inter via `next/font/google`
- **CSS variable**: `--font-inter`
- **Tailwind token**: `font-sans` → `var(--font-inter), "Inter", sans-serif`

## Border Radius

- `rounded-sm`: `4px`
- `rounded-md`: `8px`
- `rounded-lg`: `12px`
- `rounded-xl`: `16px`
- `rounded-2xl`: `20px` (default via arbitrary)
- `rounded-[1.75rem]`: `28px`
- `rounded-[2rem]`: `32px`
- `rounded-full`: `9999px`

## Rules

- Never use hardcoded hex values or raw Tailwind color classes
- Always reference tokens: `bg-background`, `text-text-primary`, `border-border`, etc.
