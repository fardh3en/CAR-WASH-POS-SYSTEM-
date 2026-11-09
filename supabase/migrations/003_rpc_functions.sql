-- Sensitive mutations are exposed as narrowly-scoped RPC functions. Every
-- SECURITY DEFINER function fixes search_path and derives identity from auth.uid().

create or replace function public._generate_transaction_number(p_ist_date_string text)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_sequence integer;
begin
  if p_ist_date_string !~ '^[0-9]{8}$' then
    raise exception 'Invalid IST transaction date';
  end if;
  if p_ist_date_string <> to_char(now() at time zone 'Asia/Kolkata', 'YYYYMMDD') then
    raise exception 'Transaction number date must match the current IST date';
  end if;

  insert into public.transaction_counters (date_string, last_sequence)
  values (p_ist_date_string, 1)
  on conflict (date_string) do update
    set last_sequence = public.transaction_counters.last_sequence + 1,
        updated_at = now()
  returning last_sequence into v_sequence;

  return 'TRX-' || p_ist_date_string || '-' || lpad(v_sequence::text, 4, '0');
end;
$$;

create or replace function public.rpc_next_transaction_number(p_ist_date_string text)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
begin
  if not public.is_active_user() then raise exception 'Unauthorized'; end if;
  return public._generate_transaction_number(p_ist_date_string);
end;
$$;

create or replace function public.rpc_create_transaction(
  p_ist_date_string text,
  p_vehicle_snapshot jsonb,
  p_customer_snapshot jsonb,
  p_service_package_snapshot jsonb,
  p_pricing_snapshot jsonb,
  p_staff_snapshot jsonb,
  p_expected_pickup_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_profile public.profiles%rowtype;
  v_vehicle public.vehicles%rowtype;
  v_customer public.customers%rowtype;
  v_package public.service_packages%rowtype;
  v_category_name text;
  v_standard_price integer;
  v_actual_price integer;
  v_transaction_id text;
  v_now timestamptz := now();
  v_result jsonb;
begin
  select * into v_profile from public.profiles
  where id = auth.uid() and is_active;
  if not found then raise exception 'Unauthorized: active session required'; end if;

  if p_staff_snapshot->>'staffId' is distinct from auth.uid()::text then
    raise exception 'Staff identity does not match the authenticated user';
  end if;

  select * into v_vehicle from public.vehicles
  where id = p_vehicle_snapshot->>'vehicleId';
  if not found then raise exception 'Vehicle record not found'; end if;
  select name into v_category_name from public.vehicle_categories
  where id = v_vehicle.category_id and is_active;
  if not found then raise exception 'Vehicle category is unavailable'; end if;

  if v_vehicle.registration_number is distinct from p_vehicle_snapshot->>'registrationNumber'
     or v_vehicle.category_id is distinct from p_vehicle_snapshot->>'categoryId'
     or v_vehicle.variant is distinct from nullif(p_vehicle_snapshot->>'variant', '') then
    raise exception 'Vehicle details changed; refresh and try again';
  end if;

  if nullif(p_customer_snapshot->>'customerId', '') is null then
    if v_vehicle.customer_id is not null then
      raise exception 'Customer details changed; refresh and try again';
    end if;
  else
    select * into v_customer from public.customers
    where id = p_customer_snapshot->>'customerId';
    if not found or v_vehicle.customer_id is distinct from v_customer.id then
      raise exception 'Customer details changed; refresh and try again';
    end if;
  end if;

  select * into v_package from public.service_packages
  where id = p_service_package_snapshot->>'servicePackageId' and is_active;
  if not found then raise exception 'Service package is unavailable'; end if;

  select price into v_standard_price from public.pricing_rules
  where vehicle_category_id = v_vehicle.category_id
    and service_package_id = v_package.id
    and variant is not distinct from v_vehicle.variant
    and is_active;
  if not found and v_vehicle.variant is not null then
    select price into v_standard_price from public.pricing_rules
    where vehicle_category_id = v_vehicle.category_id
      and service_package_id = v_package.id
      and variant is null
      and is_active;
  end if;
  if v_standard_price is null then raise exception 'Price is not configured for this service'; end if;

  if (p_pricing_snapshot->>'standardPrice')::integer is distinct from v_standard_price then
    raise exception 'Standard price changed; refresh and try again';
  end if;
  v_actual_price := (p_pricing_snapshot->>'actualPrice')::integer;
  if v_actual_price is null or v_actual_price <= 0 then
    raise exception 'Actual Price must be a positive whole rupee amount';
  end if;

  insert into public.transactions (
    transaction_number, status, vehicle_snapshot, customer_snapshot,
    service_package_snapshot, pricing_snapshot, staff_snapshot,
    vehicle_arrived_at, expected_pickup_at, payment_status, paid_amount,
    created_at, updated_at
  ) values (
    public._generate_transaction_number(p_ist_date_string), 'OPEN',
    jsonb_build_object(
      'vehicleId', v_vehicle.id,
      'registrationNumber', v_vehicle.registration_number,
      'displayRegistrationNumber', v_vehicle.display_registration_number,
      'categoryId', v_vehicle.category_id,
      'categoryName', v_category_name,
      'variant', v_vehicle.variant,
      'model', v_vehicle.model
    ),
    jsonb_build_object(
      'customerId', case when v_vehicle.customer_id is null then null else v_customer.id end,
      'name', case when v_vehicle.customer_id is null then null else v_customer.name end,
      'phoneNumber', case when v_vehicle.customer_id is null then null else v_customer.phone_number end
    ),
    jsonb_build_object(
      'servicePackageId', v_package.id,
      'name', v_package.name,
      'description', v_package.description,
      'activities', v_package.activities
    ),
    jsonb_build_object(
      'standardPrice', v_standard_price,
      'actualPrice', v_actual_price,
      'priceAdjustment', v_actual_price - v_standard_price,
      'adjustmentReason', nullif(trim(p_pricing_snapshot->>'adjustmentReason'), '')
    ),
    jsonb_build_object(
      'staffId', auth.uid()::text,
      'staffName', v_profile.display_name,
      'staffEmail', v_profile.email
    ),
    v_now, p_expected_pickup_at, 'UNPAID', 0, v_now, v_now
  ) returning id into v_transaction_id;

  select to_jsonb(t) into v_result from public.transactions t where t.id = v_transaction_id;
  return v_result;
end;
$$;

create or replace function public.rpc_complete_payment(
  p_transaction_id text,
  p_payment_method text,
  p_amount integer,
  p_upi_reference text default null,
  p_notes text default null,
  p_staff_id uuid default null,
  p_staff_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_tx public.transactions%rowtype;
  v_profile public.profiles%rowtype;
  v_payment_id text;
  v_now timestamptz := now();
  v_result jsonb;
begin
  select * into v_profile from public.profiles
  where id = auth.uid() and is_active;
  if not found then raise exception 'Unauthorized'; end if;
  if p_staff_id is distinct from auth.uid() then raise exception 'Staff identity mismatch'; end if;
  if p_payment_method not in ('CASH', 'UPI') then raise exception 'Invalid payment method'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Payment amount must be positive'; end if;

  select * into v_tx from public.transactions where id = p_transaction_id for update;
  if not found then raise exception 'Transaction record not found'; end if;
  if v_tx.status <> 'OPEN' or v_tx.payment_status <> 'UNPAID' then
    raise exception 'Only OPEN / UNPAID transactions can be paid';
  end if;
  if p_amount <> (v_tx.pricing_snapshot->>'actualPrice')::integer then
    raise exception 'Payment amount must exactly equal the transaction Actual Price';
  end if;

  insert into public.payments (
    transaction_id, transaction_number, amount, payment_method,
    upi_reference_number, notes, recorded_by_staff_id, recorded_by_staff_name, recorded_at
  ) values (
    v_tx.id, v_tx.transaction_number, p_amount, p_payment_method,
    nullif(trim(p_upi_reference), ''), nullif(trim(p_notes), ''),
    auth.uid()::text, v_profile.display_name, v_now
  ) returning id into v_payment_id;

  update public.transactions set
    status = 'COMPLETED', payment_status = 'PAID', paid_amount = p_amount,
    payment_method = p_payment_method, paid_at = v_now, updated_at = v_now
  where id = v_tx.id;

  select to_jsonb(p) into v_result from public.payments p where p.id = v_payment_id;
  return v_result;
end;
$$;

create or replace function public.rpc_reverse_payment(
  p_payment_id text,
  p_reversal_reason text,
  p_admin_id uuid,
  p_admin_name text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_payment public.payments%rowtype;
  v_tx public.transactions%rowtype;
  v_profile public.profiles%rowtype;
  v_now timestamptz := now();
begin
  select * into v_profile from public.profiles
  where id = auth.uid() and role = 'ADMIN' and is_active;
  if not found or p_admin_id is distinct from auth.uid() then
    raise exception 'Unauthorized: Admin role required';
  end if;
  if nullif(trim(p_reversal_reason), '') is null then
    raise exception 'A mandatory reversal reason must be provided';
  end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then raise exception 'Payment record not found'; end if;
  if v_payment.is_reversed then raise exception 'Payment record has already been reversed'; end if;
  select * into v_tx from public.transactions where id = v_payment.transaction_id for update;
  if not found then raise exception 'Associated transaction record not found'; end if;
  if v_tx.status <> 'COMPLETED' or v_tx.payment_status <> 'PAID' then
    raise exception 'Only COMPLETED / PAID transactions can be reversed';
  end if;

  update public.payments set is_reversed = true, reversed_at = v_now,
    reversed_by_admin_id = auth.uid()::text, reversal_reason = trim(p_reversal_reason)
  where id = v_payment.id;
  update public.transactions set status = 'OPEN', payment_status = 'UNPAID',
    paid_amount = 0, payment_method = null, paid_at = null, updated_at = v_now
  where id = v_tx.id;
  insert into public.audit_logs (
    event_type, target_document_id, target_reference, performed_by_user_id,
    performed_by_user_name, performed_by_user_role, reason, metadata, created_at
  ) values (
    'PAYMENT_REVERSED', v_payment.id, v_payment.transaction_number, auth.uid()::text,
    v_profile.display_name, 'ADMIN', trim(p_reversal_reason),
    jsonb_build_object('amount', v_payment.amount, 'paymentMethod', v_payment.payment_method), v_now
  );
end;
$$;

create or replace function public.rpc_cancel_transaction(
  p_transaction_id text,
  p_cancellation_reason text,
  p_user_id uuid default null,
  p_user_name text default null,
  p_user_role text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_tx public.transactions%rowtype;
  v_profile public.profiles%rowtype;
  v_now timestamptz := now();
begin
  select * into v_profile from public.profiles where id = auth.uid() and is_active;
  if not found or (p_user_id is not null and p_user_id is distinct from auth.uid()) then
    raise exception 'Unauthorized';
  end if;
  if p_user_role is not null and p_user_role is distinct from v_profile.role then
    raise exception 'User role mismatch';
  end if;
  if nullif(trim(p_cancellation_reason), '') is null then
    raise exception 'A mandatory cancellation reason must be provided';
  end if;

  select * into v_tx from public.transactions where id = p_transaction_id for update;
  if not found then raise exception 'Transaction record not found'; end if;
  if v_tx.status <> 'OPEN' then raise exception 'Only OPEN transactions can be cancelled'; end if;

  update public.transactions set status = 'CANCELLED',
    cancellation_reason = trim(p_cancellation_reason), updated_at = v_now
  where id = v_tx.id;
  insert into public.audit_logs (
    event_type, target_document_id, target_reference, performed_by_user_id,
    performed_by_user_name, performed_by_user_role, reason, metadata, created_at
  ) values (
    'TRANSACTION_CANCELLED', v_tx.id, v_tx.transaction_number, auth.uid()::text,
    v_profile.display_name, v_profile.role, trim(p_cancellation_reason),
    jsonb_build_object(
      'vehicleRegistration', v_tx.vehicle_snapshot->>'registrationNumber',
      'servicePackageName', v_tx.service_package_snapshot->>'name',
      'standardPrice', (v_tx.pricing_snapshot->>'standardPrice')::integer,
      'actualPrice', (v_tx.pricing_snapshot->>'actualPrice')::integer
    ), v_now
  );
end;
$$;

create or replace function public.rpc_set_price_rule(
  p_category_id text,
  p_service_package_id text,
  p_price integer,
  p_variant text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_profile public.profiles%rowtype;
  v_rule_id text;
  v_old_price integer;
  v_now timestamptz := now();
begin
  select * into v_profile from public.profiles
  where id = auth.uid() and role = 'ADMIN' and is_active;
  if not found then raise exception 'Unauthorized: Admin role required'; end if;
  if p_price is null or p_price <= 0 then raise exception 'Price must be a positive whole rupee amount'; end if;
  if not exists (select 1 from public.vehicle_categories where id = p_category_id and is_active)
     or not exists (select 1 from public.service_packages where id = p_service_package_id and is_active) then
    raise exception 'Category or service package is unavailable';
  end if;

  v_rule_id := regexp_replace(lower(p_category_id), '[^a-z0-9]', '_', 'g') || '_' ||
    case when nullif(trim(p_variant), '') is null then ''
         else regexp_replace(lower(trim(p_variant)), '[^a-z0-9]', '_', 'g') || '_' end ||
    regexp_replace(lower(p_service_package_id), '[^a-z0-9]', '_', 'g');

  select price into v_old_price from public.pricing_rules
  where vehicle_category_id = p_category_id
    and service_package_id = p_service_package_id
    and variant is not distinct from nullif(trim(p_variant), '')
    and is_active;

  insert into public.pricing_rules (
    id, vehicle_category_id, service_package_id, variant, price, is_active,
    effective_from, created_at, updated_at
  ) values (
    v_rule_id, p_category_id, p_service_package_id, nullif(trim(p_variant), ''),
    p_price, true, v_now, v_now, v_now
  ) on conflict (vehicle_category_id, (coalesce(variant, '')), service_package_id)
    do update set id = excluded.id, price = excluded.price, is_active = true,
      effective_from = excluded.effective_from, updated_at = excluded.updated_at;

  if v_old_price is distinct from p_price then
    insert into public.audit_logs (
      event_type, target_document_id, target_reference, performed_by_user_id,
      performed_by_user_name, performed_by_user_role, metadata, created_at
    ) values (
      'PRICE_CHANGED', v_rule_id,
      p_category_id || ' / ' || p_service_package_id || coalesce(' (' || nullif(trim(p_variant), '') || ')', ''),
      auth.uid()::text, v_profile.display_name, 'ADMIN',
      jsonb_build_object(
        'vehicleCategoryId', p_category_id,
        'servicePackageId', p_service_package_id,
        'variant', coalesce(nullif(trim(p_variant), ''), '—'),
        'oldPrice', coalesce(v_old_price::text, 'UNCONFIGURED'),
        'newPrice', p_price
      ), v_now
    );
  end if;
end;
$$;

create or replace function public.rpc_seed_official_pricing(p_rules jsonb)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_item jsonb;
  v_count integer := 0;
begin
  if not public.is_active_admin() then raise exception 'Unauthorized: Admin role required'; end if;
  if jsonb_typeof(p_rules) <> 'array' then raise exception 'Pricing seed must be an array'; end if;
  for v_item in select value from jsonb_array_elements(p_rules)
  loop
    perform public.rpc_set_price_rule(
      v_item->>'categoryId', v_item->>'servicePackageId',
      (v_item->>'price')::integer, v_item->>'variant'
    );
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.rpc_update_service_package(p_package_id text, p_updates jsonb)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_profile public.profiles%rowtype;
  v_old public.service_packages%rowtype;
  v_now timestamptz := now();
  v_keys text[];
begin
  select * into v_profile from public.profiles
  where id = auth.uid() and role = 'ADMIN' and is_active;
  if not found then raise exception 'Unauthorized: Admin role required'; end if;
  if jsonb_typeof(p_updates) <> 'object' then raise exception 'Updates must be an object'; end if;
  if exists (
    select 1 from jsonb_object_keys(p_updates) as k(key)
    where key not in ('name', 'description', 'activities', 'displayOrder', 'isActive')
  ) then raise exception 'Unsupported service package field'; end if;

  select * into v_old from public.service_packages where id = p_package_id for update;
  if not found then raise exception 'Service package not found'; end if;
  v_keys := array(select jsonb_object_keys(p_updates));
  update public.service_packages set
    name = case when p_updates ? 'name' then p_updates->>'name' else name end,
    description = case when p_updates ? 'description' then p_updates->>'description' else description end,
    activities = case when p_updates ? 'activities' then p_updates->'activities' else activities end,
    display_order = case when p_updates ? 'displayOrder' then (p_updates->>'displayOrder')::integer else display_order end,
    is_active = case when p_updates ? 'isActive' then (p_updates->>'isActive')::boolean else is_active end,
    updated_at = v_now
  where id = p_package_id;

  insert into public.audit_logs (
    event_type, target_document_id, target_reference, performed_by_user_id,
    performed_by_user_name, performed_by_user_role, metadata, created_at
  ) values (
    'SERVICE_CONFIGURATION_CHANGED', p_package_id, v_old.name, auth.uid()::text,
    v_profile.display_name, 'ADMIN',
    jsonb_build_object('packageName', v_old.name, 'updatedFields', array_to_string(v_keys, ', ')), v_now
  );
end;
$$;

create or replace function public.rpc_get_analytics(
  p_start_utc timestamptz,
  p_end_utc timestamptz,
  p_period_label text
)
returns jsonb
language plpgsql
security definer
stable
set search_path = pg_catalog, public, auth
as $$
declare
  v_total_vehicles integer;
  v_total_sales bigint;
  v_cash_sales bigint;
  v_upi_sales bigint;
  v_cash_count integer;
  v_upi_count integer;
  v_adjusted_count integer;
  v_total_adjustment bigint;
  v_new_vehicles integer;
  v_returning_vehicles integer;
  v_daily_trend jsonb;
  v_service_distribution jsonb;
  v_category_distribution jsonb;
  v_yesterday_comparison jsonb := null;
  v_yesterday_sales bigint := 0;
  v_yesterday_vehicles integer := 0;
begin
  if not public.is_active_admin() then raise exception 'Unauthorized: Admin role required'; end if;
  if p_start_utc >= p_end_utc then raise exception 'Invalid analytics time range'; end if;

  with completed as (
    select * from public.transactions
    where status = 'COMPLETED' and payment_status = 'PAID'
      and created_at >= p_start_utc and created_at < p_end_utc
  )
  select count(*)::integer,
    coalesce(sum((pricing_snapshot->>'actualPrice')::integer), 0),
    coalesce(sum(case when payment_method = 'CASH' then paid_amount else 0 end), 0),
    coalesce(sum(case when payment_method = 'UPI' then paid_amount else 0 end), 0),
    count(*) filter (where payment_method = 'CASH')::integer,
    count(*) filter (where payment_method = 'UPI')::integer,
    count(*) filter (where (pricing_snapshot->>'priceAdjustment')::integer <> 0)::integer,
    coalesce(sum((pricing_snapshot->>'priceAdjustment')::integer), 0)
  into v_total_vehicles, v_total_sales, v_cash_sales, v_upi_sales,
    v_cash_count, v_upi_count, v_adjusted_count, v_total_adjustment
  from completed;

  with completed as (
    select * from public.transactions
    where status = 'COMPLETED' and payment_status = 'PAID'
      and created_at >= p_start_utc and created_at < p_end_utc
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'name', name, 'count', cnt, 'totalSales', total_sales
    ) order by cnt desc), '[]'::jsonb)
  into v_service_distribution
  from (
    select service_package_snapshot->>'name' as name, count(*)::integer as cnt,
      sum((pricing_snapshot->>'actualPrice')::integer)::bigint as total_sales
    from completed group by service_package_snapshot->>'name'
  ) d;

  with completed as (
    select * from public.transactions
    where status = 'COMPLETED' and payment_status = 'PAID'
      and created_at >= p_start_utc and created_at < p_end_utc
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'name', name, 'count', cnt, 'totalSales', total_sales
    ) order by cnt desc), '[]'::jsonb)
  into v_category_distribution
  from (
    select vehicle_snapshot->>'categoryName' as name, count(*)::integer as cnt,
      sum((pricing_snapshot->>'actualPrice')::integer)::bigint as total_sales
    from completed group by vehicle_snapshot->>'categoryName'
  ) d;

  with current_regs as (
    select distinct vehicle_snapshot->>'registrationNumber' as registration_number
    from public.transactions
    where status = 'COMPLETED' and payment_status = 'PAID'
      and created_at >= p_start_utc and created_at < p_end_utc
  ), classified as (
    select r.registration_number,
      exists (
        select 1 from public.transactions prior
        where prior.status = 'COMPLETED'
          and prior.vehicle_snapshot->>'registrationNumber' = r.registration_number
          and prior.created_at < p_start_utc
      ) as has_prior
    from current_regs r
  )
  select count(*) filter (where not has_prior)::integer,
    count(*) filter (where has_prior)::integer
  into v_new_vehicles, v_returning_vehicles from classified;

  -- Match the dashboard's existing weekday / day-of-month / month chart groups.
  if extract(epoch from (p_end_utc - p_start_utc)) / 86400 <= 7 then
    with completed as (
      select * from public.transactions
      where status = 'COMPLETED' and payment_status = 'PAID'
        and created_at >= p_start_utc and created_at < p_end_utc
    ), grouped as (
      select extract(isodow from created_at at time zone 'Asia/Kolkata')::integer as bucket,
        sum((pricing_snapshot->>'actualPrice')::integer)::bigint as sales, count(*)::integer as vehicles
      from completed group by 1
    )
    select coalesce(jsonb_agg(jsonb_build_object(
      'label', case s.bucket when 1 then 'Mon' when 2 then 'Tue' when 3 then 'Wed'
        when 4 then 'Thu' when 5 then 'Fri' when 6 then 'Sat' else 'Sun' end,
      'sales', coalesce(g.sales, 0), 'vehicles', coalesce(g.vehicles, 0)
    ) order by s.bucket), '[]'::jsonb)
    into v_daily_trend
    from generate_series(1, 7) as s(bucket)
    left join grouped g on g.bucket = s.bucket;
  elsif extract(epoch from (p_end_utc - p_start_utc)) / 86400 <= 31 then
    with completed as (
      select * from public.transactions
      where status = 'COMPLETED' and payment_status = 'PAID'
        and created_at >= p_start_utc and created_at < p_end_utc
    ), days as (
      select generate_series(
        (p_start_utc at time zone 'Asia/Kolkata')::date,
        ((p_end_utc - interval '1 microsecond') at time zone 'Asia/Kolkata')::date,
        interval '1 day'
      )::date as day
    ), grouped as (
      select (created_at at time zone 'Asia/Kolkata')::date as day,
        sum((pricing_snapshot->>'actualPrice')::integer)::bigint as sales,
        count(*)::integer as vehicles
      from completed group by 1
    )
    select coalesce(jsonb_agg(jsonb_build_object(
      'label', to_char(days.day, 'DD'),
      'sales', coalesce(grouped.sales, 0), 'vehicles', coalesce(grouped.vehicles, 0)
    ) order by days.day), '[]'::jsonb)
    into v_daily_trend from days left join grouped using (day);
  else
    with completed as (
      select * from public.transactions
      where status = 'COMPLETED' and payment_status = 'PAID'
        and created_at >= p_start_utc and created_at < p_end_utc
    ), months as (
      select generate_series(
        date_trunc('month', p_start_utc at time zone 'Asia/Kolkata'),
        date_trunc('month', (p_end_utc - interval '1 microsecond') at time zone 'Asia/Kolkata'),
        interval '1 month'
      ) as month
    ), grouped as (
      select date_trunc('month', created_at at time zone 'Asia/Kolkata') as month,
        sum((pricing_snapshot->>'actualPrice')::integer)::bigint as sales,
        count(*)::integer as vehicles
      from completed group by 1
    )
    select coalesce(jsonb_agg(jsonb_build_object(
      'label', to_char(months.month, 'Mon'),
      'sales', coalesce(grouped.sales, 0), 'vehicles', coalesce(grouped.vehicles, 0)
    ) order by months.month), '[]'::jsonb)
    into v_daily_trend from months left join grouped using (month);
  end if;

  if p_end_utc - p_start_utc <= interval '25 hours' then
    select count(*)::integer,
      coalesce(sum((pricing_snapshot->>'actualPrice')::integer), 0)
    into v_yesterday_vehicles, v_yesterday_sales
    from public.transactions
    where status = 'COMPLETED' and payment_status = 'PAID'
      and created_at >= p_start_utc - interval '24 hours'
      and created_at < p_start_utc;
    v_yesterday_comparison := jsonb_build_object(
      'yesterdaySales', v_yesterday_sales,
      'yesterdayVehicles', v_yesterday_vehicles,
      'differenceSales', v_total_sales - v_yesterday_sales,
      'differenceVehicles', v_total_vehicles - v_yesterday_vehicles,
      'percentGrowth', case when v_yesterday_sales > 0 then
        round(((v_total_sales - v_yesterday_sales)::numeric / v_yesterday_sales) * 1000) / 10
        else 0 end
    );
  end if;

  return jsonb_build_object(
    'periodLabel', p_period_label,
    'totalVehicles', v_total_vehicles,
    'totalSales', v_total_sales,
    'cashSales', v_cash_sales,
    'upiSales', v_upi_sales,
    'cashCount', v_cash_count,
    'upiCount', v_upi_count,
    'averageTransactionValue', case when v_total_vehicles > 0
      then round(v_total_sales::numeric / v_total_vehicles) else 0 end,
    'serviceDistribution', v_service_distribution,
    'categoryDistribution', v_category_distribution,
    'newVehicles', v_new_vehicles,
    'returningVehicles', v_returning_vehicles,
    'adjustedTransactionCount', v_adjusted_count,
    'totalAdjustmentAmount', v_total_adjustment,
    'dailyTrend', coalesce(v_daily_trend, '[]'::jsonb),
    'yesterdayComparison', v_yesterday_comparison
  );
end;
$$;

-- Limit EXECUTE privileges. RLS policies alone do not protect definer RPCs.
revoke all on function public._generate_transaction_number(text) from public, anon, authenticated;
revoke all on function public.rpc_create_transaction(text, jsonb, jsonb, jsonb, jsonb, jsonb, timestamptz) from public, anon;
revoke all on function public.rpc_next_transaction_number(text) from public, anon;
revoke all on function public.rpc_complete_payment(text, text, integer, text, text, uuid, text) from public, anon;
revoke all on function public.rpc_reverse_payment(text, text, uuid, text) from public, anon;
revoke all on function public.rpc_cancel_transaction(text, text, uuid, text, text) from public, anon;
revoke all on function public.rpc_set_price_rule(text, text, integer, text) from public, anon;
revoke all on function public.rpc_seed_official_pricing(jsonb) from public, anon;
revoke all on function public.rpc_update_service_package(text, jsonb) from public, anon;
revoke all on function public.rpc_get_analytics(timestamptz, timestamptz, text) from public, anon;

grant execute on function public.rpc_create_transaction(text, jsonb, jsonb, jsonb, jsonb, jsonb, timestamptz) to authenticated;
grant execute on function public.rpc_next_transaction_number(text) to authenticated;
grant execute on function public.rpc_complete_payment(text, text, integer, text, text, uuid, text) to authenticated;
grant execute on function public.rpc_reverse_payment(text, text, uuid, text) to authenticated;
grant execute on function public.rpc_cancel_transaction(text, text, uuid, text, text) to authenticated;
grant execute on function public.rpc_set_price_rule(text, text, integer, text) to authenticated;
grant execute on function public.rpc_seed_official_pricing(jsonb) to authenticated;
grant execute on function public.rpc_update_service_package(text, jsonb) to authenticated;
grant execute on function public.rpc_get_analytics(timestamptz, timestamptz, text) to authenticated;
