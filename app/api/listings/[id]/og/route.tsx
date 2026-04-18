import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { ogQuerySchema } from '@/lib/schemas/social-post';
import { renderLayout, ErrorPlaceholder } from '@/lib/social/templates';
import { loadDisplayFonts } from '@/lib/social/fonts';
import type { PostData } from '@/lib/social/types';
import type { Listing } from '@/lib/database.types';

export const runtime = 'nodejs';

const IMAGE_WIDTH = 1080;
const IMAGE_HEIGHT = 1350;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await params;

  const url = new URL(request.url);
  const parsed = ogQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return new Response(`Invalid query: ${parsed.error.issues.map((i) => i.message).join(', ')}`, {
      status: 400,
    });
  }
  const query = parsed.data;

  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !listing) {
    return new Response('Listing not found', { status: 404 });
  }

  const photoUrl = listing.photos[query.photo] ?? listing.photos[0];
  if (!photoUrl) {
    return renderImage(<ErrorPlaceholder message="No photo available for this listing" />);
  }

  const data: PostData = {
    listing: listing as Listing,
    photoUrl,
    type: query.type,
    layout: query.layout,
    extras: {
      openHouseAt: query.openHouseAt ?? null,
      oldPrice: query.oldPrice ?? null,
      hidePrice: query.hidePrice ?? false,
    },
  };

  const response = await renderImage(renderLayout(data));

  if (query.download) {
    const filename = buildFilename(listing.address, query.type);
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  }

  return response;
}

async function renderImage(element: React.ReactElement): Promise<ImageResponse> {
  let fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[] = [];
  try {
    const loaded = await loadDisplayFonts();
    fonts = [
      { name: 'Libre Baskerville', data: loaded.regular, weight: 400, style: 'normal' },
      { name: 'Libre Baskerville', data: loaded.bold, weight: 700, style: 'normal' },
    ];
  } catch {
    // Font load failed — fall back to system font (handled by Satori).
  }

  return new ImageResponse(element, {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    fonts: fonts.length ? fonts : undefined,
  });
}

function buildFilename(address: string, type: string): string {
  const slug = address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  return `${slug}-${type}.png`;
}
