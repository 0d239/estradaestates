# Estrada Estates Realty Group

**Full-stack real estate platform for a brokerage based in Hollister, CA (San Benito County).**

Public-facing marketing site + authenticated team dashboard with CRM capabilities — contacts, listings, and communications management.

Live at [estradaestates.com](https://estradaestates.com)

---

## The Journey

### Where we started
A static React + Vite single-page app hosted on GitHub Pages. It was a clean marketing site — team bios, services, resources — but it had no backend, no auth, no data layer. Everything was hardcoded. It served its purpose as a digital business card, but the team needed real tools.

### What we built (April 7, 2026)

In a single session, we took this from a static SPA to a full-stack platform:

1. **Set up Supabase** — PostgreSQL database with Row Level Security, auth system, and typed client helpers (`server`, `client`, `middleware` variants via `@supabase/ssr`)
2. **Set up Vercel** — Migrated hosting off GitHub Pages onto Vercel with auto-deploy from `main`
3. **Migrated Vite to Next.js 16** — Full rewrite to App Router with React 19, Turbopack dev server, server components by default
4. **Built the route architecture** — Public route group `(public)/` with shared Header/Footer layout, plus protected `/dashboard` routes with sidebar layout
5. **Designed and migrated the database schema** — Tables for `profiles`, `contacts`, `listings`, `contact_listings`, `communications`, `communication_recipients` with RLS policies
6. **Built the CRM foundation** — Dashboard pages for contact management, listing management, and mass communications (text/email compose + history)
7. **Migrated from middleware to proxy** — Adopted Next.js 16's `proxy.ts` pattern for auth gates and route protection
8. **Wired up the full stack** — Supabase auth with cookie-based sessions, TanStack Query for client-side data fetching, Zod for validation

### Dashboard unification (April 7, 2026)

Merged the dashboard into the main site experience:

1. **Moved dashboard into public route group** — `app/dashboard/` → `app/(public)/dashboard/` so it shares the Header, Footer, and panning hills background
2. **Replaced sidebar with tab bar** — horizontal tabs (Overview, Contacts, Listings, Messages) instead of a separate sidebar layout
3. **Added "Dash" nav link** — appears in the main header nav only when logged in
4. **Simplified login button** — icon-only (no text) for a cleaner header
5. **Auth unchanged** — middleware still protects `/dashboard` routes; the `(public)` route group is invisible to URLs

### Where we're going

- **Listings CRUD** — Full create/edit/delete flow for listings with image uploads via Supabase Storage
- **Contact management** — Import, tag, segment, and track client interactions
- **Mass communications** — Send bulk texts and emails to contact segments
- **Leads system** — Capture and route inbound leads
- **Client portal** — Eventually: a login experience for clients to view their transactions
- **Polish** — Loading states, error boundaries, mobile refinements, SEO

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Data Fetching | TanStack Query (React Query) |
| Validation | Zod |
| Icons | Lucide React |
| Hosting | Vercel |

## Getting Started

```bash
bun install
bun dev
```

Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server with Turbopack |
| `bun run build` | Production build |
| `bun start` | Serve production build locally |
| `bun lint` | Run ESLint |

## Project Structure

```
app/
  layout.tsx                    # Root layout (fonts, providers)
  (public)/                     # Public routes (Header + Footer)
    page.tsx                    # / — Team page
    services/page.tsx           # /services
    resources/page.tsx          # /resources
    listings/page.tsx           # /listings — browse
    listings/[id]/page.tsx      # /listings/:id — detail
    login/page.tsx              # /login — team login
  dashboard/                    # Protected routes (tab bar layout, shares public layout)
    page.tsx                    # /dashboard — overview
    contacts/page.tsx           # /dashboard/contacts
    listings/page.tsx           # /dashboard/listings
    communications/page.tsx     # /dashboard/communications
src/
  components/
    ui/                         # Button, Card, Badge, Accordion
    layout/                     # Header, Footer
    dashboard/                  # ContactForm, ListingForm, ComposeMessage
    providers.tsx               # QueryClient + Auth providers
  contexts/                     # AuthContext
  lib/
    supabase/                   # Server, client, middleware helpers
    schemas/                    # Zod validation schemas
    utils.ts                    # cn() utility
  data/                         # Static data (agents, services)
supabase/
  migrations/                   # SQL schema migrations
```
