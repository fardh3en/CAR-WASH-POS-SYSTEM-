-- ============================================================
-- Mr. Wash POS — Standalone Mock Sales Data Generator (SQL)
-- Run this in the Supabase SQL Editor to populate realistic sales
-- for Today, Yesterday, and the past week.
-- ============================================================

DO $$
DECLARE
  v_admin_id text;
  v_admin_name text := 'System Administrator';
  v_admin_email text := 'admin@mrwash.com';
  v_cust_id text;
  v_veh_id text;
  v_tx_id text;
  v_tx_num text;
  v_today_ist text := to_char(now() at time zone 'Asia/Kolkata', 'YYYYMMDD');
  v_now timestamptz := now();
  v_yesterday timestamptz := now() - interval '1 day';
  v_two_days_ago timestamptz := now() - interval '2 days';
  v_three_days_ago timestamptz := now() - interval '3 days';
  v_seq integer := 1;
BEGIN
  -- 1. Obtain an active admin profile ID
  SELECT id::text INTO v_admin_id FROM public.profiles WHERE is_active LIMIT 1;
  IF v_admin_id IS NULL THEN
    v_admin_id := '00000000-0000-0000-0000-000000000001';
  END IF;

  -- 2. Clean up any previous demo transactions if needed (optional)
  -- DELETE FROM public.payments WHERE transaction_number LIKE 'TRX-DEMO-%';
  -- DELETE FROM public.transactions WHERE transaction_number LIKE 'TRX-DEMO-%';

  -- ==========================================================
  -- TODAY'S TRANSACTIONS (10 Sample Completed Orders)
  -- ==========================================================

  -- Item 1: Swift Hatchback - Full Wash (UPI)
  v_cust_id := gen_random_uuid()::text;
  INSERT INTO public.customers (id, name, phone_number, created_at, updated_at)
  VALUES (v_cust_id, 'Anand Verma', '9847123456', v_now, v_now)
  ON CONFLICT DO NOTHING;

  v_veh_id := gen_random_uuid()::text;
  INSERT INTO public.vehicles (id, registration_number, display_registration_number, category_id, model, customer_id, created_at, updated_at)
  VALUES (v_veh_id, 'KL07CD4589', 'KL 07 CD 4589', 'hatchback_car', 'Maruti Suzuki Swift', v_cust_id, v_now, v_now)
  ON CONFLICT (registration_number) DO UPDATE SET updated_at = v_now RETURNING id INTO v_veh_id;

  v_tx_id := gen_random_uuid()::text;
  v_tx_num := 'TRX-' || v_today_ist || '-0001';
  INSERT INTO public.transactions (
    id, transaction_number, status, payment_status, paid_amount, payment_method, paid_at,
    vehicle_arrived_at, created_at, updated_at,
    vehicle_snapshot, customer_snapshot, service_package_snapshot, pricing_snapshot, staff_snapshot
  ) VALUES (
    v_tx_id, v_tx_num, 'COMPLETED', 'PAID', 550, 'UPI', v_now - interval '3 hours',
    v_now - interval '3 hours', v_now - interval '3 hours', v_now - interval '3 hours',
    jsonb_build_object('vehicleId', v_veh_id, 'registrationNumber', 'KL07CD4589', 'displayRegistrationNumber', 'KL 07 CD 4589', 'categoryId', 'hatchback_car', 'categoryName', 'Hatchback Car', 'model', 'Swift'),
    jsonb_build_object('customerId', v_cust_id, 'name', 'Anand Verma', 'phoneNumber', '9847123456'),
    jsonb_build_object('servicePackageId', 'full_wash', 'name', 'Full Wash', 'activities', '["Exterior wash","Interior vacuum","Tyre polish"]'::jsonb),
    jsonb_build_object('standardPrice', 550, 'actualPrice', 550, 'priceAdjustment', 0),
    jsonb_build_object('staffId', v_admin_id, 'staffName', v_admin_name, 'staffEmail', v_admin_email)
  ) ON CONFLICT (transaction_number) DO NOTHING;

  INSERT INTO public.payments (
    transaction_id, transaction_number, amount, payment_method, upi_reference_number,
    recorded_by_staff_id, recorded_by_staff_name, recorded_at, is_reversed
  ) VALUES (
    v_tx_id, v_tx_num, 550, 'UPI', 'UPI-948102384910', v_admin_id, v_admin_name, v_now - interval '3 hours', false
  ) ON CONFLICT DO NOTHING;

  -- Item 2: Pulsar 150 Bike - Full Wash (Cash)
  v_cust_id := gen_random_uuid()::text;
  INSERT INTO public.customers (id, name, phone_number, created_at, updated_at)
  VALUES (v_cust_id, 'Suresh Kumar', '9847234567', v_now, v_now)
  ON CONFLICT DO NOTHING;

  v_veh_id := gen_random_uuid()::text;
  INSERT INTO public.vehicles (id, registration_number, display_registration_number, category_id, model, customer_id, created_at, updated_at)
  VALUES (v_veh_id, 'KL01AB9988', 'KL 01 AB 9988', 'bike', 'Bajaj Pulsar 150', v_cust_id, v_now, v_now)
  ON CONFLICT (registration_number) DO UPDATE SET updated_at = v_now RETURNING id INTO v_veh_id;

  v_tx_id := gen_random_uuid()::text;
  v_tx_num := 'TRX-' || v_today_ist || '-0002';
  INSERT INTO public.transactions (
    id, transaction_number, status, payment_status, paid_amount, payment_method, paid_at,
    vehicle_arrived_at, created_at, updated_at,
    vehicle_snapshot, customer_snapshot, service_package_snapshot, pricing_snapshot, staff_snapshot
  ) VALUES (
    v_tx_id, v_tx_num, 'COMPLETED', 'PAID', 250, 'CASH', v_now - interval '2 hours 40 minutes',
    v_now - interval '2 hours 40 minutes', v_now - interval '2 hours 40 minutes', v_now - interval '2 hours 40 minutes',
    jsonb_build_object('vehicleId', v_veh_id, 'registrationNumber', 'KL01AB9988', 'displayRegistrationNumber', 'KL 01 AB 9988', 'categoryId', 'bike', 'categoryName', 'Bike', 'model', 'Pulsar 150'),
    jsonb_build_object('customerId', v_cust_id, 'name', 'Suresh Kumar', 'phoneNumber', '9847234567'),
    jsonb_build_object('servicePackageId', 'full_wash', 'name', 'Full Wash', 'activities', '["Exterior wash","Tyre polish"]'::jsonb),
    jsonb_build_object('standardPrice', 250, 'actualPrice', 250, 'priceAdjustment', 0),
    jsonb_build_object('staffId', v_admin_id, 'staffName', v_admin_name, 'staffEmail', v_admin_email)
  ) ON CONFLICT (transaction_number) DO NOTHING;

  INSERT INTO public.payments (
    transaction_id, transaction_number, amount, payment_method, notes,
    recorded_by_staff_id, recorded_by_staff_name, recorded_at, is_reversed
  ) VALUES (
    v_tx_id, v_tx_num, 250, 'CASH', 'Exact tender received', v_admin_id, v_admin_name, v_now - interval '2 hours 40 minutes', false
  ) ON CONFLICT DO NOTHING;

  -- Item 3: Creta Compact SUV - Full Wash (UPI)
  v_cust_id := gen_random_uuid()::text;
  INSERT INTO public.customers (id, name, phone_number, created_at, updated_at)
  VALUES (v_cust_id, 'Vishnu Prasad', '9847567890', v_now, v_now)
  ON CONFLICT DO NOTHING;

  v_veh_id := gen_random_uuid()::text;
  INSERT INTO public.vehicles (id, registration_number, display_registration_number, category_id, model, customer_id, created_at, updated_at)
  VALUES (v_veh_id, 'KL01AZ7777', 'KL 01 AZ 7777', 'compact_suv', 'Hyundai Creta', v_cust_id, v_now, v_now)
  ON CONFLICT (registration_number) DO UPDATE SET updated_at = v_now RETURNING id INTO v_veh_id;

  v_tx_id := gen_random_uuid()::text;
  v_tx_num := 'TRX-' || v_today_ist || '-0003';
  INSERT INTO public.transactions (
    id, transaction_number, status, payment_status, paid_amount, payment_method, paid_at,
    vehicle_arrived_at, created_at, updated_at,
    vehicle_snapshot, customer_snapshot, service_package_snapshot, pricing_snapshot, staff_snapshot
  ) VALUES (
    v_tx_id, v_tx_num, 'COMPLETED', 'PAID', 700, 'UPI', v_now - interval '2 hours 15 minutes',
    v_now - interval '2 hours 15 minutes', v_now - interval '2 hours 15 minutes', v_now - interval '2 hours 15 minutes',
    jsonb_build_object('vehicleId', v_veh_id, 'registrationNumber', 'KL01AZ7777', 'displayRegistrationNumber', 'KL 01 AZ 7777', 'categoryId', 'compact_suv', 'categoryName', 'Compact SUV', 'model', 'Creta'),
    jsonb_build_object('customerId', v_cust_id, 'name', 'Vishnu Prasad', 'phoneNumber', '9847567890'),
    jsonb_build_object('servicePackageId', 'full_wash', 'name', 'Full Wash', 'activities', '["Complete wash","Underbody wash","Interior vacuum"]'::jsonb),
    jsonb_build_object('standardPrice', 700, 'actualPrice', 700, 'priceAdjustment', 0),
    jsonb_build_object('staffId', v_admin_id, 'staffName', v_admin_name, 'staffEmail', v_admin_email)
  ) ON CONFLICT (transaction_number) DO NOTHING;

  INSERT INTO public.payments (
    transaction_id, transaction_number, amount, payment_method, upi_reference_number,
    recorded_by_staff_id, recorded_by_staff_name, recorded_at, is_reversed
  ) VALUES (
    v_tx_id, v_tx_num, 700, 'UPI', 'UPI-639102948273', v_admin_id, v_admin_name, v_now - interval '2 hours 15 minutes', false
  ) ON CONFLICT DO NOTHING;

  -- Item 4: Fortuner Premium SUV - Full Wash (Cash)
  v_cust_id := gen_random_uuid()::text;
  INSERT INTO public.customers (id, name, phone_number, created_at, updated_at)
  VALUES (v_cust_id, 'George Joseph', '9847678901', v_now, v_now)
  ON CONFLICT DO NOTHING;

  v_veh_id := gen_random_uuid()::text;
  INSERT INTO public.vehicles (id, registration_number, display_registration_number, category_id, model, customer_id, created_at, updated_at)
  VALUES (v_veh_id, 'KL07CK2020', 'KL 07 CK 2020', 'premium_suv', 'Toyota Fortuner', v_cust_id, v_now, v_now)
  ON CONFLICT (registration_number) DO UPDATE SET updated_at = v_now RETURNING id INTO v_veh_id;

  v_tx_id := gen_random_uuid()::text;
  v_tx_num := 'TRX-' || v_today_ist || '-0004';
  INSERT INTO public.transactions (
    id, transaction_number, status, payment_status, paid_amount, payment_method, paid_at,
    vehicle_arrived_at, created_at, updated_at,
    vehicle_snapshot, customer_snapshot, service_package_snapshot, pricing_snapshot, staff_snapshot
  ) VALUES (
    v_tx_id, v_tx_num, 'COMPLETED', 'PAID', 900, 'CASH', v_now - interval '1 hour 45 minutes',
    v_now - interval '1 hour 45 minutes', v_now - interval '1 hour 45 minutes', v_now - interval '1 hour 45 minutes',
    jsonb_build_object('vehicleId', v_veh_id, 'registrationNumber', 'KL07CK2020', 'displayRegistrationNumber', 'KL 07 CK 2020', 'categoryId', 'premium_suv', 'categoryName', 'Premium SUV', 'model', 'Fortuner'),
    jsonb_build_object('customerId', v_cust_id, 'name', 'George Joseph', 'phoneNumber', '9847678901'),
    jsonb_build_object('servicePackageId', 'full_wash', 'name', 'Full Wash', 'activities', '["Complete wash","Underbody wash","Dashboard dressing"]'::jsonb),
    jsonb_build_object('standardPrice', 900, 'actualPrice', 900, 'priceAdjustment', 0),
    jsonb_build_object('staffId', v_admin_id, 'staffName', v_admin_name, 'staffEmail', v_admin_email)
  ) ON CONFLICT (transaction_number) DO NOTHING;

  INSERT INTO public.payments (
    transaction_id, transaction_number, amount, payment_method,
    recorded_by_staff_id, recorded_by_staff_name, recorded_at, is_reversed
  ) VALUES (
    v_tx_id, v_tx_num, 900, 'CASH', v_admin_id, v_admin_name, v_now - interval '1 hour 45 minutes', false
  ) ON CONFLICT DO NOTHING;

  -- Item 5: Force Traveller 10-Seat - Full Wash (UPI)
  v_cust_id := gen_random_uuid()::text;
  INSERT INTO public.customers (id, name, phone_number, created_at, updated_at)
  VALUES (v_cust_id, 'Kochi Tours', '9847112233', v_now, v_now)
  ON CONFLICT DO NOTHING;

  v_veh_id := gen_random_uuid()::text;
  INSERT INTO public.vehicles (id, registration_number, display_registration_number, category_id, variant, model, customer_id, created_at, updated_at)
  VALUES (v_veh_id, 'KL07CN9001', 'KL 07 CN 9001', 'traveller', '10 Seat', 'Force Traveller', v_cust_id, v_now, v_now)
  ON CONFLICT (registration_number) DO UPDATE SET updated_at = v_now RETURNING id INTO v_veh_id;

  v_tx_id := gen_random_uuid()::text;
  v_tx_num := 'TRX-' || v_today_ist || '-0005';
  INSERT INTO public.transactions (
    id, transaction_number, status, payment_status, paid_amount, payment_method, paid_at,
    vehicle_arrived_at, created_at, updated_at,
    vehicle_snapshot, customer_snapshot, service_package_snapshot, pricing_snapshot, staff_snapshot
  ) VALUES (
    v_tx_id, v_tx_num, 'COMPLETED', 'PAID', 1200, 'UPI', v_now - interval '1 hour 15 minutes',
    v_now - interval '1 hour 15 minutes', v_now - interval '1 hour 15 minutes', v_now - interval '1 hour 15 minutes',
    jsonb_build_object('vehicleId', v_veh_id, 'registrationNumber', 'KL07CN9001', 'displayRegistrationNumber', 'KL 07 CN 9001', 'categoryId', 'traveller', 'categoryName', 'Traveller', 'variant', '10 Seat', 'model', 'Traveller 10S'),
    jsonb_build_object('customerId', v_cust_id, 'name', 'Kochi Tours', 'phoneNumber', '9847112233'),
    jsonb_build_object('servicePackageId', 'full_wash', 'name', 'Full Wash', 'activities', '["Heavy wash","Underbody wash","High roof wash"]'::jsonb),
    jsonb_build_object('standardPrice', 1200, 'actualPrice', 1200, 'priceAdjustment', 0),
    jsonb_build_object('staffId', v_admin_id, 'staffName', v_admin_name, 'staffEmail', v_admin_email)
  ) ON CONFLICT (transaction_number) DO NOTHING;

  INSERT INTO public.payments (
    transaction_id, transaction_number, amount, payment_method, upi_reference_number,
    recorded_by_staff_id, recorded_by_staff_name, recorded_at, is_reversed
  ) VALUES (
    v_tx_id, v_tx_num, 1200, 'UPI', 'UPI-318294019283', v_admin_id, v_admin_name, v_now - interval '1 hour 15 minutes', false
  ) ON CONFLICT DO NOTHING;

  -- Item 6: City Sedan - Body & Vacuum (UPI)
  v_cust_id := gen_random_uuid()::text;
  INSERT INTO public.customers (id, name, phone_number, created_at, updated_at)
  VALUES (v_cust_id, 'Deepa Nair', '9847456789', v_now, v_now)
  ON CONFLICT DO NOTHING;

  v_veh_id := gen_random_uuid()::text;
  INSERT INTO public.vehicles (id, registration_number, display_registration_number, category_id, model, customer_id, created_at, updated_at)
  VALUES (v_veh_id, 'KL08CE1024', 'KL 08 CE 1024', 'sedan_car', 'Honda City', v_cust_id, v_now, v_now)
  ON CONFLICT (registration_number) DO UPDATE SET updated_at = v_now RETURNING id INTO v_veh_id;

  v_tx_id := gen_random_uuid()::text;
  v_tx_num := 'TRX-' || v_today_ist || '-0006';
  INSERT INTO public.transactions (
    id, transaction_number, status, payment_status, paid_amount, payment_method, paid_at,
    vehicle_arrived_at, created_at, updated_at,
    vehicle_snapshot, customer_snapshot, service_package_snapshot, pricing_snapshot, staff_snapshot
  ) VALUES (
    v_tx_id, v_tx_num, 'COMPLETED', 'PAID', 450, 'UPI', v_now - interval '50 minutes',
    v_now - interval '50 minutes', v_now - interval '50 minutes', v_now - interval '50 minutes',
    jsonb_build_object('vehicleId', v_veh_id, 'registrationNumber', 'KL08CE1024', 'displayRegistrationNumber', 'KL 08 CE 1024', 'categoryId', 'sedan_car', 'categoryName', 'Sedan Car', 'model', 'Honda City'),
    jsonb_build_object('customerId', v_cust_id, 'name', 'Deepa Nair', 'phoneNumber', '9847456789'),
    jsonb_build_object('servicePackageId', 'body_vacuum', 'name', 'Body & Vacuum', 'activities', '["Exterior wash","Interior vacuum"]'::jsonb),
    jsonb_build_object('standardPrice', 450, 'actualPrice', 450, 'priceAdjustment', 0),
    jsonb_build_object('staffId', v_admin_id, 'staffName', v_admin_name, 'staffEmail', v_admin_email)
  ) ON CONFLICT (transaction_number) DO NOTHING;

  INSERT INTO public.payments (
    transaction_id, transaction_number, amount, payment_method, upi_reference_number,
    recorded_by_staff_id, recorded_by_staff_name, recorded_at, is_reversed
  ) VALUES (
    v_tx_id, v_tx_num, 450, 'UPI', 'UPI-748291039482', v_admin_id, v_admin_name, v_now - interval '50 minutes', false
  ) ON CONFLICT DO NOTHING;

  -- ==========================================================
  -- YESTERDAY'S TRANSACTIONS (For Day-Over-Day Comparison)
  -- ==========================================================

  v_tx_id := gen_random_uuid()::text;
  INSERT INTO public.transactions (
    id, transaction_number, status, payment_status, paid_amount, payment_method, paid_at,
    vehicle_arrived_at, created_at, updated_at,
    vehicle_snapshot, customer_snapshot, service_package_snapshot, pricing_snapshot, staff_snapshot
  ) VALUES (
    v_tx_id, 'TRX-YEST-0001', 'COMPLETED', 'PAID', 550, 'UPI', v_yesterday,
    v_yesterday, v_yesterday, v_yesterday,
    jsonb_build_object('vehicleId', v_veh_id, 'registrationNumber', 'KL07CD4589', 'displayRegistrationNumber', 'KL 07 CD 4589', 'categoryId', 'hatchback_car', 'categoryName', 'Hatchback Car', 'model', 'Swift'),
    jsonb_build_object('customerId', v_cust_id, 'name', 'Anand Verma', 'phoneNumber', '9847123456'),
    jsonb_build_object('servicePackageId', 'full_wash', 'name', 'Full Wash', 'activities', '["Wash"]'::jsonb),
    jsonb_build_object('standardPrice', 550, 'actualPrice', 550, 'priceAdjustment', 0),
    jsonb_build_object('staffId', v_admin_id, 'staffName', v_admin_name, 'staffEmail', v_admin_email)
  ) ON CONFLICT (transaction_number) DO NOTHING;

  v_tx_id := gen_random_uuid()::text;
  INSERT INTO public.transactions (
    id, transaction_number, status, payment_status, paid_amount, payment_method, paid_at,
    vehicle_arrived_at, created_at, updated_at,
    vehicle_snapshot, customer_snapshot, service_package_snapshot, pricing_snapshot, staff_snapshot
  ) VALUES (
    v_tx_id, 'TRX-YEST-0002', 'COMPLETED', 'PAID', 700, 'CASH', v_yesterday,
    v_yesterday, v_yesterday, v_yesterday,
    jsonb_build_object('vehicleId', v_veh_id, 'registrationNumber', 'KL01AZ7777', 'displayRegistrationNumber', 'KL 01 AZ 7777', 'categoryId', 'compact_suv', 'categoryName', 'Compact SUV', 'model', 'Creta'),
    jsonb_build_object('customerId', v_cust_id, 'name', 'Vishnu Prasad', 'phoneNumber', '9847567890'),
    jsonb_build_object('servicePackageId', 'full_wash', 'name', 'Full Wash', 'activities', '["Wash"]'::jsonb),
    jsonb_build_object('standardPrice', 700, 'actualPrice', 700, 'priceAdjustment', 0),
    jsonb_build_object('staffId', v_admin_id, 'staffName', v_admin_name, 'staffEmail', v_admin_email)
  ) ON CONFLICT (transaction_number) DO NOTHING;

  RAISE NOTICE 'Demo transactions successfully generated.';
END $$;
