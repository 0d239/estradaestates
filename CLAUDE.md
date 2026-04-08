# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Estrada Estates Realty Group — a Next.js App Router + Supabase backend for a real estate brokerage based in Hollister, CA (San Benito County). Public-facing marketing site with an authenticated team dashboard for CRM (contacts, listings, communications).

## Commands

- `bun dev` — start Next.js dev server with Turbopack
- `bun run build` — Next.js production build
- `bun start` — serve the production build locally
- `bun lint` — ESLint across the project

**Package manager: bun** — use `bun` instead of `npm` for all install/run commands.

## Architecture

- **Next.js 16 (App Router)** with **React 19 + TypeScript**
- **Supabase** for auth, PostgreSQL database, and (future) storage — using `@supabase/ssr` for cookie-based auth
- **TanStack Query (React Query)** for client-side data fetching, caching, and mutations
- **Zod** for runtime form/data validation
- **Tailwind CSS v4** (configured via `@theme` in `app/globals.css`). PostCSS integration via `@tailwindcss/postcss`.
- Utility function `cn()` in `src/lib/utils.ts` merges Tailwind classes using `clsx` + `tailwind-merge`

### Routing (App Router)

**Public routes** (route group `app/(public)/` with Header + Footer layout):
- `/` — Team page
- `/services` — Services page
- `/contact` — Public lead/contact form
- `/listings` — Public listings browse
- `/listings/[id]` — Listing detail
- `/login` — Team login

**Protected dashboard routes** (`app/(public)/dashboard/` with tab bar layout, protected by middleware):
- `/dashboard` — Dashboard overview
- `/dashboard/contacts` — Contact management (clients, leads, partners)
- `/dashboard/listings` — Listing management (CRUD)
- `/dashboard/communications` — Mass text/email compose and history

Dashboard lives inside the `(public)` route group so it shares the same Header, Footer, and hills background as the rest of the site. Auth protection is handled by middleware (unchanged — checks `/dashboard` path prefix). The dashboard layout renders a horizontal tab bar for sub-navigation instead of a sidebar.

### Key directories

- `app/` — Next.js App Router pages and layouts
- `app/(public)/` — public route group with shared layout (Header/Footer)
- `app/(public)/dashboard/` — authenticated dashboard with tab bar layout (shares public layout)
- `src/components/ui/` — reusable UI primitives (Button, Card, Badge, Accordion)
- `src/components/layout/` — Header, Footer
- `src/components/dashboard/` — dashboard feature components (ContactForm, ListingForm, ComposeMessage)
- `src/components/providers.tsx` — QueryClientProvider + AuthProvider wrapper
- `src/contexts/` — React context providers (AuthContext)
- `src/lib/` — Supabase clients, database types, utility functions
- `src/lib/supabase/` — server, client, and middleware Supabase client helpers
- `src/lib/schemas/` — Zod validation schemas (contact, listing)
- `src/data/` — static data (agent profiles in `agents.ts`, services in `services.ts`)
- `supabase/migrations/` — SQL migration files for database schema
- `middleware.ts` — Supabase auth session refresh + route protection

### Database

PostgreSQL via Supabase. Tables: `profiles`, `contacts`, `listings`, `contact_listings`, `communications`, `communication_recipients`. Row-level security enabled on all tables. See `supabase/migrations/001_initial_schema.sql` for full schema.

### Styling

Dark theme with black background (`bg-black`) and light text (`text-neutral-200`). Primary brand color is a yellow/gold palette (`primary-50` through `primary-950`). Fonts: Playfair Display (display/body), Inter (sans). Custom container utilities: `.container-narrow` (max-w-5xl) and `.container-wide` (max-w-7xl).

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous/public key

## Deployment

Deployed to Vercel. Auto-deploys on push to `main`. Domain: estradaestates.com (configured in Vercel dashboard).
