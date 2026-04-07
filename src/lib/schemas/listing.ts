import { z } from 'zod';

export const listingSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().nullable().optional(),
  state: z.string().default('CA'),
  zip: z.string().nullable().optional(),
  price: z.coerce.number().positive('Price must be positive').nullable().optional(),
  status: z.enum(['active', 'pending', 'sold', 'off_market']),
  bedrooms: z.coerce.number().int().min(0).nullable().optional(),
  bathrooms: z.coerce.number().min(0).nullable().optional(),
  sqft: z.coerce.number().int().positive().nullable().optional(),
  lot_size: z.string().nullable().optional(),
  year_built: z.coerce.number().int().min(1800).max(2030).nullable().optional(),
  description: z.string().nullable().optional(),
  photos: z.array(z.string().url()).optional().default([]),
  mls_number: z.string().nullable().optional(),
  listed_by: z.string().uuid().nullable().optional(),
});

export type ListingFormData = z.infer<typeof listingSchema>;
