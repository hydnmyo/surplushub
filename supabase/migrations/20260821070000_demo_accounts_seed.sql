-- Demo account wiring for live demos and judging — data seeding, not schema.
--
-- The pre-seeded businesses (Green Stitch, etc.) were created with no known
-- password, so nobody can sign in as their real owner. This re-points one of
-- them to a known demo account instead, and grants admin to another, so the
-- full negotiate → order → payout loop is actually walkable end to end:
--
--   demo.seller@surplushub.app / SurplusDemo123!  → Green Stitch Textile Co.
--   demo.buyer@surplushub.app  / SurplusDemo123!  → plain buyer
--   demo.admin@surplushub.app  / SurplusDemo123!  → platform admin
--
-- Safe to re-run: both statements are idempotent.

update public.businesses
set user_id = 'a416451f-2896-4365-bc9c-8f141bfe571e'
where id = 'd845ac00-e6ec-3a61-bc88-52cbf06c27b6';

insert into public.user_roles (user_id, role)
select 'cfd66570-1634-4a2e-a770-40e37f3c8d30', 'admin'
where not exists (
  select 1 from public.user_roles
  where user_id = 'cfd66570-1634-4a2e-a770-40e37f3c8d30' and role = 'admin'
);
