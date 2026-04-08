import { z } from 'zod';

export const contactSchema = z
  .object({
    type: z.enum(['client', 'lead', 'partner']),
    name: z.string().min(1, 'Name is required'),
    phone: z.string().nullable().optional(),
    email: z.string().email('Invalid email').nullable().optional(),
    address: z.string().nullable().optional(),
    birthday: z.string().nullable().optional(),
    budget: z.coerce.number().positive().nullable().optional(),
    bedrooms_min: z.coerce.number().int().min(0).nullable().optional(),
    bathrooms_min: z.coerce.number().min(0).nullable().optional(),
    preferred_zipcodes: z.array(z.string()).optional().default([]),
    search_radius_miles: z.coerce.number().int().positive().nullable().optional(),
    notes: z.string().nullable().optional(),
    assigned_to: z.string().uuid().nullable().optional(),
    company: z.string().nullable().optional(),
    interest_flags: z.coerce.number().int().min(0).max(7).optional().default(0),
    design_services: z.array(z.string()).optional().default([]),
    property_zipcode: z.string().nullable().optional(),
  })
  .refine((data) => data.phone || data.email, {
    message: 'At least one of phone or email is required',
    path: ['phone'],
  });

export type ContactFormData = z.infer<typeof contactSchema>;
