# Supabase migration and setup

The application now supports two backends behind the existing service APIs. Firebase remains the default. Supabase is selected explicitly with `VITE_BACKEND_PROVIDER=supabase`.

## Repository changes

- `supabase/migrations/001_initial_schema.sql` creates the PostgreSQL tables, constraints, indexes, active-user helpers, and immutable snapshot/audit triggers.
- `supabase/migrations/002_rls_policies.sql` enables row-level security and limits direct writes.
- `supabase/migrations/003_rpc_functions.sql` adds the guarded transaction, payment, reversal, cancellation, pricing, service configuration, counter, and analytics functions.
- `supabase/migrations/004_seed_data.sql` seeds the current categories, package definitions, and 43 approved price rules. Unavailable combinations have no price row.

The application build has been checked locally. These SQL migrations have not been applied to a hosted Supabase project, and no project was created or linked during this repository migration.

## Configure a Supabase project

1. Create or select a Supabase project and apply the four SQL migration files in numeric order using the Supabase SQL Editor or your approved migration workflow.
2. Create the initial administrator in Supabase Authentication. Then insert a matching active `ADMIN` row into `public.profiles` using the new Auth user's UUID. For example:

   ```sql
   insert into public.profiles (id, email, role, display_name, is_active)
   values ('AUTH_USER_UUID', 'admin@example.com', 'ADMIN', 'System Administrator', true);
   ```

   This initial profile step must be performed by a trusted project administrator because no active app administrator exists yet. Create or invite staff Auth users and matching `STAFF` profiles through a trusted administrative process.
3. Set these values in the local, git-ignored `.env.local` file:

   ```dotenv
   VITE_BACKEND_PROVIDER=supabase
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-project-anon-key
   ```

   The frontend must only receive the public anon/publishable key. Never put the Supabase service-role key in a `VITE_` variable or distributed client.
4. Start the app with `npm run dev`. When switching back to Firebase, set `VITE_BACKEND_PROVIDER=firebase` and configure the Firebase variables in `.env.local`.

## Data migration and cutover status

The SQL seed covers reference data only. It does not copy Firebase Auth users, customer or vehicle records, transaction/payment history, counters, or audit logs. No production data has been imported, reconciled, or cut over. Firebase remains available and remains the default until an operator configures Supabase.

Before production cutover, prepare and review a separate export/import plan for the Firestore data and user accounts, reconcile record counts and paid totals, and validate the Supabase app against the migrated records. Firebase Auth credentials are not copied by these migrations; plan how users will be provisioned or reset their passwords. Tauri and Capacitor packaging remain post-validation work.
