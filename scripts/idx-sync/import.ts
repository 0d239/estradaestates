/**
 * IDX Listing Importer
 *
 * Reads scraped PropertyMinder listing JSON (from scrape.ts) and upserts it
 * into the Supabase `listings` table. Uses the service-role key to bypass RLS.
 *
 * Listings are keyed by `idx_key` (listingKey + MLS source), so re-running
 * this script updates existing rows rather than creating duplicates.
 *
 * Usage:
 *   bunx tsx scripts/idx-sync/import.ts <file.json>
 *   bunx tsx scripts/idx-sync/scrape.ts <url> | bunx tsx scripts/idx-sync/import.ts
 *
 * Environment (reads from .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL        — Supabase project URL
 *   NEXT_PUBLIC_SERVICE_ROLE_KEY     — Supabase service-role key (bypasses RLS)
 *
 * Examples:
 *   # From a saved file
 *   bunx tsx scripts/idx-sync/import.ts listings.json
 *
 *   # Piped directly from the scraper
 *   bunx tsx scripts/idx-sync/scrape.ts https://myhilltoprealty.com/FeaturedListings \
 *     | bunx tsx scripts/idx-sync/import.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

// Load .env.local if running outside of Next.js
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // .env.local not found — env vars must already be set
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SERVICE_ROLE_KEY");
  console.error("Set them in .env.local or export them before running.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------------------------------------------------------------------
// Transforms — PropertyMinder JSON → Supabase listings row
// ---------------------------------------------------------------------------

type ListingStatus = "active" | "pending" | "sold" | "off_market";

function mapStatus(raw: string): ListingStatus {
  const s = raw.toLowerCase();
  if (s === "active") return "active";
  if (s === "pending") return "pending";
  if (s === "sold") return "sold";
  return "off_market";
}

/** Parse: <span>123 Main St</span> <span>Hollister</span> <span>CA 95023</span> */
function parseAddress(html: string) {
  const spans =
    html
      .match(/<span>(.*?)<\/span>/g)
      ?.map((s) => s.replace(/<\/?span>/g, "").trim()) ?? [];

  const [street, city, stateZipRaw] = spans;
  const [state, zip] = (stateZipRaw ?? "").split(" ");

  return {
    address: street || html.replace(/<[^>]+>/g, "").trim(),
    city: city || null,
    state: state || "CA",
    zip: zip || null,
  };
}

function parseBathrooms(listing: any): number | null {
  if (listing.bathTotalAsStr) return parseFloat(listing.bathTotalAsStr);
  const full = listing.bathFull ?? 0;
  const part = listing.bathPart ?? 0;
  return full || part ? full + part * 0.5 : null;
}

function toRow(l: any) {
  const { address, city, state, zip } = parseAddress(l.addressStr ?? "");
  return {
    address,
    city,
    state,
    zip,
    price: l.priceToShow ?? null,
    status: mapStatus(l.status ?? "active"),
    bedrooms: l.bedrooms ?? null,
    bathrooms: parseBathrooms(l),
    sqft: l.squareFeet ?? null,
    lot_size: l.lotSize ?? null,
    year_built: l.yearBuilt ?? null,
    description: l.description ?? null,
    photos: l.pictures ?? (l.pictureURL ? [l.pictureURL] : []),
    mls_number: l.lid ?? null,
    source: "idx" as const,
    idx_key: `${l.listingKey}_${l.ls}`,
    idx_synced_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Read input: file arg or stdin
  let raw: string;
  const filePath = process.argv[2];

  if (filePath) {
    raw = readFileSync(resolve(filePath), "utf-8");
  } else if (!process.stdin.isTTY) {
    // Reading from pipe
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    raw = Buffer.concat(chunks).toString("utf-8");
  } else {
    console.error("Usage: bunx tsx scripts/idx-sync/import.ts <file.json>");
    console.error("   or: bunx tsx scripts/idx-sync/scrape.ts <url> | bunx tsx scripts/idx-sync/import.ts");
    process.exit(1);
  }

  const listings: any[] = JSON.parse(raw);
  console.log(`Parsed ${listings.length} listings from input`);

  // Transform and deduplicate
  const seen = new Set<string>();
  const rows = listings
    .map(toRow)
    .filter((r) => {
      if (seen.has(r.idx_key)) return false;
      seen.add(r.idx_key);
      return true;
    });

  const dupes = listings.length - rows.length;
  console.log(`Importing ${rows.length} unique listings${dupes ? ` (${dupes} duplicates removed)` : ""} ...`);

  const { data, error } = await supabase
    .from("listings")
    .upsert(rows, { onConflict: "idx_key" })
    .select("id, address, city, status");

  if (error) {
    console.error("Import failed:", error.message);
    console.error("Details:", error);
    process.exit(1);
  }

  console.log(`Imported ${data.length} listings:`);
  const byStatus = { active: 0, pending: 0, sold: 0, off_market: 0 };
  for (const row of data) {
    byStatus[row.status as keyof typeof byStatus]++;
    console.log(`  [${row.status.padEnd(10)}] ${row.address}, ${row.city}`);
  }
  console.log(`\nSummary: ${byStatus.active} active, ${byStatus.pending} pending, ${byStatus.sold} sold, ${byStatus.off_market} off-market`);
}

main().catch(console.error);
