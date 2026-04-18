import type { Listing } from '../database.types';

export const POST_TYPES = ['new-listing', 'open-house', 'price-drop', 'just-sold'] as const;
export type PostType = (typeof POST_TYPES)[number];

export const LAYOUT_IDS = ['classic', 'minimal', 'editorial'] as const;
export type LayoutId = (typeof LAYOUT_IDS)[number];

export const POST_TYPE_LABELS: Record<PostType, string> = {
  'new-listing': 'New Listing',
  'open-house': 'Open House',
  'price-drop': 'Price Drop',
  'just-sold': 'Just Sold',
};

export const LAYOUT_LABELS: Record<LayoutId, string> = {
  classic: 'Classic banner',
  minimal: 'Minimal stamp',
  editorial: 'Editorial split',
};

export interface PostExtras {
  openHouseAt?: string | null;
  oldPrice?: number | null;
  hidePrice?: boolean;
}

export interface PostData {
  listing: Listing;
  photoUrl: string;
  type: PostType;
  layout: LayoutId;
  extras: PostExtras;
}

export function captionVariantIds(type: PostType): readonly string[] {
  return CAPTION_VARIANT_IDS[type];
}

const CAPTION_VARIANT_IDS: Record<PostType, readonly string[]> = {
  'new-listing': ['short', 'detailed', 'hook'],
  'open-house': ['invite', 'warm'],
  'price-drop': ['direct', 'urgent'],
  'just-sold': ['celebrate', 'thanks'],
};
