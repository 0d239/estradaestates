/**
 * IDX Listing Scraper
 *
 * Scrapes listing data from a PropertyMinder / AccelerAgent real estate site.
 * These sites load listings via AJAX after the initial page render, so we use
 * Puppeteer to launch a headless browser, intercept the API responses, and
 * paginate through all results.
 *
 * Outputs a JSON array of raw listing objects to stdout (or a file via --out).
 *
 * Usage:
 *   bunx tsx scripts/idx-sync/scrape.ts <url> [--out file.json]
 *
 * Examples:
 *   bunx tsx scripts/idx-sync/scrape.ts https://myhilltoprealty.com/FeaturedListings
 *   bunx tsx scripts/idx-sync/scrape.ts https://myhilltoprealty.com/FeaturedListings --out listings.json
 */

import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--"));
const outFlag = args.indexOf("--out");
const outPath = outFlag !== -1 ? args[outFlag + 1] : undefined;

if (!url) {
  console.error(
    "Usage: bunx tsx scripts/idx-sync/scrape.ts <url> [--out file.json]"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Scrape
// ---------------------------------------------------------------------------

async function scrape(targetUrl: string): Promise<any[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  // Intercept the listing API responses that AccelerAgent fires after render.
  // The list endpoint returns paginated JSON; the map endpoint has coordinates.
  const listPages: any[] = [];

  page.on("response", async (response) => {
    const respUrl = response.url();
    try {
      if (/_list\.do/.test(respUrl) && response.headers()["content-type"]?.includes("json")) {
        listPages.push(await response.json());
      }
    } catch {
      // Response may have been consumed or aborted — safe to ignore.
    }
  });

  console.error(`[scrape] Navigating to ${targetUrl} ...`);
  await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 60_000 });

  // AccelerAgent fires the first AJAX call shortly after networkidle — wait.
  await new Promise((r) => setTimeout(r, 8_000));

  if (listPages.length === 0) {
    console.error("[scrape] No listing API responses intercepted. The site may have changed.");
    await browser.close();
    return [];
  }

  // Paginate: the first response tells us the total count and page size.
  const { total, pageSize } = listPages[0].paging;
  console.error(`[scrape] ${total} listings across ${Math.ceil(total / pageSize)} page(s)`);

  if (total > pageSize) {
    const remaining = Math.ceil(total / pageSize) - 1;
    // Derive the API path from the intercepted URL so this works for any endpoint
    // (FeaturedListings, OfficeListings, MyListings, etc.)
    const firstUrl = listPages[0] ? undefined : undefined; // not needed — we fetch relative
    for (let p = 1; p <= remaining; p++) {
      console.error(`[scrape] Fetching page ${p + 1}/${Math.ceil(total / pageSize)} ...`);
      // The listing page endpoint pattern: /search/<type>_list.do?pageNum=N
      const nextPage = await page.evaluate(async (pageNum: number) => {
        // Find the original XHR URL and swap the page number
        const perf = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        const listReq = perf.find((e) => /_list\.do/.test(e.name));
        const base = listReq
          ? new URL(listReq.name).pathname
          : "/search/featuredListings_list.do";
        const resp = await fetch(`${base}?pageNum=${pageNum}`, {
          credentials: "same-origin",
        });
        return resp.json();
      }, p);
      listPages.push(nextPage);
      await new Promise((r) => setTimeout(r, 1_500));
    }
  }

  await browser.close();

  // Flatten and deduplicate by listingKey + MLS source
  const seen = new Set<string>();
  const listings: any[] = [];
  for (const pg of listPages) {
    for (const l of pg.listings ?? []) {
      const key = `${l.listingKey}_${l.ls}`;
      if (!seen.has(key)) {
        seen.add(key);
        listings.push(l);
      }
    }
  }

  console.error(`[scrape] ${listings.length} unique listings collected`);
  return listings;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  const listings = await scrape(url);

  const json = JSON.stringify(listings, null, 2);

  if (outPath) {
    const abs = resolve(outPath);
    writeFileSync(abs, json);
    console.error(`[scrape] Written to ${abs}`);
  } else {
    // stdout so it can be piped into the import script
    process.stdout.write(json);
  }
})();
