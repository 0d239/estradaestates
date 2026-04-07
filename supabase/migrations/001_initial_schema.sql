-- ============================================
-- Estrada Estates Realty Group — Initial Schema
-- ============================================

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  title text,
  license text,
  phone text,
  email text not null,
  image_url text,
  bio text,
  specialties text[] default '{}',
  role text not null check (role in ('admin', 'agent', 'staff')),
  created_at timestamptz default now()
);

-- Contacts (clients, leads, partners)
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('client', 'lead', 'partner')),
  name text not null,
  phone text,
  email text,
  address text,
  birthday date,
  budget numeric,
  bedrooms_min int,
  bathrooms_min numeric,
  preferred_zipcodes text[] default '{}',
  search_radius_miles int,
  notes text,
  assigned_to uuid references public.profiles(id) on delete set null,
  company text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint contacts_phone_or_email check (phone is not null or email is not null)
);

-- Listings (properties)
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  city text,
  state text default 'CA',
  zip text,
  price numeric,
  status text not null check (status in ('active', 'pending', 'sold', 'off_market')),
  bedrooms int,
  bathrooms numeric,
  sqft int,
  lot_size text,
  year_built int,
  description text,
  photos text[] default '{}',
  mls_number text,
  listed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contact ↔ Listing junction
create table public.contact_listings (
  contact_id uuid references public.contacts(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  interest_level text not null check (interest_level in ('interested', 'shown', 'offered', 'closed')),
  created_at timestamptz default now(),
  primary key (contact_id, listing_id)
);

-- Communications log
create table public.communications (
  id uuid primary key default gen_random_uuid(),
  sent_by uuid references public.profiles(id) on delete set null,
  channel text not null check (channel in ('sms', 'email')),
  message text not null,
  recipient_count int not null default 0,
  created_at timestamptz default now()
);

-- Communication recipients
create table public.communication_recipients (
  communication_id uuid references public.communications(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  status text not null default 'sent' check (status in ('sent', 'delivered', 'failed')),
  primary key (communication_id, contact_id)
);

-- ============================================
-- Indexes
-- ============================================

create index idx_contacts_type on public.contacts(type);
create index idx_contacts_assigned_to on public.contacts(assigned_to);
create index idx_listings_status on public.listings(status);
create index idx_listings_listed_by on public.listings(listed_by);
create index idx_communications_sent_by on public.communications(sent_by);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.handle_updated_at();

create trigger listings_updated_at
  before update on public.listings
  for each row execute function public.handle_updated_at();

-- ============================================
-- Auto-create profile on signup trigger
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Row Level Security
-- ============================================

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.listings enable row level security;
alter table public.contact_listings enable row level security;
alter table public.communications enable row level security;
alter table public.communication_recipients enable row level security;

-- Profiles: team can read all, update own
create policy "Team can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Contacts: team has full access
create policy "Team can view all contacts"
  on public.contacts for select
  to authenticated
  using (true);

create policy "Team can insert contacts"
  on public.contacts for insert
  to authenticated
  with check (true);

create policy "Team can update contacts"
  on public.contacts for update
  to authenticated
  using (true);

create policy "Team can delete contacts"
  on public.contacts for delete
  to authenticated
  using (true);

-- Listings: team has full CRUD, public can view active
create policy "Anyone can view active listings"
  on public.listings for select
  using (status = 'active');

create policy "Team can view all listings"
  on public.listings for select
  to authenticated
  using (true);

create policy "Team can insert listings"
  on public.listings for insert
  to authenticated
  with check (true);

create policy "Team can update listings"
  on public.listings for update
  to authenticated
  using (true);

create policy "Team can delete listings"
  on public.listings for delete
  to authenticated
  using (true);

-- Contact listings: team has full access
create policy "Team can manage contact listings"
  on public.contact_listings for all
  to authenticated
  using (true)
  with check (true);

-- Communications: team can read all, insert own
create policy "Team can view all communications"
  on public.communications for select
  to authenticated
  using (true);

create policy "Team can send communications"
  on public.communications for insert
  to authenticated
  with check (sent_by = auth.uid());

-- Communication recipients: team has full access
create policy "Team can manage communication recipients"
  on public.communication_recipients for all
  to authenticated
  using (true)
  with check (true);
