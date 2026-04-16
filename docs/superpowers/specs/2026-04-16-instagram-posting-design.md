# Instagram Posting Infrastructure — Design

**Date:** 2026-04-16
**Scope:** Phase 1 (manual generator). Phase 2 (direct API posting) is deferred and explicitly designed to swap in without rework.

## Goal

Let agents generate an Instagram-ready image and caption for any listing from inside the dashboard, then copy/download to post manually from their own account. Nothing about the post is persisted — no history, no status tracking. The generator lives per-listing (no new top-level dashboard tab).

## Out of scope

- Direct posting via Instagram Graph API (Phase 2).
- Post history, "mark as posted" log, or reminders.
- Multi-photo carousel posts (single photo per post for now).
- Instagram Stories and Reels (feed posts only).
- Agent-spotlight, listing-unrelated posts.
- Per-agent OAuth / Instagram Business connections.

## User flow

1. Agent opens the dashboard listings page (`/dashboard/listings`).
2. Each listing row has a new **Social** button (disabled if the listing has no photos).
3. Clicking it opens a `SocialPostModal` scoped to that listing.
4. Inside the modal:
   - **Post type** selector (4 options): New Listing · Open House · Price Drop · Just Sold.
   - **Layout** selector (3 options): Classic banner · Minimal stamp · Editorial split.
   - **Photo picker** — thumbnails of `listings.photos`, first is default.
   - **Post-type extras** appear conditionally:
     - Open House: date/time input.
     - Price Drop: old price input.
     - Just Sold: "Hide price" toggle.
   - **Caption variant** selector (2–3 variants per post type).
   - **Editable caption** textarea, pre-filled from the selected variant.
   - **Live preview** — image re-renders as selections change.
5. Two actions at the bottom:
   - **Download image (PNG)** — forces browser download of the rendered 1080×1350 PNG.
   - **Copy caption** — writes the textarea contents to the clipboard.
6. Closing the modal discards all state.

## Post types and templates

Four post types, three layouts, 2–3 caption variants per type. Layouts are orthogonal — any post type can be rendered in any layout.

### Post types

| Post type | Required inputs beyond listing | Notes |
|---|---|---|
| New Listing | Listing photos, price | Default state. |
| Open House | Date + time (manual input) | Shows date/time on the composed image. |
| Price Drop | Old price (manual input) | Shows old price struck through next to new price. |
| Just Sold | Optional "hide price" toggle | When toggled, price is replaced by a "SOLD" stamp. |

### Layouts

Visual mockups: `.superpowers/brainstorm/36885-1776357549/content/new-listing-templates.html` (retained for reference).

- **Classic banner** — photo with a dark gradient fade into a bottom info band. Conservative; high information density.
- **Minimal stamp** — full-bleed photo with a small info card in one corner. Photo is the hero.
- **Editorial split** — photo occupies the top ~60%, a typographic info panel below. Magazine style.

All three target 1080×1350 (Instagram 4:5 portrait feed post).

### Caption variants

Each post type ships with 2–3 variants. Variants differ in tone/structure (e.g., "short & punchy", "detailed & warm", "question-hook"). All variants are template strings with mad-lib slots filled from listing data. The agent can edit the filled result freely before copying. Examples belong in `src/lib/social/captions.ts`.

## Architecture

### File layout

**New files**
- `app/api/listings/[id]/og/route.tsx` — `ImageResponse` endpoint. Fetches the listing server-side, renders the selected layout, returns a PNG.
- `src/components/dashboard/SocialPostModal.tsx` — the modal UI.
- `src/lib/social/types.ts` — `PostType`, `LayoutId`, `PostData`, `PostTypeExtras` types.
- `src/lib/social/templates.tsx` — three layout components (`ClassicLayout`, `MinimalLayout`, `EditorialLayout`) that each accept normalized `PostData` and return JSX for `ImageResponse`.
- `src/lib/social/captions.ts` — caption templates keyed by `[postType][variantId]`, each a function `(data: PostData) => string`.
- `src/lib/social/fonts.ts` — fetches and caches the Libre Baskerville font(s) for `ImageResponse`.
- `src/lib/schemas/social-post.ts` — Zod schema validating modal form state and the OG route's query params.

**Modified files**
- `app/(public)/dashboard/listings/page.tsx` — adds the **Social** button to each listing row and wires it to `SocialPostModal`.

### Rendering approach

`next/og` `ImageResponse` (Satori). Chosen over Puppeteer (too heavy for Vercel cold starts) and client-side `html-to-image` (flaky with cross-origin photos and fonts).

Known `ImageResponse` constraints that the layouts must respect:
- `display: flex` only (no `grid`).
- No `backdrop-filter`, no CSS filters.
- Images must be fetchable URLs (no `data:` blobs).
- Fonts must be supplied as `ArrayBuffer` via the `fonts` option.

The three HTML mockups use a few features (e.g., `backdrop-filter`, absolute positioning) that need adjustment during implementation. The layouts themselves are achievable with the Satori subset; the mockups are design intent, not literal source.

### Data flow

```
Agent clicks Social
  → SocialPostModal mounts with { listingId }
  → Agent updates state (type, layout, photoIdx, variant, extras, caption)
  → Preview <img src="/api/listings/{id}/og?type=...&layout=...&photo=...&openHouseAt=..."> (debounced ~300ms)
      → Route handler loads listing by id via Supabase server client
      → Validates query params (Zod)
      → Selects the layout component by id
      → Returns ImageResponse (PNG, 1080×1350)
  → Download button hits the same URL with `?download=1` and forces a filename
  → Copy caption button writes textarea contents to clipboard
```

No write paths. No new database tables.

### Auth

The existing `proxy.ts` (Next.js 16's replacement for `middleware.ts`) only redirects unauthenticated traffic on `/dashboard/*`; it does not gate `/api/*`. The OG route must therefore enforce auth itself: the route handler calls `createClient()` (server Supabase client) and `supabase.auth.getUser()` up-front, and returns a 401 `Response` when there is no user.

Phase 2 note: when Instagram's Graph API needs to fetch the PNG directly, it won't have a Supabase session cookie. At that point we switch to a short-lived signed URL (HMAC over listing id + params + expiry) that the Graph API call includes. Out of scope for Phase 1.

## Edge cases

- **No photos:** Social button disabled. Hint text: "Add a listing photo to enable social posts."
- **Missing price for a template that needs it:** warning in the modal, Download disabled until resolved. Just Sold with "hide price" toggled is allowed with no price.
- **Missing beds/baths/sqft:** the stats row drops missing slots (layouts render stats as a flex row, so a missing slot collapses naturally).
- **Photo URL fetch failure inside `ImageResponse`:** return a 4:5 placeholder image with an error label, so the preview visibly breaks rather than hanging.
- **Font fetch failure:** fall back to `system-ui`. The route still returns a valid PNG.
- **Preview spam:** debounce preview URL changes ~300ms while the agent types into inputs.

## Phase 2 (direct API posting — deferred)

Out of scope for this spec; captured here only so Phase 1 doesn't foreclose the path.

The Phase 1 OG route already produces a publicly-fetchable PNG URL, which is what Instagram's Content Publishing API needs. Phase 2 would add:
- Per-agent Meta OAuth flow (Instagram Business/Creator + Facebook Page connection).
- A small table for OAuth tokens keyed by `profile_id`, with refresh handling.
- A "Post to Instagram" button alongside Download/Copy that calls the Graph API with the existing OG URL and caption.
- A minimal post log (listing id, agent, IG post id, timestamp) added at that point.

None of this requires changing Phase 1 file layout or data flow.

## Testing

- Unit tests for `src/lib/social/captions.ts` — each variant × a few representative `PostData` inputs → expected string output.
- Unit tests for each layout component — render to JSX, assert key structural nodes and text content are present. No PNG snapshots (Satori is the trusted boundary).
- Manual verification of the OG route producing a valid PNG at the correct dimensions for each (post type × layout) combination.
- Manual verification of the modal flow in the dashboard, including the disabled-button case for a listing with no photos.

## Open questions

None blocking Phase 1. Supabase Storage bucket policy for listing photos should be confirmed as public-fetch-capable by `ImageResponse` during implementation; if photos are served from a private bucket, switch to signed URLs generated server-side inside the OG route.
