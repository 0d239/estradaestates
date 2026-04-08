#!/usr/bin/env -S npx tsx
/**
 * IDX Sync — one-shot scrape + import
 *
 * Convenience wrapper that scrapes a PropertyMinder site and imports the
 * results into Supabase in a single command.
 *
 * Usage:
 *   bunx tsx scripts/idx-sync/sync.ts <url>
 *   bunx tsx scripts/idx-sync/sync.ts https://myhilltoprealty.com/FeaturedListings
 *
 * This is equivalent to:
 *   bunx tsx scripts/idx-sync/scrape.ts <url> | bunx tsx scripts/idx-sync/import.ts
 *
 * Environment (reads from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL        — Supabase project URL
 *   NEXT_PUBLIC_SERVICE_ROLE_KEY     — Supabase service-role key
 */

import { execSync } from "child_process";
import { resolve } from "path";

const url = process.argv[2];

if (!url) {
  console.error("Usage: bunx tsx scripts/idx-sync/sync.ts <url>");
  console.error("Example: bunx tsx scripts/idx-sync/sync.ts https://myhilltoprealty.com/FeaturedListings");
  process.exit(1);
}

const root = resolve(import.meta.dirname, "../..");
const scraper = resolve(import.meta.dirname, "scrape.ts");
const importer = resolve(import.meta.dirname, "import.ts");

console.log(`\n=== IDX Sync: ${url} ===\n`);

execSync(
  `npx tsx "${scraper}" "${url}" | npx tsx "${importer}"`,
  { cwd: root, stdio: "inherit", timeout: 120_000 }
);
