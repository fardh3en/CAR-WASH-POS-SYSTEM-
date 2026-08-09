# 04 — DEVELOPMENT PLAN

## 1. Purpose

This document converts the Project Constitution, Business Specification, and System Architecture into an executable development plan.

The purpose is not to redefine business requirements.

The business requirements are already established in:

- `01_PROJECT_CONSTITUTION.md`
- `02_BUSINESS_SPECIFICATION.md`
- `03_SYSTEM_ARCHITECTURE.md`

This document defines:

- What gets built.
- In what order.
- What belongs in the MVP.
- What must wait.
- How development is validated.
- How Antigravity is expected to work within the project.

---

# 2. Development Philosophy

Development follows the same principle used throughout the project:

> Build the simplest system that accurately represents the real car wash business.

The software must not become complicated merely because a feature is technically possible.

Every implementation decision must be evaluated against the actual workflow of the business.

The system should optimize for:

- Fast Staff operation.
- Minimal data entry.
- Accurate transaction records.
- Reliable historical data.
- Simple administration.
- Useful business analytics.
- Mobile usability.
- Controlled complexity.

---

# 3. Development Authority

The following hierarchy determines what should be treated as authoritative:

```text
01_PROJECT_CONSTITUTION.md
          ↓
02_BUSINESS_SPECIFICATION.md
          ↓
03_SYSTEM_ARCHITECTURE.md
          ↓
04_DEVELOPMENT_PLAN.md
          ↓
Phase-specific development instructions
          ↓
Implementation

If an implementation instruction conflicts with the Constitution or Business Specification, the conflict must be identified rather than silently resolved.

If a technical implementation detail is not specified, the development agent may choose a reasonable implementation provided that it does not violate the established business rules.

4. Development Agent Rules

Antigravity and other coding agents are implementation assistants.

They are not authorized to redefine the business workflow independently.

The development agent must:

Read the relevant project documentation before implementing a phase.
Understand the business reason behind the requested feature.
Avoid inventing requirements.
Avoid adding unnecessary features.
Follow the existing architecture.
Keep implementations modular.
Prefer simple solutions.
Explain significant architectural decisions.
Identify conflicts or ambiguities before making assumptions.
Test implemented functionality before declaring a phase complete.
5. Feature Development Rule

Every significant feature must answer:

Why does it exist?

Who uses it?

What business problem does it solve?

What database changes are required?

What backend changes are required?

What frontend changes are required?

What are the risks?

What are better alternatives?

What belongs in MVP?

What should remain future functionality?

No feature should be implemented merely because it is common in other POS systems.

The business workflow of this project is the deciding factor.

6. Development Sequence

Development will proceed incrementally.

The initial development sequence is:

Phase 1
Project Foundation
        ↓
Phase 2
Authentication & Roles
        ↓
Phase 3
Vehicle & Customer Foundation
        ↓
Phase 4
Services & Pricing
        ↓
Phase 5
Transaction Workflow
        ↓
Phase 6
Payments & Completion
        ↓
Phase 7
E-Billing & WhatsApp
        ↓
Phase 8
Admin Dashboard & Analytics
        ↓
Phase 9
Excel Reporting
        ↓
Phase 10
Exceptions, Corrections & Audit
        ↓
Phase 11
Responsive UI Refinement
        ↓
Phase 12
Testing, Security & Production Readiness

The exact contents of each phase may be refined as development reveals practical requirements.

7. Phase 1 — Project Foundation
Objective

Create a clean, working application foundation.

Phase 1 must establish:

Repository structure.
Frontend application.
Backend application where applicable.
Database connection.
Environment configuration.
Development tooling.
Basic application shell.
Basic responsive foundation.
Version control.
Initial documentation linkage.

Phase 1 should result in a running application.

It does not need to contain the complete POS workflow.

8. Phase 2 — Authentication & Roles

Implement the basic user system.

Current roles:

ADMIN
STAFF

Admin requires access to management and analytics functionality.

Staff requires access to operational transaction functionality.

The authorization system must be established before sensitive business functionality is implemented.

9. Phase 3 — Vehicle & Customer Foundation

Implement:

Vehicle registration.
Vehicle search.
Vehicle records.
Vehicle categories.
Vehicle variants where applicable.
Customer records.
Customer-vehicle relationships.
Vehicle history retrieval.

The primary Staff interaction must remain:

Vehicle Number
      ↓
Vehicle Found / New Vehicle
      ↓
Relevant History

Vehicle registration number is the core operational identifier.

10. Phase 4 — Services & Pricing

Implement:

Service packages.
Service configuration.
Vehicle category pricing.
Vehicle variant pricing where applicable.
Administrator price management.
Historical price preservation.
Negotiated transaction pricing.

Current primary services:

Body Wash
Body & Vacuum
Full Wash

The normal Staff workflow must select a service package rather than requiring Staff to manually select every included activity.

Custom jobs should be supported separately as an exception mechanism rather than complicating the standard service workflow.

11. Phase 5 — Transaction Workflow

Implement the core POS workflow.

Target flow:

Vehicle Number
      ↓
Vehicle Identification
      ↓
Customer Information
      ↓
Service Selection
      ↓
Vehicle Classification
      ↓
Price Determination
      ↓
Transaction Creation

The workflow must be optimized for busy-hour Staff usage.

The system should minimize:

Clicks.
Typing.
Repeated information.
Unnecessary confirmation screens.
12. Phase 6 — Payments & Completion

Implement:

Payment recording.
Cash payment.
UPI payment.
Transaction completion.
Payment validation.
Transaction history.
Controlled corrections.

Payment is recorded after the service transaction is established.

The core transaction must remain independent of WhatsApp availability.

13. Phase 7 — E-Billing & WhatsApp

Implement:

E-Bill generation.
E-Bill representation.
WhatsApp integration.
Delivery status.
Failed delivery handling.
Retry capability where supported.

Target flow:

Completed Transaction
        ↓
E-Bill Generated
        ↓
WhatsApp Attempt
        ↓
Success / Failure

WhatsApp failure must never invalidate the transaction.

The exact WhatsApp provider must be evaluated before implementation.

14. Phase 8 — Admin Dashboard & Analytics

Implement Administrator analytics for:

Day.
Week.
Month.
Year.
Custom date range.

Core metrics include:

Total vehicles.
Total sales.
Cash sales.
UPI sales.
Average transaction value.
Service distribution.
Vehicle-category distribution.
Returning vehicle/customer activity where determinable.
Price adjustments.

The dashboard must help the business owner understand the business rather than simply display large quantities of data.

15. Phase 9 — Excel Reporting

Implement:

Daily sales export.
Weekly export.
Monthly export.
Yearly export.
Custom-range export.

The MVP priority is:

Daily Sales → Excel

Exports must use authoritative transaction data.

Excel is an output format, not a second database.

16. Phase 10 — Exceptions, Corrections & Audit

Implement controlled handling for unpredictable real-world scenarios.

Examples include:

Negotiated pricing.
Custom jobs.
Incorrect transaction information.
Duplicate transactions.
Voided transactions.
Payment corrections.
E-Bill delivery failure.
Other legitimate operational exceptions.

The exception system must remain separate from the normal Staff workflow.

The goal is:

Normal Workflow
      ↓
Extremely Simple

Unexpected Situation
      ↓
Controlled Exception Flow

The normal user experience must not become complicated merely to accommodate rare cases.

17. Phase 11 — Responsive UI Refinement

The application must support:

Staff

Primary:

Mobile-first

Secondary:

Desktop-compatible
Administrator

Primary:

Desktop-first

Secondary:

Tablet / Mobile-compatible

The same system should adapt to different screen sizes rather than maintaining separate applications.

18. Phase 12 — Testing & Production Readiness

Before production deployment, verify:

Authentication.
Authorization.
Vehicle search.
Customer retrieval.
Service selection.
Pricing.
Historical pricing.
Transaction creation.
Payment recording.
Transaction corrections.
WhatsApp integration.
E-Bill generation.
Excel export.
Analytics.
Responsive layouts.
Error handling.
Duplicate protection.
Backup and recovery.
Security controls.

Testing must include realistic car wash workflows rather than only technical unit tests.

19. MVP Boundary

The MVP should focus on the core business loop:

Vehicle
   ↓
Service
   ↓
Price
   ↓
Transaction
   ↓
Payment
   ↓
E-Bill
   ↓
Reporting

The MVP should NOT require:

Worker tracking.
Worker assignment.
Bay management.
Wash-status tracking.
Individual labour activity tracking.
Complex scheduling.
Loyalty programs.
Memberships.
Advanced CRM.
Inventory management.
Accounting integration.
Multi-branch management.
Complex offline synchronization.

These may become valid future requirements if the business evolves.

20. Development Priorities

When competing implementation decisions exist, prioritize in this order:

1. Business correctness
2. Data integrity
3. Staff speed
4. Administrator usefulness
5. Mobile usability
6. Reliability
7. Security
8. Maintainability
9. Scalability
10. Visual polish

Visual polish matters, but it must not delay a correct and usable workflow.

21. Definition of Done

A development phase is not complete merely because the code runs.

A phase is considered complete when:

Required functionality is implemented.
Business rules are respected.
Database changes are complete.
Backend validation exists where required.
Frontend workflow works.
Relevant errors are handled.
Responsive behavior is verified.
Existing functionality has not been unnecessarily broken.
Tests appropriate to the phase pass.
Code is reasonably organized.
Documentation is updated where necessary.
The implementation has been reviewed against the relevant project documents.
22. Development Workflow

Each phase should follow:

Understand
    ↓
Plan
    ↓
Implement
    ↓
Test
    ↓
Review
    ↓
Fix
    ↓
Verify
    ↓
Commit

The development agent must not immediately begin writing large amounts of code without first understanding the phase.

23. Agent Scope Control

Antigravity must work within the currently assigned phase.

It should not independently implement future phases because they appear related.

For example:

If Phase 3 is Vehicle & Customer Foundation, the agent should not independently implement:

WhatsApp.
Analytics.
Excel export.
Loyalty.
Worker management.

unless explicitly instructed.

This prevents uncontrolled scope expansion.

24. Change Management

New requirements discovered during development must be classified as:

Required Correction

The existing implementation contradicts the approved business requirements.

→ Fix it.

Necessary Technical Change

The implementation requires a technical change to remain viable.

→ Explain and implement after approval where the change is significant.

New Business Requirement

The business wants functionality that was not previously specified.

→ Document and evaluate before implementation.

Nice-to-Have

Useful but not necessary.

→ Defer unless explicitly prioritized.

25. Challenging Requirements

The development process must allow the developer/AI to challenge requirements.

If a requirement appears likely to:

Slow Staff workflow.
Introduce unnecessary complexity.
Create unreliable data.
Duplicate existing functionality.
Increase maintenance unnecessarily.
Conflict with the actual car wash workflow.

the concern should be raised before implementation.

The goal is not blind execution.

The goal is to build the correct system.

26. Development Environment

The exact technology stack will be selected before Phase 1 implementation.

The chosen stack must support:

Responsive web application.
Mobile-first Staff workflow.
Desktop-first Administrator workflow.
Secure authentication.
Reliable relational business data.
Backend business logic.
WhatsApp integration.
Excel generation.
Analytics.
Cloud deployment.

Technology selection must be justified against the project requirements.

27. Phase Completion Artifacts

Each completed phase should leave the project in a usable state.

Where appropriate, the phase should produce:

Working code.
Database migrations.
Tests.
Updated configuration.
Documentation updates.
Git commit.
Short implementation summary.

The implementation itself is the primary artifact.

Long narrative summaries are not required unless they provide useful technical context.

28. Final Development Principle

The POS is being built for a real operating car wash.

Therefore:

The software must adapt to the business workflow, not force the business to behave like software.

The implementation should continuously optimize for:

FAST
SIMPLE
RELIABLE
ACCURATE
MOBILE-FIRST
BUSINESS-FOCUSED

The system should remain simple for Staff while giving the Administrator the depth of information required to understand and grow the business.

29. Starting Point

After approval of this Development Plan, development begins with:

PHASE 1 — PROJECT FOUNDATION

The development agent must first inspect the existing repository and environment, compare it against the approved project documents, and propose the Phase 1 implementation plan before making substantial changes.

No application feature beyond the Phase 1 scope should be implemented at this stage.

