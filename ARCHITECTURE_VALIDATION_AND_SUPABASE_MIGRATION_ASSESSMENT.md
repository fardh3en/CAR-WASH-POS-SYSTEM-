# MR. WASH POS — ARCHITECTURE VALIDATION & FIREBASE-TO-SUPABASE MIGRATION ASSESSMENT

**Document Type:** Formal Architectural Evaluation & Migration Feasibility Study  
**Project:** Mr. Wash Car Wash Point of Sale (POS) & Business Management System  
**Date:** October 31, 2026  
**Status:** Under Review (Awaiting Stakeholder Approval)  
**Target Decision:** Evaluation of proposed *"Mr. Wash POS — Final Technology Decisions & Architecture Specification"*

---

## 1. Executive Verdict: Is the Proposed Architecture Recommended?

### **Verdict: APPROVE WITH MODIFICATIONS**

The proposed target architecture—**React 19 + TypeScript + Vite, Tailwind CSS, Tauri 2 for Windows desktop, Capacitor for Android, Supabase + PostgreSQL with Row Level Security (RLS) and stored procedures (PL/pgSQL functions)**—is **technically superior** to Cloud Firestore for the long-term future of Mr. Wash POS.

### Core Justification

1. **Relational & Financial Data**: A Point of Sale system is fundamentally a financial, relational application. Customer-vehicle relationships, standard price rules, and transaction payment lifecycles require strict relational integrity (foreign keys, check constraints, unique constraints) that Firestore cannot enforce at the database level.
2. **Server-Enforced ACID Atomicity**: In the current Firebase implementation, multi-document transactions (e.g., atomic payment completion, payment reversals, order cancellations with append-only audit logging) are orchestrated by client-side JavaScript via `runTransaction`. While hardened with complex `firestore.rules`, this places operational orchestration in the client. In PostgreSQL, these critical operations move into **`SECURITY DEFINER` stored procedures (PL/pgSQL)** with row-level locks (`SELECT FOR UPDATE`), eliminating client-side race conditions and preventing tampered client calls.
3. **Reporting & Analytics Scalability**: Under Firestore, computing daily, monthly, or yearly metrics (Total Sales, Average Transaction Value, Cash vs. UPI split) requires downloading **every single transaction document** to the client device and running JavaScript loops. In PostgreSQL, native SQL aggregates (`SELECT COUNT(*), SUM(actual_price), AVG(actual_price) ...`) execute in milliseconds on the database engine, transmitting only a lightweight JSON response to mobile devices and saving immense bandwidth.
4. **Cost & Vendor Independence**: PostgreSQL is an open standard. If Supabase is ever abandoned, the entire database schema, stored procedures, and data can be exported via standard `pg_dump` and hosted on AWS RDS, DigitalOcean, or an on-premise local server without altering business logic.

### Mandatory Modifications to the Proposed Architecture

- **Modification 1 (No Immediate Rewrite)**: Do **NOT** perform a ground-up frontend rewrite. The existing React 19 application possesses clean service abstraction (`auth.service.ts`, `transaction.service.ts`, `payment.service.ts`, etc.) spanning 10 completed phases. Migration must follow an **Incremental Service Adapter Pattern** where Supabase client adapters drop in beneath existing service signatures.
- **Modification 2 (Tauri & Capacitor Staging)**: Do **NOT** package Tauri and Capacitor simultaneously with the backend migration. The web application must first be validated against the Supabase backend in the browser before adding the native binary compilation layers.
- **Modification 3 (Edge Functions Restraint)**: Restrict Supabase Edge Functions strictly to third-party integrations requiring hidden API credentials (e.g., WhatsApp Cloud API / Meta Graph API). Core POS operations must reside in PostgreSQL functions, avoiding cold-start latency during peak car wash hours.

---

## 2. Current Repository State: What Actually Exists?

An evidence-based inspection was conducted across the active workspace (`c:\Users\ahamm\Downloads\CAR WASH POS`):

### A. Repository Health & Verification Checks
- **Git Branch**: `before-ecc` (HEAD at commit `758a6c1`: *"docs: update README with Phase 1-10 implementation status, architecture, and business rules"*).
- **TypeScript**: `tsc -b` completed with **0 errors**.
- **Linter**: `oxlint` completed on 71 files with 104 rules in 12ms with **0 errors and 0 warnings**.
- **Production Build**: `vite build` completed in 783ms, generating production assets in `dist/`.
- **Automated Tests**: No Jest/Vitest unit test runner is currently installed in `package.json`. Verification has historically relied on TypeScript strict type-checking, linter validation, and standalone Node.js verification scripts (e.g., `scripts/verify-pricing.mjs`).

### B. Dependency & Technology Stack
- **React**: `19.2.8` (React 19 with React DOM `19.2.8`)
- **TypeScript**: `~6.0.2`
- **Vite**: `8.2.0` with `@vitejs/plugin-react` `6.0.4`
- **Tailwind CSS**: `4.3.3` (Tailwind v4 with `@tailwindcss/vite`)
- **Router**: `react-router-dom` `7.18.2`
- **Database/Auth**: `firebase` `12.17.1` (Firestore + Firebase Auth)
- **Visualizations**: `recharts` `3.10.1`
- **Excel Export Engine**: `xlsx` `0.18.5` (SheetJS)
- **Icons**: `lucide-react` `1.30.0`

### C. End-to-End Tracing of Critical Operations

| Business Operation | UI Entry Point | Service Implementation | Database Reads/Writes | Security Enforcement | Audit Behavior |
|:---|:---|:---|:---|:---|:---|
| **Staff Login** | `src/pages/auth/LoginPage.tsx` | `auth.service.ts` (`signInWithEmail`) | Reads `users/{uid}` document | Firebase Auth + `users` security rule | N/A |
| **Vehicle Registration** | `src/components/vehicle/VehicleForm.tsx` | `vehicle.service.ts` (`findOrCreateVehicle`) | Queries `vehicles` by `registrationNumber`, writes if new | `isActiveUser()` rule | N/A |
| **Pricing Lookup** | `src/components/service/ServiceSelector.tsx` | `pricing.service.ts` (`getStandardPriceRule`) | Reads `pricingRules/{cat_var_pkg}` | `isActiveUser()` rule; returns `null` for 14 unavailable combinations | Client-side Negotiated Price exception reason capture |
| **Order Creation** | `src/pages/staff/NewTransactionPage.tsx` | `transaction.service.ts` (`createTransaction`) | Atomic `runTransaction`: increments `transactionCounters/{YYYYMMDD}`, writes `transactions/{id}` with 5 immutable snapshots | `isActiveUser()` rule; counter format `TRX-YYYYMMDD-XXXX` | Snapshots frozen at write |
| **Payment Completion** | `src/components/payment/PaymentModal.tsx` | `payment.service.ts` (`recordPayment`) | Atomic `runTransaction`: writes `payments/{id}`, updates `transactions/{id}` to `COMPLETED` + `PAID` | Field-diff rule in `firestore.rules` checks amount matches `pricingSnapshot.actualPrice` | Embedded payment timestamps and cashier UID |
| **Admin Payment Reversal** | `src/pages/admin/TransactionsPage.tsx` | `payment.service.ts` (`reversePayment`) | Atomic `runTransaction`: updates `payments/{id}` (`isReversed=true`), reverts `transactions/{id}` (`OPEN`), writes `auditLogs/{id}` | `isAdmin()` rule checks admin credentials and role | Atomically writes `PAYMENT_REVERSED` with admin name & reason |
| **Order Cancellation** | `src/pages/staff/HistoryPage.tsx` | `transaction.service.ts` (`cancelTransaction`) | Atomic `runTransaction`: updates `transactions/{id}` (`CANCELLED`), writes `auditLogs/{id}` | Field-diff rule allows only `status`, `cancellationReason`, `updatedAt` | Atomically writes `TRANSACTION_CANCELLED` with staff name & reason |
| **Standard Price Mutation** | `src/pages/admin/PricingPage.tsx` | `pricing.service.ts` (`setStandardPriceRule`) | Atomic `runTransaction`: writes `pricingRules/{id}`, writes `auditLogs/{id}` | `isAdmin()` rule | Atomically writes `PRICE_CHANGED` with old/new price |
| **Business Analytics** | `src/pages/admin/DashboardPage.tsx` | `analytics.service.ts` (`getAnalytics`) | Reads all `transactions` in IST window where `status == 'COMPLETED'` | Client-side double guard `paymentStatus === 'PAID'` | Zero hourly tracking; day-over-day IST comparison |
| **Excel Export** | `src/pages/admin/ReportsPage.tsx` | `excel.service.ts` (`exportSalesReport`) | Client-side memory parsing into binary `.xlsx` via SheetJS | Accessible only in Admin hub | Generates Executive Summary & Transaction audit sheets |

---

## 3. Conflicts with Project Documentation

An exhaustive cross-examination of the repository's foundational documents reveals specific governance agreements and architectural boundaries:

### A. Document Hierarchy
Per `1_PROJECT CONSTITUTION.md` §1 and `04_ DEVELOPMENT PLAN.md` §3:
1. `1_PROJECT CONSTITUTION.md` (Highest authority)
2. `2_BUSINESS SPECIFICATION.md`
3. `3_SYSTEM ARCHITECTURE.md`
4. `04_ DEVELOPMENT PLAN.md`
5. Implementation instructions

### B. Identified Conflicts & Governance Status

1. **Backend Technology Conflict**:
   - `1_PROJECT CONSTITUTION.md` §15 explicitly specified: *Firebase Authentication, Cloud Firestore, Cloud Functions, Firebase Storage, Firebase Hosting*.
   - However, `3_SYSTEM ARCHITECTURE.md` §1524 intentionally stated: *"It defines how we think about the business data and its relationships, but we still won't lock in Firestore/SQL/etc. yet."*
   - Furthermore, Constitution §15 provides an adoption escape clause: *"Additional technologies may be adopted when they provide measurable business value without compromising maintainability."*
   - **Resolution**: Adopting Supabase/PostgreSQL is **permissible under the Constitution**, but because Constitution §15 explicitly named Firebase, a formal **Architecture Change Record (ACR)** is mandatory before altering production infrastructure.

2. **Target Platform Alignment**:
   - Constitution §1 & §7: *"Staff Interface – Mobile First; Admin Interface – Desktop First with Mobile Compatibility."*
   - The proposed Tauri (Windows) + Capacitor (Android) architecture **directly satisfies** this constitutional requirement, formalizing mobile-first staff operations and desktop-first admin management into native binaries instead of relying strictly on mobile web browsers.

3. **Strict Terminology & Business Boundaries (Must Be Preserved)**:
   - Prohibited terms: **"Discount"** (must use *Price Adjustment*), **"Revenue / Profit"** (must use *Total Sales*).
   - Vehicle Classifications: Strictly the 15 approved Mr. Wash categories. No "Luxury" category or invented classifications.
   - Pricing Rules: Exactly **43 configured combinations** and **14 unavailable combinations** (`—`). SUV and Superbike have zero rules configured. No ₹0 rules.
   - Scope Exclusions: No hourly charts, no bay volume, no worker tracking.

---

## 4. Firebase versus Supabase: Technical Comparison

| Evaluation Area | Firebase (Current Implementation) | Supabase / PostgreSQL (Proposed Architecture) | Architectural Impact on Mr. Wash POS |
|:---|:---|:---|:---|
| **Relational Business Data** | Document store. No foreign key constraints. Relational integrity maintained exclusively by client-side code. | Relational database. Native foreign keys (`ON DELETE RESTRICT`), unique constraints, check constraints. | **Major Advantage Supabase**: Prevents orphaned vehicles or transactions with deleted categories. |
| **Customer & Vehicle Links** | Soft IDs stored as string attributes. Multiple reads required to resolve relationships. | Relational `customers.id = vehicles.customer_id` with foreign key indexes. | **Major Advantage Supabase**: Clean 1-to-many relationship with enforced data consistency. |
| **Transaction Integrity** | Optimistic Concurrency Control (OCC). Fails and retries if documents mutate concurrently. Max 500 writes. | True ACID transactions with pessimistic row-level locking (`SELECT ... FOR UPDATE`). | **Major Advantage Supabase**: Guarantees zero duplicate payment submissions or race conditions during bay rush hours. |
| **Atomic Payment Operations** | Handled via client-orchestrated Firestore `runTransaction`. Complex field-diff security rules. | Handled via server-side PL/pgSQL function (`rpc_complete_payment`). Client never touches transaction state directly. | **Major Advantage Supabase**: Eliminates client trust and complex cross-document security rules. |
| **Historical Snapshots** | Native fit. Embeds `vehicleSnapshot`, `pricingSnapshot`, etc. directly inside document. | Stored as native `JSONB` columns or denormalized table attributes. | **Tie**: Both approaches preserve 100% snapshot immutability cleanly. |
| **Audit Logging** | Append-only `auditLogs` collection written within Firestore `runTransaction`. | Stored in append-only table. Can be enforced via PL/pgSQL trigger or inside stored procedures. | **Major Advantage Supabase**: Database triggers guarantee an audit row is written even if client code is bypassed. |
| **Role-Based Authorization** | Custom claims or reading `users/{uid}` in security rules. Incurs Firestore document read costs. | Native PostgreSQL Row Level Security (RLS) reading `auth.uid()` and cached JWT claims. | **Major Advantage Supabase**: Zero database read penalty for evaluating authorization policies. |
| **Database Security** | Declarative `firestore.rules`. Cross-document checks are cumbersome and hard to test locally. | Declarative PostgreSQL RLS policies + `SECURITY DEFINER` stored procedures. Testable via `pgTAP`. | **Major Advantage Supabase**: Enterprise-grade security enforced at the SQL engine level. |
| **Reporting & Analytics** | Must fetch all completed transaction documents over network to client memory. Aggregations run in JS. | Native SQL queries (`SUM`, `AVG`, `COUNT`, `DATE_TRUNC`). Aggregation runs inside engine in milliseconds. | **Decisive Advantage Supabase**: Reduces mobile data transfer by >98% for annual and monthly reports. |
| **Data Querying** | Severely limited. No multi-field range filters without composite indexes. No `LIKE` or joins. | Full SQL power: arbitrary joins, window functions, ILIKE search, subqueries. | **Major Advantage Supabase**: Allows flexible operational reporting without custom composite index provisioning. |
| **Backup and Restoration** | GCP Cloud Backup. Difficult to inspect or restore to a local development machine. | Standard `pg_dump` and `pg_restore`. Industry-standard, portable, human-readable SQL. | **Decisive Advantage Supabase**: Enables complete database restoration in minutes on any PostgreSQL server. |
| **Android Integration** | Firebase Web SDK running inside WebView. Session management relies on IndexedDB. | Supabase JS client inside Capacitor. Compatible with native secure storage adapters. | **Tie**: Both operate reliably inside modern Android WebViews. |
| **Windows Desktop Integration** | Web SDK inside browser or Electron. High memory footprint if wrapped with Electron. | Supabase JS client inside Tauri 2 (WebView2). Ultra-lightweight binary (~15MB, ~40MB RAM). | **Major Advantage Supabase + Tauri**: High performance on budget counter PCs. |
| **Future Web Deployment** | Deployed to Firebase Hosting. | Standard static web hosting (Vercel, Cloudflare Pages, Netlify) talking to Supabase REST API. | **Tie**: Both support zero-configuration static web deployment. |
| **Operational Cost** | Pay-per-read/write. Free tier is generous, but analytics scans increase read billing as history grows. | Free tier: 500MB DB, 50k MAU. Pro tier: $25/mo flat with automated daily backups. | **Advantage Supabase**: Predictable flat cost unaffected by analytical query volume. |
| **Vendor Dependency** | Proprietary Google Cloud API. Cannot be self-hosted. Migration away requires full rewrite. | Open-source PostgreSQL. Can be self-hosted on a local mini-PC or any cloud VPS at zero license cost. | **Decisive Advantage Supabase**: Complete data and operational sovereignty. |
| **Maintenance Complexity** | Low initial maintenance, but high maintenance for complex security rules and aggregations. | Moderate initial SQL setup; near-zero long-term maintenance once schema and RLS stabilize. | **Advantage Supabase**: Mature, standard relational tooling familiar to all backend engineers. |
| **Long-Term Scalability** | Requires external aggregation pipelines or BigQuery exports for multi-branch reporting. | PostgreSQL handles multi-tenant schemas, connection pooling, and multi-branch rollups natively. | **Decisive Advantage Supabase**: Built-in foundation for multi-branch expansion. |

### Answers to Mandatory Technical Questions:
1. **Does PostgreSQL offer a meaningful advantage for relational/financial data?**  
   **Yes.** Financial ledgers, payment balancing, sequential ticket counters, and audit logs require relational consistency and ACID transactions that Firestore cannot enforce natively.
2. **Can the existing Firestore implementation meet business requirements reliably?**  
   **Yes, for single-bay MVP operations.** The Phase 1-10 implementation is functional and hardened. However, it will experience performance degradation and cost escalation when historical records grow into tens of thousands of transactions.
3. **Is a full backend migration justified by measurable technical benefits?**  
   **Yes**, provided it is executed safely through an incremental service adapter approach. The performance gains in analytics, data portability, and server-side payment atomicity justify the transition.
4. **Would retaining Firebase create meaningful long-term limitations?**  
   **Yes.** Specifically: lack of server-side data aggregation, vendor lock-in, and the inability to run lightweight desktop binaries with local SQL fallback.
5. **Does migration introduce risks greater than benefits?**  
   **No**, because the application's domain logic is already cleanly decoupled in TypeScript services. As long as Firebase remains running during development, migration risk is minimal.
6. **Is a practical hybrid architecture worth considering?**  
   **No.** Running Firebase Auth alongside Supabase DB introduces split-brain authentication, token synchronization failures, and dual vendor costs. A clean, single backend is required.
7. **What would you choose if responsible for this application for the next 5 years?**  
   **Supabase + PostgreSQL.** It guarantees complete vendor independence, rock-solid financial consistency, and native SQL analytical power.

---

## 5. Recommended Target Architecture

### A. Architectural Topology

```text
[ Windows Desktop Counter ]       [ Staff Android Handheld ]       [ Web Browser Hub ]
   (Tauri 2 · WebView2)            (Capacitor · Android View)      (Cloudflare Pages / Vercel)
            │                                 │                                │
            └─────────────────────────────────┼────────────────────────────────┘
                                              ▼
                    [ Client Service Layer (Shared React 19 Frontend) ]
                       auth.service · transaction.service · payment.service
                       pricing.service · analytics.service · audit.service
                                              │
                    ┌─────────────────────────┴────────────────────────┐
                    ▼                                                  ▼
     [ Supabase Auth (JWT / Roles) ]                 [ PostgREST API / PostgreSQL 16+ ]
                    │                                                  │
                    │               ┌──────────────────────────────────┤
                    ▼               ▼                                  ▼
         [ Row Level Security ]  [ PL/pgSQL Stored Procedures ]  [ Relational Engine ]
         (User Role Policies)    (rpc_complete_payment, etc.)   (Tables, JSONB Snapshots)
```

---

## 6. Database and Security Design

### A. Normalized PostgreSQL Relational Schema

```sql
-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. VEHICLE CATEGORIES (15 Mr. Wash Classifications)
CREATE TABLE public.vehicle_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    variants JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SERVICE PACKAGES (Body Wash, Body & Vacuum, Full Wash)
CREATE TABLE public.service_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    activities JSONB NOT NULL DEFAULT '[]'::jsonb,
    display_order INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRICING RULES (43 Configured Combinations)
CREATE TABLE public.pricing_rules (
    id TEXT PRIMARY KEY, -- e.g. 'hatchback_car_body_wash' or 'traveller_10_seat_full_wash'
    category_id TEXT NOT NULL REFERENCES public.vehicle_categories(id) ON DELETE RESTRICT,
    service_package_id TEXT NOT NULL REFERENCES public.service_packages(id) ON DELETE RESTRICT,
    variant TEXT,
    price INT NOT NULL CHECK (price > 0), -- Whole rupees only
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_pricing_combination UNIQUE (category_id, service_package_id, variant)
);

-- 5. CUSTOMERS (Optional Name & Phone)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. VEHICLES (Primary Operational Entity)
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT NOT NULL UNIQUE, -- Normalized uppercase e.g. 'KL01AB1234'
    display_registration_number TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.vehicle_categories(id) ON DELETE RESTRICT,
    variant TEXT,
    model TEXT,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TRANSACTION COUNTERS (Concurrency-Safe IST Sequence)
CREATE TABLE public.transaction_counters (
    date_key TEXT PRIMARY KEY, -- YYYYMMDD in Asia/Kolkata
    last_sequence INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TRANSACTIONS (Authoritative Business Ledger)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number TEXT NOT NULL UNIQUE, -- 'TRX-YYYYMMDD-XXXX'
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'CANCELLED', 'COMPLETED')),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('UNPAID', 'PAID')),
    payment_method TEXT CHECK (payment_method IN ('CASH', 'UPI')),
    paid_amount INT NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    paid_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by_user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    
    -- 100% Immutable Historical Snapshots (Phase 5 Governance)
    vehicle_snapshot JSONB NOT NULL,
    customer_snapshot JSONB NOT NULL,
    service_package_snapshot JSONB NOT NULL,
    pricing_snapshot JSONB NOT NULL,
    staff_snapshot JSONB NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PAYMENTS (Independent Payment Ledger)
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE RESTRICT,
    transaction_number TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'UPI')),
    amount INT NOT NULL CHECK (amount > 0),
    is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
    reversal_reason TEXT,
    reversed_at TIMESTAMPTZ,
    reversed_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    received_by_staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AUDIT LOGS (Append-Only Governance Trail)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'TRANSACTION_CANCELLED',
        'PAYMENT_REVERSED',
        'PRICE_CHANGED',
        'SERVICE_CONFIGURATION_CHANGED'
    )),
    target_document_id TEXT NOT NULL,
    target_reference TEXT NOT NULL,
    performed_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    performed_by_user_name TEXT NOT NULL,
    performed_by_user_role TEXT NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. INDEXES FOR HIGH-SPEED OPERATIONAL QUERIES
CREATE INDEX idx_transactions_status_created ON public.transactions(status, created_at DESC);
CREATE INDEX idx_transactions_reg_number ON public.transactions((vehicle_snapshot->>'registrationNumber'));
CREATE INDEX idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type, created_at DESC);
CREATE INDEX idx_vehicles_reg_normalized ON public.vehicles(registration_number);
```

### B. PostgreSQL Row Level Security (RLS) Strategy

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is user active admin?
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'ADMIN' AND is_active = TRUE
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: Is user active staff or admin?
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND is_active = TRUE
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read own profile; Admin can read and manage all
CREATE POLICY profiles_read ON public.profiles FOR SELECT USING (id = auth.uid() OR is_active_admin());
CREATE POLICY profiles_admin_update ON public.profiles FOR UPDATE USING (is_active_admin());

-- Catalog (Categories, Packages, Rules): Read by all active users; Mutated only by Admin
CREATE POLICY catalog_read ON public.vehicle_categories FOR SELECT USING (is_active_user());
CREATE POLICY catalog_write ON public.vehicle_categories FOR ALL USING (is_active_admin());

CREATE POLICY packages_read ON public.service_packages FOR SELECT USING (is_active_user());
CREATE POLICY packages_write ON public.service_packages FOR ALL USING (is_active_admin());

CREATE POLICY pricing_read ON public.pricing_rules FOR SELECT USING (is_active_user());
CREATE POLICY pricing_write ON public.pricing_rules FOR ALL USING (is_active_admin());

-- Customers & Vehicles: Read and write by any active user; Deletion forbidden
CREATE POLICY customers_read ON public.customers FOR SELECT USING (is_active_user());
CREATE POLICY customers_insert ON public.customers FOR INSERT WITH CHECK (is_active_user());
CREATE POLICY customers_update ON public.customers FOR UPDATE USING (is_active_user());

CREATE POLICY vehicles_read ON public.vehicles FOR SELECT USING (is_active_user());
CREATE POLICY vehicles_insert ON public.vehicles FOR INSERT WITH CHECK (is_active_user());
CREATE POLICY vehicles_update ON public.vehicles FOR UPDATE USING (is_active_user());

-- Transactions & Payments: Read by active users; Mutations executed through Stored Procedures
CREATE POLICY transactions_read ON public.transactions FOR SELECT USING (is_active_user());
CREATE POLICY payments_read ON public.payments FOR SELECT USING (is_active_user());

-- Audit Logs: Read exclusively by Admin; Inserts via authenticated user; Updates and Deletes prohibited
CREATE POLICY audit_logs_admin_read ON public.audit_logs FOR SELECT USING (is_active_admin());
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT WITH CHECK (is_active_user());
-- Notice: No UPDATE or DELETE policies created = HARD DATABASE IMMUTABILITY.
```

### C. Server-Side Atomic Stored Procedure (Example: Atomic Payment Completion)

```sql
CREATE OR REPLACE FUNCTION public.rpc_complete_transaction_payment(
    p_transaction_id UUID,
    p_payment_method TEXT,
    p_amount INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx public.transactions%ROWTYPE;
    v_staff_id UUID := auth.uid();
    v_staff_name TEXT;
    v_staff_role TEXT;
    v_actual_price INT;
BEGIN
    -- 1. Security Check
    SELECT display_name, role INTO v_staff_name, v_staff_role
    FROM public.profiles WHERE id = v_staff_id AND is_active = TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unauthorized: Active user session required';
    END IF;

    -- 2. Pessimistic Row Lock (Concurrency Protection)
    SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction not found';
    END IF;

    -- 3. State Validation
    IF v_tx.status != 'OPEN' OR v_tx.payment_status != 'UNPAID' THEN
        RAISE EXCEPTION 'Invalid transaction state: Order is already % (%)', v_tx.status, v_tx.payment_status;
    END IF;

    -- 4. Pricing Validation against Immutable Snapshot
    v_actual_price := (v_tx.pricing_snapshot->>'actualPrice')::INT;
    IF p_amount != v_actual_price THEN
        RAISE EXCEPTION 'Payment amount (₹%) does not match order actual price (₹%)', p_amount, v_actual_price;
    END IF;

    -- 5. Atomic Update
    UPDATE public.transactions
    SET status = 'COMPLETED',
        payment_status = 'PAID',
        payment_method = p_payment_method,
        paid_amount = p_amount,
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = p_transaction_id;

    -- 6. Insert Payment Record
    INSERT INTO public.payments (
        transaction_id, transaction_number, payment_method, amount, received_by_staff_id, received_at
    ) VALUES (
        p_transaction_id, v_tx.transaction_number, p_payment_method, p_amount, v_staff_id, NOW()
    );

    RETURN jsonb_build_object('success', true, 'transactionNumber', v_tx.transaction_number);
END;
$$;
```

---

## 7. Migration Feasibility and Risks

### A. Source Inventory & Field Mapping

| Firestore Collection | Target PostgreSQL Table | Transformation / Mapping Notes |
|:---|:---|:---|
| `users` | `profiles` | Document ID maps to `auth.users(id)`. Attributes: `email`, `displayName` &rarr; `display_name`, `role`, `isActive` &rarr; `is_active`. |
| `vehicleCategories` | `vehicle_categories` | Document ID &rarr; `id`. Name &rarr; `name`, `displayOrder` &rarr; `display_order`, `variants` (array) &rarr; `variants` (`JSONB`). |
| `servicePackages` | `service_packages` | Document ID &rarr; `id`. Name &rarr; `name`, `activities` (array) &rarr; `activities` (`JSONB`). |
| `pricingRules` | `pricing_rules` | Document ID &rarr; `id`. `categoryId` &rarr; `category_id`, `servicePackageId` &rarr; `service_package_id`, `price` (integer INR). |
| `customers` | `customers` | Document ID &rarr; `id` (UUID). `name`, `phoneNumber` &rarr; `phone_number`. |
| `vehicles` | `vehicles` | Document ID &rarr; `id`. `registrationNumber` &rarr; `registration_number` (uppercase normalized), `customerId` &rarr; `customer_id`. |
| `transactionCounters` | `transaction_counters` | Document ID (`YYYYMMDD`) &rarr; `date_key`, `count` &rarr; `last_sequence`. |
| `transactions` | `transactions` | Document ID &rarr; `id`. Status, snapshots (`vehicleSnapshot`, `pricingSnapshot`, etc.) mapped directly to `JSONB` columns preserving 100% snapshot keys. |
| `payments` | `payments` | Document ID &rarr; `id`. Foreign key link to `transactions(id)`. Attributes: `amount`, `paymentMethod`, `isReversed`. |
| `auditLogs` | `audit_logs` | Document ID &rarr; `id`. `eventType`, `targetDocumentId`, `performedByUserId`, `metadata` (`JSONB`). |

### B. Authentication Transition
- **Limitation**: Firebase passwords cannot be exported in plaintext. Firebase Auth uses a modified Scrypt hash algorithm (`base64_signer_key`, `base64_salt_separator`, `rounds`, `mem_cost`).
- **Feasible Solution**: Supabase Auth supports importing Firebase Scrypt hashes via the Supabase Management API / CLI user import with `password_hash` and hash parameters.
- **Fail-safe Alternative**: For small operations (~5-10 staff/admins), the Administrator can bulk-invite or set temporary passwords for staff during the scheduled maintenance window.

### C. Cutover & Rollback Strategy
1. **Maintenance Window**: 2-hour scheduled window on a Tuesday night (lowest car wash transaction volume).
2. **Extraction & Seeding**:
   - Run Node.js migration export script against Firestore.
   - Run PostgreSQL import script with referential integrity verification.
   - Run automated reconciliation: `COUNT(Firestore.transactions) == COUNT(PostgreSQL.transactions)` and `SUM(Firestore.paidAmount) == SUM(PostgreSQL.paid_amount)`.
3. **Rollback Plan**:
   - The Firebase project is **NEVER deleted or disabled** during migration.
   - The React frontend utilizes an environment switch: `VITE_BACKEND_PROVIDER=SUPABASE` vs `VITE_BACKEND_PROVIDER=FIREBASE`.
   - If cutover encounters unexpected blockers within 45 minutes, revert `VITE_BACKEND_PROVIDER=FIREBASE` and restart the client. Zero data loss.

---

## 8. Windows and Android Feasibility

### A. Windows Desktop via Tauri 2
- **Engine**: Uses Microsoft Edge WebView2 (pre-installed on Windows 10/11).
- **Binary Footprint**: Installer size ~12-15 MB (compared to Electron's 150 MB+).
- **RAM Consumption**: 35-50 MB (Electron typically uses 200-350 MB).
- **Thermal Receipt Printing**: Tauri 2 provides direct access to Windows spooler printers (`winspool.drv`) and serial/USB ports via Rust plugins (`tauri-plugin-printer` or native ESC/POS commands), enabling fast 58mm/80mm receipt printing without browser print dialogs.

### B. Android via Capacitor
- **Engine**: Uses native Android WebView (Chromium-based).
- **Capabilities**: Zero changes required for React 19 UI components. Supports Bluetooth/USB thermal printer plugins (`@capacitor-community/bluetooth-le`) for portable staff handhelds.
- **Security**: Auth tokens stored in Android EncryptedSharedPreferences via Capacitor Secure Storage plugin rather than unencrypted browser localStorage.

### C. Printing Hardware Abstraction
Because hardware has not yet been procured:
1. **Preserve Current Web Print Engine**: The current `@media print` CSS engine in `src/components/receipt/ReceiptView.tsx` remains the universal default.
2. **Printer Adapter Interface**:
   ```typescript
   export interface ReceiptPrinterAdapter {
     printReceipt(data: ReceiptPrintPayload): Promise<{ success: boolean; error?: string }>
   }
   ```
   - `WebBrowserPrintAdapter` (calls `window.print()`)
   - `TauriRawPrintAdapter` (future ESC/POS direct USB spooler)
   - `CapacitorBluetoothPrintAdapter` (future ESC/POS Bluetooth)

---

## 9. Cost, Backup and Operational Considerations

| Operational Dimension | Supabase Free Tier | Supabase Pro Tier ($25 / month) | Local Self-Hosted Fallback |
|:---|:---|:---|:---|
| **Database Storage** | 500 MB (sufficient for ~300,000 car wash transactions) | 8 GB included | Unlimited (Host Disk) |
| **Active Users (MAU)** | 50,000 MAU | 100,000 MAU | Unlimited |
| **Inactivity Policy** | **Pauses after 7 days of inactivity** (High operational risk if shop closes for vacation) | **No pausing ever** | No pausing ever |
| **Automated Backups** | None included | Daily automated backups with 7-day retention | Custom cron `pg_dump` |
| **Point-in-Time Recovery** | Not available | Available (optional add-on) | Available via WAL-G / Barman |
| **Recommended Verdict** | Development & Staging only | **Mandatory for Production** | Disaster recovery standby |

### Independent Production Backup Strategy (Non-Negotiable)
Even with Supabase Pro, an automated off-site backup pipeline must be deployed:
- **Daily Automated Backup**: GitHub Actions scheduled cron running `pg_dump --format=custom` daily at 02:00 IST.
- **Encrypted Off-Site Storage**: Compressed `.dump` file encrypted with GPG and uploaded to an independent AWS S3 / Cloudflare R2 bucket.
- **RPO (Recovery Point Objective)**: 24 hours.
- **RTO (Recovery Time Objective)**: < 30 minutes (tested restore command: `pg_restore -d new_db backup.dump`).

---

## 10. Testing and Acceptance Criteria

Before any production cutover to Supabase is authorized, the following automated verification suite must achieve a **100% pass rate**:

1. **Pricing Matrix Parity (57 Combinations)**:
   - All 43 official Mr. Wash prices configured correctly (> ₹0).
   - All 14 unavailable combinations (`—`) rejected with `Service Unavailable` error.
   - Confirmation that SUV (3 packages) and Superbike (3 packages) remain unconfigured.
2. **Snapshot Immutability Test**:
   - Modify a customer's phone number or vehicle category in their master records.
   - Assert that completed historical transactions retain their original snapshot attributes without mutation.
3. **Financial Integrity & Double-Submission Test**:
   - Execute 5 concurrent `rpc_complete_transaction_payment` requests for the same order.
   - Assert that exactly **1** payment succeeds, **4** are rejected by row-level lock, and the ledger balances.
4. **Reversal Audit Test**:
   - Execute payment reversal as Staff &rarr; Assert database rejection (403 Forbidden).
   - Execute payment reversal as Admin &rarr; Assert payment marked `is_reversed=true`, order marked `OPEN`, and `PAYMENT_REVERSED` written to `audit_logs`.
5. **IST Date Boundary Test**:
   - Query daily analytics across midnight IST boundary &rarr; Assert calendar accuracy matching UTC+5:30.
6. **Data Reconciliation**:
   - `SELECT COUNT(*) FROM firestore_export` == `SELECT COUNT(*) FROM supabase_transactions`.
   - `SELECT SUM(paid_amount) FROM firestore_export` == `SELECT SUM(paid_amount) FROM supabase_transactions`.

---

## 11. Architecture Decisions Requiring Approval

The following four specific decisions require formal stakeholder sign-off before proceeding:

1. **Decision 1: Adopt Supabase + PostgreSQL as the Authoritative Production Backend**  
   *Requires approving a formal Architecture Change Record (ACR) to revise Constitution §15.*
2. **Decision 2: Authorize Supabase Pro ($25/mo / ~₹2,100/mo)**  
   *Necessary to prevent the 7-day inactivity pause of the Free Tier and provide daily managed database backups.*
3. **Decision 3: Retain the Existing React 19 Frontend via an Adapter Pattern**  
   *Approve maintaining the current React 19 codebase and swapping service internals, rejecting any total frontend rewrite.*
4. **Decision 4: Stage Tauri 2 and Capacitor Packaging as Post-Migration Steps**  
   *Validate the web app with Supabase first, before building desktop and Android binary installers.*

---

## 12. Recommended Next Step

### **Safest Next Action:**
**Do NOT touch the existing codebase or modify Firebase infrastructure.**  
Review and formally sign off on the **Architecture Decisions Requiring Approval** above. 

Upon your approval, we will prepare:
1. The formal **Architecture Change Record (ACR)** documenting the revision to Constitution §15.
2. The **PostgreSQL migration schema and PL/pgSQL function scripts** in an isolated `supabase/` directory without altering existing Firebase services.
