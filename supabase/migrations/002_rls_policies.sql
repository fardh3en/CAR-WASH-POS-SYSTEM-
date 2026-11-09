-- Restrict direct table access. Financial transitions and audited changes are
-- performed only by the SECURITY DEFINER RPCs in 003_rpc_functions.sql.

alter table public.profiles enable row level security;
alter table public.vehicle_categories enable row level security;
alter table public.service_packages enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.transaction_counters enable row level security;
alter table public.transactions enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

revoke all on public.profiles, public.vehicle_categories, public.service_packages,
  public.pricing_rules, public.customers, public.vehicles, public.transaction_counters,
  public.transactions, public.payments, public.audit_logs from anon, authenticated;
grant select on public.profiles, public.vehicle_categories, public.service_packages,
  public.pricing_rules, public.customers, public.vehicles, public.transactions,
  public.payments, public.audit_logs to authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update on public.customers, public.vehicles to authenticated;

create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_active_admin());
create policy profiles_insert_admin on public.profiles
  for insert to authenticated
  with check (public.is_active_admin());
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_active_admin())
  with check (
    public.is_active_admin()
    and (id <> auth.uid() or (role = 'ADMIN' and is_active))
  );

create policy vehicle_categories_select_active on public.vehicle_categories
  for select to authenticated using (public.is_active_user());
create policy service_packages_select_active on public.service_packages
  for select to authenticated using (public.is_active_user());
create policy pricing_rules_select_active on public.pricing_rules
  for select to authenticated using (public.is_active_user());

create policy customers_select_active on public.customers
  for select to authenticated using (public.is_active_user());
create policy customers_insert_active on public.customers
  for insert to authenticated with check (public.is_active_user());
create policy customers_update_active on public.customers
  for update to authenticated using (public.is_active_user())
  with check (public.is_active_user());

create policy vehicles_select_active on public.vehicles
  for select to authenticated using (public.is_active_user());
create policy vehicles_insert_active on public.vehicles
  for insert to authenticated with check (public.is_active_user());
create policy vehicles_update_active on public.vehicles
  for update to authenticated using (public.is_active_user())
  with check (public.is_active_user());

create policy transactions_select_active on public.transactions
  for select to authenticated using (public.is_active_user());
create policy payments_select_active on public.payments
  for select to authenticated using (public.is_active_user());
create policy audit_logs_select_admin on public.audit_logs
  for select to authenticated using (public.is_active_admin());

-- No policies or table grants permit direct writes to counters, transactions,
-- payments, pricing rules, service packages, or audit logs.
