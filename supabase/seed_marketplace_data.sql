-- Seed data generated from src/lib/data.ts.
-- Compatible with supabase/migrations/20260820_marketplace_schema.sql.
-- Demo auth users are inserted so businesses.user_id satisfies the auth.users foreign key.
-- Demo password for seeded auth users: password

begin;

create extension if not exists pgcrypto;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
)
values
  ('13ce4f24-0443-3631-b890-0956121c7cb7'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'surplus@greenstitch.com.mm', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"company_name":"Green Stitch Textile Co.","business_id":"d845ac00-e6ec-3a61-bc88-52cbf06c27b6","seed_slug":"green-stitch"}'::jsonb, false, now(), now()),
  ('a45bf8db-b731-39ce-aa06-a7259cbc8cbd'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'sales@ycplastics.com.mm', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"company_name":"Yangon Circular Plastics","business_id":"dd208da7-74b5-318f-b437-0f020917d86c","seed_slug":"yangon-circular-plastics"}'::jsonb, false, now(), now()),
  ('7f7e083c-feec-302b-bee6-c9607c2b3a28'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'hello@ecoboxmm.com', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"company_name":"EcoBox Myanmar","business_id":"9d24b029-610c-3b04-a375-a7ca0bff5a25","seed_slug":"ecobox-myanmar"}'::jsonb, false, now(), now()),
  ('98daed20-26b4-3cea-93a9-6d9fd7c3dce9'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'trade@mmmetal.com.mm', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"company_name":"Myanmar Metal Recovery","business_id":"8b5b4eae-b019-3037-ac2f-26e44fb6a2b1","seed_slug":"myanmar-metal-recovery"}'::jsonb, false, now(), now()),
  ('e5c513c3-4cc6-3b62-a2b0-6dc0a656bf22'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'workshop@greenwood.mm', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"company_name":"GreenWood Manufacturing","business_id":"1a0b86cb-2e4f-3c9a-86ce-6d445d7a2f55","seed_slug":"greenwood-manufacturing"}'::jsonb, false, now(), now()),
  ('eecb71a7-4b60-3a36-a5c2-86c76dd79a1c'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'orders@yangonglass.mm', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"company_name":"Yangon Glass Supply","business_id":"33d188dd-d947-303b-94ef-fdc1e8b6d351","seed_slug":"yangon-glass-supply"}'::jsonb, false, now(), now()),
  ('2ea03376-e9b0-31a0-aff4-b443a63d1dc8'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'info@ecorubber.mm', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"company_name":"EcoRubber Industries","business_id":"430d86aa-6fc6-3b3f-94dc-97019afe13fc","seed_slug":"ecorubber-industries"}'::jsonb, false, now(), now()),
  ('6dfed0bf-cd60-3429-8e51-ff2084c10d70'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'surplus@circularbuild.mm', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"company_name":"CircularBuild Myanmar","business_id":"cc999684-8f1b-31d7-bd2b-8ea9508c3b72","seed_slug":"circularbuild-myanmar"}'::jsonb, false, now(), now())
on conflict (id) do update set
  email = excluded.email,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into public.businesses (
  id,
  user_id,
  name,
  initials,
  industry,
  location,
  verified,
  rating,
  transactions,
  since,
  categories,
  description,
  contact,
  hours,
  website,
  social_links,
  created_at
)
values
  ('d845ac00-e6ec-3a61-bc88-52cbf06c27b6'::uuid, '13ce4f24-0443-3631-b890-0956121c7cb7'::uuid, 'Green Stitch Textile Co.', 'GS', 'Garment Manufacturing', 'Yangon', true, 4.8, 32, 2016, array['textile'::public.category_id]::public.category_id[], 'A CMP garment factory in Hlaing Tharyar producing woven and knit apparel for export. We list surplus fabric rolls, denim offcuts and trims every production cycle instead of discarding them.', '{"person":"Daw Khin Myat","phone":"+95 9 77 000 1120","email":"surplus@greenstitch.com.mm","address":"No. 42, Industrial Zone 3, Hlaing Tharyar, Yangon"}'::jsonb, 'Mon–Sat, 9:00 – 17:30', 'greenstitch.com.mm', '{}'::jsonb, now()),
  ('dd208da7-74b5-318f-b437-0f020917d86c'::uuid, 'a45bf8db-b731-39ce-aa06-a7259cbc8cbd'::uuid, 'Yangon Circular Plastics', 'YC', 'Plastic Reprocessing', 'Yangon', true, 4.9, 58, 2014, array['plastic'::public.category_id, 'industrial'::public.category_id]::public.category_id[], 'Collection, sorting and baling of post-industrial plastics. We supply washed PET flake, HDPE regrind and clean plastic film to manufacturers across Myanmar.', '{"person":"U Zaw Min Htet","phone":"+95 9 42 118 8830","email":"sales@ycplastics.com.mm","address":"Plot 18, Shwe Pyi Thar Industrial Zone, Yangon"}'::jsonb, 'Mon–Sat, 8:00 – 18:00', 'ycplastics.com.mm', '{}'::jsonb, now()),
  ('9d24b029-610c-3b04-a375-a7ca0bff5a25'::uuid, '7f7e083c-feec-302b-bee6-c9607c2b3a28'::uuid, 'EcoBox Myanmar', 'EB', 'Packaging & Corrugation', 'Mandalay', true, 4.7, 41, 2018, array['paper'::public.category_id]::public.category_id[], 'Corrugated packaging producer in Mandalay. We list surplus boxes, trimmed sheets and kraft paper rolls from over-runs and cancelled orders.', '{"person":"Ko Aung Kyaw","phone":"+95 9 20 445 7712","email":"hello@ecoboxmm.com","address":"Corner of 62nd & Theikpan St, Pyigyitagon, Mandalay"}'::jsonb, 'Mon–Fri, 8:30 – 17:00', 'ecoboxmm.com', '{}'::jsonb, now()),
  ('8b5b4eae-b019-3037-ac2f-26e44fb6a2b1'::uuid, '98daed20-26b4-3cea-93a9-6d9fd7c3dce9'::uuid, 'Myanmar Metal Recovery', 'MM', 'Metal Recovery & Trading', 'Bago', true, 4.6, 47, 2012, array['metal'::public.category_id, 'industrial'::public.category_id]::public.category_id[], 'Sorting and trading of aluminium, steel and copper production surplus from factories in the Bago and Yangon corridors.', '{"person":"U Thet Naing","phone":"+95 9 79 330 2211","email":"trade@mmmetal.com.mm","address":"Mile 46, Yangon–Mandalay Road, Bago"}'::jsonb, 'Mon–Sat, 8:00 – 17:00', 'mmmetal.com.mm', '{}'::jsonb, now()),
  ('1a0b86cb-2e4f-3c9a-86ce-6d445d7a2f55'::uuid, 'e5c513c3-4cc6-3b62-a2b0-6dc0a656bf22'::uuid, 'GreenWood Manufacturing', 'GW', 'Furniture & Woodwork', 'Yangon', true, 4.8, 26, 2017, array['wood'::public.category_id, 'construction'::public.category_id]::public.category_id[], 'Furniture workshop producing hardwood and plywood pieces. Offcuts, short lengths and used pallets are listed weekly for makers and small manufacturers.', '{"person":"Ma Su Yadanar","phone":"+95 9 96 552 4400","email":"workshop@greenwood.mm","address":"No. 7, Dagon Seikkan Industrial Zone, Yangon"}'::jsonb, 'Mon–Sat, 9:00 – 18:00', 'greenwood.mm', '{}'::jsonb, now()),
  ('33d188dd-d947-303b-94ef-fdc1e8b6d351'::uuid, 'eecb71a7-4b60-3a36-a5c2-86c76dd79a1c'::uuid, 'Yangon Glass Supply', 'YG', 'Glass Containers & Sheets', 'Yangon', true, 4.5, 19, 2019, array['glass'::public.category_id]::public.category_id[], 'Supplier of returnable glass bottles, jars and cut sheet surplus to beverage, food and interior businesses.', '{"person":"U Myo Set","phone":"+95 9 45 220 6633","email":"orders@yangonglass.mm","address":"Yankin Township, Yangon"}'::jsonb, 'Mon–Fri, 9:00 – 17:00', 'yangonglass.mm', '{}'::jsonb, now()),
  ('430d86aa-6fc6-3b3f-94dc-97019afe13fc'::uuid, '2ea03376-e9b0-31a0-aff4-b443a63d1dc8'::uuid, 'EcoRubber Industries', 'ER', 'Rubber Processing', 'Mandalay', false, 4.3, 11, 2021, array['rubber'::public.category_id]::public.category_id[], 'Rubber sheet and gasket producer. Offcuts and trimmed sheet surplus are available for re-cutting, matting and industrial padding uses.', '{"person":"Ko Nay Lin","phone":"+95 9 25 118 0099","email":"info@ecorubber.mm","address":"Industrial Zone 2, Amarapura, Mandalay"}'::jsonb, 'Mon–Sat, 8:30 – 17:30', 'ecorubber.mm', '{}'::jsonb, now()),
  ('cc999684-8f1b-31d7-bd2b-8ea9508c3b72'::uuid, '6dfed0bf-cd60-3429-8e51-ff2084c10d70'::uuid, 'CircularBuild Myanmar', 'CB', 'Construction Materials', 'Yangon', true, 4.7, 23, 2020, array['construction'::public.category_id, 'wood'::public.category_id, 'metal'::public.category_id]::public.category_id[], 'Contractor and materials trader listing unused tiles, pipes, plywood and site surplus from completed projects across Yangon.', '{"person":"U Kyaw Swar","phone":"+95 9 78 664 1180","email":"surplus@circularbuild.mm","address":"Thaketa Township, Yangon"}'::jsonb, 'Mon–Sat, 8:00 – 17:00', 'circularbuild.mm', '{}'::jsonb, now())
on conflict (id) do update set
  user_id = excluded.user_id,
  name = excluded.name,
  initials = excluded.initials,
  industry = excluded.industry,
  location = excluded.location,
  verified = excluded.verified,
  rating = excluded.rating,
  transactions = excluded.transactions,
  since = excluded.since,
  categories = excluded.categories,
  description = excluded.description,
  contact = excluded.contact,
  hours = excluded.hours,
  website = excluded.website,
  social_links = excluded.social_links;

insert into public.listings (
  id,
  title,
  category,
  material_type,
  condition,
  composition,
  quantity,
  unit,
  price,
  price_unit,
  min_order,
  location,
  available_from,
  seller_id,
  requires_processing,
  pickup_available,
  featured,
  views,
  inquiries,
  popularity,
  status,
  description,
  uses,
  created_at
)
values
  ('cotton-fabric-surplus', 'Cotton Fabric Surplus', 'textile'::public.category_id, 'Production Surplus'::public.material_type, 'New / Unused'::public.condition_type, '100% cotton twill, 180 GSM, mixed dye lots', 85, 'kg', 4500, 'kg', '10 kg', 'Yangon', 'Available now', 'd845ac00-e6ec-3a61-bc88-52cbf06c27b6'::uuid, false, true, true, 1240, 18, 96, 'Active'::public.listing_status, 'Unused cotton twill remaining from a cancelled export order. Rolls are stored indoors, wrapped and free from moisture damage. Mixed dye lots in navy, khaki and off-white.', array['Small-batch garment production', 'Bag and accessory manufacturing', 'Uniform production', 'Craft and sampling']::text[], '2026-08-18T00:00:00.000Z'::timestamptz),
  ('denim-offcuts', 'Denim Offcuts', 'textile'::public.category_id, 'Offcut'::public.material_type, 'Good'::public.condition_type, 'Cotton denim 12oz, cutting-table offcuts', 240, 'kg', 1800, 'kg', '20 kg', 'Yangon', 'Available now', 'd845ac00-e6ec-3a61-bc88-52cbf06c27b6'::uuid, false, true, false, 860, 12, 81, 'Active'::public.listing_status, 'Weekly denim offcuts from our cutting floor, baled and sorted by shade. Piece sizes mostly between 20cm and 60cm.', array['Patchwork products', 'Bags and pouches', 'Industrial wipes', 'Craft manufacturing']::text[], '2026-08-15T00:00:00.000Z'::timestamptz),
  ('polyester-thread-cones', 'Polyester Thread Cones', 'textile'::public.category_id, 'Excess Inventory'::public.material_type, 'New / Unused'::public.condition_type, '40/2 spun polyester, 5,000m cones', 320, 'cones', 1200, 'unit', '50 cones', 'Yangon', 'Available now', 'd845ac00-e6ec-3a61-bc88-52cbf06c27b6'::uuid, false, true, false, 410, 6, 62, 'Active'::public.listing_status, 'Surplus thread cones in white, black and grey. Sealed, stored on racks, unopened cartons.', array['Garment sewing', 'Bag manufacturing', 'Tailoring workshops']::text[], '2026-08-11T00:00:00.000Z'::timestamptz),
  ('metal-zippers', 'Metal Zippers & Trims', 'textile'::public.category_id, 'Unused Stock'::public.material_type, 'New / Unused'::public.condition_type, 'Brass #5 zippers, 18cm–60cm, assorted', 6400, 'pieces', 220, 'unit', '500 pieces', 'Yangon', 'Available now', 'd845ac00-e6ec-3a61-bc88-52cbf06c27b6'::uuid, false, true, false, 300, 4, 54, 'Active'::public.listing_status, 'Unused zipper stock from discontinued styles. Packed in polybags of 100.', array['Garment production', 'Bag manufacturing', 'Repair services']::text[], '2026-08-06T00:00:00.000Z'::timestamptz),
  ('pet-plastic-scrap', 'PET Plastic Scrap', 'plastic'::public.category_id, 'Recyclable Material'::public.material_type, 'Scrap / Requires Processing'::public.condition_type, 'Post-consumer PET bottles, baled, label-mixed', 550, 'kg', 600, 'kg', '100 kg', 'Yangon', 'Available now', 'dd208da7-74b5-318f-b437-0f020917d86c'::uuid, true, true, true, 2010, 27, 99, 'Active'::public.listing_status, 'Baled clear and light-blue PET collected from beverage distributors. Requires washing and flaking before reprocessing. Bale weight approx. 55kg.', array['Plastic reprocessing', 'Manufacturing inputs', 'Packaging production', 'Fibre production']::text[], '2026-08-19T00:00:00.000Z'::timestamptz),
  ('plastic-packaging-surplus', 'Plastic Packaging Surplus', 'plastic'::public.category_id, 'Packaging Surplus'::public.material_type, 'New / Unused'::public.condition_type, 'LDPE poly bags and shrink film, printed & plain', 180, 'kg', 2200, 'kg', '20 kg', 'Yangon', 'Available now', 'dd208da7-74b5-318f-b437-0f020917d86c'::uuid, false, true, true, 740, 9, 78, 'Active'::public.listing_status, 'Unused packaging film and bags from cancelled orders. Plain stock suitable for immediate reuse.', array['Product packaging', 'Shipping protection', 'Storage']::text[], '2026-08-16T00:00:00.000Z'::timestamptz),
  ('hdpe-plastic-sheets', 'HDPE Plastic Sheets', 'plastic'::public.category_id, 'Offcut'::public.material_type, 'Good'::public.condition_type, 'HDPE sheet 5mm, offcut panels', 95, 'sheets', 6500, 'unit', '10 sheets', 'Yangon', 'Available now', 'dd208da7-74b5-318f-b437-0f020917d86c'::uuid, false, true, false, 380, 5, 58, 'Reserved'::public.listing_status, 'Cut panels from a fabrication run, sizes between 40x60cm and 90x120cm.', array['Fabrication', 'Cutting boards', 'Machine guards', 'Signage']::text[], '2026-08-09T00:00:00.000Z'::timestamptz),
  ('corrugated-cardboard-boxes', 'Corrugated Cardboard Boxes', 'paper'::public.category_id, 'Reusable Surplus'::public.material_type, 'Like New'::public.condition_type, '3-ply corrugated, 40x30x25cm', 1200, 'boxes', 300, 'unit', '100 boxes', 'Mandalay', 'Available now', '9d24b029-610c-3b04-a375-a7ca0bff5a25'::uuid, false, true, true, 1580, 21, 94, 'Active'::public.listing_status, 'Over-run cartons from a completed order, flat-packed and stored dry. Minor print on one side, structurally as-new.', array['Shipping boxes', 'Packaging', 'Storage', 'E-commerce fulfilment']::text[], '2026-08-17T00:00:00.000Z'::timestamptz),
  ('kraft-paper-rolls', 'Kraft Paper Rolls', 'paper'::public.category_id, 'Excess Inventory'::public.material_type, 'New / Unused'::public.condition_type, '120 GSM kraft, 90cm width rolls', 42, 'rolls', 38000, 'unit', '5 rolls', 'Mandalay', 'Available now', '9d24b029-610c-3b04-a375-a7ca0bff5a25'::uuid, false, true, false, 520, 7, 66, 'Active'::public.listing_status, 'Unused kraft rolls surplus to current production planning.', array['Wrapping and void fill', 'Paper bag production', 'Printing']::text[], '2026-08-12T00:00:00.000Z'::timestamptz),
  ('cardboard-sheets', 'Cardboard Sheet Trim', 'paper'::public.category_id, 'Offcut'::public.material_type, 'Good'::public.condition_type, 'Corrugated trim sheets, mixed sizes', 900, 'kg', 250, 'kg', '100 kg', 'Mandalay', 'From 20 Aug', '9d24b029-610c-3b04-a375-a7ca0bff5a25'::uuid, true, true, false, 340, 3, 49, 'Active'::public.listing_status, 'Trim from our corrugator, baled. Suitable for repulping or protective layering.', array['Paper recycling', 'Protective packing', 'Layer pads']::text[], '2026-08-04T00:00:00.000Z'::timestamptz),
  ('aluminum-offcuts', 'Aluminum Offcuts', 'metal'::public.category_id, 'Recyclable Material'::public.material_type, 'Scrap / Requires Processing'::public.condition_type, '6063 aluminium extrusion offcuts, clean', 250, 'kg', 3800, 'kg', '50 kg', 'Bago', 'Available now', '8b5b4eae-b019-3037-ac2f-26e44fb6a2b1'::uuid, true, true, true, 970, 14, 88, 'Active'::public.listing_status, 'Clean extrusion offcuts, sorted and free of steel contamination. Weighed on certified scale at pickup.', array['Aluminium smelting', 'Casting inputs', 'Fabrication components']::text[], '2026-08-14T00:00:00.000Z'::timestamptz),
  ('steel-offcuts', 'Steel Plate Offcuts', 'metal'::public.category_id, 'Offcut'::public.material_type, 'Good'::public.condition_type, 'Mild steel plate 3–8mm, laser-cut remnants', 640, 'kg', 1450, 'kg', '100 kg', 'Bago', 'Available now', '8b5b4eae-b019-3037-ac2f-26e44fb6a2b1'::uuid, false, true, false, 610, 8, 71, 'Active'::public.listing_status, 'Usable plate remnants from laser cutting, sorted by thickness.', array['Metal fabrication', 'Bracket production', 'Workshop stock']::text[], '2026-08-10T00:00:00.000Z'::timestamptz),
  ('copper-wire-scrap', 'Copper Wire Scrap', 'metal'::public.category_id, 'Scrap Material'::public.material_type, 'Scrap / Requires Processing'::public.condition_type, 'Insulated copper wire, mixed gauges', 120, 'kg', 9800, 'kg', '20 kg', 'Bago', 'Available now', '8b5b4eae-b019-3037-ac2f-26e44fb6a2b1'::uuid, true, false, false, 720, 11, 77, 'Active'::public.listing_status, 'Insulated wire requiring stripping before smelting. Delivery available within Bago and Yangon.', array['Copper recovery', 'Electrical component manufacturing']::text[], '2026-08-13T00:00:00.000Z'::timestamptz),
  ('wood-offcuts', 'Wood Offcuts', 'wood'::public.category_id, 'Reusable Surplus'::public.material_type, 'Good'::public.condition_type, 'Hardwood and rubberwood, 20–80cm lengths', 180, 'kg', null, 'kg', '20 kg', 'Yangon', 'Available now', '1a0b86cb-2e4f-3c9a-86ce-6d445d7a2f55'::uuid, false, true, false, 880, 13, 84, 'Active'::public.listing_status, 'Kiln-dried offcuts from furniture production. Price negotiable depending on volume and collection schedule.', array['Furniture components', 'Packaging', 'Crafts', 'Small product manufacturing']::text[], '2026-08-18T00:00:00.000Z'::timestamptz),
  ('wooden-pallets', 'Wooden Pallets', 'wood'::public.category_id, 'Reusable Surplus'::public.material_type, 'Used'::public.condition_type, 'Standard 120x100cm four-way pallets', 260, 'pallets', 4500, 'unit', '20 pallets', 'Yangon', 'Available now', '1a0b86cb-2e4f-3c9a-86ce-6d445d7a2f55'::uuid, false, true, false, 640, 10, 73, 'Active'::public.listing_status, 'Used but structurally sound pallets, inspected before release. Repairable units priced lower.', array['Warehouse handling', 'Furniture upcycling', 'Crating']::text[], '2026-08-08T00:00:00.000Z'::timestamptz),
  ('plywood-sheets', 'Plywood Sheet Surplus', 'wood'::public.category_id, 'Excess Inventory'::public.material_type, 'New / Unused'::public.condition_type, '12mm commercial plywood, 4x8ft', 74, 'sheets', 32000, 'unit', '5 sheets', 'Yangon', 'Available now', '1a0b86cb-2e4f-3c9a-86ce-6d445d7a2f55'::uuid, false, true, false, 430, 6, 64, 'Active'::public.listing_status, 'Unused sheets from an over-ordered project. Stored flat and dry.', array['Furniture', 'Interior fit-out', 'Crate production']::text[], '2026-08-05T00:00:00.000Z'::timestamptz),
  ('glass-bottles', 'Glass Bottles', 'glass'::public.category_id, 'Reusable Surplus'::public.material_type, 'Like New'::public.condition_type, '330ml clear glass bottles, washed', 2000, 'pieces', 350, 'unit', '200 pieces', 'Yangon', 'Available now', '33d188dd-d947-303b-94ef-fdc1e8b6d351'::uuid, false, true, false, 690, 9, 75, 'Active'::public.listing_status, 'Washed and crated returnable bottles, suitable for beverage and sauce filling lines.', array['Beverage bottling', 'Sauces and condiments', 'Retail packaging']::text[], '2026-08-16T00:00:00.000Z'::timestamptz),
  ('glass-jars', 'Glass Jars with Lids', 'glass'::public.category_id, 'Unused Stock'::public.material_type, 'New / Unused'::public.condition_type, '250ml jars with metal twist lids', 1400, 'pieces', 520, 'unit', '100 pieces', 'Yangon', 'Available now', '33d188dd-d947-303b-94ef-fdc1e8b6d351'::uuid, false, true, false, 350, 4, 57, 'Active'::public.listing_status, 'Unused jar stock from a discontinued SKU. Lids included.', array['Food packaging', 'Cosmetics', 'Retail products']::text[], '2026-08-07T00:00:00.000Z'::timestamptz),
  ('glass-sheet-surplus', 'Glass Sheet Surplus', 'glass'::public.category_id, 'Production Surplus'::public.material_type, 'Minor Defect'::public.condition_type, '5mm float glass, cut sheets', 60, 'sheets', 14000, 'unit', '5 sheets', 'Yangon', 'From 22 Aug', '33d188dd-d947-303b-94ef-fdc1e8b6d351'::uuid, false, false, false, 210, 2, 43, 'Active'::public.listing_status, 'Cut sheets with minor edge chips. Suitable for framed or non-structural applications.', array['Framing', 'Interior fittings', 'Display cases']::text[], '2026-08-02T00:00:00.000Z'::timestamptz),
  ('rubber-sheet-offcuts', 'Rubber Sheet Offcuts', 'rubber'::public.category_id, 'Offcut'::public.material_type, 'Scrap / Requires Processing'::public.condition_type, 'SBR rubber sheet 3–6mm, trimmed edges', 75, 'kg', 2500, 'kg', '15 kg', 'Mandalay', 'Available now', '430d86aa-6fc6-3b3f-94dc-97019afe13fc'::uuid, true, true, false, 290, 3, 47, 'Active'::public.listing_status, 'Edge trim from gasket cutting. Buyers typically re-cut smaller parts or granulate.', array['Gasket re-cutting', 'Matting', 'Granulate inputs']::text[], '2026-08-11T00:00:00.000Z'::timestamptz),
  ('rubber-sheets', 'Industrial Rubber Sheets', 'rubber'::public.category_id, 'Excess Inventory'::public.material_type, 'New / Unused'::public.condition_type, 'Nitrile sheet 4mm, 1m x 1.2m', 48, 'sheets', 18000, 'unit', '4 sheets', 'Mandalay', 'Available now', '430d86aa-6fc6-3b3f-94dc-97019afe13fc'::uuid, false, true, false, 240, 2, 41, 'Active'::public.listing_status, 'Unused sheet stock held beyond planned production.', array['Gaskets and seals', 'Machine padding', 'Flooring']::text[], '2026-07-31T00:00:00.000Z'::timestamptz),
  ('ceramic-tiles', 'Excess Ceramic Tiles', 'construction'::public.category_id, 'Unused Stock'::public.material_type, 'New / Unused'::public.condition_type, '60x60cm matte porcelain, beige', 120, 'boxes', 25000, 'box', '5 boxes', 'Yangon', 'Available now', 'cc999684-8f1b-31d7-bd2b-8ea9508c3b72'::uuid, false, true, true, 830, 12, 82, 'Active'::public.listing_status, 'Unused tiles left after a completed hotel fit-out. Same batch number, sealed boxes of 4 pieces.', array['Interior fit-out', 'Renovation projects', 'Retail construction']::text[], '2026-08-17T00:00:00.000Z'::timestamptz),
  ('unused-pvc-pipes', 'Unused PVC Pipes', 'construction'::public.category_id, 'Excess Inventory'::public.material_type, 'New / Unused'::public.condition_type, 'PVC 4in pressure pipe, 4m lengths', 210, 'lengths', 11500, 'unit', '10 lengths', 'Yangon', 'Available now', 'cc999684-8f1b-31d7-bd2b-8ea9508c3b72'::uuid, false, true, false, 460, 6, 63, 'Active'::public.listing_status, 'Surplus pipe from a drainage package, stored under cover.', array['Plumbing', 'Drainage', 'Irrigation']::text[], '2026-08-09T00:00:00.000Z'::timestamptz),
  ('industrial-fasteners', 'Assorted Industrial Fasteners', 'industrial'::public.category_id, 'Excess Inventory'::public.material_type, 'New / Unused'::public.condition_type, 'Stainless bolts, nuts, washers M6–M16', 340, 'kg', 5200, 'kg', '20 kg', 'Yangon', 'Available now', 'dd208da7-74b5-318f-b437-0f020917d86c'::uuid, false, true, false, 320, 5, 56, 'Active'::public.listing_status, 'Mixed fastener stock sorted into labelled bins. Sold by weight per size band.', array['Machinery assembly', 'Workshop stock', 'Maintenance']::text[], '2026-08-03T00:00:00.000Z'::timestamptz),
  ('reusable-ibc-containers', 'Reusable Plastic Containers', 'industrial'::public.category_id, 'Packaging Surplus'::public.material_type, 'Used'::public.condition_type, '200L HDPE drums, food-grade, cleaned', 86, 'units', 21000, 'unit', '5 units', 'Yangon', 'Available now', 'dd208da7-74b5-318f-b437-0f020917d86c'::uuid, false, true, false, 510, 8, 69, 'Active'::public.listing_status, 'Cleaned drums previously used for food-grade liquids. Lids and clamps included.', array['Liquid storage', 'Water tanks', 'Agricultural use']::text[], '2026-08-14T00:00:00.000Z'::timestamptz),
  ('mixed-office-paper', 'Mixed Office Paper Surplus', 'other'::public.category_id, 'Recyclable Material'::public.material_type, 'Used'::public.condition_type, 'Sorted white and mixed office paper', 400, 'kg', 180, 'kg', '50 kg', 'Yangon', 'Available now', '9d24b029-610c-3b04-a375-a7ca0bff5a25'::uuid, true, true, false, 180, 2, 38, 'Active'::public.listing_status, 'Shredded and loose office paper collected from partner offices, baled monthly.', array['Paper recycling', 'Moulded pulp packaging']::text[], '2026-07-30T00:00:00.000Z'::timestamptz)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  material_type = excluded.material_type,
  condition = excluded.condition,
  composition = excluded.composition,
  quantity = excluded.quantity,
  unit = excluded.unit,
  price = excluded.price,
  price_unit = excluded.price_unit,
  min_order = excluded.min_order,
  location = excluded.location,
  available_from = excluded.available_from,
  seller_id = excluded.seller_id,
  requires_processing = excluded.requires_processing,
  pickup_available = excluded.pickup_available,
  featured = excluded.featured,
  views = excluded.views,
  inquiries = excluded.inquiries,
  popularity = excluded.popularity,
  status = excluded.status,
  description = excluded.description,
  uses = excluded.uses,
  created_at = excluded.created_at;

insert into public.wanted_posts (
  id,
  title,
  category,
  quantity,
  budget,
  budget_value,
  location,
  use,
  condition,
  required_by,
  buyer_name,
  offers_count,
  notes,
  created_at
)
values
  ('58ba7abe-4b38-3240-9fd3-a7ceafbca5d2'::uuid, 'WANTED: PET Plastic Scrap', 'plastic'::public.category_id, '500 kg', 'Up to 350,000 MMK', 350000, 'Yangon', 'Plastic manufacturing', 'Scrap / Requires Processing', '30 Aug 2026', 'EcoBag Myanmar', 4, 'Baled material preferred. We can collect from Yangon industrial zones with our own truck.', '2026-08-19T00:00:00.000Z'::timestamptz),
  ('5f180404-b5c2-3ac8-954b-a46490254e10'::uuid, 'WANTED: Cardboard Boxes', 'paper'::public.category_id, '1,000 pieces', '200–400 MMK/unit', 400000, 'Mandalay', 'Product shipping', 'Good or better', '25 Aug 2026', 'Shwe Online Retail', 6, 'Boxes must be dry and flat-packed. Repeat monthly requirement if quality is consistent.', '2026-08-18T00:00:00.000Z'::timestamptz),
  ('b3bb5ede-dd25-3ff7-987b-0f565dd913fe'::uuid, 'WANTED: Wood Offcuts', 'wood'::public.category_id, '100 kg', '150,000 MMK', 150000, 'Yangon', 'Furniture production', 'Good', '28 Aug 2026', 'Teak & Twine Studio', 3, 'Preferably hardwood offcuts suitable for small home decor items. Pickup available.', '2026-08-17T00:00:00.000Z'::timestamptz)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  quantity = excluded.quantity,
  budget = excluded.budget,
  budget_value = excluded.budget_value,
  location = excluded.location,
  use = excluded.use,
  condition = excluded.condition,
  required_by = excluded.required_by,
  buyer_name = excluded.buyer_name,
  offers_count = excluded.offers_count,
  notes = excluded.notes,
  created_at = excluded.created_at;

commit;
