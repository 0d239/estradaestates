import type { Listing } from '../database.types';
import type { PostType, PostExtras } from './types';

interface CaptionContext {
  listing: Listing;
  extras: PostExtras;
}

type CaptionFn = (ctx: CaptionContext) => string;

const HASHTAGS = '#EstradaEstates #HollisterCA #SanBenitoCounty #CentralCoastRealEstate';

function addressLine(l: Listing): string {
  return [l.address, l.city].filter(Boolean).join(', ');
}

function priceText(l: Listing): string {
  return l.price ? `$${l.price.toLocaleString()}` : 'price on request';
}

function statsText(l: Listing): string {
  const parts: string[] = [];
  if (l.bedrooms != null) parts.push(`${l.bedrooms} bed`);
  if (l.bathrooms != null) parts.push(`${l.bathrooms} bath`);
  if (l.sqft != null) parts.push(`${l.sqft.toLocaleString()} sqft`);
  return parts.join(' · ');
}

function formatOpenHouse(iso: string | null | undefined): string {
  if (!iso) return 'this weekend';
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-US', { weekday: 'long' });
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day}, ${date} at ${time}`;
}

export const CAPTIONS: Record<PostType, Record<string, CaptionFn>> = {
  'new-listing': {
    short: ({ listing }) =>
      `✨ Just listed — ${addressLine(listing)}. ${priceText(listing)}. DM for a private tour.\n\n${HASHTAGS} #NewListing`,
    detailed: ({ listing }) => {
      const stats = statsText(listing);
      return `Welcome home to ${addressLine(listing)}.\n\n${stats ? stats + '\n' : ''}Offered at ${priceText(listing)}.\n\n${listing.description ? listing.description + '\n\n' : ''}Reach out to schedule a showing — we'd love to walk you through it.\n\n${HASHTAGS} #JustListed`;
    },
    hook: ({ listing }) =>
      `Looking for your next home?\n\n${addressLine(listing)} just hit the market at ${priceText(listing)}. ${statsText(listing)}.\n\nComment 🏡 or DM for details.\n\n${HASHTAGS} #NewListing`,
  },

  'open-house': {
    invite: ({ listing, extras }) =>
      `OPEN HOUSE — ${formatOpenHouse(extras.openHouseAt)}.\n\n${addressLine(listing)} · ${priceText(listing)}\n${statsText(listing)}\n\nStop by, bring your questions.\n\n${HASHTAGS} #OpenHouse`,
    warm: ({ listing, extras }) =>
      `Swing by and see it in person! We're hosting an open house at ${addressLine(listing)} on ${formatOpenHouse(extras.openHouseAt)}.\n\nOffered at ${priceText(listing)}. Coffee's on us.\n\n${HASHTAGS} #OpenHouse`,
  },

  'price-drop': {
    direct: ({ listing, extras }) => {
      const oldP = extras.oldPrice ? `$${extras.oldPrice.toLocaleString()}` : null;
      return `Price improvement at ${addressLine(listing)}.${oldP ? `\n\nWas ${oldP} — now ${priceText(listing)}.` : `\n\nNow ${priceText(listing)}.`}\n\n${statsText(listing)}\n\nDM us for a tour.\n\n${HASHTAGS} #PriceDrop`;
    },
    urgent: ({ listing, extras }) => {
      const oldP = extras.oldPrice ? `$${extras.oldPrice.toLocaleString()}` : null;
      return `📉 Price reduced on ${addressLine(listing)}.${oldP ? ` Was ${oldP}, now ${priceText(listing)}.` : ` Now ${priceText(listing)}.`}\n\nThis won't last. Ready to see it? DM now.\n\n${HASHTAGS} #PriceReduction`;
    },
  },

  'just-sold': {
    celebrate: ({ listing, extras }) =>
      `🎉 JUST SOLD — ${addressLine(listing)}!\n\n${extras.hidePrice ? "Congratulations to our happy buyers on their new home." : `Closed at ${priceText(listing)}. Congratulations to our happy buyers!`}\n\nIf you're thinking about selling, we'd love to help you get the same result.\n\n${HASHTAGS} #JustSold`,
    thanks: ({ listing }) =>
      `Another one in the books.\n\n${addressLine(listing)} is officially sold. A huge thank you to everyone involved — buyers, sellers, lenders, inspectors, and our incredible team.\n\nReady to start your own chapter? Reach out.\n\n${HASHTAGS} #SoldByEstradaEstates`,
  },
};

export function renderCaption(
  type: PostType,
  variantId: string,
  ctx: CaptionContext,
): string {
  const fn = CAPTIONS[type][variantId];
  if (!fn) throw new Error(`Unknown caption variant: ${type}/${variantId}`);
  return fn(ctx);
}
