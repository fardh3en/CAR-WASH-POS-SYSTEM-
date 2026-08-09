# Mr. Wash POS

> Car Wash Point of Sale (POS) & Business Management Platform

## Project Overview

Mr. Wash POS is a modern, high-performance web application designed to streamline customer registration, service selection, billing, payment recording, digital receipts, business analytics, Excel reporting, and audit logging for car wash operations.

- **Staff Interface**: Mobile-first, optimized for speed and operational efficiency
- **Admin Interface**: Desktop-first, optimized for business analytics, pricing management, reports, and audit logging

---

## Approved Governance & Design Specifications

The four authoritative project documents located in the repository root govern all development:

1. [`1_PROJECT CONSTITUTION.md`](./1_PROJECT%20CONSTITUTION.md) &mdash; Foundational governance & product philosophy
2. [`2_BUSINESS SPECIFICATION.md`](./2_BUSINESS%20SPECIFICATION.md) &mdash; Operational workflows & business rules
3. [`3_SYSTEM ARCHITECTURE.md`](./3_SYSTEM%20ARCHITECTURE.md) &mdash; Logical system architecture & domain models
4. [`04_ DEVELOPMENT PLAN.md`](./04_%20DEVELOPMENT%20PLAN.md) &mdash; 12-phase technical implementation plan

---

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + shadcn/ui design tokens
- **Routing**: React Router v7
- **Analytics & Visualizations**: Recharts v3
- **Spreadsheet Engine**: SheetJS (`xlsx` v0.18)
- **Backend & Database**: Firebase Authentication, Cloud Firestore (with composite indexing & hardened security rules)
- **Icons**: Lucide React
- **Locale & Timezone**: Asia/Kolkata (`INR ₹`, IST UTC+5:30)

---

## Project Implementation Status

- [x] **Phase 1 — Project Foundation**: Core architecture, UI framework, router setup, and design system.
- [x] **Phase 2 — Authentication & Roles**: Firebase Auth, `AuthContext`, `ProtectedRoute`, `RoleGuard` (`ADMIN` / `STAFF`), role-based navigation layouts.
- [x] **Phase 3 — Vehicle & Customer Foundation**: Vehicle registration normalization (`KL01AB1234`), optional customer phone/name registration.
- [x] **Phase 4 — Services & Pricing**: Standard service packages (Body Wash, Body & Vacuum, Full Wash), category/variant standard pricing matrix.
- [x] **Phase 5 — Transaction Workflow**: Immutable transaction snapshots (`vehicleSnapshot`, `customerSnapshot`, `servicePackageSnapshot`, `pricingSnapshot`, `staffSnapshot`), concurrency-safe counter (`TRX-YYYYMMDD-XXXX`), order status lifecycle (`OPEN`, `CANCELLED`).
- [x] **Phase 6 — Payment & Completion**: `CASH` and `UPI` payment processing, atomic completion (`COMPLETED`, `PAID`), atomic Admin payment reversals via single Firestore `runTransaction`.
- [x] **Phase 7 — Digital Receipts & WhatsApp E-Billing**: Printable thermal/A4 receipt views (`ReceiptView`), `@media print` CSS, client-side `wa.me` deep links, Indian phone validation (`DDDDD-DDDDD`).
- [x] **Phase 8 — Admin Dashboard & Analytics**: Client-side metric engine, IST calendar period boundaries (Today/Week/Month/Year/Custom), Recharts daily sales trend, payment split, deduplicated vehicle return lookups.
- [x] **Phase 9 — Excel Reporting**: Client-side native binary `.xlsx` export engine, `Executive Summary` & `Transaction Details` worksheets, combined multi-filters, sales-only vs operational audit exports.
- [x] **Phase 10 — Exceptions, Corrections & Audit**: Append-only `auditLogs` collection, identity-verified security rules, 100% atomic audit logging for all 4 mutation paths (`TRANSACTION_CANCELLED`, `PAYMENT_REVERSED`, `PRICE_CHANGED`, `SERVICE_CONFIGURATION_CHANGED`), Admin Audit Viewer (`/admin/audit`).
- [ ] **Phase 11 — Responsive UI Refinement**: *Next Phase*
- [ ] **Phase 12 — Testing, Security & Production Readiness**: *Future Phase*

---

## Key Business Rules & Terminology Enforcement

Throughout the platform, the following governance rules are strictly enforced:

| Rule Category | Approved Standard | Prohibited / Non-Compliant |
|:---|:---|:---|
| **Price Adjustment** | Standard Price, Actual Price, Price Adjustment, Adjustment Reason | ~~Discount~~, ~~Discount Reason~~ |
| **Sales Revenue** | Total Sales | ~~Revenue~~, ~~Profit~~ (requires expense data) |
| **Payment Methods** | `CASH`, `UPI` | ~~Card~~, ~~Wallet~~, ~~Credit~~ |
| **Vehicle Registration** | Core operational identifier (uppercase normalized, e.g. `KL01AB1234`) | Generic string without format validation |
| **Snapshot Integrity** | Snapshots stored in transaction docs are 100% immutable | Retroactive modification of historical transaction snapshots |

---

## Getting Started

### Prerequisites

- Node.js `v20+` or `v24+`
- npm `v10+` or `v12+`

### Installation

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### Environment Configuration

Copy `.env.example` to `.env.local` and add your Firebase credentials:

```bash
cp .env.example .env.local
```

`.env.local` is ignored by Git and will not be committed.

---

## First-Admin Bootstrap Process

1. **Firebase Authentication Setup**:
   Create the primary Administrator identity directly within the Firebase Console (Authentication section) or via Firebase CLI / Admin SDK. No public registration route exists.

2. **Firestore Profile Document Creation**:
   Create the matching document in Cloud Firestore at `users/{FIREBASE_AUTH_UID}`:
   ```json
   {
     "uid": "FIREBASE_AUTH_UID",
     "email": "admin@mrwash.com",
     "displayName": "System Administrator",
     "role": "ADMIN",
     "isActive": true,
     "createdAt": "2026-08-09T16:30:00Z",
     "updatedAt": "2026-08-09T16:30:00Z"
   }
   ```

3. **User Management**:
   Thereafter, the active Administrator logs in via `/login` and manages Staff accounts through administrative controls.
