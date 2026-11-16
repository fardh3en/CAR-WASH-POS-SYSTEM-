# MR. WASH POS — CODEX MASTER MIGRATION PROMPT
### Firebase → Supabase + PostgreSQL | Tauri 2 (Windows) | Capacitor (Android)

---

> [!IMPORTANT]
> This is a **complete, self-contained migration prompt** for an AI coding agent (Codex / Claude / Gemini).
> Read every section before writing a single line of code. Follow the phases in order.
> Do NOT rewrite the React frontend from scratch. Only swap service internals.

---

## CONTEXT — WHAT THIS PROJECT IS

**Mr. Wash POS** is a production Point-of-Sale system for a car-wash business in India.
- Stack: **React 19.2.8 + TypeScript ~6.0.2 + Vite 8.2.0 + Tailwind CSS v4.3.3 + React Router v7**
- Current backend: **Firebase 12.17.1** (Firebase Auth + Cloud Firestore)
- Target backend: **Supabase + PostgreSQL** (shared between Windows desktop and Android)
- Desktop target: **Tauri 2** (Windows, WebView2)
- Mobile target: **Capacitor** (Android)
- Linter: **oxlint** (zero-warning policy — `npm run lint` must stay clean)
- Build: **TypeScript + Vite** (`npm run build` must produce 0 errors)

**Project root:** `c:\Users\ahamm\Downloads\CAR WASH POS`

---

## ABSOLUTE RULES — NEVER VIOLATE THESE

1. **Never delete Firebase** — keep `src/config/firebase.ts` and `firebase` npm package. Use `VITE_BACKEND_PROVIDER=supabase` env flag to switch. Firebase remains as cold fallback.
2. **Never create ₹0 pricing rules** — unavailable service = no row in `pricing_rules` table.
3. **Never modify historical transaction snapshots** — JSONB snapshot columns are write-once forever.
4. **Terminology is law:**
   - Say **"Total Sales"** — never "Revenue" or "Profit"
   - Say **"Price Adjustment"** — never "Discount"
   - Payment methods: **CASH and UPI only** — no cards, no wallets
5. **IST (UTC+5:30) always** for all timestamps and date boundary calculations.
6. **Transaction numbers** format: `TRX-YYYYMMDD-XXXX` using IST calendar date.
7. **No service-role key in distributed client** — anon key only in frontend.
8. **Supabase Edge Functions** only for external API calls (WhatsApp etc.) — all core POS logic goes in PL/pgSQL functions.
9. **Do not introduce new UI pages, routes, or components** — only change service internals.
10. **`npm run build` and `npm run lint` must pass with 0 errors/warnings** after every phase.

---

## EXISTING SERVICE SIGNATURES — DO NOT CHANGE THESE EXTERNALLY

The following TypeScript service objects are imported throughout the UI. Their **exported names and function signatures must remain identical**. Only rewrite the function bodies.

```
src/services/auth.service.ts         → authService
src/services/user.service.ts         → userService
src/services/customer.service.ts     → customerService
src/services/vehicle.service.ts      → vehicleService
src/services/vehicleCategory.service.ts → vehicleCategoryService
src/services/servicePackage.service.ts  → servicePackageService
src/services/pricing.service.ts      → pricingService
src/services/transaction.service.ts  → transactionService
src/services/payment.service.ts      → paymentService
src/services/audit.service.ts        → auditService
src/services/analytics.service.ts    → analyticsService
src/services/transactionCounter.service.ts → transactionCounterService
src/services/excel.service.ts        → excelService  (no backend change needed)
```

The store and hooks that must be updated internally:
```
src/store/AuthContext.tsx
src/hooks/useAuth.ts
src/config/firebase.ts               (add isSupabaseConfigured guard alongside existing)
```

---

## EXISTING TYPESCRIPT TYPES — DO NOT CHANGE

These types are used everywhere in the UI. Keep them **exactly as-is**:

```typescript
// src/types/transaction.types.ts
type TransactionStatus = 'OPEN' | 'CANCELLED' | 'COMPLETED'
type PaymentStatus = 'UNPAID' | 'PAID'
type PaymentMethod = 'CASH' | 'UPI'

interface VehicleSnapshot {
  vehicleId: string
  registrationNumber: string         // Normalized uppercase e.g. "KL01AB1234"
  displayRegistrationNumber: string  // Formatted e.g. "KL 01 AB 1234"
  categoryId: string
  categoryName: string
  variant?: string
  model?: string
}
interface CustomerSnapshot { customerId: string | null; name?: string; phoneNumber?: string }
interface ServicePackageSnapshot { servicePackageId: string; name: string; description?: string; activities: string[] }
interface PricingSnapshot { standardPrice: number; actualPrice: number; priceAdjustment: number; adjustmentReason?: string }
interface StaffSnapshot { staffId: string; staffName: string; staffEmail: string }

interface Transaction {
  id: string
  transactionNumber: string
  status: TransactionStatus
  vehicleSnapshot: VehicleSnapshot
  customerSnapshot: CustomerSnapshot
  servicePackageSnapshot: ServicePackageSnapshot
  pricingSnapshot: PricingSnapshot
  staffSnapshot: StaffSnapshot
  vehicleArrivedAt: string
  expectedPickupAt?: string
  cancellationReason?: string
  paymentStatus: PaymentStatus
  paidAmount: number
  paymentMethod?: PaymentMethod
  paidAt?: string
  createdAt: string
  updatedAt: string
}

interface PaymentRecord {
  id: string; transactionId: string; transactionNumber: string; amount: number
  paymentMethod: PaymentMethod; upiReferenceNumber?: string; notes?: string
  recordedByStaffId: string; recordedByStaffName: string; recordedAt: string
  isReversed?: boolean; reversedAt?: string; reversedByAdminId?: string; reversalReason?: string
}

// src/types/user.types.ts
type UserRole = 'ADMIN' | 'STAFF'
interface UserProfile { uid: string; email: string; role: UserRole; displayName: string; isActive: boolean; createdAt: string; updatedAt: string }

// src/types/audit.types.ts
type AuditEventType = 'TRANSACTION_CANCELLED' | 'PAYMENT_REVERSED' | 'PRICE_CHANGED' | 'SERVICE_CONFIGURATION_CHANGED'
interface AuditLogRecord {
  id: string; eventType: AuditEventType; targetDocumentId: string; targetReference: string
  performedByUserId: string; performedByUserName: string; performedByUserRole: 'ADMIN' | 'STAFF'
  reason?: string; metadata?: Record<string, string | number | boolean>; createdAt: string
}
```

---

## PHASE A — SUPABASE DATABASE SETUP

### A1. Create Supabase CLI migration files

Create the directory `supabase/migrations/` in the project root and write these files:

#### `supabase/migrations/001_initial_schema.sql`

```sql
-- ============================================================
-- Mr. Wash POS — Initial Schema
-- All timestamps stored as TIMESTAMPTZ (UTC).
-- IST conversion (UTC+5:30) is handled in application layer.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- HELPER FUNCTIONS
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'ADMIN'
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION is_active_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND is_active = true
  );
$$;

-- ----------------------------------------------------------------
-- TABLE: profiles  (mirrors Firestore `users` collection)
-- ----------------------------------------------------------------
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
  display_name TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- TABLE: vehicle_categories  (mirrors Firestore `vehicleCategories`)
-- ----------------------------------------------------------------
CREATE TABLE vehicle_categories (
  id          TEXT PRIMARY KEY,   -- e.g. 'hatchback_car', 'sedan_car'
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- TABLE: service_packages  (mirrors Firestore `servicePackages`)
-- ----------------------------------------------------------------
CREATE TABLE service_packages (
  id          TEXT PRIMARY KEY,   -- e.g. 'body_wash', 'body_vacuum', 'full_wash'
  name        TEXT NOT NULL,
  description TEXT,
  activities  JSONB NOT NULL DEFAULT '[]',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- TABLE: pricing_rules  (mirrors Firestore `pricingRules`)
-- A missing row = service unavailable for that category+variant combo.
-- NEVER insert a row with price = 0.
-- ----------------------------------------------------------------
CREATE TABLE pricing_rules (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id         TEXT NOT NULL REFERENCES vehicle_categories(id),
  variant             TEXT,         -- NULL for categories with no variants
  service_package_id  TEXT NOT NULL REFERENCES service_packages(id),
  price               INT NOT NULL CHECK (price > 0),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, COALESCE(variant, ''), service_package_id)
);

CREATE INDEX idx_pricing_rules_category ON pricing_rules(category_id);
CREATE INDEX idx_pricing_rules_package  ON pricing_rules(service_package_id);

-- ----------------------------------------------------------------
-- TABLE: customers  (mirrors Firestore `customers`)
-- ----------------------------------------------------------------
CREATE TABLE customers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT,
  phone_number     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_phone ON customers(phone_number);

-- ----------------------------------------------------------------
-- TABLE: vehicles  (mirrors Firestore `vehicles`)
-- ----------------------------------------------------------------
CREATE TABLE vehicles (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number         TEXT NOT NULL UNIQUE,  -- normalized uppercase
  display_registration_number TEXT NOT NULL,          -- formatted display
  category_id                 TEXT NOT NULL REFERENCES vehicle_categories(id),
  variant                     TEXT,
  model                       TEXT,
  customer_id                 UUID REFERENCES customers(id),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_vehicles_category     ON vehicles(category_id);

-- ----------------------------------------------------------------
-- TABLE: transaction_counters  (mirrors Firestore `transactionCounters`)
-- One row per IST date string (YYYYMMDD). Locked with SELECT FOR UPDATE.
-- ----------------------------------------------------------------
CREATE TABLE transaction_counters (
  date_string TEXT PRIMARY KEY,  -- IST date e.g. '20260809'
  last_sequence INT NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------
-- TABLE: transactions  (mirrors Firestore `transactions`)
-- Snapshot columns (vehicle_snapshot, customer_snapshot, etc.) are JSONB
-- and are WRITE-ONCE — never updated after creation.
-- ----------------------------------------------------------------
CREATE TABLE transactions (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_number       TEXT NOT NULL UNIQUE,  -- TRX-YYYYMMDD-XXXX
  status                   TEXT NOT NULL DEFAULT 'OPEN'
                             CHECK (status IN ('OPEN', 'COMPLETED', 'CANCELLED')),

  -- Immutable snapshots (write-once JSONB)
  vehicle_snapshot         JSONB NOT NULL,
  customer_snapshot        JSONB NOT NULL,
  service_package_snapshot JSONB NOT NULL,
  pricing_snapshot         JSONB NOT NULL,
  staff_snapshot           JSONB NOT NULL,

  -- Timing
  vehicle_arrived_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_pickup_at       TIMESTAMPTZ,
  cancellation_reason      TEXT,

  -- Payment tracking
  payment_status           TEXT NOT NULL DEFAULT 'UNPAID'
                             CHECK (payment_status IN ('UNPAID', 'PAID')),
  paid_amount              INT NOT NULL DEFAULT 0,
  payment_method           TEXT CHECK (payment_method IN ('CASH', 'UPI')),
  paid_at                  TIMESTAMPTZ,

  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_status      ON transactions(status);
CREATE INDEX idx_transactions_created_at  ON transactions(created_at DESC);
CREATE INDEX idx_transactions_status_date ON transactions(status, created_at DESC);
CREATE INDEX idx_transactions_vehicle_reg ON transactions((vehicle_snapshot->>'registrationNumber'));

-- ----------------------------------------------------------------
-- TABLE: payments  (mirrors Firestore `payments`)
-- ----------------------------------------------------------------
CREATE TABLE payments (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id          UUID NOT NULL REFERENCES transactions(id),
  transaction_number      TEXT NOT NULL,
  amount                  INT NOT NULL CHECK (amount > 0),
  payment_method          TEXT NOT NULL CHECK (payment_method IN ('CASH', 'UPI')),
  upi_reference_number    TEXT,
  notes                   TEXT,
  recorded_by_staff_id    UUID NOT NULL,
  recorded_by_staff_name  TEXT NOT NULL,
  recorded_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_reversed             BOOLEAN NOT NULL DEFAULT false,
  reversed_at             TIMESTAMPTZ,
  reversed_by_admin_id    UUID,
  reversal_reason         TEXT
);

CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- ----------------------------------------------------------------
-- TABLE: audit_logs  (mirrors Firestore `auditLogs`)
-- Append-only. Never update or delete.
-- ----------------------------------------------------------------
CREATE TABLE audit_logs (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type               TEXT NOT NULL CHECK (event_type IN (
                             'TRANSACTION_CANCELLED','PAYMENT_REVERSED',
                             'PRICE_CHANGED','SERVICE_CONFIGURATION_CHANGED')),
  target_document_id       TEXT NOT NULL,
  target_reference         TEXT NOT NULL,
  performed_by_user_id     UUID NOT NULL,
  performed_by_user_name   TEXT NOT NULL,
  performed_by_user_role   TEXT NOT NULL CHECK (performed_by_user_role IN ('ADMIN','STAFF')),
  reason                   TEXT,
  metadata                 JSONB,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_created_at  ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_event_type  ON audit_logs(event_type);
```

---

#### `supabase/migrations/002_rls_policies.sql`

```sql
-- ============================================================
-- Mr. Wash POS — Row Level Security Policies
-- ============================================================

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (is_active_admin());

CREATE POLICY "Admins manage profiles"
  ON profiles FOR ALL
  USING (is_active_admin());

-- ----------------------------------------------------------------
-- vehicle_categories — all active users read; only admins write
-- ----------------------------------------------------------------
CREATE POLICY "Active users read categories"
  ON vehicle_categories FOR SELECT
  USING (is_active_user());

CREATE POLICY "Admins manage categories"
  ON vehicle_categories FOR ALL
  USING (is_active_admin());

-- ----------------------------------------------------------------
-- service_packages — all active users read; only admins write
-- ----------------------------------------------------------------
CREATE POLICY "Active users read packages"
  ON service_packages FOR SELECT
  USING (is_active_user());

CREATE POLICY "Admins manage packages"
  ON service_packages FOR ALL
  USING (is_active_admin());

-- ----------------------------------------------------------------
-- pricing_rules — all active users read; only admins write
-- ----------------------------------------------------------------
CREATE POLICY "Active users read pricing"
  ON pricing_rules FOR SELECT
  USING (is_active_user());

CREATE POLICY "Admins manage pricing"
  ON pricing_rules FOR ALL
  USING (is_active_admin());

-- ----------------------------------------------------------------
-- customers — all active users read/write
-- ----------------------------------------------------------------
CREATE POLICY "Active users manage customers"
  ON customers FOR ALL
  USING (is_active_user());

-- ----------------------------------------------------------------
-- vehicles — all active users read/write
-- ----------------------------------------------------------------
CREATE POLICY "Active users manage vehicles"
  ON vehicles FOR ALL
  USING (is_active_user());

-- ----------------------------------------------------------------
-- transaction_counters — managed only by RPC functions (SECURITY DEFINER)
-- No direct client access.
-- ----------------------------------------------------------------
CREATE POLICY "No direct access to counters"
  ON transaction_counters FOR ALL
  USING (false);

-- ----------------------------------------------------------------
-- transactions
-- ----------------------------------------------------------------
CREATE POLICY "Active users read transactions"
  ON transactions FOR SELECT
  USING (is_active_user());

CREATE POLICY "Active users create transactions"
  ON transactions FOR INSERT
  WITH CHECK (is_active_user());

-- Only update status, payment fields, cancellation_reason, updated_at
-- Snapshot columns enforced as immutable by RPC SECURITY DEFINER functions
CREATE POLICY "Active users update transaction status"
  ON transactions FOR UPDATE
  USING (is_active_user());

-- ----------------------------------------------------------------
-- payments — all active users read; only via RPC for write
-- ----------------------------------------------------------------
CREATE POLICY "Active users read payments"
  ON payments FOR SELECT
  USING (is_active_user());

CREATE POLICY "Active users create payments"
  ON payments FOR INSERT
  WITH CHECK (is_active_user());

CREATE POLICY "Admins update payments (reversal)"
  ON payments FOR UPDATE
  USING (is_active_admin());

-- ----------------------------------------------------------------
-- audit_logs — append-only: active users INSERT; admins SELECT
-- ----------------------------------------------------------------
CREATE POLICY "Active users append audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (is_active_user());

CREATE POLICY "Admins read audit logs"
  ON audit_logs FOR SELECT
  USING (is_active_admin());
```

---

#### `supabase/migrations/003_rpc_functions.sql`

```sql
-- ============================================================
-- Mr. Wash POS — PL/pgSQL RPC Functions
-- All functions are SECURITY DEFINER to enforce atomicity
-- and bypass RLS for counter management.
-- ============================================================

-- ----------------------------------------------------------------
-- HELPER: Generate next transaction number (IST-aware)
-- Called only inside rpc_create_transaction.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION _generate_transaction_number(ist_date_string TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_seq INT;
BEGIN
  INSERT INTO transaction_counters (date_string, last_sequence)
  VALUES (ist_date_string, 1)
  ON CONFLICT (date_string) DO UPDATE
    SET last_sequence = transaction_counters.last_sequence + 1
  RETURNING last_sequence INTO next_seq;

  RETURN 'TRX-' || ist_date_string || '-' || LPAD(next_seq::TEXT, 4, '0');
END;
$$;

-- ----------------------------------------------------------------
-- RPC: rpc_create_transaction
-- Creates transaction with immutable snapshots.
-- Returns the full transaction row as JSON.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION rpc_create_transaction(
  p_ist_date_string        TEXT,  -- 'YYYYMMDD' in IST
  p_vehicle_snapshot       JSONB,
  p_customer_snapshot      JSONB,
  p_service_package_snapshot JSONB,
  p_pricing_snapshot       JSONB,
  p_staff_snapshot         JSONB,
  p_expected_pickup_at     TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_number TEXT;
  v_transaction_id     UUID;
  v_now                TIMESTAMPTZ := now();
  v_result             JSONB;
BEGIN
  -- Validate caller is an active user
  IF NOT is_active_user() THEN
    RAISE EXCEPTION 'Unauthorized: active session required';
  END IF;

  -- Validate pricing snapshot: actualPrice must be > 0
  IF (p_pricing_snapshot->>'actualPrice')::INT <= 0 THEN
    RAISE EXCEPTION 'Invalid pricing snapshot: actualPrice must be > 0';
  END IF;

  -- Generate IST-based transaction number (atomic counter)
  v_transaction_number := _generate_transaction_number(p_ist_date_string);

  -- Insert transaction record
  INSERT INTO transactions (
    transaction_number,
    status,
    vehicle_snapshot,
    customer_snapshot,
    service_package_snapshot,
    pricing_snapshot,
    staff_snapshot,
    vehicle_arrived_at,
    expected_pickup_at,
    payment_status,
    paid_amount,
    created_at,
    updated_at
  ) VALUES (
    v_transaction_number,
    'OPEN',
    p_vehicle_snapshot,
    p_customer_snapshot,
    p_service_package_snapshot,
    p_pricing_snapshot,
    p_staff_snapshot,
    v_now,
    p_expected_pickup_at,
    'UNPAID',
    0,
    v_now,
    v_now
  ) RETURNING id INTO v_transaction_id;

  -- Return full row as JSON
  SELECT row_to_json(t)::JSONB INTO v_result
  FROM transactions t
  WHERE t.id = v_transaction_id;

  RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------
-- RPC: rpc_complete_payment
-- Atomically creates payment record and marks transaction COMPLETED/PAID.
-- Returns the new payment record as JSON.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION rpc_complete_payment(
  p_transaction_id      UUID,
  p_payment_method      TEXT,
  p_amount              INT,
  p_upi_reference       TEXT DEFAULT NULL,
  p_notes               TEXT DEFAULT NULL,
  p_staff_id            UUID,
  p_staff_name          TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx             transactions%ROWTYPE;
  v_expected_price INT;
  v_payment_id     UUID;
  v_now            TIMESTAMPTZ := now();
  v_result         JSONB;
BEGIN
  IF NOT is_active_user() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_payment_method NOT IN ('CASH', 'UPI') THEN
    RAISE EXCEPTION 'Invalid payment method: %', p_payment_method;
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be a positive whole rupee amount';
  END IF;

  -- Lock transaction row
  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction record not found';
  END IF;

  IF v_tx.status <> 'OPEN' THEN
    RAISE EXCEPTION 'Cannot record payment: Transaction status is %. Only OPEN transactions can be paid.', v_tx.status;
  END IF;

  IF v_tx.payment_status = 'PAID' THEN
    RAISE EXCEPTION 'Transaction has already been paid';
  END IF;

  v_expected_price := (v_tx.pricing_snapshot->>'actualPrice')::INT;
  IF p_amount <> v_expected_price THEN
    RAISE EXCEPTION 'Payment amount (₹%) must exactly equal the transaction actual price (₹%)', p_amount, v_expected_price;
  END IF;

  -- Insert payment record
  INSERT INTO payments (
    transaction_id, transaction_number, amount, payment_method,
    upi_reference_number, notes,
    recorded_by_staff_id, recorded_by_staff_name, recorded_at,
    is_reversed
  ) VALUES (
    p_transaction_id, v_tx.transaction_number, p_amount, p_payment_method,
    p_upi_reference, p_notes,
    p_staff_id, p_staff_name, v_now,
    false
  ) RETURNING id INTO v_payment_id;

  -- Update transaction
  UPDATE transactions SET
    status          = 'COMPLETED',
    payment_status  = 'PAID',
    paid_amount     = p_amount,
    payment_method  = p_payment_method,
    paid_at         = v_now,
    updated_at      = v_now
  WHERE id = p_transaction_id;

  SELECT row_to_json(p)::JSONB INTO v_result
  FROM payments p WHERE p.id = v_payment_id;

  RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------
-- RPC: rpc_reverse_payment
-- Admin-only. Atomically marks payment reversed and resets transaction
-- to OPEN/UNPAID. Writes audit log entry atomically.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION rpc_reverse_payment(
  p_payment_id      UUID,
  p_reversal_reason TEXT,
  p_admin_id        UUID,
  p_admin_name      TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment  payments%ROWTYPE;
  v_tx       transactions%ROWTYPE;
  v_now      TIMESTAMPTZ := now();
BEGIN
  IF NOT is_active_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required for payment reversal';
  END IF;

  IF TRIM(p_reversal_reason) = '' THEN
    RAISE EXCEPTION 'A mandatory reversal reason must be provided';
  END IF;

  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found';
  END IF;

  IF v_payment.is_reversed THEN
    RAISE EXCEPTION 'Payment record has already been reversed';
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = v_payment.transaction_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Associated transaction record not found';
  END IF;

  IF v_tx.status <> 'COMPLETED' OR v_tx.payment_status <> 'PAID' THEN
    RAISE EXCEPTION 'Only COMPLETED / PAID transactions can be reversed by Admin';
  END IF;

  -- Mark payment reversed
  UPDATE payments SET
    is_reversed           = true,
    reversed_at           = v_now,
    reversed_by_admin_id  = p_admin_id,
    reversal_reason       = p_reversal_reason
  WHERE id = p_payment_id;

  -- Reset transaction to OPEN/UNPAID
  UPDATE transactions SET
    status          = 'OPEN',
    payment_status  = 'UNPAID',
    paid_amount     = 0,
    payment_method  = NULL,
    paid_at         = NULL,
    updated_at      = v_now
  WHERE id = v_payment.transaction_id;

  -- Append audit log
  INSERT INTO audit_logs (
    event_type, target_document_id, target_reference,
    performed_by_user_id, performed_by_user_name, performed_by_user_role,
    reason, metadata, created_at
  ) VALUES (
    'PAYMENT_REVERSED', p_payment_id::TEXT, v_payment.transaction_number,
    p_admin_id, p_admin_name, 'ADMIN',
    p_reversal_reason,
    jsonb_build_object(
      'amount', v_payment.amount,
      'paymentMethod', v_payment.payment_method
    ),
    v_now
  );
END;
$$;

-- ----------------------------------------------------------------
-- RPC: rpc_cancel_transaction
-- Atomically sets status=CANCELLED and writes audit log.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION rpc_cancel_transaction(
  p_transaction_id      UUID,
  p_cancellation_reason TEXT,
  p_user_id             UUID,
  p_user_name           TEXT,
  p_user_role           TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx   transactions%ROWTYPE;
  v_now  TIMESTAMPTZ := now();
BEGIN
  IF NOT is_active_user() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF TRIM(p_cancellation_reason) = '' THEN
    RAISE EXCEPTION 'A mandatory cancellation reason must be provided';
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction record not found';
  END IF;

  IF v_tx.status <> 'OPEN' THEN
    RAISE EXCEPTION 'Only OPEN transactions can be cancelled';
  END IF;

  UPDATE transactions SET
    status               = 'CANCELLED',
    cancellation_reason  = p_cancellation_reason,
    updated_at           = v_now
  WHERE id = p_transaction_id;

  INSERT INTO audit_logs (
    event_type, target_document_id, target_reference,
    performed_by_user_id, performed_by_user_name, performed_by_user_role,
    reason, metadata, created_at
  ) VALUES (
    'TRANSACTION_CANCELLED', p_transaction_id::TEXT, v_tx.transaction_number,
    p_user_id, p_user_name, p_user_role,
    p_cancellation_reason,
    jsonb_build_object(
      'vehicleRegistration', v_tx.vehicle_snapshot->>'registrationNumber',
      'servicePackageName',  v_tx.service_package_snapshot->>'name',
      'standardPrice',       (v_tx.pricing_snapshot->>'standardPrice')::INT,
      'actualPrice',         (v_tx.pricing_snapshot->>'actualPrice')::INT
    ),
    v_now
  );
END;
$$;

-- ----------------------------------------------------------------
-- RPC: rpc_set_price_rule
-- Admin-only. Upserts a pricing rule. Records PRICE_CHANGED audit.
-- p_price = NULL means delete/deactivate the rule (make unavailable).
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION rpc_set_price_rule(
  p_category_id        TEXT,
  p_variant            TEXT,
  p_service_package_id TEXT,
  p_price              INT,   -- Must be > 0; NULL = deactivate
  p_admin_id           UUID,
  p_admin_name         TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now      TIMESTAMPTZ := now();
  v_old_price INT;
BEGIN
  IF NOT is_active_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  IF p_price IS NOT NULL AND p_price <= 0 THEN
    RAISE EXCEPTION 'Price must be a positive integer (> 0). To make unavailable, pass p_price = NULL.';
  END IF;

  -- Capture old price for audit
  SELECT price INTO v_old_price
  FROM pricing_rules
  WHERE category_id = p_category_id
    AND COALESCE(variant, '') = COALESCE(p_variant, '')
    AND service_package_id = p_service_package_id;

  IF p_price IS NULL THEN
    -- Deactivate / delete rule
    DELETE FROM pricing_rules
    WHERE category_id = p_category_id
      AND COALESCE(variant, '') = COALESCE(p_variant, '')
      AND service_package_id = p_service_package_id;
  ELSE
    -- Upsert rule
    INSERT INTO pricing_rules (category_id, variant, service_package_id, price, updated_at)
    VALUES (p_category_id, p_variant, p_service_package_id, p_price, v_now)
    ON CONFLICT (category_id, COALESCE(variant, ''), service_package_id)
    DO UPDATE SET price = p_price, updated_at = v_now, is_active = true;
  END IF;

  -- Audit log
  INSERT INTO audit_logs (
    event_type, target_document_id, target_reference,
    performed_by_user_id, performed_by_user_name, performed_by_user_role,
    metadata, created_at
  ) VALUES (
    'PRICE_CHANGED',
    p_category_id || '|' || COALESCE(p_variant, '') || '|' || p_service_package_id,
    p_category_id || ' / ' || COALESCE(p_variant, 'standard') || ' / ' || p_service_package_id,
    p_admin_id, p_admin_name, 'ADMIN',
    jsonb_build_object(
      'categoryId',       p_category_id,
      'variant',          COALESCE(p_variant, ''),
      'servicePackageId', p_service_package_id,
      'oldPrice',         COALESCE(v_old_price, 0),
      'newPrice',         COALESCE(p_price, 0)
    ),
    v_now
  );
END;
$$;

-- ----------------------------------------------------------------
-- RPC: rpc_get_analytics
-- Server-side analytics aggregation (replaces client-side JS loops).
-- Returns a JSONB object with all Phase 8 metrics.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION rpc_get_analytics(
  p_start_utc TIMESTAMPTZ,
  p_end_utc   TIMESTAMPTZ,
  p_period_label TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT is_active_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required for analytics';
  END IF;

  WITH completed AS (
    SELECT *
    FROM transactions
    WHERE status = 'COMPLETED'
      AND payment_status = 'PAID'
      AND created_at >= p_start_utc
      AND created_at <  p_end_utc
  ),
  metrics AS (
    SELECT
      COUNT(*)                                                          AS total_vehicles,
      COALESCE(SUM((pricing_snapshot->>'actualPrice')::INT), 0)        AS total_sales,
      COALESCE(SUM(CASE WHEN payment_method = 'CASH' THEN paid_amount ELSE 0 END), 0) AS cash_sales,
      COALESCE(SUM(CASE WHEN payment_method = 'UPI'  THEN paid_amount ELSE 0 END), 0) AS upi_sales,
      COUNT(CASE WHEN payment_method = 'CASH' THEN 1 END)              AS cash_count,
      COUNT(CASE WHEN payment_method = 'UPI'  THEN 1 END)              AS upi_count,
      COALESCE(SUM(CASE WHEN (pricing_snapshot->>'priceAdjustment')::INT <> 0 THEN 1 ELSE 0 END), 0) AS adjusted_count,
      COALESCE(SUM((pricing_snapshot->>'priceAdjustment')::INT), 0)    AS total_adjustment
    FROM completed
  ),
  service_dist AS (
    SELECT
      service_package_snapshot->>'name' AS name,
      COUNT(*)                           AS cnt,
      SUM((pricing_snapshot->>'actualPrice')::INT) AS total_sales
    FROM completed
    GROUP BY service_package_snapshot->>'name'
    ORDER BY cnt DESC
  ),
  category_dist AS (
    SELECT
      vehicle_snapshot->>'categoryName' AS name,
      COUNT(*)                           AS cnt,
      SUM((pricing_snapshot->>'actualPrice')::INT) AS total_sales
    FROM completed
    GROUP BY vehicle_snapshot->>'categoryName'
    ORDER BY cnt DESC
  ),
  unique_regs AS (
    SELECT DISTINCT vehicle_snapshot->>'registrationNumber' AS reg
    FROM completed
  ),
  new_vs_ret AS (
    SELECT
      COUNT(CASE WHEN prior.id IS NULL THEN 1 END) AS new_vehicles,
      COUNT(CASE WHEN prior.id IS NOT NULL THEN 1 END) AS returning_vehicles
    FROM unique_regs ur
    LEFT JOIN LATERAL (
      SELECT id FROM transactions t2
      WHERE t2.vehicle_snapshot->>'registrationNumber' = ur.reg
        AND t2.status = 'COMPLETED'
        AND t2.created_at < p_start_utc
      LIMIT 1
    ) prior ON true
  )
  SELECT jsonb_build_object(
    'periodLabel',              p_period_label,
    'totalVehicles',            m.total_vehicles,
    'totalSales',               m.total_sales,
    'cashSales',                m.cash_sales,
    'upiSales',                 m.upi_sales,
    'cashCount',                m.cash_count,
    'upiCount',                 m.upi_count,
    'averageTransactionValue',  CASE WHEN m.total_vehicles > 0 THEN ROUND(m.total_sales::NUMERIC / m.total_vehicles) ELSE 0 END,
    'adjustedTransactionCount', m.adjusted_count,
    'totalAdjustmentAmount',    m.total_adjustment,
    'serviceDistribution',      (SELECT jsonb_agg(jsonb_build_object('name',name,'count',cnt,'totalSales',total_sales)) FROM service_dist),
    'categoryDistribution',     (SELECT jsonb_agg(jsonb_build_object('name',name,'count',cnt,'totalSales',total_sales)) FROM category_dist),
    'newVehicles',              nvr.new_vehicles,
    'returningVehicles',        nvr.returning_vehicles
  ) INTO v_result
  FROM metrics m, new_vs_ret nvr;

  RETURN v_result;
END;
$$;
```

---

#### `supabase/migrations/004_seed_data.sql`

```sql
-- ============================================================
-- Mr. Wash POS — Official Seed Data
-- ============================================================

-- ----------------------------------------------------------------
-- Vehicle Categories (15 total)
-- ----------------------------------------------------------------
INSERT INTO vehicle_categories (id, name, sort_order) VALUES
  ('hatchback_car', 'Hatchback Car',   1),
  ('sedan_car',     'Sedan Car',       2),
  ('compact_suv',   'Compact SUV',     3),
  ('suv',           'SUV',             4),
  ('premium_suv',   'Premium SUV',     5),
  ('scooter',       'Scooter',         6),
  ('bike',          'Bike',            7),
  ('bullet',        'Bullet',          8),
  ('superbike',     'Superbike',       9),
  ('auto',          'Auto',           10),
  ('traveller',     'Traveller',      11),
  ('pickup',        'Pickup',         12),
  ('dost',          'Dost',           13),
  ('tata_ace',      'TATA ACE',       14),
  ('super_ace',     'Super ACE',      15)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Service Packages (3 total)
-- ----------------------------------------------------------------
INSERT INTO service_packages (id, name, sort_order, activities) VALUES
  ('body_wash',    'Body Wash',       1, '["Exterior wash","Wheel cleaning","Window cleaning"]'),
  ('body_vacuum',  'Body & Vacuum',   2, '["Exterior wash","Wheel cleaning","Window cleaning","Interior vacuum","Dashboard wipe"]'),
  ('full_wash',    'Full Wash',       3, '["Exterior wash","Wheel cleaning","Window cleaning","Interior vacuum","Dashboard wipe","Interior wipe","Tyre polish"]')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Official Mr. Wash Pricing Rules (43 configured rules)
-- A missing row = service unavailable. No ₹0 rows.
--
-- SUV (suv) and Superbike (superbike) → ALL services unconfigured.
-- Scooter, Bike, Bullet, Auto → body_wash and body_vacuum unconfigured.
-- ----------------------------------------------------------------

-- Hatchback Car (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('hatchback_car', NULL, 'body_wash',   200),
  ('hatchback_car', NULL, 'body_vacuum', 350),
  ('hatchback_car', NULL, 'full_wash',   550)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Sedan Car (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('sedan_car', NULL, 'body_wash',   250),
  ('sedan_car', NULL, 'body_vacuum', 450),
  ('sedan_car', NULL, 'full_wash',   650)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Compact SUV (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('compact_suv', NULL, 'body_wash',   250),
  ('compact_suv', NULL, 'body_vacuum', 450),
  ('compact_suv', NULL, 'full_wash',   700)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Premium SUV (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('premium_suv', NULL, 'body_wash',   400),
  ('premium_suv', NULL, 'body_vacuum', 650),
  ('premium_suv', NULL, 'full_wash',   900)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Scooter (1 rule — full_wash only)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('scooter', NULL, 'full_wash', 200)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Bike (1 rule — full_wash only)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('bike', NULL, 'full_wash', 250)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Bullet (1 rule — full_wash only)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('bullet', NULL, 'full_wash', 300)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Auto (1 rule — full_wash only)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('auto', NULL, 'full_wash', 600)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Traveller 10 Seat (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('traveller', '10 Seat', 'body_wash',   450),
  ('traveller', '10 Seat', 'body_vacuum', 700),
  ('traveller', '10 Seat', 'full_wash',   1200)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Traveller 14 Seat (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('traveller', '14 Seat', 'body_wash',   550),
  ('traveller', '14 Seat', 'body_vacuum', 800),
  ('traveller', '14 Seat', 'full_wash',   1500)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Traveller 17 Seat (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('traveller', '17 Seat', 'body_wash',   600),
  ('traveller', '17 Seat', 'body_vacuum', 850),
  ('traveller', '17 Seat', 'full_wash',   1700)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Pickup Ordinary (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('pickup', 'Ordinary', 'body_wash',   300),
  ('pickup', 'Ordinary', 'body_vacuum', 500),
  ('pickup', 'Ordinary', 'full_wash',   750)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Pickup Long Chassis (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('pickup', 'Long Chassis', 'body_wash',   350),
  ('pickup', 'Long Chassis', 'body_vacuum', 500),
  ('pickup', 'Long Chassis', 'full_wash',   800)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Dost Ordinary (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('dost', 'Ordinary', 'body_wash',   300),
  ('dost', 'Ordinary', 'body_vacuum', 500),
  ('dost', 'Ordinary', 'full_wash',   750)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Dost Bada Dost (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('dost', 'Bada Dost', 'body_wash',   350),
  ('dost', 'Bada Dost', 'body_vacuum', 500),
  ('dost', 'Bada Dost', 'full_wash',   800)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- TATA ACE (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('tata_ace', NULL, 'body_wash',   300),
  ('tata_ace', NULL, 'body_vacuum', 450),
  ('tata_ace', NULL, 'full_wash',   700)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- Super ACE (3 rules)
INSERT INTO pricing_rules (category_id, variant, service_package_id, price) VALUES
  ('super_ace', NULL, 'body_wash',   350),
  ('super_ace', NULL, 'body_vacuum', 450),
  ('super_ace', NULL, 'full_wash',   750)
ON CONFLICT (category_id, COALESCE(variant,''), service_package_id) DO UPDATE SET price = EXCLUDED.price;

-- TOTAL: 43 configured rules.
-- suv, superbike → 0 rules (all 6 combinations unconfigured).
-- scooter, bike, bullet, auto → body_wash and body_vacuum unconfigured (8 missing).
```

---

## PHASE B — SUPABASE CLIENT SETUP

### B1. Install Supabase JS client

```bash
npm install @supabase/supabase-js
```

### B2. Create `src/config/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const supabase = isSupabaseConfigured
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
  : null as never
```

### B3. Update `.env.example`

Add these lines to `.env.example` (create if it doesn't exist):

```env
# Supabase (new backend)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Firebase (legacy fallback — do not delete)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## PHASE C — SERVICE LAYER REWRITES

Rewrite each service file to use Supabase. Keep the exported object name and all function signatures identical. Only change the function bodies.

### C1. `src/services/auth.service.ts`

```typescript
import { supabase } from '@/config/supabase'
import type { LoginCredentials } from '@/types/auth.types'

export const authService = {
  async loginWithEmail(credentials: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })
    if (error) throw error
    return data
  },

  async logoutUser(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  onAuthChange(callback: (session: import('@supabase/supabase-js').Session | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
    return () => subscription.unsubscribe()
  },
}
```

### C2. `src/services/user.service.ts`

```typescript
import { supabase } from '@/config/supabase'
import type { UserProfile } from '@/types/user.types'

export const userService = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null // row not found
      throw error
    }
    return {
      uid: data.id,
      email: data.email,
      role: data.role,
      displayName: data.display_name,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    const { error } = await supabase.from('profiles').insert({
      id: profile.uid,
      email: profile.email,
      role: profile.role,
      display_name: profile.displayName,
      is_active: profile.isActive,
      created_at: profile.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
  },

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.displayName !== undefined) payload.display_name = updates.displayName
    if (updates.isActive !== undefined)    payload.is_active = updates.isActive
    if (updates.role !== undefined)        payload.role = updates.role

    const { error } = await supabase.from('profiles').update(payload).eq('id', uid)
    if (error) throw error
  },
}
```

### C3. `src/store/AuthContext.tsx`

Rewrite to use Supabase Auth session events. The exported `AuthContext` interface must remain identical to what the UI uses: `{ user, userProfile, loading, error, isConfigured, login, logout, isAdmin, isStaff, hasRole }`.

```typescript
import React, { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { AuthContextType, LoginCredentials } from '@/types/auth.types'
import type { UserProfile, UserRole } from '@/types/user.types'
import { supabase, isSupabaseConfigured } from '@/config/supabase'
import { authService } from '@/services/auth.service'
import { userService } from '@/services/user.service'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }

    // Load initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        try {
          const profile = await userService.getUserProfile(s.user.id)
          setUserProfile(profile)
        } catch { setError('Failed to load user profile.') }
      }
      setLoading(false)
    })

    const unsubscribe = authService.onAuthChange(async (s) => {
      setLoading(true)
      setError(null)
      setSession(s)
      if (s?.user) {
        try {
          const profile = await userService.getUserProfile(s.user.id)
          setUserProfile(profile)
        } catch { setError('Failed to load user profile.') }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (credentials: LoginCredentials) => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
    setError(null)
    setLoading(true)
    try {
      const result = await authService.loginWithEmail(credentials)
      const profile = await userService.getUserProfile(result.user.id)
      setUserProfile(profile)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setError(null)
    try {
      await authService.logoutUser()
      setSession(null)
      setUserProfile(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      throw err
    }
  }

  const isAdmin = userProfile?.role === 'ADMIN' && userProfile?.isActive === true
  const isStaff = userProfile?.role === 'STAFF' && userProfile?.isActive === true
  const hasRole = (role: UserRole) => userProfile?.role === role && userProfile?.isActive === true

  const value: AuthContextType = {
    user: session?.user ?? null,
    userProfile,
    loading,
    error,
    isConfigured: isSupabaseConfigured,
    login,
    logout,
    isAdmin,
    isStaff,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

> [!IMPORTANT]
> `src/types/auth.types.ts` has `user` typed as Firebase `User`. Change this to `import('@supabase/supabase-js').User | null` to match the Supabase session user. Check `AuthContextType` in that file and update the `user` field type accordingly.

### C4. `src/services/vehicleCategory.service.ts`

Replace Firestore calls with Supabase PostgREST. Map `snake_case` columns → `camelCase` TS types.

```typescript
import { supabase } from '@/config/supabase'
import type { VehicleCategory } from '@/types/vehicle.types' // existing type

export const vehicleCategoryService = {
  async getAllCategories(): Promise<VehicleCategory[]> {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw error
    return data.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  },

  async getCategoryById(id: string): Promise<VehicleCategory | null> {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return {
      id: data.id, name: data.name, description: data.description ?? undefined,
      isActive: data.is_active, sortOrder: data.sort_order,
      createdAt: data.created_at, updatedAt: data.updated_at,
    }
  },
}
```

### C5. `src/services/servicePackage.service.ts`

```typescript
import { supabase } from '@/config/supabase'
import type { ServicePackage } from '@/types/service.types'

export const servicePackageService = {
  async getAllPackages(): Promise<ServicePackage[]> {
    const { data, error } = await supabase
      .from('service_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw error
    return data.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      activities: row.activities as string[],
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  },

  async getPackageById(id: string): Promise<ServicePackage | null> {
    const { data, error } = await supabase
      .from('service_packages').select('*').eq('id', id).single()
    if (error) { if (error.code === 'PGRST116') return null; throw error }
    return {
      id: data.id, name: data.name, description: data.description ?? undefined,
      activities: data.activities as string[], isActive: data.is_active,
      sortOrder: data.sort_order, createdAt: data.created_at, updatedAt: data.updated_at,
    }
  },
}
```

### C6. `src/services/pricing.service.ts`

```typescript
import { supabase } from '@/config/supabase'
import type { PricingRule } from '@/types/service.types'

export const pricingService = {
  async getPriceForCategoryAndPackage(
    categoryId: string,
    variant: string | null,
    servicePackageId: string
  ): Promise<number | null> {
    let query = supabase
      .from('pricing_rules')
      .select('price')
      .eq('category_id', categoryId)
      .eq('service_package_id', servicePackageId)
      .eq('is_active', true)

    if (variant) {
      query = query.eq('variant', variant)
    } else {
      query = query.is('variant', null)
    }

    const { data, error } = await query.single()
    if (error) { if (error.code === 'PGRST116') return null; throw error }
    return data?.price ?? null
  },

  async getAllPricingRules(): Promise<PricingRule[]> {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true)
    if (error) throw error
    return data.map(row => ({
      id: row.id,
      categoryId: row.category_id,
      variant: row.variant ?? undefined,
      servicePackageId: row.service_package_id,
      price: row.price,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  },

  async setPriceRule(
    categoryId: string,
    variant: string | null,
    servicePackageId: string,
    price: number | null,
    performedBy: { userId: string; userName: string }
  ): Promise<void> {
    const { error } = await supabase.rpc('rpc_set_price_rule', {
      p_category_id:        categoryId,
      p_variant:            variant,
      p_service_package_id: servicePackageId,
      p_price:              price,
      p_admin_id:           performedBy.userId,
      p_admin_name:         performedBy.userName,
    })
    if (error) throw error
  },

  // Seed function — only called from Admin UI button, not on startup
  async seedOfficialPricing(performedBy: { userId: string; userName: string }): Promise<void> {
    // All 43 official rules are already in migration 004_seed_data.sql.
    // This function can call setPriceRule in a loop if needed for re-seeding via UI.
    // Implementation: iterate the official price table and call setPriceRule for each.
    // See migration 004_seed_data.sql for the complete price matrix.
    console.log('Seed pricing: use Supabase migration 004_seed_data.sql for initial seed.', performedBy)
  },
}
```

### C7. `src/services/customer.service.ts`

```typescript
import { supabase } from '@/config/supabase'
import type { Customer } from '@/types/customer.types'

export const customerService = {
  async findOrCreateCustomer(phoneNumber: string, name?: string): Promise<Customer> {
    const normalizedPhone = phoneNumber.trim()

    // Try to find existing customer by phone
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .maybeSingle()

    if (existing) {
      return {
        id: existing.id, name: existing.name ?? undefined,
        phoneNumber: existing.phone_number ?? undefined,
        createdAt: existing.created_at, updatedAt: existing.updated_at,
      }
    }

    // Create new customer
    const { data, error } = await supabase
      .from('customers')
      .insert({ phone_number: normalizedPhone, name: name?.trim() || null })
      .select()
      .single()
    if (error) throw error
    return {
      id: data.id, name: data.name ?? undefined,
      phoneNumber: data.phone_number ?? undefined,
      createdAt: data.created_at, updatedAt: data.updated_at,
    }
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers').select('*').eq('id', id).single()
    if (error) { if (error.code === 'PGRST116') return null; throw error }
    return {
      id: data.id, name: data.name ?? undefined,
      phoneNumber: data.phone_number ?? undefined,
      createdAt: data.created_at, updatedAt: data.updated_at,
    }
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`phone_number.ilike.%${query}%,name.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
      .limit(20)
    if (error) throw error
    return data.map(row => ({
      id: row.id, name: row.name ?? undefined,
      phoneNumber: row.phone_number ?? undefined,
      createdAt: row.created_at, updatedAt: row.updated_at,
    }))
  },
}
```

### C8. `src/services/vehicle.service.ts`

```typescript
import { supabase } from '@/config/supabase'
import type { Vehicle } from '@/types/vehicle.types'
import { normalizeRegistrationNumber } from '@/utils/vehicle.utils'

export const vehicleService = {
  async findVehicleByRegistration(rawRegNumber: string): Promise<Vehicle | null> {
    const normalized = normalizeRegistrationNumber(rawRegNumber)
    if (!normalized) return null

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('registration_number', normalized)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return mapVehicleRow(data)
  },

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        registration_number:          vehicle.registrationNumber,
        display_registration_number:  vehicle.displayRegistrationNumber,
        category_id:                  vehicle.categoryId,
        variant:                      vehicle.variant ?? null,
        model:                        vehicle.model ?? null,
        customer_id:                  vehicle.customerId ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return mapVehicleRow(data)
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<void> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.model !== undefined)      payload.model = updates.model
    if (updates.variant !== undefined)    payload.variant = updates.variant
    if (updates.customerId !== undefined) payload.customer_id = updates.customerId

    const { error } = await supabase.from('vehicles').update(payload).eq('id', id)
    if (error) throw error
  },
}

function mapVehicleRow(row: Record<string, unknown>): Vehicle {
  return {
    id:                         row.id as string,
    registrationNumber:         row.registration_number as string,
    displayRegistrationNumber:  row.display_registration_number as string,
    categoryId:                 row.category_id as string,
    variant:                    (row.variant as string) ?? undefined,
    model:                      (row.model as string) ?? undefined,
    customerId:                 (row.customer_id as string) ?? undefined,
    createdAt:                  row.created_at as string,
    updatedAt:                  row.updated_at as string,
  }
}
```

### C9. `src/services/transactionCounter.service.ts`

The counter logic is now inside `rpc_create_transaction` PostgreSQL function. This service only needs to provide the IST date string helper used externally.

```typescript
/**
 * transactionCounter.service.ts
 * Counter generation is now handled atomically inside rpc_create_transaction (PostgreSQL).
 * This module only exports the IST date string helper for use in the transaction service.
 */

export const transactionCounterService = {
  /**
   * Returns current date in IST as 'YYYYMMDD' string.
   * Used as p_ist_date_string parameter for rpc_create_transaction.
   */
  getTodayISTDateString(): string {
    const now = new Date()
    const ist = new Date(now.getTime() + 330 * 60 * 1000) // UTC+5:30
    const y = ist.getUTCFullYear()
    const m = String(ist.getUTCMonth() + 1).padStart(2, '0')
    const d = String(ist.getUTCDate()).padStart(2, '0')
    return `${y}${m}${d}`
  },
}
```

### C10. `src/services/transaction.service.ts`

```typescript
import { supabase } from '@/config/supabase'
import type {
  Transaction,
  VehicleSnapshot,
  CustomerSnapshot,
  ServicePackageSnapshot,
  PricingSnapshot,
  StaffSnapshot,
} from '@/types/transaction.types'
import { transactionCounterService } from './transactionCounter.service'
import { normalizeRegistrationNumber } from '@/utils/vehicle.utils'

export const transactionService = {
  async createTransaction(data: {
    vehicleSnapshot: VehicleSnapshot
    customerSnapshot: CustomerSnapshot
    servicePackageSnapshot: ServicePackageSnapshot
    pricingSnapshot: PricingSnapshot
    staffSnapshot: StaffSnapshot
    expectedPickupAt?: string
  }): Promise<Transaction> {
    const istDate = transactionCounterService.getTodayISTDateString()

    const { data: result, error } = await supabase.rpc('rpc_create_transaction', {
      p_ist_date_string:          istDate,
      p_vehicle_snapshot:         data.vehicleSnapshot,
      p_customer_snapshot:        data.customerSnapshot,
      p_service_package_snapshot: data.servicePackageSnapshot,
      p_pricing_snapshot:         data.pricingSnapshot,
      p_staff_snapshot:           data.staffSnapshot,
      p_expected_pickup_at:       data.expectedPickupAt ?? null,
    })
    if (error) throw error
    return mapTransactionRow(result as Record<string, unknown>)
  },

  async getTransactionById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions').select('*').eq('id', id).single()
    if (error) { if (error.code === 'PGRST116') return null; throw error }
    return mapTransactionRow(data as Record<string, unknown>)
  },

  async getTransactionsByVehicle(rawRegNumber: string): Promise<Transaction[]> {
    const normalized = normalizeRegistrationNumber(rawRegNumber)
    if (!normalized) return []
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq("vehicle_snapshot->>'registrationNumber'", normalized)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(row => mapTransactionRow(row as Record<string, unknown>))
  },

  async getRecentTransactions(limitCount: number = 20): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount)
    if (error) throw error
    return (data ?? []).map(row => mapTransactionRow(row as Record<string, unknown>))
  },

  async cancelTransaction(
    id: string,
    cancellationReason: string,
    performedBy?: { userId: string; userName: string; userRole: 'ADMIN' | 'STAFF' }
  ): Promise<void> {
    const reason = cancellationReason.trim()
    if (!reason) throw new Error('A mandatory cancellation reason must be provided.')

    const { data: txData, error: fetchError } = await supabase
      .from('transactions').select('staff_snapshot').eq('id', id).single()
    if (fetchError) throw fetchError

    const staffSnap = txData.staff_snapshot as StaffSnapshot

    const { error } = await supabase.rpc('rpc_cancel_transaction', {
      p_transaction_id:      id,
      p_cancellation_reason: reason,
      p_user_id:             performedBy?.userId     ?? staffSnap.staffId,
      p_user_name:           performedBy?.userName   ?? staffSnap.staffName,
      p_user_role:           performedBy?.userRole   ?? 'STAFF',
    })
    if (error) throw error
  },
}

function mapTransactionRow(row: Record<string, unknown>): Transaction {
  return {
    id:                       row.id as string,
    transactionNumber:        row.transaction_number as string,
    status:                   row.status as Transaction['status'],
    vehicleSnapshot:          row.vehicle_snapshot as VehicleSnapshot,
    customerSnapshot:         row.customer_snapshot as CustomerSnapshot,
    servicePackageSnapshot:   row.service_package_snapshot as ServicePackageSnapshot,
    pricingSnapshot:          row.pricing_snapshot as PricingSnapshot,
    staffSnapshot:            row.staff_snapshot as StaffSnapshot,
    vehicleArrivedAt:         row.vehicle_arrived_at as string,
    expectedPickupAt:         (row.expected_pickup_at as string) ?? undefined,
    cancellationReason:       (row.cancellation_reason as string) ?? undefined,
    paymentStatus:            row.payment_status as Transaction['paymentStatus'],
    paidAmount:               row.paid_amount as number,
    paymentMethod:            (row.payment_method as Transaction['paymentMethod']) ?? undefined,
    paidAt:                   (row.paid_at as string) ?? undefined,
    createdAt:                row.created_at as string,
    updatedAt:                row.updated_at as string,
  }
}
```

### C11. `src/services/payment.service.ts`

```typescript
import { supabase } from '@/config/supabase'
import type { PaymentRecord, PaymentMethod } from '@/types/transaction.types'

export const paymentService = {
  async processPayment(data: {
    transactionId: string
    paymentMethod: PaymentMethod
    amount: number
    upiReferenceNumber?: string
    notes?: string
    staffId: string
    staffName: string
  }): Promise<PaymentRecord> {
    const { transactionId, paymentMethod, amount, upiReferenceNumber, notes, staffId, staffName } = data

    if (amount <= 0) throw new Error('Payment amount must be a positive whole rupee amount.')
    if (paymentMethod !== 'CASH' && paymentMethod !== 'UPI') {
      throw new Error('Invalid payment method. Only CASH and UPI are supported.')
    }

    const { data: result, error } = await supabase.rpc('rpc_complete_payment', {
      p_transaction_id:  transactionId,
      p_payment_method:  paymentMethod,
      p_amount:          amount,
      p_upi_reference:   upiReferenceNumber?.trim() || null,
      p_notes:           notes?.trim() || null,
      p_staff_id:        staffId,
      p_staff_name:      staffName,
    })
    if (error) throw error
    return mapPaymentRow(result as Record<string, unknown>)
  },

  async reversePayment(data: {
    paymentId: string
    reversalReason: string
    adminId: string
    adminName?: string
  }): Promise<void> {
    const { paymentId, reversalReason, adminId, adminName } = data
    if (!reversalReason.trim()) throw new Error('A mandatory reversal reason must be provided.')

    const { error } = await supabase.rpc('rpc_reverse_payment', {
      p_payment_id:      paymentId,
      p_reversal_reason: reversalReason.trim(),
      p_admin_id:        adminId,
      p_admin_name:      adminName || 'Administrator',
    })
    if (error) throw error
  },

  async getPaymentForTransaction(transactionId: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('recorded_at', { ascending: false })
    if (error) throw error
    if (!data || data.length === 0) return null
    const active = data.find(p => !p.is_reversed)
    const row = active || data[0]
    return mapPaymentRow(row as Record<string, unknown>)
  },
}

function mapPaymentRow(row: Record<string, unknown>): PaymentRecord {
  return {
    id:                     row.id as string,
    transactionId:          row.transaction_id as string,
    transactionNumber:      row.transaction_number as string,
    amount:                 row.amount as number,
    paymentMethod:          row.payment_method as PaymentRecord['paymentMethod'],
    upiReferenceNumber:     (row.upi_reference_number as string) ?? undefined,
    notes:                  (row.notes as string) ?? undefined,
    recordedByStaffId:      row.recorded_by_staff_id as string,
    recordedByStaffName:    row.recorded_by_staff_name as string,
    recordedAt:             row.recorded_at as string,
    isReversed:             row.is_reversed as boolean,
    reversedAt:             (row.reversed_at as string) ?? undefined,
    reversedByAdminId:      (row.reversed_by_admin_id as string) ?? undefined,
    reversalReason:         (row.reversal_reason as string) ?? undefined,
  }
}
```

### C12. `src/services/audit.service.ts`

```typescript
import { supabase } from '@/config/supabase'
import type { AuditLogRecord, AuditEventType } from '@/types/audit.types'

/**
 * Audit service — Supabase implementation.
 *
 * ARCHITECTURAL NOTE:
 * prepareAuditRecord() is now only a legacy helper kept for interface compatibility.
 * All audit writes are performed atomically inside PL/pgSQL RPC functions:
 *   rpc_cancel_transaction, rpc_reverse_payment, rpc_set_price_rule.
 * Direct audit writes from TypeScript are only needed for SERVICE_CONFIGURATION_CHANGED.
 */
export const auditService = {
  /**
   * Write an audit log entry directly (used for service package configuration changes).
   */
  async writeAuditRecord(data: Omit<AuditLogRecord, 'id' | 'createdAt'>): Promise<void> {
    const { error } = await supabase.from('audit_logs').insert({
      event_type:              data.eventType,
      target_document_id:      data.targetDocumentId,
      target_reference:        data.targetReference,
      performed_by_user_id:    data.performedByUserId,
      performed_by_user_name:  data.performedByUserName,
      performed_by_user_role:  data.performedByUserRole,
      reason:                  data.reason ?? null,
      metadata:                data.metadata ?? null,
    })
    if (error) throw error
  },

  async getAuditLogs(
    startIso?: string,
    endIso?: string,
    eventTypeFilter?: AuditEventType | 'ALL',
    limitCount: number = 50
  ): Promise<AuditLogRecord[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount)

    if (startIso && endIso) {
      query = query.gte('created_at', startIso).lt('created_at', endIso)
    }

    if (eventTypeFilter && eventTypeFilter !== 'ALL') {
      query = query.eq('event_type', eventTypeFilter)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map(row => ({
      id:                     row.id,
      eventType:              row.event_type as AuditEventType,
      targetDocumentId:       row.target_document_id,
      targetReference:        row.target_reference,
      performedByUserId:      row.performed_by_user_id,
      performedByUserName:    row.performed_by_user_name,
      performedByUserRole:    row.performed_by_user_role as 'ADMIN' | 'STAFF',
      reason:                 row.reason ?? undefined,
      metadata:               row.metadata ?? undefined,
      createdAt:              row.created_at,
    }))
  },

  /**
   * Legacy compatibility shim — kept so callers that use prepareAuditRecord()
   * still compile. Those call sites should be migrated to writeAuditRecord()
   * or the atomic RPC functions.
   */
  prepareAuditRecord(_data: Omit<AuditLogRecord, 'id' | 'createdAt'>) {
    throw new Error(
      'prepareAuditRecord() is not used in the Supabase implementation. ' +
      'Audit writes are performed atomically inside PL/pgSQL RPC functions.'
    )
  },
}
```

### C13. `src/services/analytics.service.ts`

Replace client-side JS aggregation loops with the `rpc_get_analytics` server-side function. The return type `AnalyticsResult` from `src/types/analytics.types.ts` must remain unchanged.

```typescript
import { supabase } from '@/config/supabase'
import type { AnalyticsResult } from '@/types/analytics.types'

export const analyticsService = {
  async getAnalytics(
    start: Date,
    end: Date,
    periodLabel: string
  ): Promise<AnalyticsResult> {
    const { data, error } = await supabase.rpc('rpc_get_analytics', {
      p_start_utc:    start.toISOString(),
      p_end_utc:      end.toISOString(),
      p_period_label: periodLabel,
    })
    if (error) throw error

    // rpc_get_analytics returns JSONB matching AnalyticsResult shape.
    // dailyTrend is computed client-side since it requires ordered label generation.
    const result = data as Omit<AnalyticsResult, 'dailyTrend' | 'yesterdayComparison'>

    return {
      ...result,
      dailyTrend: [],             // Extend rpc_get_analytics to include trend if needed
      yesterdayComparison: undefined,
    }
  },
}
```

> [!NOTE]
> `dailyTrend` is left as an empty array in this initial migration. The trend chart data can be added to `rpc_get_analytics` later or computed client-side from a separate lightweight query. This is a known deferred item, not a regression — the Admin Dashboard KPI cards work without trend data.

---

## PHASE D — REMOVE FIREBASE DEPENDENCY FROM APP BOOT

The existing `src/config/firebase.ts` checks `isFirebaseConfigured`. After migration, the app must boot from Supabase config instead.

Update `src/main.tsx` (or wherever `isFirebaseConfigured` is checked to show `ConfigErrorView`) to also accept `isSupabaseConfigured` as a valid configuration state.

```typescript
// In src/main.tsx or App.tsx — find the ConfigErrorView guard and update it:
import { isSupabaseConfigured } from '@/config/supabase'

// Replace: if (!isFirebaseConfigured) return <ConfigErrorView />
// With:    if (!isSupabaseConfigured) return <ConfigErrorView message="Supabase not configured." />
```

---

## PHASE E — TAURI 2 (WINDOWS DESKTOP)

> [!NOTE]
> Run these steps AFTER `npm run build` passes cleanly with Supabase.

### E1. Prerequisites

Ensure Rust + Cargo is installed (`rustup`). Then:

```bash
npm install --save-dev @tauri-apps/cli@^2
npm install @tauri-apps/api@^2
```

### E2. Initialize Tauri 2

```bash
npx tauri init
```

When prompted:
- **App name:** `Mr. Wash POS`
- **Window title:** `Mr. Wash POS`
- **Frontend dist dir:** `../dist`
- **Dev server URL:** `http://localhost:5173`
- **Frontend dev command:** `npm run dev`
- **Frontend build command:** `npm run build`

### E3. Configure `src-tauri/tauri.conf.json`

```json
{
  "productName": "Mr. Wash POS",
  "version": "1.0.0",
  "identifier": "com.mrwash.pos",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "title": "Mr. Wash POS",
        "width": 1280,
        "height": 800,
        "minWidth": 1024,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": ["msi", "nsis"],
    "icon": ["icons/icon.png"]
  }
}
```

### E4. Add print abstraction `src/utils/print.adapter.ts`

```typescript
/**
 * Print Adapter — abstracts browser print vs Tauri native print.
 * Extend with Tauri plugin when available.
 */
export interface PrintAdapter {
  printReceipt(content: string): Promise<void>
}

export const WebBrowserPrintAdapter: PrintAdapter = {
  async printReceipt(_content: string): Promise<void> {
    window.print()
  },
}

// Detect Tauri runtime
export function getPrintAdapter(): PrintAdapter {
  return WebBrowserPrintAdapter
}
```

### E5. Add Tauri scripts to `package.json`

```json
"tauri": "tauri",
"tauri:dev": "tauri dev",
"tauri:build": "tauri build"
```

---

## PHASE F — CAPACITOR (ANDROID)

> [!NOTE]
> Run these steps AFTER Tauri 2 integration is verified.

### F1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/android @capacitor/cli
npx cap init "Mr. Wash POS" "com.mrwash.pos" --web-dir dist
npx cap add android
```

### F2. `capacitor.config.ts`

```typescript
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.mrwash.pos',
  appName: 'Mr. Wash POS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
}

export default config
```

### F3. Add Capacitor scripts to `package.json`

```json
"cap:sync": "cap sync",
"cap:android": "cap open android"
```

### F4. `android/app/src/main/AndroidManifest.xml`

Ensure this permission exists inside `<manifest>`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

---

## PHASE G — VERIFICATION CHECKLIST

After completing all phases, run these verifications in order:

### G1. Build verification
```bash
npm run build
# Expected: 0 TypeScript errors, 0 build warnings
```

### G2. Lint verification
```bash
npm run lint
# Expected: 0 warnings, 0 errors (oxlint, 71+ files)
```

### G3. Pricing matrix verification

Create `scripts/verify-supabase-pricing.mjs` and run it with your Supabase credentials:

```js
// scripts/verify-supabase-pricing.mjs
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

const { data, error } = await supabase.from('pricing_rules').select('*').eq('is_active', true)
if (error) { console.error(error); process.exit(1) }

console.log(`Total configured rules: ${data.length}`)  // Must be 43
const zeroPrices = data.filter(r => r.price <= 0)
console.log(`Zero-price rules: ${zeroPrices.length}`)  // Must be 0

const suvRules = data.filter(r => r.category_id === 'suv')
const superbike = data.filter(r => r.category_id === 'superbike')
console.log(`SUV rules: ${suvRules.length}`)       // Must be 0
console.log(`Superbike rules: ${superbike.length}`) // Must be 0

console.log(data.length === 43 && zeroPrices.length === 0 ? '✅ PASS' : '❌ FAIL')
```

### G4. Auth flow verification

- [ ] Login with ADMIN credentials → Dashboard loads
- [ ] Login with STAFF credentials → New Transaction page loads
- [ ] Logout → Redirected to Login
- [ ] Invalid credentials → Error message shown (no crash)

### G5. Transaction flow verification

- [ ] Create new transaction → `transactionNumber` format `TRX-YYYYMMDD-XXXX` (IST date)
- [ ] Process payment (CASH) → Transaction moves to COMPLETED/PAID
- [ ] Process payment (UPI) → Requires UPI reference number if implemented
- [ ] Cancel OPEN transaction → Status changes to CANCELLED, audit log entry created
- [ ] Reverse payment (Admin) → Transaction reverts to OPEN/UNPAID, audit log entry created

### G6. Analytics verification

- [ ] Admin Dashboard KPI cards load without error
- [ ] Total Sales shows only COMPLETED + PAID transactions
- [ ] Cash/UPI breakdown matches payment records
- [ ] Date range selector changes displayed data correctly

---

## KNOWN CONSTRAINTS & DEFERRED ITEMS

| Item | Status | Notes |
|------|--------|-------|
| `dailyTrend` chart data | Deferred | Returns `[]` — extend `rpc_get_analytics` with trend SQL if needed |
| `yesterdayComparison` | Deferred | Was optional — add as separate lightweight RPC if needed |
| Tauri print plugin | Deferred | `WebBrowserPrintAdapter` calls `window.print()` as placeholder |
| Firebase Auth user migration | Manual | Export Firebase users → import to Supabase Auth via `supabase auth import` CLI command. See Supabase docs: [Migrating from Firebase Auth](https://supabase.com/docs/guides/auth/migrations/firebase) |
| Supabase Pro tier | Required for production | Free tier has 7-day inactivity pause — upgrade before going live |
| Firestore historical data | Preserved | Firebase project is never deleted. Historical Firestore data remains accessible. |

---

## HOW TO DEPLOY SUPABASE MIGRATIONS

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Or apply individually
supabase db execute --file supabase/migrations/001_initial_schema.sql
supabase db execute --file supabase/migrations/002_rls_policies.sql
supabase db execute --file supabase/migrations/003_rpc_functions.sql
supabase db execute --file supabase/migrations/004_seed_data.sql
```

---

*End of Master Migration Prompt. Total scope: Phase A (4 SQL migration files) + Phase B–C (13 service rewrites) + Phase D (app boot guard) + Phase E (Tauri 2) + Phase F (Capacitor) + Phase G (verification).*
