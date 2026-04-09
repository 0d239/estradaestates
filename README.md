# Estrada Estates Realty Group

**Full-stack real estate platform for a brokerage based in Hollister, CA (San Benito County).**

Public-facing marketing site + authenticated team dashboard with CRM capabilities — contacts, listings, and communications management.

Live at [estradaestates.com](https://estradaestates.com)

---

## The Journey

### Where we started
A static React + Vite single-page app hosted on GitHub Pages. It was a clean marketing site — team bios, services, resources — but it had no backend, no auth, no data layer. Everything was hardcoded. It served its purpose as a digital business card, but the team needed real tools.

### The initial build (April 7, 2026)

In the first session, we took this from a static SPA to a full-stack platform:

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

### What we've built since

All of the above goals have been shipped:

- **Listings CRUD** — Full create/edit/delete for manual listings, IDX sync for MLS listings, agent assignment, status lifecycle (Active/Pending/Sold/Off Market), filtering by status and source
- **Leads system** — Public contact form auto-creates leads with interest flags (Buy/Sell/Design). Leads convert into Contacts, Listings, or both with a single click
- **Contact management (CRM)** — Client and partner records with buyer preferences (budget, beds/baths, zip codes, radius), seller details, design interests, and notes
- **Mass communications** — Compose and send bulk SMS or email to filtered contact segments, with full message history
- **Activity log** — Audit trail of every dashboard action (creates, updates, deletes, conversions, assignments) with team note-taking
- **Calendar** — Embedded Google Calendar integration
- **Public listings** — Browse page with filters (city, bedrooms, price range, sort), detail page with photo gallery, agent card, and visitor inquiry form
- **Featured listings carousel** — Auto-rotating showcase on the homepage (Just Sold, Just Listed, Active)
- **Design showcase** — Photo gallery on the services page highlighting interior design work
- **Resources page** — External listing links (MLS portal, Homes.com, Zillow) and mortgage calculator

### Where we're going

- **Image uploads** — Supabase Storage for listing photos (currently URL-based)
- **SMS/email delivery** — Provider integration (Twilio, etc.) for actual message sending
- **Client portal** — Login experience for clients to view their transactions
- **IDX automation** — Automated MLS feed sync
- **Polish** — Loading states, error boundaries, SEO meta tags

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
    contact/page.tsx            # /contact — lead capture form
    services/page.tsx           # /services
    resources/page.tsx          # /resources — links + mortgage calculator
    listings/page.tsx           # /listings — public browse with filters
    listings/[id]/page.tsx      # /listings/:id — detail + inquiry form
    login/page.tsx              # /login — team login
    dashboard/                  # Protected routes (tab bar, shares public layout)
      page.tsx                  # /dashboard — overview + quick stats
      contacts/page.tsx         # /dashboard/contacts — CRM (clients + partners)
      listings/page.tsx         # /dashboard/listings — listing management
      leads/page.tsx            # /dashboard/leads — inbound lead pipeline
      communications/page.tsx   # /dashboard/communications — bulk SMS/email
      activity/page.tsx         # /dashboard/activity — audit log + notes
      calendar/page.tsx         # /dashboard/calendar — Google Calendar embed
      help/page.tsx             # /dashboard/help — feature guides for team
      settings/page.tsx         # /dashboard/settings — password management
src/
  components/
    ui/                         # Button, Card, Badge, Accordion
    layout/                     # Header, Footer
    dashboard/                  # ContactForm, ListingForm, ComposeMessage
    FeaturedListings.tsx        # Homepage listing carousel
    DesignShowcase.tsx          # Services page design gallery
    providers.tsx               # QueryClient + Auth providers
  contexts/                     # AuthContext
  lib/
    supabase/                   # Server, client, middleware helpers
    schemas/                    # Zod validation schemas
    database.types.ts           # Supabase generated types
    utils.ts                    # cn() utility
  data/                         # Static data (agents, services, resources)
supabase/
  migrations/                   # SQL schema migrations
```
