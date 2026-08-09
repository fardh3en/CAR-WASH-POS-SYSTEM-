# Mr. Wash POS

> Car Wash Point of Sale (POS) & Business Management Platform

## Project Overview

Mr. Wash POS is designed to streamline customer registration, service selection, billing, payment recording, and business reporting for modern car wash operations.

- **Staff Interface**: Mobile-first, optimized for speed
- **Admin Interface**: Desktop-first, optimized for insights and business management

---

## Approved Governance & Design Specifications

The four authoritative project documents located in the repository root govern all development:

1. [`1_PROJECT CONSTITUTION.md`](./1_PROJECT%20CONSTITUTION.md) &mdash; Foundational governance & mission
2. [`2_BUSINESS SPECIFICATION.md`](./2_BUSINESS%20SPECIFICATION.md) &mdash; Operational workflows & business rules
3. [`3_SYSTEM ARCHITECTURE.md`](./3_SYSTEM%20ARCHITECTURE.md) &mdash; Logical system architecture & domain models
4. [`04_ DEVELOPMENT PLAN.md`](./04_%20DEVELOPMENT%20PLAN.md) &mdash; 12-phase technical implementation plan

---

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Routing**: React Router v7
- **Backend & Database**: Firebase Authentication, Cloud Firestore, Cloud Functions
- **Hosting**: Firebase Hosting
- **Locale & Timezone**: Asia/Kolkata (`INR ₹`)

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
```

### Environment Configuration

Copy `.env.example` to `.env.local` and add your Firebase credentials:

```bash
cp .env.example .env.local
```

`.env.local` is ignored by Git and will not be committed.

---

## Project Status

- **Phase 1 (Project Foundation)**: Completed
- **Phase 2 (Authentication & Roles)**: Pending
