-- Migrate interest from enum to smallint bitmap
-- Bits: 1 = buying, 2 = selling, 4 = design
-- Values 1-7 cover all combinations

-- Add the new column
alter table public.contacts
  add column interest_flags smallint not null default 0
  constraint interest_flags_range check (interest_flags between 0 and 7);

-- Migrate existing enum values
update public.contacts set interest_flags = case
  when interest = 'buying'  then 1
  when interest = 'selling' then 2
  when interest = 'both'    then 3
  else 0
end;

-- Drop the old enum column and type
alter table public.contacts drop column interest;
drop type public.lead_interest;

-- Add design_services array for specific design selections
alter table public.contacts
  add column design_services text[] not null default '{}';
