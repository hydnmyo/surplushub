-- Real auth identity, negotiation and order/payment/dispute/payout state.
--
-- Replaces the demo localStorage order system with tables backed by Supabase
-- Auth. Reuses the existing has_role()/user_roles pattern for admin access
-- and the existing businesses/listings tables for seller identity and pricing
-- reference, rather than duplicating them.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.order_status as enum (
  'PENDING_PAYMENT', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED',
  'COMPLETED', 'DISPUTED', 'REFUNDED', 'CANCELLED'
);

create type public.payment_status as enum ('UNPAID', 'PAID', 'FAILED', 'REFUNDED');

create type public.payout_status as enum ('NOT_ELIGIBLE', 'PENDING', 'PAID');

create type public.purchase_request_status as enum (
  'Pending', 'Accepted', 'Countered', 'Rejected', 'Completed'
);

-- ---------------------------------------------------------------------------
-- profiles — display name for any signed-in user (buyer or business contact).
-- Role/admin status lives in user_roles, not here, so a user can never grant
-- themselves admin by editing their own profile row.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users manage their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- New auth users get a profile row automatically, from the full_name passed
-- at sign-up. Keeps profile creation out of the client's hands for INSERT,
-- while UPDATE remains self-service via the policy above.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- shared updated_at trigger
-- ---------------------------------------------------------------------------

-- A function of this name and signature already exists in the project
-- (pre-dates this migration); reuse it rather than redefine it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- purchase_requests — the negotiation that precedes an order. A buyer opens
-- one against a listing; the seller can counter; accepting locks the price
-- and is expected to be followed by inserting the matching order row.
-- ---------------------------------------------------------------------------

create table public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references public.listings (id),
  listing_title text not null,
  seller_business_id uuid not null references public.businesses (id),
  buyer_id uuid not null references auth.users (id),
  buyer_name text not null,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  offered_price numeric not null check (offered_price >= 0),
  message text not null default '',
  fulfillment text not null default '',
  preferred_date text not null default '',
  status public.purchase_request_status not null default 'Pending',
  counter_unit_price numeric,
  counter_delivery_fee numeric,
  counter_note text,
  agreed_unit_price numeric,
  agreed_total numeric,
  order_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchase_requests_buyer_id_idx on public.purchase_requests (buyer_id);
create index purchase_requests_seller_business_id_idx on public.purchase_requests (seller_business_id);

create trigger purchase_requests_set_updated_at
  before update on public.purchase_requests
  for each row execute function public.set_updated_at();

alter table public.purchase_requests enable row level security;

create policy "Buyers and sellers read their own requests"
  on public.purchase_requests for select
  using (
    auth.uid() = buyer_id
    or seller_business_id in (select id from public.businesses where user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Buyers create their own requests"
  on public.purchase_requests for insert
  with check (auth.uid() = buyer_id);

create policy "Buyers and sellers update their own requests"
  on public.purchase_requests for update
  using (
    auth.uid() = buyer_id
    or seller_business_id in (select id from public.businesses where user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- orders — the transaction spine. One row per accepted quote. Money fields
-- are captured at creation and never recalculated, mirroring calculateOrderTotals()
-- in src/lib/fees.ts on the client.
-- ---------------------------------------------------------------------------

create sequence public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer not null default nextval('public.order_number_seq'),
  listing_id text not null references public.listings (id),
  listing_title text not null,
  category public.category_id not null,
  buyer_id uuid not null references auth.users (id),
  buyer_name text not null,
  seller_business_id uuid not null references public.businesses (id),
  seller_name text not null,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  unit_price numeric not null check (unit_price >= 0),
  material_price numeric not null check (material_price >= 0),
  buyer_fee numeric not null default 0,
  delivery_fee numeric not null default 0,
  tax numeric not null default 0,
  buyer_total numeric not null,
  seller_fee numeric not null default 0,
  seller_net numeric not null,
  platform_revenue numeric not null default 0,
  status public.order_status not null default 'PENDING_PAYMENT',
  payment_status public.payment_status not null default 'UNPAID',
  payment_ref text,
  paid_at timestamptz,
  delivered_at timestamptz,
  inspection_deadline timestamptz,
  accepted_at timestamptz,
  auto_accepted boolean not null default false,
  payout_status public.payout_status not null default 'NOT_ELIGIBLE',
  payout_ref text,
  payout_at timestamptz,
  dispute_reason text,
  dispute_resolution text,
  dispute_resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index orders_order_number_idx on public.orders (order_number);
create index orders_buyer_id_idx on public.orders (buyer_id);
create index orders_seller_business_id_idx on public.orders (seller_business_id);
create index orders_status_idx on public.orders (status);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

create policy "Buyers, sellers and admins read relevant orders"
  on public.orders for select
  using (
    auth.uid() = buyer_id
    or seller_business_id in (select id from public.businesses where user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Buyers create their own orders"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

-- Status/fulfillment updates from buyer or seller, plus admin for payout and
-- dispute resolution. Which specific transitions are legal is still enforced
-- client-side via canTransition() in src/lib/orders.ts, same as the
-- localStorage version — this policy governs row ownership, not the state
-- machine itself.
create policy "Buyers, sellers and admins update relevant orders"
  on public.orders for update
  using (
    auth.uid() = buyer_id
    or seller_business_id in (select id from public.businesses where user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );
