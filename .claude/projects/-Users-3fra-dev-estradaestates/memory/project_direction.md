---
name: Project Direction
description: Estrada Estates evolution from static SPA to full-stack CRM — completed migration, now building out CRM features
type: project
---

## Completed (April 7, 2026)

Major migration session — took the project from a static Vite SPA on GitHub Pages to a full-stack Next.js 16 app on Vercel + Supabase:

1. Supabase setup — PostgreSQL with RLS, auth, typed client helpers
2. Vercel setup — auto-deploy from main, domain configured (estradaestates.com)
3. GitHub Pages migration — fully moved off, Vercel is now the host
4. Vite-to-Next.js 16 migration — App Router, React 19, Turbopack, server components
5. CRM route + DB schema — dashboard pages (contacts, listings, communications) and full schema with 6 tables + RLS
6. Middleware-to-proxy migration — adopted Next.js 16 proxy.ts pattern
7. Full stack wiring — Supabase auth with cookies, TanStack Query, Zod validation

## Dashboard unification (April 7, 2026)

Merged dashboard into the main site layout:

1. Moved `app/dashboard/` into `app/(public)/dashboard/` — shares Header, Footer, and hills background
2. Replaced sidebar with horizontal tab bar (Overview, Contacts, Listings, Messages)
3. Added auth-gated "Dash" nav link in the main header
4. Simplified login button to icon-only
5. Middleware auth protection unchanged (checks `/dashboard` path prefix)

**Why:** Dashboard felt like a separate app. Unifying it makes the site feel cohesive — the dashboard is just another section, not a different product.

## Next up

- Listings CRUD with Supabase Storage for images
- Contact management (import, tag, segment, track)
- Mass communications (bulk text/email)
- Leads system (capture + routing)
- Client portal (future — lower priority)
- Polish: loading states, error boundaries, mobile, SEO

**Why:** Transitioning from a marketing-only site to an operational tool for the brokerage. Agent-facing features are the priority; client-facing login is secondary.

**How to apply:** The foundation is laid. Future work should focus on wiring up real data flows through the existing scaffolding — forms that write to Supabase, queries that populate dashboard views, and real auth-gated workflows.
