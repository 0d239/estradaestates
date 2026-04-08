# IDX Sync Scripts

Scrape listing data from PropertyMinder / AccelerAgent real estate sites and import it into the Supabase `listings` table.

## How it works

PropertyMinder sites (like `myhilltoprealty.com`) render listings via AJAX calls after the page loads — a plain HTTP fetch only gets the empty template. These scripts use **Puppeteer** to:

1. Launch a headless Chrome browser
2. Navigate to the listings page and wait for it to render
3. Intercept the underlying JSON API responses (`*_list.do`)
4. Paginate through all results automatically
5. Deduplicate and output clean JSON

The import script then maps each listing to the `listings` table schema and upserts by `idx_key` (composite of MLS listing key + source), so re-runs update existing rows instead of creating duplicates.

## Quick start

```sh
# One command — scrape and import
bunx tsx scripts/idx-sync/sync.ts https://myhilltoprealty.com/FeaturedListings
```

## Individual scripts

### `scrape.ts` — Scrape listings to JSON

```sh
# Output to stdout (for piping)
bunx tsx scripts/idx-sync/scrape.ts https://myhilltoprealty.com/FeaturedListings

# Output to a file
bunx tsx scripts/idx-sync/scrape.ts https://myhilltoprealty.com/FeaturedListings --out listings.json
```

Works with any PropertyMinder listing page:
- `/FeaturedListings`
- `/OfficeListings`
- `/MyListings`

### `import.ts` — Import JSON into Supabase

```sh
# From a file
bunx tsx scripts/idx-sync/import.ts listings.json

# From stdin (piped from scraper)
bunx tsx scripts/idx-sync/scrape.ts <url> | bunx tsx scripts/idx-sync/import.ts
```

### `sync.ts` — Scrape + import in one step

```sh
bunx tsx scripts/idx-sync/sync.ts https://myhilltoprealty.com/FeaturedListings
```

## Environment variables

Set in `.env.local` (loaded automatically):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SERVICE_ROLE_KEY` | Supabase service-role key (bypasses RLS) |

## Dependencies

- `puppeteer` (dev dependency — already installed)
- `@supabase/supabase-js` (already in project)

## Database mapping

| PropertyMinder field | → | Supabase column |
|---|---|---|
| `addressStr` (parsed) | → | `address`, `city`, `state`, `zip` |
| `priceToShow` | → | `price` |
| `status` | → | `status` (active/pending/sold/off_market) |
| `bedrooms` | → | `bedrooms` |
| `bathTotalAsStr` / `bathFull` + `bathPart` | → | `bathrooms` |
| `squareFeet` | → | `sqft` |
| `lotSize` | → | `lot_size` |
| `yearBuilt` | → | `year_built` |
| `description` | → | `description` |
| `pictures[]` | → | `photos` |
| `lid` | → | `mls_number` |
| `listingKey` + `ls` | → | `idx_key` (unique constraint for upsert) |

All imported listings are tagged `source: 'idx'` and `idx_synced_at: <timestamp>`.
