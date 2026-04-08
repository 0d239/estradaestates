'use server';

import { createClient } from '@/lib/supabase/server';
import { leadFormSchema } from '@/lib/schemas/lead';

export async function submitLead(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    interest: formData.get('interest'),
    bedrooms_min: formData.get('bedrooms_min'),
    bathrooms_min: formData.get('bathrooms_min'),
    budget: formData.get('budget'),
    preferred_zipcode: formData.get('preferred_zipcode'),
    search_radius_miles: formData.get('search_radius_miles'),
    property_zipcode: formData.get('property_zipcode'),
    notes: formData.get('notes'),
  };

  const result = leadFormSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  const supabase = await createClient();
  const { error } = await supabase.from('contacts').insert({
    type: 'lead',
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    interest: data.interest,
    bedrooms_min: typeof data.bedrooms_min === 'number' ? data.bedrooms_min : null,
    bathrooms_min: typeof data.bathrooms_min === 'number' ? data.bathrooms_min : null,
    budget: typeof data.budget === 'number' ? data.budget : null,
    preferred_zipcodes: data.preferred_zipcode ? [data.preferred_zipcode] : [],
    search_radius_miles:
      typeof data.search_radius_miles === 'number' ? data.search_radius_miles : null,
    property_zipcode: data.property_zipcode || null,
    notes: data.notes || null,
  });

  if (error) {
    console.error('Lead insert error:', error);
    return { error: { _form: ['Something went wrong. Please try again.'] } };
  }

  return { success: true };
}
