-- Mr. Wash POS schema for Supabase/PostgreSQL.
-- All timestamps are UTC timestamptz values. The application computes IST
-- reporting boundaries and transaction-number dates.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('ADMIN', 'STAFF')),
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicle_categories (
  id text primary key,
  name text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  variants text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_packages (
  id text primary key,
  name text not null,
  description text,
  activities jsonb not null default '[]'::jsonb check (jsonb_typeof(activities) = 'array'),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pricing_rules (
  id text primary key,
  vehicle_category_id text not null references public.vehicle_categories(id),
  service_package_id text not null references public.service_packages(id),
  variant text,
  price integer not null check (price > 0),
  is_active boolean not null default true,
  effective_from timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index pricing_rules_combination_unique
  on public.pricing_rules (vehicle_category_id, coalesce(variant, ''), service_package_id);
create index pricing_rules_category_idx on public.pricing_rules (vehicle_category_id);

create table public.customers (
  id text primary key default gen_random_uuid()::text,
  name text,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_phone_number_idx on public.customers (phone_number);

create table public.vehicles (
  id text primary key default gen_random_uuid()::text,
  registration_number text not null unique,
  display_registration_number text not null,
  category_id text not null references public.vehicle_categories(id),
  variant text,
  model text,
  customer_id text references public.customers(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vehicles_category_idx on public.vehicles (category_id);
create index vehicles_customer_idx on public.vehicles (customer_id);

create table public.transaction_counters (
  date_string text primary key check (date_string ~ '^[0-9]{8}$'),
  last_sequence integer not null check (last_sequence > 0),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id text primary key default gen_random_uuid()::text,
  transaction_number text not null unique,
  status text not null default 'OPEN' check (status in ('OPEN', 'COMPLETED', 'CANCELLED')),
  vehicle_snapshot jsonb not null,
  customer_snapshot jsonb not null,
  service_package_snapshot jsonb not null,
  pricing_snapshot jsonb not null,
  staff_snapshot jsonb not null,
  vehicle_arrived_at timestamptz not null default now(),
  expected_pickup_at timestamptz,
  cancellation_reason text,
  payment_status text not null default 'UNPAID' check (payment_status in ('UNPAID', 'PAID')),
  paid_amount integer not null default 0 check (paid_amount >= 0),
  payment_method text check (payment_method in ('CASH', 'UPI')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index transactions_status_created_at_idx on public.transactions (status, created_at desc);
create index transactions_created_at_idx on public.transactions (created_at desc);
create index transactions_vehicle_registration_idx
  on public.transactions ((vehicle_snapshot ->> 'registrationNumber'));

create table public.payments (
  id text primary key default gen_random_uuid()::text,
  transaction_id text not null references public.transactions(id),
  transaction_number text not null,
  amount integer not null check (amount > 0),
  payment_method text not null check (payment_method in ('CASH', 'UPI')),
  upi_reference_number text,
  notes text,
  recorded_by_staff_id text not null,
  recorded_by_staff_name text not null,
  recorded_at timestamptz not null default now(),
  is_reversed boolean not null default false,
  reversed_at timestamptz,
  reversed_by_admin_id text,
  reversal_reason text
);
create index payments_transaction_id_idx on public.payments (transaction_id, recorded_at desc);

create table public.audit_logs (
  id text primary key default gen_random_uuid()::text,
  event_type text not null check (event_type in (
    'TRANSACTION_CANCELLED', 'PAYMENT_REVERSED', 'PRICE_CHANGED', 'SERVICE_CONFIGURATION_CHANGED'
  )),
  target_document_id text not null,
  target_reference text not null,
  performed_by_user_id text not null,
  performed_by_user_name text not null,
  performed_by_user_role text not null check (performed_by_user_role in ('ADMIN', 'STAFF')),
  reason text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_event_type_idx on public.audit_logs (event_type);

create or replace function public.is_active_user()
returns boolean
language sql
security definer
stable
set search_path = pg_catalog, public, auth
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active
  );
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
security definer
stable
set search_path = pg_catalog, public, auth
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN' and p.is_active
  );
$$;

create or replace function public.prevent_transaction_snapshot_changes()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.vehicle_snapshot is distinct from old.vehicle_snapshot
     or new.customer_snapshot is distinct from old.customer_snapshot
     or new.service_package_snapshot is distinct from old.service_package_snapshot
     or new.pricing_snapshot is distinct from old.pricing_snapshot
     or new.staff_snapshot is distinct from old.staff_snapshot then
    raise exception 'Transaction snapshots are immutable';
  end if;
  return new;
end;
$$;

create trigger transactions_snapshots_are_immutable
before update on public.transactions
for each row execute function public.prevent_transaction_snapshot_changes();

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception 'Audit logs are append-only';
end;
$$;

create trigger audit_logs_are_append_only
before update or delete on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

revoke all on function public.is_active_user() from public;
revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.is_active_admin() to authenticated;
