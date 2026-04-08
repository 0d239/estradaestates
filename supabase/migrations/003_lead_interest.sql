-- Add interest type to contacts for lead intake (buying, selling, or both)
create type public.lead_interest as enum ('buying', 'selling', 'both');

alter table public.contacts
  add column interest public.lead_interest;

-- Add a property_zipcode field for sellers (zip of home they want to sell)
alter table public.contacts
  add column property_zipcode text;
