import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Listing tags — computed from listing data, not stored in DB
// ---------------------------------------------------------------------------

type Listing = {
  sqft: number | null;
  lot_size: string | null;
  year_built: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  description: string | null;
};

/** Parse lot_size strings like "0.25acres", ".15acres", "1.06", "3.31acres" → acres */
function parseLotAcres(raw: string | null): number | null {
  if (!raw) return null;
  const match = raw.replace(/,/g, '').match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

function propertyTypeTag(listing: Listing): string | null {
  const d = listing.description?.toLowerCase() ?? '';
  if (d.includes('commercial') || d.includes('industrial')) return 'Commercial';
  if (d.includes('townhome') || d.includes('condo')) return 'Townhome/Condo';
  if (d.includes('multi') || d.includes('boarding') || d.includes('duplex')) return 'Multi-Family';
  if (d.includes('mobile') || d.includes('manufactured')) return 'Mobile Home';
  if (listing.bedrooms === null && listing.sqft === null) return 'Land';
  return 'Single Family';
}

function sizeTag(sqft: number | null): string | null {
  if (sqft === null) return null;
  if (sqft < 1200) return 'Cozy';
  if (sqft < 2000) return 'Mid-Size';
  if (sqft < 3000) return 'Spacious';
  return 'Estate';
}

function lotTag(lotSize: string | null): string | null {
  const acres = parseLotAcres(lotSize);
  if (acres === null) return null;
  if (acres < 0.25) return 'Standard Lot';
  if (acres < 1) return 'Large Lot';
  return 'Acreage';
}

function eraTag(yearBuilt: number | null): string | null {
  if (yearBuilt === null) return null;
  if (yearBuilt < 1960) return 'Historic';
  if (yearBuilt < 2000) return 'Established';
  if (yearBuilt < 2020) return 'Modern';
  return 'New Construction';
}

export function getListingTags(listing: Listing): string[] {
  return [
    propertyTypeTag(listing),
    sizeTag(listing.sqft),
    lotTag(listing.lot_size),
    eraTag(listing.year_built),
  ].filter((t): t is string => t !== null);
}
