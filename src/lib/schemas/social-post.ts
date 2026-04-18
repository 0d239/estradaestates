import { z } from 'zod';
import { POST_TYPES, LAYOUT_IDS } from '../social/types';

export const postTypeSchema = z.enum(POST_TYPES);
export const layoutIdSchema = z.enum(LAYOUT_IDS);

export const ogQuerySchema = z.object({
  type: postTypeSchema,
  layout: layoutIdSchema,
  photo: z.coerce.number().int().min(0).default(0),
  openHouseAt: z.string().datetime().optional(),
  oldPrice: z.coerce.number().positive().optional(),
  hidePrice: z.coerce.boolean().optional(),
  download: z.coerce.boolean().optional(),
});

export type OgQuery = z.infer<typeof ogQuerySchema>;
