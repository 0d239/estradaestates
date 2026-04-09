import { z } from 'zod';

// Interest bitmap: 1 = buying, 2 = selling, 4 = design (range 0–7)
export const INTEREST_BUYING = 1;
export const INTEREST_SELLING = 2;
export const INTEREST_DESIGN = 4;

export const leadFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional().default(''),
    email: z.string().email('Invalid email address').optional().or(z.literal('')).default(''),
    wants_buying: z.string().optional().default(''),
    wants_selling: z.string().optional().default(''),
    wants_design: z.string().optional().default(''),
    design_services: z.union([z.string(), z.array(z.string())]).optional().default([]),
    // Buyer fields
    bedrooms_min: z.coerce.number().int().min(0).optional().or(z.literal('')),
    bathrooms_min: z.coerce.number().min(0).optional().or(z.literal('')),
    budget: z.coerce.number().positive('Budget must be positive').optional().or(z.literal('')),
    preferred_zipcode: z.string().optional().default(''),
    search_radius_miles: z.coerce.number().int().positive().optional().or(z.literal('')),
    // Seller fields
    property_zipcode: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  })
  .refine((data) => data.phone || data.email, {
    message: 'Please provide a phone number or email so we can reach you',
    path: ['phone'],
  });

export type LeadFormData = z.infer<typeof leadFormSchema>;

export const listingInquirySchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional().default(''),
    email: z.string().email('Invalid email address').optional().or(z.literal('')).default(''),
    listing_id: z.string().uuid(),
  })
  .refine((data) => data.phone || data.email, {
    message: 'Please provide a phone number or email',
    path: ['phone'],
  });

export type ListingInquiryData = z.infer<typeof listingInquirySchema>;
