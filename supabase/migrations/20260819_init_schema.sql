create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null,
  phone text,
  location text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  condition text not null,
  price_mmk numeric(14, 2),
  unit text not null,
  quantity_available numeric(14, 3) not null check (quantity_available >= 0),
  location text,
  images text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'sold', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wanted_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null,
  quantity_needed numeric(14, 3) not null check (quantity_needed > 0),
  target_price_mmk numeric(14, 2),
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  quantity numeric(14, 3) not null check (quantity > 0),
  total_price_mmk numeric(14, 2),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'paid', 'completed', 'cancelled')),
  qr_code_hash text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deals_distinct_parties check (buyer_id <> seller_id)
);

create index listings_seller_id_idx on public.listings(seller_id);
create index listings_status_idx on public.listings(status);
create index listings_category_idx on public.listings(category);
create index wanted_requests_buyer_id_idx on public.wanted_requests(buyer_id);
create index wanted_requests_category_idx on public.wanted_requests(category);
create index deals_listing_id_idx on public.deals(listing_id);
create index deals_buyer_id_idx on public.deals(buyer_id);
create index deals_seller_id_idx on public.deals(seller_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

create trigger wanted_requests_set_updated_at
before update on public.wanted_requests
for each row execute function public.set_updated_at();

create trigger deals_set_updated_at
before update on public.deals
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.wanted_requests enable row level security;
alter table public.deals enable row level security;

create policy "Profiles are readable by their owners"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can create their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can delete their own profile"
on public.profiles
for delete
using (auth.uid() = id);

create policy "Anyone can read active listings"
on public.listings
for select
using (status = 'active');

create policy "Sellers can read their own listings"
on public.listings
for select
using (auth.uid() = seller_id);

create policy "Sellers can create their own listings"
on public.listings
for insert
with check (auth.uid() = seller_id);

create policy "Sellers can update their own listings"
on public.listings
for update
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

create policy "Sellers can delete their own listings"
on public.listings
for delete
using (auth.uid() = seller_id);

create policy "Buyers can read their own wanted requests"
on public.wanted_requests
for select
using (auth.uid() = buyer_id);

create policy "Buyers can create their own wanted requests"
on public.wanted_requests
for insert
with check (auth.uid() = buyer_id);

create policy "Buyers can update their own wanted requests"
on public.wanted_requests
for update
using (auth.uid() = buyer_id)
with check (auth.uid() = buyer_id);

create policy "Buyers can delete their own wanted requests"
on public.wanted_requests
for delete
using (auth.uid() = buyer_id);

create policy "Deal participants can read their deals"
on public.deals
for select
using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Deal participants can create their deals"
on public.deals
for insert
with check (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Deal participants can update their deals"
on public.deals
for update
using (auth.uid() = buyer_id or auth.uid() = seller_id)
with check (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Deal participants can delete their deals"
on public.deals
for delete
using (auth.uid() = buyer_id or auth.uid() = seller_id);
