# Project Overview — JobPilot

AI-powered job search assistant for developers. Helps users find roles, score matches, and research companies.

## Key Features

- **Job Search**: Search Adzuna IT roles by title and location
- **Match Scoring**: AI-powered match scores comparing jobs to user profiles (planned)
- **Company Research**: AI-generated company dossiers (planned)
- **Saved Jobs**: Bookmark and track application status
- **Auth**: OAuth via Google and GitHub through InsForge
- **Analytics**: PostHog for usage tracking

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Backend**: InsForge BaaS (database, auth, edge functions, storage)
- **Auth**: InsForge SSR auth (Google + GitHub OAuth)
- **Analytics**: PostHog
- **Styling**: Tailwind CSS v4
- **Font**: Inter via `next/font`

## Deployment

- Frontend: Vercel (via InsForge deployments)
- Backend: InsForge Cloud (ap-southeast region)
