'use server';

import { createClient } from '@/lib/supabase/server';
import { listingInquirySchema, INTEREST_BUYING } from '@/lib/schemas/lead';

export async function submitListingInquiry(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    listing_id: formData.get('listing_id'),
  };

  const result = listingInquirySchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const data = result.data;
  const supabase = await createClient();

  // Create the contact as a lead with buying interest
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .insert({
      type: 'lead',
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      interest_flags: INTEREST_BUYING,
    })
    .select('id')
    .single();

  if (contactError) {
    console.error('Listing inquiry contact insert error:', contactError);
    return { error: { _form: ['Something went wrong. Please try again.'] } };
  }

  // Link the contact to the listing
  const { error: linkError } = await supabase
    .from('contact_listings')
    .insert({
      contact_id: contact.id,
      listing_id: data.listing_id,
      interest_level: 'interested',
    });

  if (linkError) {
    console.error('Listing inquiry link error:', linkError);
    // Contact was created, link failed — still report success to user
  }

  return { success: true };
}
