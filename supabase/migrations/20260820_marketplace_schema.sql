create extension if not exists pgcrypto;

do $$
begin
  create type public.category_id as enum (
    'textile',
    'plastic',
    'paper',
    'metal',
    'wood',
    'glass',
    'rubber',
    'construction',
    'industrial',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.material_type as enum (
    'Reusable Surplus',
    'Production Surplus',
    'Offcut',
    'Excess Inventory',
    'Recyclable Material',
    'Scrap Material',
    'Packaging Surplus',
    'Unused Stock'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.condition_type as enum (
    'New / Unused',
    'Like New',
    'Good',
    'Minor Defect',
    'Used',
    'Scrap / Requires Processing'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.listing_status as enum (
    'Active',
    'Reserved',
    'Sold Out',
    'Hidden'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  initials text not null,
  industry text not null,
  location text not null,
  verified boolean not null default false,
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  transactions integer not null default 0 check (transactions >= 0),
  since integer not null check (since >= 1900),
  categories public.category_id[] not null default '{}',
  description text not null,
  contact jsonb not null default '{}'::jsonb,
  hours text not null,
  website text,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  category public.category_id not null,
  material_type public.material_type not null,
  condition public.condition_type not null,
  composition text not null,
  quantity numeric(14, 3) not null check (quantity >= 0),
  unit text not null,
  price numeric(14, 2) check (price is null or price >= 0),
  price_unit text not null,
  min_order text not null,
  location text not null,
  available_from text not null,
  seller_id uuid not null references public.businesses(id) on delete cascade,
  requires_processing boolean not null default false,
  pickup_available boolean not null default true,
  featured boolean not null default false,
  views integer not null default 0 check (views >= 0),
  inquiries integer not null default 0 check (inquiries >= 0),
  popularity integer not null default 0 check (popularity >= 0),
  status public.listing_status not null default 'Active',
  description text not null,
  uses text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.wanted_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category public.category_id not null,
  quantity text not null,
  budget text not null,
  budget_value numeric(14, 2) not null check (budget_value >= 0),
  location text not null,
  use text not null,
  condition text not null,
  required_by text not null,
  buyer_name text not null,
  offers_count integer not null default 0 check (offers_count >= 0),
  notes text not null,
  created_at timestamptz not null default now()
);

create index if not exists businesses_user_id_idx on public.businesses(user_id);
create index if not exists businesses_verified_idx on public.businesses(verified);
create index if not exists businesses_categories_idx on public.businesses using gin(categories);
create index if not exists listings_seller_id_idx on public.listings(seller_id);
create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_category_idx on public.listings(category);
create index if not exists listings_material_type_idx on public.listings(material_type);
create index if not exists listings_location_idx on public.listings(location);
create index if not exists listings_uses_idx on public.listings using gin(uses);
create index if not exists wanted_posts_category_idx on public.wanted_posts(category);
create index if not exists wanted_posts_location_idx on public.wanted_posts(location);

alter table public.businesses enable row level security;
alter table public.listings enable row level security;
alter table public.wanted_posts enable row level security;

create or replace function public.increment_listing_views(listing_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.listings
  set views = views + 1
  where id = listing_id
    and status = 'Active';
$$;

grant execute on function public.increment_listing_views(text) to anon, authenticated;

drop policy if exists "Anyone can read verified businesses" on public.businesses;
create policy "Anyone can read verified businesses"
on public.businesses
for select
using (verified = true);

drop policy if exists "Owners can read their business profile" on public.businesses;
create policy "Owners can read their business profile"
on public.businesses
for select
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can create their business profile" on public.businesses;
create policy "Authenticated users can create their business profile"
on public.businesses
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Owners can update their business profile" on public.businesses;
create policy "Owners can update their business profile"
on public.businesses
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Owners can delete their business profile" on public.businesses;
create policy "Owners can delete their business profile"
on public.businesses
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Anyone can read active listings" on public.listings;
create policy "Anyone can read active listings"
on public.listings
for select
using (status = 'Active');

drop policy if exists "Sellers can read their own listings" on public.listings;
create policy "Sellers can read their own listings"
on public.listings
for select
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = listings.seller_id
      and businesses.user_id = auth.uid()
  )
);

drop policy if exists "Sellers can create their own listings" on public.listings;
create policy "Sellers can create their own listings"
on public.listings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = listings.seller_id
      and businesses.user_id = auth.uid()
  )
);

drop policy if exists "Sellers can update their own listings" on public.listings;
create policy "Sellers can update their own listings"
on public.listings
for update
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = listings.seller_id
      and businesses.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = listings.seller_id
      and businesses.user_id = auth.uid()
  )
);

drop policy if exists "Sellers can delete their own listings" on public.listings;
create policy "Sellers can delete their own listings"
on public.listings
for delete
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = listings.seller_id
      and businesses.user_id = auth.uid()
  )
);

drop policy if exists "Anyone can read wanted posts" on public.wanted_posts;
create policy "Anyone can read wanted posts"
on public.wanted_posts
for select
using (true);

drop policy if exists "Authenticated users can create wanted posts" on public.wanted_posts;
create policy "Authenticated users can create wanted posts"
on public.wanted_posts
for insert
to authenticated
with check (true);
