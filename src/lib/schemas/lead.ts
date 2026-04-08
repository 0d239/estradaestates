import { z } from 'zod';

export const leadFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional().default(''),
    email: z.string().email('Invalid email address').optional().or(z.literal('')).default(''),
    interest: z.enum(['buying', 'selling', 'both']).default('buying'),
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
