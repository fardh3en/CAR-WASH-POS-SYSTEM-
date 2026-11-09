-- Approved business configuration. Missing pricing rows mean unavailable.
-- This seed mirrors DEFAULT_BUSINESS_CATEGORIES, DEFAULT_SERVICE_PACKAGES,
-- and OFFICIAL_MR_WASH_PRICING in the TypeScript source.

insert into public.vehicle_categories (id, name, display_order, variants) values
  ('hatchback_car', 'Hatchback Car', 1, '{}'),
  ('sedan_car', 'Sedan Car', 2, '{}'),
  ('compact_suv', 'Compact SUV', 3, '{}'),
  ('suv', 'SUV', 4, '{}'),
  ('premium_suv', 'Premium SUV', 5, '{}'),
  ('scooter', 'Scooter', 6, '{}'),
  ('bike', 'Bike', 7, '{}'),
  ('bullet', 'Bullet', 8, '{}'),
  ('superbike', 'Superbike', 9, '{}'),
  ('auto', 'Auto', 10, '{}'),
  ('traveller', 'Traveller', 11, array['10 Seat', '14 Seat', '17 Seat']),
  ('pickup', 'Pickup', 12, array['Ordinary', 'Long Chassis']),
  ('dost', 'Dost', 13, array['Ordinary', 'Bada Dost']),
  ('tata_ace', 'TATA ACE', 14, '{}'),
  ('super_ace', 'Super ACE', 15, '{}')
on conflict (id) do update set
  name = excluded.name,
  display_order = excluded.display_order,
  variants = excluded.variants,
  updated_at = now();

insert into public.service_packages (id, name, description, activities, display_order) values
  ('body_wash', 'Body Wash', 'Exterior pressure wash and tyre polishing',
    '["Exterior pressure wash", "Tyre polishing"]'::jsonb, 1),
  ('body_vacuum', 'Body & Vacuum', 'Exterior body cleaning, interior vacuuming, dashboard and tyre polishing',
    '["Exterior body cleaning", "Interior vacuuming", "Dashboard polishing", "Tyre polishing"]'::jsonb, 2),
  ('full_wash', 'Full Wash', 'Complete comprehensive cleaning including underbody and engine room',
    '["Exterior body cleaning", "Interior vacuuming", "Dashboard polishing", "Tyre polishing", "Underbody cleaning", "Engine room cleaning"]'::jsonb, 3)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  activities = excluded.activities,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.pricing_rules (
  id, vehicle_category_id, service_package_id, variant, price, is_active
) values
  ('hatchback_car_body_wash', 'hatchback_car', 'body_wash', null, 200, true),
  ('hatchback_car_body_vacuum', 'hatchback_car', 'body_vacuum', null, 350, true),
  ('hatchback_car_full_wash', 'hatchback_car', 'full_wash', null, 550, true),
  ('sedan_car_body_wash', 'sedan_car', 'body_wash', null, 250, true),
  ('sedan_car_body_vacuum', 'sedan_car', 'body_vacuum', null, 450, true),
  ('sedan_car_full_wash', 'sedan_car', 'full_wash', null, 650, true),
  ('compact_suv_body_wash', 'compact_suv', 'body_wash', null, 250, true),
  ('compact_suv_body_vacuum', 'compact_suv', 'body_vacuum', null, 450, true),
  ('compact_suv_full_wash', 'compact_suv', 'full_wash', null, 700, true),
  ('premium_suv_body_wash', 'premium_suv', 'body_wash', null, 400, true),
  ('premium_suv_body_vacuum', 'premium_suv', 'body_vacuum', null, 650, true),
  ('premium_suv_full_wash', 'premium_suv', 'full_wash', null, 900, true),
  ('scooter_full_wash', 'scooter', 'full_wash', null, 200, true),
  ('bike_full_wash', 'bike', 'full_wash', null, 250, true),
  ('bullet_full_wash', 'bullet', 'full_wash', null, 300, true),
  ('auto_full_wash', 'auto', 'full_wash', null, 600, true),
  ('traveller_10_seat_body_wash', 'traveller', 'body_wash', '10 Seat', 450, true),
  ('traveller_10_seat_body_vacuum', 'traveller', 'body_vacuum', '10 Seat', 700, true),
  ('traveller_10_seat_full_wash', 'traveller', 'full_wash', '10 Seat', 1200, true),
  ('traveller_14_seat_body_wash', 'traveller', 'body_wash', '14 Seat', 550, true),
  ('traveller_14_seat_body_vacuum', 'traveller', 'body_vacuum', '14 Seat', 800, true),
  ('traveller_14_seat_full_wash', 'traveller', 'full_wash', '14 Seat', 1500, true),
  ('traveller_17_seat_body_wash', 'traveller', 'body_wash', '17 Seat', 600, true),
  ('traveller_17_seat_body_vacuum', 'traveller', 'body_vacuum', '17 Seat', 850, true),
  ('traveller_17_seat_full_wash', 'traveller', 'full_wash', '17 Seat', 1700, true),
  ('pickup_ordinary_body_wash', 'pickup', 'body_wash', 'Ordinary', 300, true),
  ('pickup_ordinary_body_vacuum', 'pickup', 'body_vacuum', 'Ordinary', 500, true),
  ('pickup_ordinary_full_wash', 'pickup', 'full_wash', 'Ordinary', 750, true),
  ('pickup_long_chassis_body_wash', 'pickup', 'body_wash', 'Long Chassis', 350, true),
  ('pickup_long_chassis_body_vacuum', 'pickup', 'body_vacuum', 'Long Chassis', 500, true),
  ('pickup_long_chassis_full_wash', 'pickup', 'full_wash', 'Long Chassis', 800, true),
  ('dost_ordinary_body_wash', 'dost', 'body_wash', 'Ordinary', 300, true),
  ('dost_ordinary_body_vacuum', 'dost', 'body_vacuum', 'Ordinary', 500, true),
  ('dost_ordinary_full_wash', 'dost', 'full_wash', 'Ordinary', 750, true),
  ('dost_bada_dost_body_wash', 'dost', 'body_wash', 'Bada Dost', 350, true),
  ('dost_bada_dost_body_vacuum', 'dost', 'body_vacuum', 'Bada Dost', 500, true),
  ('dost_bada_dost_full_wash', 'dost', 'full_wash', 'Bada Dost', 800, true),
  ('tata_ace_body_wash', 'tata_ace', 'body_wash', null, 300, true),
  ('tata_ace_body_vacuum', 'tata_ace', 'body_vacuum', null, 450, true),
  ('tata_ace_full_wash', 'tata_ace', 'full_wash', null, 700, true),
  ('super_ace_body_wash', 'super_ace', 'body_wash', null, 350, true),
  ('super_ace_body_vacuum', 'super_ace', 'body_vacuum', null, 450, true),
  ('super_ace_full_wash', 'super_ace', 'full_wash', null, 750, true)
on conflict (vehicle_category_id, (coalesce(variant, '')), service_package_id)
do update set price = excluded.price, is_active = true, effective_from = now(), updated_at = now();

-- SUV and Superbike are deliberately unconfigured. Two-wheelers and Auto also
-- have only the approved Full Wash price; all other combinations stay absent.
