# SYSTEM ARCHITECTURE

Version: 1.0
Status: In Progress
Document Type: System Architecture Specification

---

# 1. Architecture Purpose

This document defines the technical architecture required to implement the business requirements established in:

• 01_PROJECT_CONSTITUTION.md
• 02_BUSINESS_SPECIFICATION.md

The architecture must translate the real-world business workflow into a reliable, maintainable, secure, and scalable software system.

The architecture must prioritize the actual operational requirements of the business rather than forcing the business into a generic POS architecture.

The system must support two primary operational experiences:

1. Staff
   A fast, mobile-first transaction workflow optimized for use during busy operating hours.

2. Administrator
   A management and analytics experience optimized primarily for desktop while remaining responsive.

The architecture must support the current single-business operational model while remaining capable of future expansion into areas such as:

• Loyalty.
• Memberships.
• Fleet and corporate customers.
• Supervisors.
• Multiple branches.
• Advanced analytics.
• Accounting integrations.
• Additional communication channels.

Future capabilities must not unnecessarily complicate the current MVP.

---

# 2. Architecture Principles

The following principles govern all architectural decisions.

## AP-001 — Business First

Architecture must implement the documented business workflow.

Technical convenience must not override an established business requirement.

---

## AP-002 — Simplicity Over Unnecessary Complexity

The simplest architecture capable of satisfying the current requirements should be preferred.

A more complex solution must have a clear business or technical justification.

---

## AP-003 — Staff Speed Is a System Requirement

Staff operations are time-sensitive.

The architecture must support:

• Fast data retrieval.
• Fast transaction creation.
• Minimal network-dependent waiting.
• Minimal unnecessary processing.
• Responsive mobile interaction.

Performance is therefore a functional requirement, not merely a technical optimization.

---

## AP-004 — Vehicle Number Is a Core Identifier

The vehicle registration number is the primary operational identifier for service transactions.

The architecture must support fast and reliable vehicle-number search and retrieval.

---

## AP-005 — Transaction History Is Immutable by Default

Completed transactions represent historical business records.

The architecture must preserve historical transaction information even when current business configuration changes.

Historical prices, service selections, payment information, and other transaction-specific values must not be silently overwritten by current configuration.

---

## AP-006 — Current Configuration Is Separate From Historical Transactions

Current business configuration includes information such as:

• Vehicle categories.
• Service packages.
• Standard prices.
• Business settings.

Historical transactions must preserve the values that were applicable when the transaction occurred.

Current configuration and historical transaction data must therefore be architecturally distinguishable.

---

## AP-007 — External Services Must Not Own Core Business Data

Services such as WhatsApp must be treated as external integrations.

The business transaction must exist independently of whether an external service succeeds.

For example:

WhatsApp unavailable
        ↓
Transaction remains valid
        ↓
Analytics remain available
        ↓
Excel export remains available

External service failure must not result in loss of core business data.

---

## AP-008 — Mobile First for Staff

The Staff application must be designed primarily for mobile devices.

The architecture must support responsive layouts and touch-oriented interaction.

---

## AP-009 — Desktop First for Administration

Administrative analytics and management functions should be optimized for desktop displays while remaining responsive on smaller screens.

---

## AP-010 — Least Privilege

Users should have only the access required for their role.

Staff should not have unrestricted administrative capabilities.

Administrative actions must be protected separately from normal transaction operations.

---

## AP-011 — Progressive Enhancement

The system should provide a fast and reliable core workflow even when optional services or integrations are unavailable.

Optional capabilities must enhance the system rather than become dependencies for basic operation.

---

## AP-012 — Future Extensibility Without Premature Complexity

The architecture should provide clear extension points for future requirements.

However, future possibilities must not result in unnecessary abstractions or infrastructure in the MVP.

---

## AP-013 — Observable Business Data

Important business actions should produce data that can be analyzed, audited, and exported.

The architecture must support reliable reporting from transaction history.

---

## AP-014 — Source of Truth

The authoritative business state must exist within the POS system.

External services, exported spreadsheets, WhatsApp messages, and generated documents are representations or outputs of the underlying business data.

They must not become the primary source of truth.

---

# 3. System Overview

The system consists of several logical layers.

```text
                    ┌─────────────────────────┐
                    │        ADMIN USER       │
                    │ Desktop / Responsive    │
                    └────────────┬────────────┘
                                 │
                                 │
                    ┌────────────▼────────────┐
                    │                         │
                    │      POS APPLICATION    │
                    │                         │
                    │ Staff + Administrator   │
                    │                         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     APPLICATION LOGIC   │
                    │                         │
                    │ Transactions            │
                    │ Customers               │
                    │ Vehicles                │
                    │ Services                │
                    │ Pricing                 │
                    │ Payments                │
                    │ Reporting               │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     BUSINESS DATA       │
                    │                         │
                    │ Customers               │
                    │ Vehicles                │
                    │ Transactions            │
                    │ Configuration            │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       WhatsApp / E-Bill    Excel Export      Authentication


# 4. System Actors

The system has two primary human user roles:

- Administrator
- Staff

Customers and external services interact with the system indirectly and are therefore treated separately from the primary application users.

---

## 4.1 Administrator

The Administrator is the primary management and configuration user.

The Administrator requires access to:

- Business configuration.
- Vehicle categories.
- Vehicle variants.
- Service packages.
- Standard pricing.
- Customer and vehicle records.
- Transaction history.
- Reports.
- Analytics.
- Excel exports.
- Staff management.
- Relevant system settings.

The Administrator is responsible for managing the business configuration used by Staff.

Administrator access must be protected through role-based authorization.

Administrative capabilities must not be available to Staff unless explicitly authorized by the system's permission model.

---

## 4.2 Staff

Staff are the primary operational users of the POS.

Staff require access to the functionality necessary to handle customer transactions quickly.

This includes:

- Vehicle registration number search.
- Customer and vehicle registration.
- Customer and vehicle history relevant to the current transaction.
- Service package selection.
- Transaction creation.
- Payment recording.
- E-Bill generation and delivery where available.
- Transaction correction capabilities permitted by the business rules.

The Staff interface must prioritize:

- Speed.
- Minimal data entry.
- Large touch targets.
- Fast vehicle-number search.
- Clear pricing.
- Simple transaction completion.

Staff should not have unrestricted access to:

- Standard pricing configuration.
- Service configuration.
- Vehicle-category configuration.
- Full business analytics.
- Staff management.
- System configuration.
- Other administrative controls.

The Staff role is intentionally limited because Staff are responsible primarily for customer-facing operational work rather than business management.

---

## 4.3 Customer

Customers are not direct users of the POS application in the current MVP.

Customers interact with the system indirectly through Staff.

Customers may receive system-generated outputs such as:

- WhatsApp E-Bills.
- Future service reminders.
- Future loyalty communication.
- Future membership communication.

A customer-facing application, customer portal, or self-service booking interface is outside the current MVP.

The architecture should not require customers to create accounts or interact directly with the POS in order for the business to complete a transaction.

---

## 4.4 External Services

External services are systems outside the core POS that provide supporting capabilities.

Potential external services include:

- WhatsApp communication services.
- Authentication services.
- Hosting infrastructure.
- File or document generation services.
- Future accounting integrations.
- Future payment integrations.
- Future communication services.

External services must be treated as supporting components rather than sources of truth for business transactions.

The core POS transaction must remain valid even when an external service is unavailable.

For example:

```text
WhatsApp unavailable
        ↓
Transaction remains valid
        ↓
E-Bill remains associated with the transaction
        ↓
Admin analytics remain available
        ↓
Excel export remains available

4.5 Future Actors

The current MVP intentionally supports only the Administrator and Staff as direct application users.

Future business expansion may introduce additional roles, including:

Supervisor.
Branch Manager.
Franchise Administrator.
Accountant.
Fleet Account Manager.

These roles must not be introduced into the current Staff workflow unless the corresponding business requirement becomes real.

Future roles should be implemented through the authorization model rather than by duplicating the existing Staff or Administrator role.

4.6 Actor Principle

The system should distinguish between:

People who operate the system.
People who receive outputs from the system.
External services that support the system.

The current model is therefore:

                 ┌─────────────────────┐
                 │    Administrator    │
                 │   Management User   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │         POS         │
                 │                     │
                 │ Core Business Data  │
                 └──────────┬──────────┘
                            ▲
                            │
                 ┌──────────┴──────────┐
                 │                     │
        ┌────────┴────────┐   ┌────────┴────────┐
        │      Staff      │   │ External        │
        │ Operational User│   │ Services        │
        └─────────────────┘   └─────────────────┘
                 │
                 ▼
             Customers

# 5. Application Architecture

The POS application must be structured around the responsibilities and workflows established in the Business Specification.

The application should be modular enough to allow individual business capabilities to evolve without creating unnecessary coupling between unrelated features.

The architecture must support two primary application experiences:

- Staff operational workflow.
- Administrator management and analytics workflow.

Both experiences operate on the same underlying business data and business rules.

---

## 5.1 Application Structure

The application should be organized into logical functional modules rather than one large undifferentiated application.

The primary modules are:

- Authentication and Access Control.
- Customer Management.
- Vehicle Management.
- Transaction Management.
- Service Management.
- Pricing Management.
- Payment Management.
- E-Billing.
- Customer and Vehicle History.
- Reporting and Analytics.
- Excel Export.
- Administration.
- System Configuration.

These modules should share common business rules and data but maintain clear responsibilities.

---

## 5.2 Staff Application

The Staff experience is the primary operational interface.

Its primary purpose is to allow Staff to handle customer transactions quickly.

The Staff application should provide direct access to:

- Vehicle search.
- Vehicle registration.
- Customer information.
- Customer and vehicle history.
- Service selection.
- Price confirmation.
- Transaction creation.
- Payment recording.
- E-Bill handling.

The Staff application should avoid exposing administrative functionality that is irrelevant to normal transaction processing.

---

## 5.3 Administrator Application

The Administrator experience provides management and analytical capabilities.

The Administrator application should provide access to:

- Dashboard.
- Sales analytics.
- Vehicle analytics.
- Service analytics.
- Customer analytics.
- Payment analysis.
- Transaction history.
- Excel exports.
- Service configuration.
- Vehicle-category configuration.
- Pricing configuration.
- Staff management.
- Business settings.

The Administrator interface should prioritize information density and analytical visibility while remaining responsive.

---

## 5.4 Shared Business Logic

Staff and Administrator interfaces must not implement their own independent versions of core business rules.

Business rules such as:

- Pricing calculation.
- Transaction validation.
- Payment handling.
- Historical transaction preservation.
- Customer and vehicle relationships.

must be centralized within the application's business logic layer.

This prevents different parts of the application from producing inconsistent results.

For example:

```text
Staff Interface
      │
      ▼
┌──────────────────────┐
│ Shared Business Logic│
└──────────┬───────────┘
           │
           ▼
      Business Data

5.5 Transaction-Centered Architecture

The transaction is the central business operation of the POS.

A transaction connects:

Customer
    │
    ▼
Vehicle
    │
    ▼
Service Package
    │
    ▼
Pricing
    │
    ▼
Payment
    │
    ▼
E-Bill

The architecture must ensure that these relationships remain consistent.

A transaction must preserve the information necessary to reconstruct what happened at the time of the sale.

5.6 Vehicle-Centered Retrieval

Although the transaction is the central commercial record, the vehicle registration number is the primary operational search key.

The application should therefore optimize the Staff workflow around:

Vehicle Number
      ↓
Vehicle
      ↓
Customer
      ↓
Previous History
      ↓
New Transaction

This is particularly important for returning customers.

The system should avoid forcing Staff to search through customer records when the vehicle number is already available.

5.7 Configuration vs Transaction Data

The application must distinguish between current configuration and historical transaction data.

Current configuration includes:

Current service packages.
Current vehicle categories.
Current vehicle variants.
Current standard prices.

Transaction data contains historical information representing what actually occurred.

For example:

Current Standard Price
        │
        ▼
New Transaction
        │
        ▼
Historical Transaction Price

Changing the current standard price must not modify the historical transaction price.

5.8 External Integration Boundary

External services must interact with the application through defined integration boundaries.

Examples include:

POS Application
      │
      ├── WhatsApp Integration
      │
      ├── Excel Export
      │
      └── Future Integrations

External integrations must not directly modify core business records without passing through appropriate application logic.

5.9 Application State

The application may maintain temporary interface state such as:

Current search.
Selected vehicle.
Selected service.
Form input.
UI preferences.
Loading state.

Temporary interface state must be distinguished from persistent business data.

Persistent business data includes:

Customers.
Vehicles.
Transactions.
Payments.
Services.
Pricing configuration.
Historical records.

A temporary UI state must not be treated as a completed business transaction.

5.10 Error Handling

Application errors must be handled at the appropriate layer.

The system should:

Provide clear feedback to Staff.
Avoid exposing technical error details to customers.
Prevent partially completed operations from silently becoming valid transactions.
Preserve successfully stored business data.
Allow recoverable operations to be retried.

Error handling must prioritize data integrity and operational continuity.

5.11 Application Architecture Principle

The application should follow this general structure:

┌────────────────────────────────────────────┐
│              USER INTERFACES               │
│                                            │
│       Staff              Administrator     │
│         │                     │            │
└─────────┼─────────────────────┼────────────┘
          │                     │
          ▼                     ▼
┌────────────────────────────────────────────┐
│           APPLICATION / BUSINESS           │
│                  LOGIC                     │
│                                            │
│ Transactions │ Pricing │ Customers        │
│ Vehicles     │ Services│ Payments         │
│ Reporting   │ E-Billing│ Authorization    │
└──────────────────────┬─────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────┐
│             PERSISTENT DATA                │
│                                            │
│ Customers │ Vehicles │ Transactions       │
│ Services  │ Pricing  │ Payments            │
│ Users     │ Configuration                  │
└──────────────────────┬─────────────────────┘
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
      WhatsApp      Excel         Future
      Service      Export       Integrations

This represents the logical application architecture.

The specific implementation technologies and deployment model will be evaluated separately.

6. Client Architecture

This section defines how the application should behave across the devices used by Staff and Administrator.

# 6. Client Architecture

The POS will primarily be accessed through mobile phones by Staff and through desktop computers by the Administrator.

The client architecture must therefore support responsive behavior while optimizing each role for its primary device.

The application should use a shared application foundation rather than maintaining separate products for mobile and desktop.

---

## 6.1 Responsive Architecture

The application must be responsive by design.

Responsive behavior is a mandatory requirement rather than a future enhancement.

The interface must adapt to:

- Mobile phones.
- Tablets.
- Desktop computers.
- Different screen sizes and orientations.

The system must remain usable without requiring users to zoom, horizontally scroll, or rely on desktop-only interactions.

---

## 6.2 Staff Client

The Staff client is mobile-first.

The majority of Staff interaction is expected to occur through mobile phones.

The Staff client must prioritize:

- Large touch targets.
- Minimal clicks.
- Fast vehicle-number search.
- Simple transaction creation.
- Clear pricing.
- Fast service selection.
- Easy payment recording.
- Easy access to relevant history.
- Minimal typing where practical.

The Staff client should not attempt to reproduce the density of the Administrator desktop interface on a small screen.

---

## 6.3 Staff Desktop Adaptation

Although Staff usage is expected to be primarily mobile, Staff may also access the application through desktop devices.

The Staff interface must therefore remain fully functional on desktop.

Desktop adaptation may take advantage of:

- Wider layouts.
- Keyboard input.
- Larger information areas.
- Additional visible context.

However, the desktop Staff interface must preserve the same simple operational workflow as the mobile version.

Desktop availability must not result in a separate Staff application.

---

## 6.4 Administrator Client

The Administrator client is desktop-first.

Administrative tasks such as analytics, reporting, configuration, pricing management, and historical review benefit from larger displays.

The Administrator interface may therefore use:

- Wider dashboards.
- Tables.
- Charts.
- Side navigation.
- Multiple information panels.
- Larger reporting views.

The Administrator client must nevertheless remain responsive and usable on mobile devices when required.

---

## 6.5 Role-Based Interface

The client must adapt its available navigation and functionality based on the authenticated user's role.

Example:

```text
Staff
├── Transactions
├── Vehicles / Customers
├── History
└── Payment / E-Bill

Administrator
├── Dashboard
├── Transactions
├── Customers / Vehicles
├── Customers / Vehicles
├── Services
├── Pricing
├── Reports
├── Analytics
├── Excel Export
├── Staff
└── Settings

Role-based navigation is not a substitute for backend authorization.

Unauthorized operations must also be rejected by the server or authoritative business-logic layer.

6.6 Touch Interaction

The Staff client must be designed for touch interaction.

Interactive elements should have sufficiently large touch targets to reduce accidental selections during busy operations.

Primary actions should be visually obvious.

The interface should avoid:

Tiny buttons.
Dense controls.
Hidden actions.
Unnecessary dropdowns.
Excessive modal dialogs.
Long forms.
6.7 Keyboard Interaction

Keyboard interaction should be supported where it provides a genuine productivity advantage, particularly when Staff or Administrator users access the system from desktop devices.

Useful keyboard interactions may include:

Vehicle-number search.
Form navigation.
Confirming a transaction.
Navigating tables.
Search shortcuts.

Keyboard shortcuts should remain secondary to the primary touch and mouse workflows.

6.8 Search Interaction

Vehicle-number search is one of the most important Staff interactions.

The client should provide a fast search experience where Staff can:

Enter a vehicle registration number.
Identify an existing vehicle.
Retrieve relevant customer and vehicle information.
Select the required service.
Continue the transaction.

Search results should prioritize the most relevant vehicle match.

The system should avoid forcing Staff through unnecessary navigation before reaching the vehicle record.

6.9 Forms

Forms should be designed around the minimum information required at each stage of the workflow.

The client should not present every possible field at once.

Optional information should remain optional.

For example:

Customer name should not be required.
Phone number should not block a transaction.
Expected pickup information should only appear when relevant.
Unusual service information should not complicate normal transactions.

The interface should progressively reveal additional information only when it becomes relevant.

6.10 Transaction Interface

The transaction interface should make the following information immediately understandable:

Vehicle number.
Customer information available.
Vehicle category.
Selected service.
Standard price.
Final price.
Payment status.
Payment method.
E-Bill status where applicable.

The interface must make the final amount charged especially clear.

Staff should not need to navigate through multiple screens to understand what the customer is being charged.

6.11 Administrative Interface

The Administrator interface may use higher information density than the Staff interface.

Administrative screens should be optimized for:

Data comparison.
Trend analysis.
Filtering.
Configuration.
Historical review.
Reporting.

However, information density should not come at the expense of clarity.

The Administrator should be able to understand important business metrics quickly.

6.12 Loading and Feedback

The client must provide immediate visual feedback when operations are being processed.

Examples include:

Search loading.
Transaction saving.
Payment recording.
E-Bill generation.
Excel export generation.

The interface should prevent accidental duplicate submissions while an operation is being processed.

Long-running operations should provide clear progress or completion feedback where appropriate.

6.13 Error Presentation

Errors should be presented in language that is understandable to Staff.

Technical details such as database errors, stack traces, or internal service responses must not be displayed directly to operational users.

The interface should explain:

What went wrong.
Whether the transaction was saved.
What the Staff member should do next.

Example:

"Payment could not be saved. The transaction has not been marked as paid. Please try again."

This is preferable to exposing a technical error message.

6.14 Accessibility

The client should follow practical accessibility principles.

This includes:

Sufficient text contrast.
Readable font sizes.
Clear focus states.
Touch-friendly controls.
Meaningful labels.
Avoiding color as the only indicator of status.
Clear error messages.

Accessibility should be considered during component and interface design rather than added after implementation.

6.15 Performance

The Staff client should prioritize perceived performance.

Common actions should feel immediate.

Particular attention should be given to:

Initial application loading.
Vehicle search.
Customer history retrieval.
Service selection.
Price calculation.
Transaction creation.
Payment recording.

The client should avoid loading unnecessary administrative data into the Staff experience.

6.16 Client Architecture Principle

The client architecture follows:

                 POS APPLICATION
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    STAFF EXPERIENCE          ADMIN EXPERIENCE
          │                         │
    Mobile First               Desktop First
          │                         │
    Touch Optimized           Data Optimized
          │                         │
    Fast Transactions         Analytics & Management
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
              Shared Application
                 & Business Logic

The system should not become two disconnected applications merely because the two roles have different interface priorities.

The Staff and Administrator experiences should share the same underlying application architecture while presenting role-appropriate interfaces.

6.17 Client Architecture Decision

Responsive design is mandatory for the MVP.

The primary optimization targets are:

Staff:
Mobile-first, touch-first, transaction-first.

Administrator:
Desktop-first, data-first, management-first.

Both must remain usable across device sizes.

7. Backend Architecture

Add this as the next section of 03_SYSTEM_ARCHITECTURE.md:

# 7. Backend Architecture

The backend is responsible for enforcing business rules, protecting business data, coordinating transactions, and providing controlled access to the application's persistent data and external integrations.

The backend must be treated as the authoritative execution layer for business operations.

The client must not be trusted to enforce business rules by itself.

---

## 7.1 Backend Responsibilities

The backend is responsible for:

- Authentication and authorization enforcement.
- Customer management.
- Vehicle management.
- Transaction management.
- Service management.
- Pricing management.
- Payment recording.
- Historical transaction preservation.
- Customer and vehicle history.
- Reporting data retrieval.
- Excel export generation.
- E-Bill generation.
- WhatsApp integration.
- Validation of business rules.
- Error handling.
- Audit and correction handling.
- Data integrity.

The backend should expose only the operations required by the application.

---

## 7.2 Backend as the Business Authority

The frontend may provide immediate validation and user feedback, but the backend must remain the final authority for business rules.

For example:

```text
Staff selects:
SUV + Full Wash

        ↓

Frontend displays:
₹700

        ↓

Backend validates:
Vehicle Category
+
Service Package
+
Current Standard Price

        ↓

Transaction created

The backend must not blindly trust a price supplied by the frontend.

This prevents users or modified client requests from bypassing business rules.

7.3 Backend Business Modules

The backend should be logically divided into business modules.

Primary modules include:

Authentication.
Users and Roles.
Customers.
Vehicles.
Services.
Vehicle Categories.
Pricing.
Transactions.
Payments.
E-Billing.
Reporting.
Export.
Notifications / Integrations.
Administration.

The exact implementation structure may vary depending on the selected technology stack.

7.4 Transaction Processing

Transaction creation is a critical backend operation.

A transaction should only be created when the required business conditions are satisfied.

At minimum:

A valid vehicle registration number must exist.
A valid service package must be selected.
A valid vehicle category must be available.
An applicable price must exist.

The backend should determine or validate the standard price using the current configuration.

The actual transaction price must then be stored as part of the transaction.

7.5 Historical Price Preservation

When a transaction is created, the backend must capture the relevant pricing information at that point in time.

For example:

Current Price Configuration
        │
        ▼
Transaction Created
        │
        ├── Standard Price at Transaction Time
        │
        └── Actual Price Charged

Later changes to the configured price must not modify the stored historical transaction values.

7.6 Transaction Atomicity

Operations that represent a single business event should be handled in a way that prevents inconsistent records.

For example, when recording a payment:

Payment Amount
      +
Payment Method
      +
Transaction Reference

must not result in a state where only some of the information is stored successfully.

The backend must use the appropriate transactional or atomic mechanisms supported by the selected data platform.

7.7 Transaction Lifecycle

The backend should recognize the distinction between:

Vehicle Identification
        ↓
Service Selected
        ↓
Transaction Created
        ↓
Payment Recorded
        ↓
Transaction Completed

A vehicle being identified does not automatically create a transaction.

A transaction is created only after a service has been selected.

A transaction is considered completed when the required business information has been recorded and payment has been recorded.

7.8 Payment Processing

The current payment methods are:

Cash.
UPI.

The backend must validate the payment method against the currently supported payment methods.

Payment information must be associated with the correct transaction.

The system must not mark a transaction as paid merely because the Staff interface attempted to record a payment.

The backend must confirm successful persistence before treating the payment as recorded.

7.9 Negotiated and Adjusted Pricing

The backend must support cases where the actual amount charged differs from the standard price.

The transaction should preserve:

Standard price.
Actual price charged.
Adjustment information where applicable.

The backend must not overwrite the standard price configuration merely because an individual transaction has a negotiated price.

7.10 Authorization

Authorization must be enforced on the backend.

Examples:

Staff
 ├── Create transaction       ✓
 ├── Record payment           ✓
 ├── Search vehicle           ✓
 ├── View relevant history    ✓
 ├── Change standard pricing  ✗
 ├── Manage staff             ✗
 └── System configuration     ✗


Administrator
 ├── Create transaction       ✓
 ├── Record payment           ✓
 ├── Manage pricing           ✓
 ├── Manage services          ✓
 ├── Manage staff             ✓
 ├── Reports                  ✓
 └── System configuration     ✓

The frontend must not be considered a security boundary.

Hiding an Administrator button from Staff is insufficient protection.

The backend must independently reject unauthorized operations.

7.11 Customer and Vehicle Relationships

The backend must maintain the relationships between:

Customer
   │
   ├── Vehicle
   │      │
   │      └── Transactions
   │
   └── Other Vehicles

A customer may have multiple vehicles.

A vehicle maintains its own transaction history.

The vehicle registration number must remain a reliable mechanism for retrieving the correct vehicle.

7.12 Search

Vehicle-number search is a critical backend operation.

The backend should support fast retrieval of:

Vehicle.
Associated customer information.
Relevant historical transactions.

Search should be optimized for the practical formats used by vehicle registration numbers.

The system should account for reasonable formatting differences where appropriate.

For example, users may enter a registration number with or without spaces or separators.

The exact normalization rules will be defined during implementation.

7.13 Reporting Backend

Reports and analytics must be generated from authoritative transaction data.

The backend should provide aggregated information such as:

Vehicle counts.
Sales totals.
Cash totals.
UPI totals.
Service counts.
Service revenue.
Customer counts.
Returning customer counts.
Average transaction value.

Reporting logic should use completed and valid transactions according to the business rules.

7.14 Excel Export

Excel exports should be generated from backend-controlled business data.

The client should request an export rather than independently reconstructing financial records.

For example:

Administrator
      ↓
Request Daily Sales Export
      ↓
Backend
      ↓
Query Authoritative Transactions
      ↓
Generate Excel File
      ↓
Return Export

This ensures that exported data matches the same data used by the administrative reporting system.

7.15 E-Bill Generation

The backend should generate E-Bill information from the completed transaction.

The E-Bill must reflect:

Vehicle number.
Service.
Vehicle category.
Standard price where relevant.
Actual price charged.
Payment method.
Transaction date and time.
Business information.

The E-Bill must not be generated from manually re-entered information.

7.16 WhatsApp Integration

WhatsApp communication should be isolated behind an integration boundary.

The backend should:

Confirm that the transaction is valid.
Generate the E-Bill.
Attempt delivery through the configured WhatsApp service.
Record the delivery result where appropriate.

The transaction itself must not depend on successful WhatsApp delivery.

Example:

Completed Transaction
        │
        ├──────────────► Analytics
        │
        ├──────────────► Excel Export
        │
        └──────────────► E-Bill
                              │
                              ▼
                         WhatsApp

A WhatsApp failure must not roll back a valid completed transaction.

7.17 External Service Failure

External service failures should be isolated from core business operations.

Examples include:

WhatsApp unavailable.
E-Bill delivery failure.
Export generation failure.
Temporary network failure.

The backend should distinguish between:

Business transaction failure

and

External service failure.

They must not be treated as the same event.

7.18 Error Handling

Backend errors should provide structured information to the client without exposing sensitive implementation details.

Errors should distinguish between categories such as:

Validation error.
Authorization error.
Authentication error.
Resource not found.
Business-rule violation.
External-service failure.
Temporary infrastructure failure.

The frontend can then provide appropriate user feedback.

7.19 Idempotency and Duplicate Operations

The backend should protect important operations against accidental duplicate execution.

This is particularly important for:

Transaction creation.
Payment recording.
E-Bill generation.
External message delivery.

For example, repeated submission caused by a poor network connection should not accidentally create two identical transactions.

The exact idempotency strategy will depend on the selected backend and database technologies.

7.20 Backend Observability

The backend should provide sufficient logging and monitoring to diagnose important failures.

Logs should help identify:

Failed transactions.
Authorization failures.
Integration failures.
Payment-recording failures.
E-Bill failures.
Export failures.
Unexpected application errors.

Logs must not unnecessarily expose sensitive customer information.

7.21 Backend Security

The backend must protect:

Customer information.
Phone numbers.
Transaction information.
Payment information.
Administrative configuration.
Authentication credentials.
Integration credentials.

Secrets and API credentials must not be stored in frontend code.

Administrative operations must require appropriate authorization.

7.22 Backend Scalability

The initial backend should be designed for the current single-business environment.

It should nevertheless avoid architectural decisions that make future expansion unnecessarily difficult.

Potential future requirements include:

More Staff users.
More simultaneous devices.
More transactions.
Multiple branches.
Fleet customers.
Supervisor roles.
Additional integrations.

The MVP should not introduce distributed systems, microservices, queues, or other infrastructure solely for hypothetical future scale.

7.23 Backend Architecture Principle

The backend follows this general model:

                CLIENT
                  │
                  ▼
        ┌─────────────────────┐
        │ Authentication /    │
        │ Authorization       │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Business Logic      │
        │                     │
        │ Transactions        │
        │ Customers           │
        │ Vehicles            │
        │ Services            │
        │ Pricing             │
        │ Payments            │
        │ Reporting           │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Persistent Data     │
        │                     │
        │ Authoritative       │
        │ Business Records    │
        └──────────┬──────────┘
                   │
          ┌────────┴─────────┐
          ▼                  ▼
   External Services     Reporting /
   WhatsApp etc.         Export Systems

The backend is the authoritative enforcement layer between the client, business rules, persistent data, and external services.

7.24 Backend Architecture Decision

The backend must prioritize:

Data integrity.
Business-rule enforcement.
Security.
Transaction reliability.
Fast Staff operations.
Simple maintenance.
Controlled external integrations.
Reasonable future scalability.

Technology selection must be evaluated against these requirements rather than being predetermined.

8. Data Architecture

This is the next section. It defines how we think about the business data and its relationships, but we still won't lock in Firestore/SQL/etc. yet.

# 8. Data Architecture

The data architecture defines how the POS represents, stores, relates, and preserves the business information described in the Business Specification.

The primary objective is to maintain accurate historical business records while allowing Staff to retrieve vehicle information quickly and allowing the Administrator to analyze business performance.

The data architecture must distinguish between:

- Current business configuration.
- Operational records.
- Historical transaction records.
- External service outputs.

---

## 8.1 Data Architecture Principles

The data architecture must follow these principles:

- Vehicle registration number is the primary operational identifier.
- Transactions are historical business records.
- Historical transaction values must be preserved.
- Current configuration must not overwrite historical transaction data.
- Customer and vehicle records must be reusable across transactions.
- External services must not become the source of truth.
- Data required for reporting must remain available.
- Personally identifiable information should be collected only when useful to the business.
- The data model should remain simple enough for the current business scale.

---

## 8.2 Core Business Entities

The primary business entities are:

- User
- Customer
- Vehicle
- Vehicle Category
- Vehicle Variant
- Service Package
- Service Activity
- Price Configuration
- Transaction
- Payment
- E-Bill
- Business Configuration

These entities represent different concepts and should not be collapsed into a single generic record.

---

## 8.3 User

A User represents a person who is authorized to access the POS application.

Current roles are:

- Administrator
- Staff

A User record should contain the information necessary for:

- Authentication.
- Authorization.
- Role identification.
- Account management.
- Relevant audit information.

The exact authentication mechanism will be defined separately.

---

## 8.4 Customer

A Customer represents a person associated with one or more vehicles serviced by the business.

A customer may have:

- Name.
- Phone number.
- Multiple vehicles.
- Transaction history through associated vehicles.

Customer name is optional.

Phone number is normally collected but is not mandatory for completing a transaction.

The absence of customer information must not prevent a valid vehicle transaction when the business can otherwise identify and service the vehicle.

---

## 8.5 Vehicle

A Vehicle represents the physical vehicle being serviced.

The vehicle registration number is the primary operational identifier.

A vehicle may contain:

- Registration number.
- Vehicle category.
- Vehicle variant where applicable.
- Associated customer.
- Historical transactions.

A vehicle may exist independently of a currently active customer relationship where necessary.

---

## 8.6 Vehicle Registration Number

The vehicle registration number must be stored in a way that supports:

- Fast search.
- Reliable matching.
- Consistent formatting.
- Historical association with transactions.

The system should normalize reasonable formatting differences during search where appropriate.

For example, the following may represent the same registration number:

```text
KL07AB1234
KL 07 AB 1234
KL-07-AB-1234

The exact normalization strategy will be defined during implementation.

The original value may also be preserved where necessary for display or audit purposes.

8.7 Vehicle Category

A Vehicle Category represents the business classification used to determine service pricing.

Examples include:

Hatchback.
Sedan.
SUV.
Traveller.
Pickup.
Dost.
Other categories defined by the business.

Categories are business-defined rather than dependent on formal automotive classification systems.

Vehicle categories may be added, modified, or deactivated by the Administrator.

Historical transactions must retain sufficient information to preserve the category applicable at the time of the transaction.

8.8 Vehicle Variant

A Vehicle Variant represents a more specific classification within a vehicle category where size or configuration affects pricing.

Examples include:

Traveller
├── 10 Seat
├── 14 Seat
└── 17 Seat

Pickup
├── Standard
└── Long Chassis

Not every vehicle category requires variants.

The architecture must support categories with and without variants.

8.9 Service Package

A Service Package represents a standard service sold to customers.

Current standard packages are:

Body Wash.
Body & Vacuum.
Full Wash.

A Service Package may contain multiple Service Activities.

Staff normally select the Service Package rather than selecting individual activities.

8.10 Service Activity

A Service Activity represents an individual physical activity included within a service package.

Examples include:

Exterior pressure wash.
Interior vacuum.
Dashboard polishing.
Tyre polishing.
Underbody cleaning.
Engine room cleaning.

Service Activities primarily describe what is included in a package.

They should not automatically become individual transaction selections.

This distinction prevents the normal Staff workflow from becoming unnecessarily complex.

8.11 Price Configuration

Price Configuration represents the current standard pricing maintained by the Administrator.

A standard price is determined by the relevant combination of:

Vehicle Category / Variant
+
Service Package
=
Standard Price

The exact pricing relationship may vary for different vehicle classifications.

Price configuration represents current pricing only.

8.12 Historical Pricing

When a transaction is created, the applicable standard price must be captured within the transaction's historical information.

For example:

Current Price Configuration
          │
          ▼
    Transaction Created
          │
          ├── Standard Price at Time
          │
          └── Actual Price Charged

If the Administrator later changes the standard price, previous transactions must remain unchanged.

The transaction must therefore not depend exclusively on looking up the current price configuration.

8.13 Transaction

A Transaction represents a completed or in-progress commercial service interaction.

A transaction is created only after the customer selects a service package.

The transaction should be associated with:

Vehicle.
Customer where available.
Service Package.
Vehicle Category / Variant.
Standard price at transaction time.
Actual price charged.
Payment.
Transaction date and time.
Relevant E-Bill information.

The transaction is the primary historical business record.

8.14 Transaction State

The data model must distinguish between transaction states where necessary.

At minimum, the system should be able to distinguish:

Transaction being completed.
Payment pending.
Completed transaction.
Corrected or voided transaction where applicable.

A vehicle number existing in the system does not automatically represent a transaction.

A transaction begins only after service selection.

8.15 Actual Transaction Price

The transaction must preserve the actual amount charged to the customer.

The actual price may differ from the configured standard price because of:

Negotiation.
Vehicle condition.
Other legitimate business exceptions.

The data model should therefore preserve both:

Standard Price
Actual Price Charged

These values must not be conflated.

8.16 Price Adjustment

Where the actual transaction price differs from the standard price, the system should be capable of representing the adjustment.

Potential information includes:

Standard price.
Actual price.
Difference.
Adjustment reason.
User responsible for the adjustment.

The exact authorization and reason requirements remain an open business decision.

8.17 Payment

A Payment represents money received for a transaction.

Current payment methods are:

Cash.
UPI.

Payment information should include the information necessary to determine:

Amount paid.
Payment method.
Associated transaction.
Payment status.
Relevant timestamp.

The exact payment model will be refined during implementation.

8.18 Customer-to-Vehicle Relationship

A customer may have multiple vehicles.

The data architecture must support:

Customer
│
├── Vehicle A
│      ├── Transaction
│      ├── Transaction
│      └── Transaction
│
├── Vehicle B
│      ├── Transaction
│      └── Transaction
│
└── Vehicle C
       └── Transaction

This relationship is important for customer history and returning-customer workflows.

8.19 Vehicle-to-Transaction Relationship

A vehicle may have many historical transactions.

Vehicle
│
├── Transaction 1
├── Transaction 2
├── Transaction 3
└── Transaction N

The vehicle registration number allows Staff to retrieve the vehicle and its relevant service history.

8.20 Transaction-to-Payment Relationship

A transaction must be associated with its payment information.

The architecture must preserve enough information to determine whether a transaction is:

Unpaid.
Paid.
Corrected.
Voided where applicable.

The exact payment correction and reversal model will be defined later.

8.21 E-Bill

An E-Bill represents the electronic customer-facing billing document generated from a transaction.

The E-Bill must be derived from authoritative transaction data.

It should not require Staff to manually re-enter transaction information.

The E-Bill may contain:

Business information.
Transaction identifier.
Date and time.
Vehicle number.
Service package.
Vehicle category.
Standard price where relevant.
Actual price.
Payment method.
8.22 WhatsApp Delivery Information

WhatsApp delivery information should be treated separately from the transaction itself.

The system may store information such as:

Delivery requested.
Delivery attempted.
Delivery successful.
Delivery failed.
Failure information where useful.
Delivery timestamp.

A WhatsApp failure must not invalidate the transaction.

8.23 Business Configuration

Business Configuration represents information controlling the current operation of the POS.

Examples include:

Business name.
Business contact information.
Current service packages.
Vehicle categories.
Vehicle variants.
Current prices.
Billing configuration.
Other administrative settings.

Changes to business configuration must not silently modify historical transactions.

8.24 Historical Snapshot Principle

A transaction should contain enough information to accurately describe what happened at the time of the transaction.

For example, if the current price is later changed:

2026 Transaction
Standard Price: ₹500
Actual Price: ₹500

        ↓ Price changed later

Current Configuration
Standard Price: ₹600

        ↓

2026 Transaction remains:
Standard Price: ₹500
Actual Price: ₹500

The transaction must remain historically accurate.

8.25 Data Ownership

The POS database is the authoritative source of business information.

The following are outputs or representations rather than authoritative records:

WhatsApp messages.
E-Bills.
Excel exports.
Reports.
Dashboard visualizations.

If an exported Excel file differs from the database, the database remains the source of truth.

8.26 Data Retention

Business transactions and historical records must be retained for administrative analysis and historical reference.

The system must not automatically delete historical transactions merely because they are old.

The exact retention period may depend on future legal, accounting, or business requirements.

8.27 Data Integrity

The data architecture must prevent invalid relationships and inconsistent business states.

Examples:

A transaction cannot exist without a vehicle.
A transaction cannot exist without a selected service.
A completed transaction must have recorded payment.
A transaction must preserve its historical price.
A payment must belong to a valid transaction.
Historical transactions must not depend on mutable current pricing.
8.28 Data Privacy

The system should collect and retain only information that provides business value.

Customer information such as phone numbers should be protected because it may be personally identifiable information.

Access to customer information must follow the user's role and authorization level.

Sensitive information must not be exposed unnecessarily in:

Logs.
URLs.
Client-side code.
Error messages.
Public exports.
8.29 Data Architecture Principle

The core relationship can be summarized as:

                CUSTOMER
                   │
                   │
                   ▼
                VEHICLE
                   │
                   │
                   ▼
              TRANSACTION
             /     │      \
            /      │       \
           ▼       ▼        ▼
       SERVICE   PRICING   PAYMENT
                  │
                  ▼
           HISTORICAL PRICE
                   │
                   ▼
                E-BILL
                   │
                   ▼
               WHATSAPP

The architecture must preserve the distinction between:

Who the customer is.
Which vehicle was serviced.
What service was purchased.
What the standard price was at that time.
What the customer actually paid.
How the payment was made.
What was communicated to the customer.

These distinctions are essential for accurate history, reporting, and future expansion.

8.30 Technology Independence

This section intentionally defines the logical data model without committing to a specific database technology.

The final database technology must be evaluated against:

Transaction integrity.
Query requirements.
Vehicle-number search performance.
Reporting requirements.
Mobile usage.
Offline/recovery requirements.
Concurrent Staff usage.
Security.
Operational simplicity.
Cost.
Future scalability.

The database technology decision will be documented after these requirements have been evaluated.

9. Authentication & Authorization

Add this next to 03_SYSTEM_ARCHITECTURE.md:

# 9. Authentication & Authorization

Authentication and authorization control who can access the POS and what each user is permitted to do.

The current system has two primary application roles:

- Administrator
- Staff

The security model must remain simple for the current business while preventing Staff from accessing or modifying administrative functions.

---

## 9.1 Authentication

Authentication verifies the identity of a person attempting to access the POS.

A user must authenticate before accessing protected application functionality.

The authentication mechanism must support:

- Secure login.
- Secure session management.
- Logout.
- Session expiration where appropriate.
- Account disablement.
- Secure credential handling.

The exact authentication provider and implementation will be selected during technology evaluation.

---

## 9.2 User Accounts

Each person who directly operates the POS should have an identifiable user account.

Current user types are:

- Administrator.
- Staff.

Shared credentials should be avoided where practical because they make it difficult to determine which user performed an administrative or corrective action.

The exact account-creation and onboarding workflow will be defined during implementation.

---

## 9.3 Administrator Role

The Administrator has the highest level of access within the current system.

Administrator capabilities include:

- Managing services.
- Managing vehicle categories.
- Managing vehicle variants.
- Managing standard pricing.
- Viewing reports.
- Viewing analytics.
- Exporting business data.
- Managing Staff accounts.
- Managing business configuration.
- Performing authorized administrative corrections.
- Viewing historical business records.

Administrator access must be protected appropriately because administrative actions can directly affect business operations and data.

---

## 9.4 Staff Role

Staff access is intentionally restricted to operational responsibilities.

Staff should be able to:

- Search vehicles.
- Register customers and vehicles.
- View relevant customer and vehicle history.
- Create transactions.
- Select services.
- Record payments.
- Generate or initiate E-Bills.
- Perform permitted transaction corrections.

Staff should not be able to:

- Change standard pricing.
- Delete or freely remove historical transactions.
- Manage Staff accounts.
- Change system configuration.
- Modify business-wide service definitions without authorization.
- Access unrestricted administrative analytics.
- Modify security settings.

---

## 9.5 Role-Based Authorization

Authorization must be role-based.

The application must determine whether the authenticated user has permission to perform a requested operation.

For example:

```text
                    ADMINISTRATOR
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     Pricing          Reports         Staff Mgmt
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                  Full Admin Access


                       STAFF
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Transactions    Vehicles       Payments

Authorization must be enforced by the authoritative backend or data-access layer.

Frontend visibility alone is not sufficient security.

9.6 Frontend vs Backend Authorization

The frontend should hide functionality that the current user does not have permission to use.

However, this is only a usability measure.

The backend must independently enforce authorization.

For example:

Staff
  │
  │ Request: Change Standard Price
  ▼
Backend
  │
  ├── Check authenticated user
  ├── Check user role
  ├── Reject unauthorized operation
  ▼
Permission Denied

A user must not be able to bypass authorization simply by manipulating frontend requests.

9.7 Authentication State

The application must maintain a reliable authenticated state.

The client should know whether the current session is:

Unauthenticated.
Authenticating.
Authenticated.
Session expired.
Logged out.

Protected application screens must not remain accessible after authentication has expired.

9.8 Logout

Users must be able to explicitly log out.

Logout should invalidate the appropriate authenticated session or token according to the selected authentication architecture.

This is particularly important on shared devices.

9.9 Session Security

Authentication sessions must be handled securely.

The implementation should consider:

Session expiration.
Secure token handling.
Protection against token theft.
Secure transport.
Reauthentication for sensitive operations where appropriate.

The exact session strategy depends on the selected authentication provider.

9.10 Staff Account Management

The Administrator should be able to manage Staff accounts.

Potential administrative actions include:

Create Staff account.
Disable Staff account.
Reactivate Staff account.
Reset or assist with account recovery.
View account status.

The Administrator should not need to modify technical authentication credentials directly.

The exact account-management workflow will depend on the selected authentication system.

9.11 Staff Turnover

If a Staff member leaves the business, their account should be disabled rather than deleted immediately.

This prevents the account from being used while preserving historical attribution for transactions or corrections performed by that user.

Historical records should retain the identity of the user associated with important actions where appropriate.

9.12 Administrative Action Attribution

Important administrative or corrective operations should be attributable to the user who performed them.

Examples include:

Price changes.
Service configuration changes.
Vehicle-category changes.
Transaction corrections.
Transaction voiding.
Staff account changes.

This does not mean every minor UI interaction needs an audit record.

The system should focus auditability on actions that materially affect business data or configuration.

9.13 Sensitive Operations

Certain operations may require additional authorization or confirmation.

Potential examples include:

Changing standard prices.
Correcting completed transactions.
Voiding transactions.
Modifying business configuration.
Managing Staff accounts.

The exact list of sensitive operations and whether they require additional confirmation will be finalized during security and backend design.

9.14 Customer Access

Customers do not require POS accounts in the current MVP.

The customer does not need to:

Log into the POS.
Create a POS account.
Maintain a password.
Access the Staff interface.

Customer interaction remains primarily through the physical business and, where applicable, WhatsApp E-Billing.

Future customer-facing applications may introduce a separate authentication model if required.

9.15 External Service Credentials

Credentials for external services must never be exposed to Staff or embedded directly into frontend application code.

Examples include:

WhatsApp API credentials.
Database credentials.
Server secrets.
Authentication service secrets.
API keys.

External service credentials must be stored using secure server-side configuration or secret-management mechanisms appropriate to the selected infrastructure.

9.16 Password and Credential Security

If password-based authentication is selected, passwords must never be stored as plaintext.

The authentication provider should handle secure credential storage wherever possible.

The system should rely on established authentication mechanisms rather than implementing custom password storage or cryptographic logic unnecessarily.

9.17 Account Recovery

The authentication system should provide an appropriate account-recovery mechanism.

The recovery process must not expose passwords or sensitive account information.

The exact recovery method will depend on the selected authentication provider.

9.18 Authorization Failure

When a user attempts an operation they are not authorized to perform, the system should:

Reject the operation.
Preserve existing business data.
Provide a clear user-facing message.
Record the security event where appropriate.

The system should not expose internal authorization logic or sensitive implementation details.

9.19 Security Principle

The security model follows:

Authenticate
     ↓
Identify User
     ↓
Determine Role
     ↓
Check Permission
     ↓
Execute Authorized Operation
     ↓
Record Important Action

Authentication answers:

"Who are you?"

Authorization answers:

"What are you allowed to do?"

These are separate concerns and must be treated separately in the architecture.

9.20 MVP Security Model

The MVP should keep the role model intentionally simple:

Administrator
      │
      └── Full authorized business management


Staff
      │
      └── Operational transaction management

Additional granular permissions may be introduced later if the business develops more complex organizational roles.

The architecture should therefore support future permission expansion without requiring the current application to expose unnecessary complexity.

9.21 Authentication & Authorization Principle

Security must protect the business without making the Staff workflow unnecessarily difficult.

The system should therefore follow:

Strong backend authorization.
Simple Staff authentication.
Minimal unnecessary security friction during normal transactions.
Stronger protection for sensitive administrative operations.
Individual user accountability for important actions.
No shared administrative credentials.

10. Transaction Architecture

This is one of the most important architecture sections because the transaction is the core commercial record of the POS.

# 10. Transaction Architecture

The transaction is the central commercial record of the POS.

A transaction represents a customer's purchase of a vehicle service and contains the information necessary to understand what was requested, what price was applicable, what amount was actually charged, how payment was made, and what was communicated to the customer.

The transaction architecture must reflect the flexible real-world workflow established in the Business Specification.

---

## 10.1 Transaction Creation Principle

A vehicle registration number alone does not create a transaction.

The vehicle may be searched or identified before a transaction exists.

A transaction is created only after the customer has selected a service package.

The basic relationship is:

```text
Vehicle Identified
        ↓
Service Selected
        ↓
Transaction Created

This prevents unnecessary incomplete transactions from being created simply because a vehicle arrived at the business.

10.2 Transaction Lifecycle

The transaction lifecycle should support the actual operational sequence of the business.

A typical lifecycle is:

Vehicle Identified
        ↓
Service Selected
        ↓
Transaction Created
        ↓
Service Performed
        ↓
Payment Recorded
        ↓
E-Bill Generated
        ↓
Transaction Completed

The physical service process is not digitally tracked by the current system.

The system therefore does not require:

Wash started status.
Wash completed status.
Worker assignment.
Bay assignment.
Individual service activity tracking.

The transaction lifecycle represents the commercial record rather than the physical wash workflow.

10.3 Transaction Information

A transaction should preserve the information necessary to represent the sale.

At minimum, this includes:

Vehicle.
Customer information available at the time.
Vehicle category.
Vehicle variant where applicable.
Service package.
Standard price applicable at the time.
Actual price charged.
Payment information.
Transaction date and time.
User responsible for the transaction.
E-Bill information where applicable.

Additional information may be recorded when required by an exception or business rule.

10.4 Transaction and Vehicle

Every transaction must be associated with a vehicle.

The vehicle registration number is the primary operational identifier used to locate the vehicle.

The relationship is:

Vehicle
   │
   ├── Transaction 1
   ├── Transaction 2
   ├── Transaction 3
   └── Transaction N

This allows Staff to retrieve the historical service record of a returning vehicle.

10.5 Transaction and Customer

A transaction may be associated with customer information when available.

Customer information may include:

Customer name.
Customer phone number.

Customer information should not be duplicated unnecessarily when a reusable customer record already exists.

However, the transaction must retain sufficient historical context to identify the customer relationship applicable at the time of the transaction.

A transaction must remain valid even when optional customer information is unavailable.

10.6 Service Selection

A transaction must contain the selected service package.

Current standard service packages are:

Body Wash.
Body & Vacuum.
Full Wash.

Staff should select the package rather than manually selecting every activity included in the package.

The selected service must be preserved as part of the historical transaction.

10.7 Vehicle Classification at Transaction Time

The transaction must preserve the vehicle classification applicable when the transaction was created.

This may include:

Vehicle category.
Vehicle variant.

The transaction must not depend solely on the vehicle's current classification.

For example:

Transaction in 2026
Vehicle Category = Sedan

        ↓

Business classification changes later

        ↓

Vehicle Current Category = Different Category

        ↓

2026 Transaction still reports:
Vehicle Category = Sedan

This protects historical reporting.

10.8 Price Determination

The standard price is determined using the applicable business configuration at transaction creation.

Conceptually:

Vehicle Category / Variant
              +
       Service Package
              ↓
       Standard Price

The backend must determine or validate the applicable standard price.

The frontend must not be considered authoritative for pricing.

10.9 Standard Price Snapshot

When a transaction is created, the standard price applicable at that time must be captured as part of the transaction.

This is a historical snapshot.

For example:

Current Configuration
Full Wash + Sedan = ₹600

        ↓

Transaction Created

        ↓

Transaction stores:
Standard Price = ₹600

If the Administrator later changes the standard price to ₹700:

Current Configuration
Full Wash + Sedan = ₹700

Historical Transaction
Standard Price = ₹600

The historical transaction must remain ₹600.

10.10 Actual Price

The transaction must separately preserve the actual amount charged.

Normally:

Standard Price = Actual Price

However:

Standard Price ≠ Actual Price

may occur because of:

Customer negotiation.
Vehicle condition.
Other legitimate business exceptions.

The system must preserve both values.

10.11 Price Adjustment

When the actual price differs from the standard price, the transaction should be capable of recording:

Standard price.
Actual price.
Difference.
Adjustment reason where applicable.
User responsible for the adjustment.

The exact authorization requirements remain an open business decision.

The adjustment must apply only to the individual transaction and must not modify the standard pricing configuration.

10.12 No Standard Discount Model

The current business does not operate a formal discount system.

The transaction architecture should therefore not require a discount field or discount workflow as part of every transaction.

If a negotiated or adjusted price occurs, it should be represented as a transaction-level price adjustment rather than forcing the business into a generic discount model.

Future loyalty, promotional, or membership pricing may introduce additional pricing concepts later.

10.13 Payment State

The transaction must distinguish whether payment has been recorded.

At minimum, the system must be able to represent:

Payment pending.
Payment recorded.

A transaction must not be considered fully completed merely because a service was selected.

Payment recording is a separate business event.

10.14 Payment Recording

When payment is recorded, the system must capture:

Amount paid.
Payment method.
Payment timestamp.
Associated transaction.

Current payment methods are:

Cash.
UPI.

The backend must validate payment information before marking the transaction as paid.

10.15 Transaction Completion

A transaction becomes completed when:

Required transaction information has been recorded.
The service has been selected.
Payment has been recorded.

The successful delivery of a WhatsApp E-Bill is not a prerequisite for transaction completion.

For example:

Transaction
    ↓
Payment Recorded
    ↓
Transaction Completed
    ↓
WhatsApp E-Bill Attempted
    ↓
Delivery Successful / Failed

A WhatsApp failure must not change the transaction back to an unpaid or incomplete state.

10.16 E-Bill Relationship

The E-Bill is generated from the transaction.

The transaction remains the authoritative source of billing information.

The relationship is:

Transaction
     ↓
E-Bill
     ↓
WhatsApp Delivery

The E-Bill must not contain independently entered values that could contradict the transaction.

10.17 Transaction Corrections

Completed transactions must not be freely deleted.

If Staff makes an error, the system should provide a controlled correction mechanism.

Possible corrections include:

Vehicle information.
Customer information.
Vehicle category.
Service package.
Payment information.
Actual transaction price.

The exact correction authorization rules will be finalized during security and backend design.

10.18 Transaction Void / Cancellation

The architecture must support a controlled mechanism for transactions that should no longer be treated as valid business sales.

Potential examples include:

Duplicate transaction.
Transaction created accidentally.
Legitimate cancellation before completion.

A voided or cancelled transaction should not simply disappear from the system.

The original record should remain available for appropriate administrative review.

The exact state model will be finalized during implementation.

10.19 Historical Integrity

Historical transaction data must be protected from unintended modification.

Changes to:

Current prices.
Current service configuration.
Current vehicle categories.
Current customer information.

must not silently rewrite historical transaction values.

The transaction must contain the historical values necessary to accurately represent what occurred.

10.20 Duplicate Transaction Protection

The system should reduce the possibility of duplicate transactions.

Potential causes include:

Double tapping a submit button.
Network retry.
Browser refresh.
Staff accidentally submitting the same transaction twice.

The backend should use appropriate safeguards to prevent accidental duplication.

The exact idempotency strategy will be defined based on the selected backend and database technology.

10.21 Concurrent Staff Usage

Multiple Staff members or devices may potentially use the POS at the same time.

The transaction architecture must therefore account for concurrent operations.

For example:

Staff Device A
      │
      ├── Transaction 1
      │
      ▼
   Backend
      ▲
      │
      ├── Transaction 2
      │
Staff Device B

The system must ensure that simultaneous transactions do not overwrite one another or produce inconsistent records.

10.22 Transaction Timestamps

Transactions should preserve relevant timestamps.

At minimum, the system should record:

Transaction creation timestamp.
Payment timestamp.
Completion timestamp where appropriate.

Timestamps should use a consistent timezone strategy.

The business currently operates in India, so the system should use Indian Standard Time (IST) for business-facing dates and times unless a future multi-region requirement changes this.

10.23 Expected Pickup Information

Expected pickup information is optional transaction-related information.

Where relevant, the transaction may record:

Expected pickup time.
Expected pickup date.

This information must not be interpreted as a service-status indicator.

The system must not automatically assume that a vehicle has been collected merely because the expected pickup time has passed.

10.24 Transaction Search

Administrators and authorized Staff should be able to retrieve transactions using appropriate search criteria.

The primary operational search should remain:

Vehicle Registration Number

Administrative reporting may additionally support:

Date.
Customer.
Service package.
Vehicle category.
Payment method.
Transaction identifier.

Search capabilities should reflect the user's role and purpose.

10.25 Transaction Data Flow

The overall transaction flow is:

             CUSTOMER
                 │
                 ▼
       Vehicle Registration
                 │
                 ▼
        Vehicle Identification
                 │
                 ▼
         Service Selection
                 │
                 ▼
        Price Determination
                 │
                 ▼
       Transaction Creation
                 │
                 ▼
          Service Occurs
                 │
                 ▼
         Payment Recorded
                 │
                 ▼
      Transaction Completed
                 │
          ┌──────┴──────┐
          ▼             ▼
       E-Bill        Analytics
          │             │
          ▼             ▼
      WhatsApp       Reports
                        │
                        ▼
                   Excel Export

The physical wash process occurs between transaction creation and payment, but is intentionally not represented as a detailed digital workflow.

10.26 Transaction Architecture Principle

The transaction architecture must preserve the following distinctions:

Vehicle
   ≠
Transaction
   ≠
Payment
   ≠
E-Bill

They are related but represent different business concepts.

The architecture must ensure that:

A vehicle can have many transactions.
A transaction belongs to a vehicle.
A transaction records the service purchased.
A transaction records the historical price.
A transaction records the actual amount charged.
A transaction records its payment.
An E-Bill is generated from the transaction.
WhatsApp is only a delivery mechanism.
10.27 Transaction Architecture Decision

The transaction architecture must prioritize:

Historical accuracy.
Fast Staff workflow.
Reliable payment recording.
Accurate pricing.
Duplicate protection.
Controlled corrections.
Reliable reporting.
External-service independence.
Future extensibility without unnecessary complexity.

The final implementation must preserve these principles regardless of the selected database or backend technology.

11. Pricing Architecture

This section defines how pricing should work technically while preserving the business rules we've already locked.

# 11. Pricing Architecture

Pricing is a core business capability of the POS.

The pricing architecture must support the business's current vehicle-category-based pricing model while preserving historical pricing for completed transactions.

The system must distinguish between:

- Current standard pricing.
- Historical standard pricing.
- Actual transaction price.
- Negotiated or adjusted transaction price.

The pricing architecture must allow the Administrator to change prices for future transactions without altering historical transactions.

---

## 11.1 Pricing Model

The current pricing model is primarily determined by:

```text
Vehicle Category / Variant
            +
      Service Package
            ↓
      Standard Price

Different vehicle categories and variants may have different prices for the same service package.

For example:

Hatchback + Body Wash
        ≠
Sedan + Body Wash
        ≠
SUV + Body Wash

The exact prices are business configuration and must not be hard-coded into the application.

11.2 Administrator-Controlled Pricing

The Administrator is responsible for managing standard prices.

The Administrator should be able to:

Create a price.
Modify a current price.
Deactivate a price where appropriate.
Review current pricing.
Review historical pricing where required.

Staff should not be able to modify standard pricing.

11.3 Pricing Is Configuration

Standard prices are business configuration rather than transaction records.

For example:

Current Configuration

Sedan
├── Body Wash        ₹X
├── Body & Vacuum    ₹Y
└── Full Wash        ₹Z

Changing the configuration affects future transactions.

It must not modify historical transactions.

11.4 Price Resolution

When Staff selects a service for a vehicle, the system should determine the applicable standard price.

The conceptual process is:

Vehicle
   ↓
Vehicle Category / Variant
   ↓
Selected Service Package
   ↓
Current Applicable Price
   ↓
Standard Price

The backend must validate the price before the transaction is completed.

11.5 Price Snapshot

When a transaction is created, the applicable standard price must be copied into the transaction as a historical snapshot.

For example:

Current Price
Sedan + Full Wash = ₹600

        ↓

Transaction Created

        ↓

Transaction stores:
Standard Price = ₹600

If the Administrator later changes the price:

Current Price
Sedan + Full Wash = ₹700

Historical Transaction
Standard Price = ₹600

The historical transaction remains ₹600.

11.6 Actual Transaction Price

The actual transaction price represents the amount the customer was actually charged.

Normally:

Actual Price = Standard Price

However, the business allows exceptions.

For example:

Standard Price = ₹600
Actual Price   = ₹550

The system must preserve both values.

11.7 No Mandatory Discount Workflow

The business does not currently operate a formal discount system.

Therefore, the standard Staff workflow must not contain a mandatory discount field or discount-selection process.

The system should not assume that every transaction has:

Discount percentage.
Discount code.
Promotional campaign.
Coupon.
Loyalty discount.

These concepts may be introduced in the future if the business adopts them.

11.8 Negotiated Pricing

Negotiated pricing is a supported business exception.

Staff may encounter situations where the customer and business agree on a final price different from the standard price.

The architecture must therefore support:

Standard Price
      ↓
Price Adjustment
      ↓
Actual Price

The adjustment must apply only to the current transaction.

It must never modify the configured standard price.

11.9 Price Adjustment Reason

The system should be capable of storing a reason for a price adjustment.

Possible reasons include:

Negotiation.
Vehicle condition.
Other legitimate business exception.

Whether a reason is mandatory, optional, or restricted by role remains an open business decision.

The data model should support the capability without forcing unnecessary Staff input.

11.10 Price Adjustment Authorization

The exact authorization model for negotiated pricing has not yet been finalized.

Possible future rules include:

Staff can adjust freely.
Staff can adjust within a permitted range.
Larger adjustments require Administrator approval.
Certain adjustment reasons require authorization.

The MVP architecture should leave room for these rules without unnecessarily complicating the normal pricing workflow.

11.11 Vehicle Category and Variant Pricing

Some vehicle types require additional size or configuration distinctions.

For example:

Traveller
├── 10 Seat
├── 14 Seat
└── 17 Seat

Different variants may have different prices.

The pricing architecture must support:

Vehicle Category
       +
Vehicle Variant
       +
Service Package
       ↓
Standard Price

Not every category requires a variant.

11.12 Pricing Without Variants

Where a vehicle category does not require variants, the pricing model should remain simple.

For example:

Sedan
   +
Body Wash
   ↓
₹X

The system should not force Staff to select an unnecessary variant when the category has no meaningful size distinction.

11.13 Future Price Changes

Administrators may change prices as the business evolves.

A price change should apply to future transactions from the point at which it becomes effective.

The system should not retroactively change:

Historical transaction prices.
Historical revenue.
Historical reports.
Previous E-Bills.
11.14 Effective Pricing

The architecture should support the concept of a price becoming effective at a specific point in time.

This allows the system to determine which price applies to a transaction without ambiguity.

Conceptually:

Price A
Effective: January 1
        │
        ▼
Transactions before Price B


Price B
Effective: June 1
        │
        ▼
Transactions from June 1 onward

The exact implementation of effective dates will be determined by the database and backend design.

11.15 Historical Price Management

Historical prices should remain accessible for administrative analysis where useful.

The Administrator may need to answer:

What was the standard price at the time?
When did the price change?
How did sales change after the price change?
What was the actual amount charged?

Historical price information must therefore remain distinguishable from current pricing.

11.16 Pricing and Reporting

Reporting must use the historical transaction price rather than the current price configuration.

For example:

Transaction from 2025
Historical Standard Price = ₹500
Actual Price = ₹500

Current Standard Price = ₹650

A 2025 report must use ₹500, not ₹650.

This is essential for accurate historical revenue analysis.

11.17 Pricing and E-Billing

E-Bills must use the actual transaction price.

The customer must not receive an E-Bill containing the current configured price if the transaction was completed under a previous price.

For example:

Historical Standard Price = ₹500
Actual Price Charged      = ₹450

E-Bill Amount = ₹450

The actual amount charged is the amount that matters for billing.

11.18 Pricing Validation

The backend must validate pricing before allowing a transaction to be completed.

The client may display a calculated price for responsiveness, but the backend must remain authoritative.

The backend should verify:

Vehicle category.
Vehicle variant where applicable.
Service package.
Current applicable standard price.
Actual transaction price.
Authorization for adjustments where required.
11.19 Price Configuration Integrity

The pricing system must prevent invalid configurations where possible.

Examples include:

Missing price for a required vehicle/service combination.
Duplicate active prices for the same combination.
Negative prices.
Invalid vehicle variants.
Price configurations referencing inactive services.

The exact validation rules will be refined during implementation.

11.20 Pricing and Custom Jobs

The business occasionally receives unusual requests that do not fit the standard service packages.

Examples may include:

Pressure washing spare parts.
Engine parts.
Exhaust components.
Other unusual objects or cleaning requests.

These should not force the standard pricing model to support every possible service combination.

Custom jobs should be handled through an exception mechanism with sufficient description and pricing information.

The exact custom-job model will be defined during the relevant feature design.

11.21 Pricing Security

Only authorized users should be able to modify standard pricing.

Pricing changes can directly affect business revenue and therefore require administrative protection.

Important pricing changes should be attributable to the Administrator who performed them.

11.22 Pricing Architecture Principle

The pricing architecture can be summarized as:

          CURRENT CONFIGURATION
                   │
                   ▼
        Vehicle Category / Variant
                   +
             Service Package
                   │
                   ▼
             Standard Price
                   │
                   ▼
          Transaction Created
                   │
          ┌────────┴────────┐
          ▼                 ▼
   Standard Price      Actual Price
     Snapshot            Charged
          │                 │
          └────────┬────────┘
                   ▼
              Transaction
                   │
          ┌────────┴────────┐
          ▼                 ▼
       Reporting          E-Bill

The fundamental rule is:

Current prices determine future transactions; historical transactions preserve the prices that applied when they occurred.

11.23 Pricing Architecture Decision

The pricing architecture must prioritize:

Administrator-controlled pricing.
Vehicle-category-based pricing.
Variant-based pricing where required.
Historical price preservation.
Negotiated transaction prices.
No unnecessary discount workflow.
Accurate reporting.
Accurate E-Billing.
Backend validation.
Future extensibility without unnecessary complexity.

The final implementation must preserve these principles regardless of the selected database or technology stack.

12. Customer & Vehicle Architecture
# 12. Customer & Vehicle Architecture

Customer and Vehicle architecture defines how the system identifies, stores, retrieves, and maintains information about the people and vehicles that interact with the business.

The architecture must prioritize the vehicle registration number because it is the primary operational identifier used during normal Staff workflow.

The system must support fast returning-customer transactions without requiring Staff to repeatedly enter information that already exists.

---

## 12.1 Vehicle-Centered Operational Model

The operational workflow is primarily vehicle-centered.

The typical interaction is:

Vehicle Arrives
        ↓
Vehicle Registration Number
        ↓
Vehicle Identified
        ↓
Existing Vehicle Found / New Vehicle Created
        ↓
Customer Information Retrieved Where Available
        ↓
Service Selected
        ↓
Transaction Created

The system should therefore optimize vehicle retrieval rather than requiring Staff to identify customers first.

---

## 12.2 Vehicle Registration Number

The vehicle registration number is the primary operational identifier.

It is mandatory for every service transaction.

The system must use it to:

- Identify a vehicle.
- Search for previous visits.
- Retrieve relevant customer information.
- Retrieve vehicle history.
- Create new transactions.
- Associate transactions with the correct vehicle.

The vehicle registration number must be stored consistently enough to support reliable search.

---

## 12.3 Registration Number Normalization

Users may enter vehicle registration numbers using different formatting.

Examples:

    KL07AB1234
    KL 07 AB 1234
    KL-07-AB-1234

The system should normalize reasonable formatting differences for search and matching.

The original display format may be preserved where useful.

The exact normalization rules must be defined during implementation based on actual registration formats encountered by the business.

The system must avoid aggressive normalization that could cause two genuinely different registration numbers to be treated as the same vehicle.

---

## 12.4 Vehicle Record

A Vehicle record represents the physical vehicle serviced by the business.

A vehicle should contain information such as:

- Vehicle registration number.
- Vehicle category.
- Vehicle variant where applicable.
- Associated customer where known.
- Creation information.
- Relevant current information.

The vehicle record should not contain historical transaction values that belong specifically to individual transactions.

---

## 12.5 Vehicle Category

A vehicle must be assigned a business-defined category when required for pricing.

Examples include:

- Hatchback.
- Sedan.
- SUV.
- Traveller.
- Pickup.
- Dost.

The category may be changed by an authorized Administrator when business classification changes.

Changing the current vehicle category must not alter the category stored within historical transactions.

---

## 12.6 Vehicle Variant

Some categories require additional size or configuration information.

Examples include:

    Traveller
    ├── 10 Seat
    ├── 14 Seat
    └── 17 Seat

Variants should only be required when they have genuine business or pricing significance.

Staff should not be forced to select a variant when the vehicle category does not use variants.

---

## 12.7 Customer Record

A Customer represents a person associated with one or more vehicles.

A customer record may contain:

- Name.
- Phone number.
- Associated vehicles.
- Relevant historical information.

Customer name is optional.

Phone number is normally useful but is not mandatory for completing a transaction.

The system must therefore support:

    Customer with phone number
    Customer without phone number
    Customer with name
    Customer without name

A missing optional customer field must never prevent a valid service transaction.

---

## 12.8 Customer-to-Vehicle Relationship

A customer may have multiple vehicles.

For example:

    Customer
    ├── Vehicle A
    ├── Vehicle B
    └── Vehicle C

The architecture must support this relationship without duplicating the customer's information unnecessarily.

A vehicle may have an associated customer relationship, but the vehicle remains an independent business entity.

---

## 12.9 Vehicle Without Customer Information

The business must be able to service a vehicle even when customer information is unavailable.

For example:

- Customer does not provide their name.
- Customer does not provide their phone number.
- Customer simply arrives with the vehicle.
- Customer only provides the vehicle registration number.

The transaction must still be possible.

Therefore:

    Vehicle Number = Required
    Customer Name = Optional
    Customer Phone = Optional

---

## 12.10 Returning Vehicle Workflow

When a vehicle returns, Staff should be able to search the registration number and retrieve the existing vehicle record.

The intended workflow is:

    Enter Vehicle Number
            ↓
    Existing Vehicle Found
            ↓
    Display Relevant History
            ↓
    Confirm / Update Information if Necessary
            ↓
    Select New Service
            ↓
    Create Transaction

Staff should not be required to recreate the customer or vehicle record for every visit.

---

## 12.11 Returning Customer Does Not Require Customer Identification First

A returning customer may identify themselves only through the vehicle.

The system should therefore support:

    Vehicle Number
          ↓
    Vehicle Record
          ↓
    Associated Customer
          ↓
    Previous History

The system should not force Staff to search by customer name or phone number before accessing the vehicle.

Customer search may exist as a secondary capability.

---

## 12.12 Customer Search

Customer search may be supported using:

- Phone number.
- Customer name.

However, these are secondary search methods.

The primary Staff search should remain the vehicle registration number.

Administrative interfaces may provide broader customer search capabilities.

---

## 12.13 Customer Information Updates

Customer information may be updated when new information becomes available.

Examples:

- Customer provides their name for the first time.
- Customer changes phone number.
- Customer adds another vehicle.

Updating the current customer record must not rewrite historical transaction data unnecessarily.

---

## 12.14 Vehicle Information Updates

Vehicle information may change over time.

For example:

- Vehicle category is corrected.
- Vehicle variant changes.
- Business classification rules change.

Current vehicle information may be updated by authorized users.

Historical transactions must preserve the information that was applicable at the time they occurred.

---

## 12.15 Historical Vehicle Information

A vehicle's current record and its historical transactions are separate concepts.

For example:

    Current Vehicle
    Category = SUV

    Historical Transaction
    Category at Time = Sedan

The historical transaction must remain Sedan even if the current vehicle record is later changed to SUV.

This prevents historical reports from being rewritten by current data changes.

---

## 12.16 Vehicle History

Vehicle history should provide Staff with enough information to understand previous visits quickly.

Relevant information may include:

- Previous service dates.
- Previous service packages.
- Previous transaction amounts.
- Previous vehicle classification.
- Previous payment information where appropriate.

The Staff interface should display only the information useful for the current transaction.

The full historical record may be available to the Administrator.

---

## 12.17 Customer History

Customer history may aggregate activity across all vehicles associated with the customer.

It may include:

- Previous visits.
- Associated vehicles.
- Service history.
- Total spending.
- Most recent transaction.
- Visit frequency.

Customer history exists primarily for business analysis and future customer-retention capabilities.

---

## 12.18 Customer and Vehicle Deduplication

The system should avoid creating duplicate vehicle records when the same registration number already exists.

For example:

    Existing:
    KL07AB1234

    Staff enters:
    KL-07-AB-1234

The system should recognize the normalized registration number as an existing vehicle where appropriate.

Customer deduplication should be more cautious because names are not reliable unique identifiers.

Phone number may provide stronger matching when available, but the system must avoid automatically merging customers based on weak evidence.

---

## 12.19 Vehicle Number Uniqueness

A normalized vehicle registration number should normally correspond to one vehicle record within the business.

The system must prevent accidental creation of multiple active vehicle records representing the same registration number.

Exceptions may need to be handled if real-world circumstances make the registration identifier ambiguous or if registration numbers are legitimately reused under different circumstances.

Such cases should be handled explicitly rather than through silent automatic merging.

---

## 12.20 Customer-Vehicle Association Changes

A vehicle may become associated with a different customer over time.

The architecture should therefore avoid assuming that a vehicle permanently belongs to one customer.

The system should be capable of representing changes in customer association without destroying historical transactions.

Historical transactions must preserve the customer context that was applicable when the transaction occurred where such information was recorded.

---

## 12.21 Privacy and Data Minimization

The system should collect only customer information that provides practical business value.

The current minimum operational information is:

    Vehicle Number
    Required

    Customer Name
    Optional

    Customer Phone
    Optional

Additional personal information should not be collected merely because the software can support it.

---

## 12.22 Customer History and WhatsApp

Customer phone numbers may be used for WhatsApp E-Billing.

The relationship is:

    Customer Phone
          ↓
    E-Bill Delivery
          ↓
    WhatsApp

WhatsApp delivery status must not determine whether the customer or vehicle record is valid.

A customer without a phone number can still have complete vehicle and transaction history.

---

## 12.23 Customer History and Future Loyalty

The architecture should retain sufficient historical information to support future capabilities such as:

- Loyalty programs.
- Memberships.
- Repeat-customer benefits.
- Customer-specific offers.
- Service reminders.
- Retention analysis.

These capabilities are not part of the current MVP.

---

## 12.24 Customer and Vehicle Architecture Principle

The architecture follows:

    VEHICLE NUMBER
          ↓
       VEHICLE
          ↓
    ┌─────┴─────┐
    ▼           ▼
 CUSTOMER   TRANSACTIONS
    │           │
    │           └── Service History
    │
    └── Other Vehicles

The key principles are:

1. Vehicle registration number is the primary operational identifier.
2. Vehicle is the central object in the Staff workflow.
3. Customer information supports the vehicle but does not replace it.
4. One customer may have multiple vehicles.
5. A vehicle may have many transactions.
6. Customer information may be incomplete.
7. Historical transaction information must remain preserved.
8. Current vehicle or customer information may change without rewriting history.
9. Duplicate vehicle records should be prevented.
10. The model must remain simple enough for the current business.

---

## 12.25 Architecture Decision

The Customer and Vehicle architecture must prioritize:

1. Fast vehicle-number retrieval.
2. Minimal Staff data entry.
3. Reliable returning-customer workflow.
4. Customer and vehicle history.
5. Historical data integrity.
6. Optional customer information.
7. Accurate vehicle classification.
8. Future loyalty and fleet expansion.
9. Privacy and data minimization.
10. Simplicity for the current MVP.

13. Reporting & Analytics Architecture

This section defines how the system should technically support the Administrator's reporting and analytics requirements.

# 13. Reporting & Analytics Architecture

Reporting and analytics transform authoritative transaction data into information that helps the Administrator understand and manage the business.

The reporting architecture must provide accurate historical analysis without affecting or rewriting the underlying business transactions.

The primary reporting periods are:

- Day.
- Week.
- Month.
- Year.
- Custom date range.

---

## 13.1 Reporting Source of Truth

All reporting must ultimately derive from authoritative POS transaction data.

The reporting layer must not maintain an independent manually edited copy of sales records.

The relationship is:

    Transactions
         ↓
    Reporting Logic
         ↓
    Aggregated Metrics
         ↓
    Dashboard / Reports / Excel

If a report differs from the underlying transaction records, the transaction records remain the source of truth.

---

## 13.2 Completed Transactions

Reports should primarily use valid completed transactions.

The reporting layer must distinguish completed transactions from:

- Incomplete transactions.
- Cancelled transactions.
- Voided transactions.
- Duplicate or invalid records.

The exact treatment of corrected and voided transactions will follow the final transaction-state rules.

---

## 13.3 Core Metrics

The system should support calculation of:

- Total vehicles serviced.
- Total sales.
- Cash sales.
- UPI sales.
- Average transaction value.
- Service package counts.
- Service package revenue.
- Vehicle category counts.
- Vehicle category revenue.
- New customer count.
- Returning customer count.

These metrics should be calculated automatically from transaction data.

Staff must not manually enter reporting totals.

---

## 13.4 Daily Reporting

The daily reporting view should provide a concise overview of the selected business day.

Example:

    DATE
    ─────────────────────
    Vehicles:        42
    Sales:       ₹18,450
    Cash:         ₹7,200
    UPI:         ₹11,250
    Avg. Sale:      ₹439

Additional information may include:

- Service distribution.
- Vehicle-category distribution.
- New versus returning customers.
- Price adjustments.

The exact dashboard presentation belongs to UI/UX design.

---

## 13.5 Weekly Reporting

The weekly reporting layer should aggregate daily activity across the selected week.

It should support:

- Total vehicles.
- Total sales.
- Daily sales trend.
- Daily vehicle count.
- Payment distribution.
- Service distribution.
- Average transaction value.

The Administrator should be able to identify unusually busy or slow days.

---

## 13.6 Monthly Reporting

Monthly reporting should provide a broader view of business performance.

It should support:

- Monthly sales.
- Monthly vehicle count.
- Weekly or daily sales trends.
- Service performance.
- Vehicle-category performance.
- Payment distribution.
- Average transaction value.
- New versus returning customer activity.

Where historical data is available, the system should support comparison with previous months.

---

## 13.7 Yearly Reporting

Yearly reporting should aggregate business performance across the year.

It should support:

- Annual sales.
- Annual vehicle count.
- Monthly sales trends.
- Monthly vehicle trends.
- Best-performing periods.
- Lowest-performing periods.
- Service performance.
- Vehicle-category performance.
- Payment distribution.
- Customer activity.

The yearly view should help identify seasonal patterns and long-term business changes.

---

## 13.8 Custom Date Range

The Administrator should be able to select a custom date range.

For example:

    01 June → 15 June

The reporting system should calculate metrics using only transactions within the selected period.

Custom date ranges are particularly useful for:

- Comparing periods.
- Reviewing unusual business periods.
- Investigating specific events.
- Preparing external reports.

---

## 13.9 Service Analytics

The reporting architecture should support analysis of standard service packages.

Current packages include:

- Body Wash.
- Body & Vacuum.
- Full Wash.

The system should be able to calculate:

- Number of transactions per service.
- Revenue per service.
- Percentage of total transactions.
- Percentage of total sales.
- Service trends over time.

Service activities inside a package should not be treated as independent sales unless the business later introduces separately chargeable activities.

---

## 13.10 Vehicle Category Analytics

The system should support analysis by vehicle category and variant.

Metrics may include:

- Number of vehicles.
- Revenue.
- Average transaction value.
- Service distribution.

The historical category recorded on the transaction must be used for historical reporting.

The current vehicle category must not overwrite historical transaction classification.

---

## 13.11 Payment Analytics

The reporting layer must support payment-method analysis.

Current methods:

- Cash.
- UPI.

The system should calculate:

- Cash total.
- UPI total.
- Number of cash transactions.
- Number of UPI transactions.
- Payment distribution over time.

Future payment methods should be capable of being added without redesigning the entire reporting architecture.

---

## 13.12 Customer Analytics

The system should support analysis of customer activity.

Possible metrics include:

- New customers.
- Returning customers.
- Customer visit frequency.
- Customer spending.
- Most recent visit.
- Vehicle count per customer.

Customer analytics must account for the fact that customer information is optional.

Transactions without customer-identifying information must not be incorrectly assigned to a customer.

---

## 13.13 Returning Customer Calculation

The system may determine whether a transaction belongs to a returning vehicle/customer using historical records.

The primary operational signal is the vehicle registration number.

Conceptually:

    Vehicle exists previously?
            │
        ┌───┴───┐
        │       │
       YES      NO
        │       │
    Returning   New

The exact definition of "returning customer" must remain consistent throughout reporting.

Where customer identity is unavailable, vehicle-return history may be used separately rather than falsely claiming customer identity.

13.14 Revenue Calculation

For the current POS, reported sales/revenue represent the actual amounts charged in completed transactions.

For example:

Transaction 1 = ₹400
Transaction 2 = ₹600
Transaction 3 = ₹350

Total Sales = ₹1,350

The system must not describe this as profit.

Profit calculation requires expense data, which is outside the current POS scope.

13.15 Average Transaction Value

Average transaction value should be calculated as:

Total Sales
────────────
Completed Transactions

The calculation must use the actual transaction amount rather than the current standard price.

13.16 Historical Price Analysis

Reporting must use the historical price stored with each transaction.

Example:

2025 Transaction
Standard Price = ₹500
Actual Price   = ₹500

Current Price
Standard Price = ₹650

A 2025 report must continue to use ₹500.

This allows the Administrator to evaluate the effect of historical price changes.

13.17 Negotiated Price Analysis

The reporting architecture should allow the Administrator to identify transactions where:

Actual Price ≠ Standard Price

Possible metrics include:

Number of adjusted transactions.
Total adjustment amount.
Average adjustment.
Adjustment frequency.
Revenue impact.

The exact reporting requirements may evolve after sufficient real-world data is collected.

13.18 Dashboard Data

The dashboard should receive calculated metrics rather than loading every historical transaction unnecessarily.

For example:

Dashboard Request
       ↓
Reporting Logic
       ↓
Aggregated Results
       ↓
Dashboard

The system should avoid transferring large volumes of raw transaction data to the client when only summary information is required.

13.19 Filtering

Administrative reports should support relevant filters such as:

Date range.
Vehicle category.
Vehicle variant.
Service package.
Payment method.
Vehicle registration number.
Customer.

Filters should be applied at the reporting/data layer where appropriate.

13.20 Report Performance

Reporting queries must be designed with expected data growth in mind.

The current business is not expected to have extremely large transaction volumes, so the MVP should prioritize:

Correctness.
Simplicity.
Maintainability.

Premature data warehouses, distributed analytics systems, or complex streaming infrastructure are not justified for the current business scale.

If the business grows substantially, reporting architecture can evolve.

13.21 Precomputed Aggregations

The system may use precomputed or cached reporting values if they provide a meaningful performance benefit.

However, such values must never become an uncontrolled second source of truth.

If precomputed data is used:

Transaction Data
      ↓
Aggregation / Cache
      ↓
Dashboard

The underlying transactions remain authoritative.

The MVP should avoid unnecessary aggregation infrastructure unless actual performance requirements justify it.

13.22 Excel Reporting

Excel exports should use the same authoritative reporting data used by the administrative reporting system.

For example:

Administrator
     ↓
Select Date Range
     ↓
Reporting Layer
     ↓
Retrieve Valid Transactions
     ↓
Generate Spreadsheet
     ↓
Excel Export

The export should not depend on manually maintained spreadsheets.

13.23 Daily Sales Export

The system must support daily sales export.

The exported data should contain relevant transaction-level information such as:

Date and time.
Vehicle registration number.
Vehicle category.
Service package.
Standard price.
Actual price.
Payment method.

The spreadsheet should also provide summary information where appropriate.

13.24 Reporting and External Services

Reporting must remain available even when external communication services fail.

For example:

WhatsApp Failure
      ↓
Transaction remains valid
      ↓
Reporting remains available
      ↓
Excel Export remains available

WhatsApp delivery status may be reported separately but must not determine whether a sale appears in business analytics.

13.25 Reporting Security

Reporting access must be restricted according to user role.

The Administrator has access to full business analytics.

Staff should not have unrestricted access to administrative reporting.

If Staff are later given limited reporting capabilities, those permissions should be explicitly defined.

13.26 Reporting Accuracy

The reporting system must ensure that:

Historical prices remain historical.
Voided transactions are handled consistently.
Duplicate transactions are not double-counted.
Payment totals match transaction records.
Service counts match completed transactions.
Vehicle counts are based on valid transactions.
Current configuration does not rewrite historical reports.

Reporting accuracy is more important than visual complexity.

13.27 Reporting Architecture Principle

The reporting architecture follows:

AUTHORITATIVE TRANSACTIONS
          ↓
    REPORTING LOGIC
          ↓
   ┌──────┼──────┐
   ▼      ▼      ▼
Dashboard Reports Excel
   │      │      │
   └──────┴──────┘
          │
          ▼
    ADMIN DECISIONS

The purpose of reporting is not merely to display numbers.

It is to help the Administrator:

Observe
   ↓
Analyze
   ↓
Understand
   ↓
Improve
   ↓
Grow

The reporting architecture must therefore prioritize accurate, actionable business information over unnecessary analytical complexity.

14. WhatsApp & E-Billing Architecture
# 14. WhatsApp & E-Billing Architecture

WhatsApp E-Billing is a core business requirement of the POS.

The architecture must allow the system to generate an E-Bill from a completed transaction and attempt delivery through WhatsApp without making WhatsApp a dependency for transaction recording, reporting, or business continuity.

---

## 14.1 E-Billing Principle

The E-Bill must be generated from authoritative transaction data.

The flow is:

    Completed Transaction
            ↓
       E-Bill Generation
            ↓
       E-Bill Available
            ↓
      WhatsApp Delivery
            ↓
    Delivery Success / Failure

The transaction remains the source of truth.

WhatsApp is only a communication channel.

---

## 14.2 E-Bill Contents

The E-Bill should contain the information necessary to clearly communicate the completed service transaction.

At minimum, it should include:

- Business name.
- Business contact information where applicable.
- Transaction date and time.
- Vehicle registration number.
- Vehicle category where relevant.
- Service package.
- Standard price where relevant.
- Actual amount charged.
- Payment method.

The exact visual format will be defined during UI/UX design.

---

## 14.3 Actual Amount Charged

The E-Bill must display the actual amount charged to the customer.

For example:

    Standard Price: ₹600
    Actual Price:   ₹550

    E-Bill Amount:
    ₹550

The E-Bill must never replace the historical transaction price with the current configured price.

---

## 14.4 WhatsApp as an External Integration

WhatsApp must be treated as an external integration.

The POS should communicate with WhatsApp through a dedicated integration boundary.

Conceptually:

    POS Backend
          │
          ▼
    E-Bill Service
          │
          ▼
    WhatsApp Integration
          │
          ▼
    Customer WhatsApp

The exact WhatsApp provider and API implementation will be evaluated separately.

---

## 14.5 Customer Phone Number

A customer phone number is useful for WhatsApp E-Billing but is not mandatory for completing a transaction.

Therefore:

    Phone Available
          ↓
    Attempt WhatsApp E-Bill

    Phone Unavailable
          ↓
    Transaction Still Completed

The absence of a phone number must not prevent:

- Service registration.
- Payment recording.
- Transaction completion.
- Reporting.
- Excel export.

---

## 14.6 WhatsApp Delivery Status

The system should be capable of representing the state of an E-Bill delivery attempt.

Possible states include:

- Not requested.
- Pending.
- Sent.
- Delivered where provider information supports this.
- Failed.

The exact delivery statuses depend on the capabilities of the selected WhatsApp integration.

---

## 14.7 WhatsApp Failure

WhatsApp failure must not invalidate the transaction.

For example:

    Transaction Completed
            ↓
       E-Bill Generated
            ↓
     WhatsApp Attempt
            ↓
          FAILED
            │
            ├── Transaction remains completed
            ├── Payment remains recorded
            ├── Analytics remain unchanged
            └── Excel export remains available

The system should preserve enough information to identify the failed delivery where useful.

---

## 14.8 Retry Handling

Where appropriate, failed WhatsApp delivery should be retryable.

A retry must not:

- Create another transaction.
- Create another payment.
- Change the transaction amount.
- Duplicate the underlying business record.

The retry applies only to the communication attempt.

The architecture should distinguish:

    Transaction
        ≠
    E-Bill
        ≠
    Delivery Attempt

---

## 14.9 E-Bill Regeneration

If an E-Bill needs to be regenerated, it must be generated from the authoritative transaction.

Regeneration must not create a new transaction.

For example:

    Existing Transaction
            ↓
    Regenerate E-Bill
            ↓
    New E-Bill Representation

The underlying transaction remains unchanged.

---

## 14.10 E-Bill and Transaction Corrections

If a completed transaction is legitimately corrected, the system must consider whether the previously generated E-Bill is still valid.

The exact correction and re-billing workflow will be defined when transaction correction rules are finalized.

The architecture should support:

- Identifying the original E-Bill.
- Determining whether it is affected by a correction.
- Generating an updated E-Bill where required.
- Preserving the transaction history.

---

## 14.11 Institutional and Business Customers

The business may provide services to:

- Institutions.
- Offices.
- Schools.
- Workshops.
- Other organizations.

These customers may require E-Billing through WhatsApp.

The architecture should therefore avoid assuming that every recipient is an individual customer.

Future fleet or institutional billing may introduce:

- Organization records.
- Multiple vehicles.
- Centralized billing.
- Monthly billing.

These are future capabilities.

---

## 14.12 Customer Communication Privacy

Customer phone numbers and WhatsApp-related information must be treated as private business data.

The system must avoid unnecessarily exposing phone numbers in:

- Public URLs.
- Client-side logs.
- Error messages.
- Analytics visible to unauthorized users.

Access must follow the role-based authorization model.

---

## 14.13 WhatsApp Credentials

WhatsApp API credentials, tokens, and secrets must never be stored in frontend code.

They must be maintained using secure backend configuration or secret-management facilities provided by the selected infrastructure.

---

## 14.14 External Service Independence

The architecture must ensure that the POS remains operational when WhatsApp is unavailable.

The following must continue to work independently:

- Transaction creation.
- Payment recording.
- Transaction completion.
- Customer history.
- Vehicle history.
- Reporting.
- Analytics.
- Excel export.

WhatsApp is an enhancement to the transaction workflow, not the foundation of the transaction workflow.

---

## 14.15 E-Bill Storage

The architecture should determine whether the E-Bill itself needs to be permanently stored or whether it can be deterministically regenerated from the transaction.

The preferred approach should minimize unnecessary duplication of business data.

If generated files are stored, the system should retain appropriate references and ensure that stored E-Bills remain associated with the correct transaction.

The final storage strategy will be determined during infrastructure and implementation design.

---

## 14.16 E-Bill Format

The business requires an electronic bill but has not yet finalized the exact format.

Possible formats include:

- PDF.
- Image.
- Structured WhatsApp message.
- PDF plus message.
- Other suitable digital representation.

The final format should prioritize:

- Readability.
- Professional appearance.
- Mobile compatibility.
- Easy customer understanding.
- Low generation complexity.
- Reliable WhatsApp delivery.

The exact format is a product/UI decision rather than a business requirement at this stage.

---

## 14.17 Delivery Architecture

The logical delivery architecture is:

    Staff
      ↓
    Transaction
      ↓
    Backend
      ↓
    E-Bill Generator
      ↓
    WhatsApp Integration
      ↓
    Customer

The Administrator may also initiate or retry an E-Bill delivery where authorized.

---

## 14.18 Delivery Logging

The system should maintain enough information to determine:

- Whether an E-Bill was generated.
- Whether delivery was attempted.
- Whether delivery succeeded or failed.
- When the attempt occurred.

The system should not store unnecessary external-service data merely for logging purposes.

---

## 14.19 WhatsApp Rate Limits and Provider Restrictions

The implementation must account for limitations imposed by the selected WhatsApp integration.

These may include:

- Message limits.
- Template requirements.
- Authentication requirements.
- Delivery restrictions.
- Provider costs.
- Message formatting restrictions.

The exact provider-specific constraints will be evaluated before implementation.

The core POS architecture must remain independent of any one provider where practical.

---

## 14.20 WhatsApp Cost Consideration

WhatsApp integration may introduce recurring costs depending on the provider and message volume.

The system architecture should therefore avoid unnecessary message generation or duplicate delivery attempts.

The business should only send E-Bills and future automated messages when they serve a genuine business purpose.

---

## 14.21 Future WhatsApp Automation

The architecture should allow future communication capabilities without requiring a redesign of the transaction system.

Potential future capabilities include:

- Pickup reminders.
- Service reminders.
- Loyalty messages.
- Membership reminders.
- Feedback requests.
- Promotional communication.
- Corporate billing.

These are future capabilities and are not required for the MVP except for E-Billing.

---

## 14.22 WhatsApp Architecture Principle

The fundamental architecture is:

    AUTHORITATIVE TRANSACTION
              │
              ├──────────────► Reporting
              │
              ├──────────────► Excel
              │
              ▼
           E-BILL
              │
              ▼
          WHATSAPP
              │
        ┌─────┴─────┐
        ▼           ▼
     Success      Failure
        │           │
        ▼           ▼
     Customer    Retry / Review

The core principle is:

> WhatsApp delivery is an output of a transaction, not a prerequisite for the transaction.

The business must never lose a valid transaction merely because an external communication service is unavailable.

# 15. Excel Export Architecture

Excel export provides the Administrator with a practical way to review, archive, share, or process business transaction data outside the POS.

Excel is an output of the POS and must never become the primary source of truth.

---

## 15.1 Excel Export Principle

The POS database remains the authoritative source of business information.

The export flow is:

    Authoritative Transactions
            ↓
       Reporting Logic
            ↓
       Export Generation
            ↓
        Excel File

The generated spreadsheet is a representation of the underlying business data.

Changes made to an exported spreadsheet must not modify the POS unless a future controlled import capability is explicitly introduced.

---

## 15.2 Administrator Access

Excel export is primarily an Administrator capability.

Staff do not require unrestricted access to business-wide Excel exports.

The Administrator should be able to generate exports from the reporting interface.

---

## 15.3 Required Export Periods

The architecture must support at least:

- Daily export.
- Weekly export.
- Monthly export.
- Yearly export.
- Custom date-range export.

The initial MVP priority is the Daily Sales Export.

---

## 15.4 Daily Sales Export

The Daily Sales Export should contain transaction-level information relevant to business review.

At minimum:

- Date.
- Time.
- Vehicle registration number.
- Vehicle category.
- Vehicle variant where applicable.
- Service package.
- Standard price.
- Actual price charged.
- Payment method.

Where customer information is appropriate, the export may also include:

- Customer name.
- Customer phone number.

The inclusion of customer phone numbers in exports must follow the system's privacy and authorization rules.

---

## 15.5 Summary Information

The exported report should provide useful summary information in addition to transaction-level records.

Possible summary values include:

- Total vehicles.
- Total sales.
- Cash total.
- UPI total.
- Average transaction value.
- Number of transactions.
- Service package distribution.

The exact spreadsheet layout will be finalized during UI/UX and reporting design.

---

## 15.6 Historical Pricing

Excel exports must use the historical transaction values.

For example:

    Historical Transaction
    Standard Price = ₹500
    Actual Price   = ₹450

    Current Price Configuration
    Standard Price = ₹600

The exported historical transaction must contain:

    Standard Price = ₹500
    Actual Price   = ₹450

The export must never substitute the current price for the historical transaction price.

---

## 15.7 Negotiated Pricing

Where the actual price differs from the standard price, the export should preserve the distinction.

Example:

    Standard Price: ₹600
    Actual Price:   ₹550
    Difference:     ₹50

Where the system records an adjustment reason, that information may also be included.

This allows the Administrator to identify negotiated or otherwise adjusted transactions.

---

## 15.8 Payment Information

The export must preserve the payment method associated with each transaction.

Current methods are:

- Cash.
- UPI.

The summary section should allow the Administrator to reconcile:

    Total Sales
         =
    Cash Total
       +
    UPI Total

subject to the treatment of corrected, voided, or otherwise exceptional transactions.

---

## 15.9 Export Consistency

Excel reports and dashboard reports should derive their information from the same authoritative transaction data.

For example:

    Dashboard Total
          │
          ├── Same Transactions
          │
          ▼
    Excel Export Total

The Administrator should not encounter unexplained differences between the dashboard and an export generated for the same period.

---

## 15.10 Filtering

The export system should support the same relevant filters available to administrative reporting where practical.

Potential filters include:

- Date range.
- Vehicle category.
- Vehicle variant.
- Service package.
- Payment method.
- Vehicle registration number.
- Customer.

If filters are applied, the exported file must clearly represent the selected scope.

---

## 15.11 File Generation

The backend should generate the Excel file from authoritative business data.

The client should request the export rather than constructing the financial dataset independently.

Conceptually:

    Administrator
          ↓
    Select Export Period
          ↓
    Apply Filters
          ↓
    Backend
          ↓
    Retrieve Valid Transactions
          ↓
    Generate Spreadsheet
          ↓
    Return File

This ensures that export logic remains centralized and consistent.

---

## 15.12 Large Export Handling

The current business is not expected to generate extremely large exports.

The MVP should therefore use a simple export mechanism.

If the business later grows significantly, the architecture may support:

- Background export generation.
- Progress indicators.
- Export history.
- Asynchronous processing.
- Larger data volumes.

These are not required for the initial implementation.

---

## 15.13 Export Failure

If Excel generation fails:

- The underlying transactions must remain unchanged.
- The reporting data must remain available.
- The Administrator should receive a clear error message.
- The export should be safely retryable.

An export failure must never affect transaction integrity.

---

## 15.14 Export Naming

Generated files should use predictable naming conventions.

Example:

    Daily_Sales_2026-08-09.xlsx

Other examples:

    Weekly_Sales_2026-W32.xlsx
    Monthly_Sales_2026-08.xlsx
    Yearly_Sales_2026.xlsx

The final naming convention may be refined during implementation.

---

## 15.15 Export Security

Exports may contain sensitive business and customer information.

The system must ensure that:

- Only authorized users can generate them.
- Files are generated through authenticated requests.
- Temporary files are not unnecessarily exposed publicly.
- Customer information is not included unless appropriate.
- Export endpoints are protected against unauthorized access.

The implementation should avoid exposing raw database data directly to the client.

---

## 15.16 Excel as a Business Backup

Excel export provides a practical secondary copy of business information for administrative review.

However, it must not be treated as the official database backup mechanism.

The system should separately implement appropriate infrastructure-level backup and recovery mechanisms.

Excel export exists primarily for:

- Review.
- Analysis.
- Sharing.
- Record keeping.
- External processing.

---

## 15.17 Excel and WhatsApp Independence

Excel export must operate independently of WhatsApp.

For example:

    WhatsApp unavailable
          ↓
    Transaction remains valid
          ↓
    Reporting remains available
          ↓
    Excel export remains available

The business must remain capable of generating its daily sales report even if customer communication services fail.

---

## 15.18 Future Export Formats

Excel is the required spreadsheet export format for the current system.

Future exports may include:

- CSV.
- PDF reports.
- Accounting-system formats.
- API-based exports.

These should be treated as additional representations of authoritative business data.

---

## 15.19 No Import Requirement

The MVP does not require Excel import.

The initial direction is:

    POS
      ↓
    Excel Export

not:

    Excel
      ↓
    POS Import

If historical data migration or bulk import becomes necessary, it should be implemented as a separate controlled capability with validation and safeguards.

---

## 15.20 Excel Export Architecture Principle

The architecture follows:

    POS DATABASE
         │
         ▼
    REPORTING LAYER
         │
         ▼
    EXPORT GENERATOR
         │
         ▼
    EXCEL FILE

The core principles are:

1. POS data remains authoritative.
2. Excel is an output, not a source of truth.
3. Historical transaction values are preserved.
4. Administrative access is required.
5. Reports and exports use consistent data.
6. Export failures cannot damage business records.
7. WhatsApp availability must not affect export availability.
8. The MVP should use a simple export mechanism.
9. Future export formats can be added without changing core transaction data.

# 16. Reliability & Failure Handling

The POS will be used during active business operations, including busy periods when Staff may be processing multiple vehicles in a short period.

Reliability therefore means more than preventing complete system outages.

The system must also prevent:

- Lost transactions.
- Duplicate transactions.
- Incorrect payment records.
- Accidental data loss.
- External-service failures from affecting core operations.
- Staff uncertainty about whether an operation succeeded.

The architecture should prioritize recovery and data integrity without introducing unnecessary infrastructure for the current business scale.

---

## 16.1 Reliability Principle

The core business transaction must remain reliable even when optional services fail.

The fundamental principle is:

    Core Business Operation
            │
            ├── Must remain reliable
            │
            └── Optional Services
                    │
                    ├── WhatsApp
                    ├── E-Bill Delivery
                    └── Excel Generation

Failure of an optional service must not corrupt or invalidate the core business record.

---

## 16.2 Core Operations

The following operations are considered core business operations:

- Vehicle identification.
- Customer and vehicle retrieval.
- Service selection.
- Transaction creation.
- Price determination.
- Payment recording.
- Transaction completion.
- Historical record creation.

These operations require the highest reliability.

---

## 16.3 Secondary Operations

The following operations support the core system but should not control whether a transaction is valid:

- WhatsApp delivery.
- E-Bill delivery.
- Excel export.
- Advanced analytics.
- Future automated communication.

Failure of a secondary operation should be isolated from the transaction.

---

## 16.4 Network Failure

The system must account for temporary network interruptions.

Possible failure situations include:

- Mobile data temporarily unavailable.
- Wi-Fi interruption.
- Weak network connection.
- Backend temporarily unreachable.
- Request timeout.

The application should clearly indicate when an operation has not been successfully completed.

Staff must not be left guessing whether a transaction was saved.

---

## 16.5 Duplicate Submission Protection

Busy Staff may accidentally:

- Tap a button twice.
- Refresh a page.
- Retry after a slow response.
- Submit the same form again.

The architecture must protect against accidental duplicate transactions.

For example:

    Staff submits transaction
            ↓
       Network delay
            ↓
    Staff taps again
            ↓
       Backend detects
       duplicate operation
            ↓
    Only one transaction created

The exact idempotency mechanism will depend on the selected backend and database technology.

---

## 16.6 Payment Reliability

Payment recording is a critical business operation.

The system must not display a payment as successfully recorded unless the authoritative data layer confirms that the payment was persisted.

For example:

    Staff taps "Paid"
            ↓
       Backend request
            ↓
       Payment persisted
            ↓
       Confirmation
            ↓
    Transaction marked paid

If persistence fails:

    Payment not confirmed
            ↓
    Transaction remains unpaid
            ↓
    Staff receives clear feedback

The system must avoid ambiguous payment states wherever possible.

---

## 16.7 Transaction Integrity

A transaction should not be left in an internally inconsistent state.

For example, the system should prevent situations such as:

- Payment exists without a valid transaction.
- Completed transaction has no payment.
- Transaction references an unavailable service.
- Transaction has no vehicle.
- Transaction has no historical price.
- Transaction is counted in reports despite being invalidated.

The backend and data layer must enforce appropriate integrity constraints.

---

## 16.8 External Service Failure

External integrations may fail independently of the POS.

Examples include:

- WhatsApp API unavailable.
- WhatsApp message rejected.
- E-Bill generation failure.
- Excel generation failure.
- External provider timeout.

The architecture must isolate these failures.

Example:

    Transaction Completed
            │
            ├──────────────► Reporting
            │
            ├──────────────► Historical Data
            │
            └──────────────► E-Bill
                                │
                                ▼
                             WhatsApp
                                │
                              FAILED

The transaction remains valid.

---

## 16.9 WhatsApp Retry

A failed WhatsApp delivery should be retryable where appropriate.

Retrying should:

- Reuse the existing transaction.
- Reuse or regenerate the E-Bill.
- Create only a communication attempt.
- Never create another transaction.
- Never create another payment.

The system should prevent uncontrolled repeated message attempts.

---

## 16.10 Excel Export Failure

If Excel generation fails:

- Transactions remain unchanged.
- Reporting remains available.
- The Administrator receives a clear error.
- The export can be attempted again.

The export process must not modify transaction records.

---

## 16.11 Application Crash

If the application closes unexpectedly:

- Already persisted transactions must remain intact.
- Completed payments must remain recorded.
- Historical data must remain available.
- The user should be able to reopen the application and continue normal operation.

The system must not rely solely on temporary client state for business records.

---

## 16.12 Partial Operations

The architecture must identify operations that could fail partway through execution.

For example:

    Create Transaction
          +
    Record Payment
          +
    Generate E-Bill

These should not be treated as one inseparable operation if E-Bill delivery depends on an external service.

The core transaction and payment should be committed independently from external communication.

---

## 16.13 Recovery Strategy

When an operation fails, the system should prefer safe recovery over silent retry.

The user should know whether:

- The operation succeeded.
- The operation failed.
- The operation is still processing.
- The operation can be safely retried.

The system should avoid creating duplicate records simply because a user retries an uncertain operation.

---

## 16.14 User Feedback During Failure

Error messages should be operationally useful.

Bad:

    "HTTP 500 Internal Server Error"

Better:

    "The transaction could not be saved.
     No payment was recorded.
     Please try again."

Best where the system knows the state:

    "Transaction saved successfully.
     WhatsApp delivery failed.
     You can retry the E-Bill later."

The Staff user should never need to understand backend implementation details.

---

## 16.15 Data Backup

The authoritative business database must have an appropriate backup strategy.

Backups should protect against:

- Infrastructure failure.
- Accidental data deletion.
- Database corruption.
- Deployment errors.
- Other catastrophic data-loss scenarios.

The exact backup frequency and retention strategy will be determined during infrastructure design.

---

## 16.16 Backup Is Not Excel Export

Excel exports are not a replacement for database backups.

They serve different purposes:

    Database Backup
    ↓
    Disaster Recovery

    Excel Export
    ↓
    Business Review / Sharing / Analysis

The system should implement proper infrastructure-level backup independently of Excel export.

---

## 16.17 Data Recovery

The architecture must provide a reasonable path to restoring business data after a serious failure.

Recovery must preserve:

- Customers.
- Vehicles.
- Transactions.
- Payments.
- Historical prices.
- Business configuration where appropriate.

The exact recovery mechanism depends on the selected infrastructure.

---

## 16.18 Monitoring

The system should provide enough monitoring to identify significant failures.

Important events may include:

- Backend availability.
- Database connectivity.
- Failed transaction requests.
- Failed payment recording.
- WhatsApp failures.
- E-Bill failures.
- Export failures.
- Authentication failures.

The MVP should avoid excessive monitoring infrastructure that provides little practical value.

---

## 16.19 Logging

Application logs should provide enough information to diagnose operational failures.

Logs should include useful technical context such as:

- Timestamp.
- Operation type.
- Error category.
- Request or transaction reference where appropriate.
- External integration status.

Logs should not unnecessarily expose:

- Customer phone numbers.
- Authentication credentials.
- API secrets.
- Sensitive business information.

---

## 16.20 Auditability

Important business changes should be attributable to the user who performed them.

Potential audit events include:

- Price changes.
- Service changes.
- Vehicle-category changes.
- Transaction corrections.
- Transaction voids.
- Staff account changes.

Not every read or interface interaction requires auditing.

Auditability should focus on actions that materially affect business records or configuration.

---

## 16.21 Concurrent Usage

The POS may be accessed by multiple Staff devices simultaneously.

The system must ensure that concurrent operations do not:

- Overwrite each other.
- Create duplicate transactions.
- Corrupt customer records.
- Produce incorrect payment totals.

The selected backend and database must provide appropriate concurrency guarantees.

---

## 16.22 Offline Capability

Offline operation is not yet a finalized business requirement.

However, the architecture must consider temporary network failures because Staff operations occur primarily on mobile devices.

Possible approaches include:

- Full offline transaction support.
- Limited offline operation.
- Local temporary persistence.
- Network-required operation with recovery mechanisms.

The final approach must be selected based on:

- Actual business network reliability.
- Transaction consistency requirements.
- Implementation complexity.
- Security.
- Cost.
- Staff experience.

The MVP should not introduce complex offline synchronization unless the business environment demonstrates that it is necessary.

---

## 16.23 Failure Classification

The system should distinguish between different classes of failure.

### Business Failure

A business operation is invalid.

Examples:

- Missing vehicle number.
- Invalid service.
- Unauthorized price change.
- Invalid payment.

The operation should be rejected.

### Infrastructure Failure

The system cannot currently perform an operation because of a technical problem.

Examples:

- Backend unavailable.
- Database unavailable.
- Network timeout.

The operation should be safely retryable where possible.

### External Service Failure

An external integration fails.

Examples:

- WhatsApp unavailable.
- E-Bill delivery failure.

The core transaction should remain valid.

---

## 16.24 Reliability Priority

Reliability priorities should follow:

    1. Protect business data.
    2. Prevent duplicate transactions.
    3. Protect payment records.
    4. Preserve historical accuracy.
    5. Isolate external failures.
    6. Provide clear recovery feedback.
    7. Maintain reasonable availability.
    8. Add advanced resilience only when justified.

---

## 16.25 Reliability Architecture Principle

The system should follow:

    FAIL SAFELY
          ↓
    PRESERVE DATA
          ↓
    TELL THE USER
          ↓
    ALLOW SAFE RECOVERY

The worst outcome is not a failed WhatsApp message or failed Excel export.

The worst outcome is:

> The business does not know whether a transaction was recorded, or the transaction/payment data is lost or duplicated.

The architecture must therefore prioritize transaction integrity and operational certainty above optional automation.

# 17. Infrastructure & Deployment Architecture

The infrastructure must support a reliable, secure, low-maintenance POS suitable for a small but growing car wash business.

The system is primarily accessed through mobile phones by Staff and through desktop computers by the Administrator.

The infrastructure should therefore prioritize:

- Reliability.
- Fast response times.
- Low operational complexity.
- Secure access.
- Automatic backups.
- Reasonable cost.
- Easy deployment.
- Future scalability.

The MVP should avoid infrastructure complexity that is not justified by the current business.

---

## 17.1 Deployment Model

The POS should be deployed as a cloud-accessible application.

The intended architecture is:

    Staff Mobile / Desktop
              │
              ▼
         Internet
              │
              ▼
       POS Application
              │
              ▼
          Backend
              │
              ▼
          Database
              │
       ┌──────┴──────┐
       ▼             ▼
   WhatsApp       Storage /
   Integration    Exports

This allows Staff and Administrator to access the same business system from different devices.

---

## 17.2 No Local-Only Architecture

The MVP should not depend on a single computer inside the business.

A local-only POS would introduce risks such as:

- Hardware failure.
- Data loss.
- Limited device access.
- Difficult backups.
- Difficulty accessing reports remotely.
- Difficulty supporting multiple Staff devices.

The system should therefore be designed as a centrally managed application.

---

## 17.3 Cloud Infrastructure

Cloud infrastructure is preferred because the business requires:

- Multiple device access.
- Centralized data.
- Remote Administrator access.
- Automated backups.
- External API integrations.
- Future scalability.

The exact cloud provider is not yet locked.

Potential infrastructure choices will be evaluated based on:

- Cost.
- Reliability.
- Database capabilities.
- Authentication support.
- Deployment simplicity.
- WhatsApp integration compatibility.
- Developer experience.
- Future scalability.

---

## 17.4 Frontend Hosting

The frontend should be hosted using a reliable web application hosting platform.

The hosting environment should support:

- HTTPS.
- Fast delivery.
- Responsive web application access.
- Production deployments.
- Environment-specific configuration.

The exact provider will be selected during infrastructure implementation.

---

## 17.5 Backend Hosting

The backend must be hosted in a secure server-side environment.

It must support:

- API requests.
- Authentication verification.
- Business logic.
- Database access.
- External integrations.
- Export generation.
- E-Bill generation.

Backend secrets must remain server-side.

---

## 17.6 Database Hosting

The database must be hosted in a managed or appropriately secured environment.

The database must support:

- Persistent storage.
- Transaction integrity.
- Concurrent access.
- Backups.
- Secure connections.
- Appropriate indexing.
- Historical data preservation.

The database technology itself is not yet finalized.

---

## 17.7 Environment Separation

The system should distinguish between at least:

- Development.
- Production.

Development environments must not directly modify production business data.

Where practical, a staging environment may be introduced before production deployment.

---

## 17.8 Environment Configuration

Environment-specific configuration must not be hard-coded into application source code.

Examples include:

- Database connection information.
- Authentication configuration.
- WhatsApp credentials.
- API keys.
- Storage configuration.
- Application URLs.

Secrets must be provided through secure environment configuration or secret-management facilities.

---

## 17.9 Production Security

Production infrastructure must use secure communication.

At minimum:

- HTTPS must be enforced.
- Database connections must use secure transport where supported.
- Authentication tokens must be protected.
- Administrative endpoints must require authorization.
- Secrets must not be exposed to clients.

The application must not rely on obscurity as a security mechanism.

---

## 17.10 Domain and Access

The production application should use a stable business-facing domain.

For example:

    https://<business-domain>

The exact domain is a deployment decision.

The application should avoid requiring Staff to remember technical infrastructure addresses.

---

## 17.11 Mobile Access

Staff should be able to access the application from a mobile browser without installing a native application unless a future requirement justifies one.

The MVP should therefore prioritize a high-quality responsive web application.

A Progressive Web App may be considered if it provides meaningful benefits such as:

- Home-screen installation.
- Better mobile launching.
- Limited offline support.
- Improved app-like experience.

It should not be introduced merely for branding.

---

## 17.12 Desktop Access

The same web application should support Administrator desktop usage.

The system should not require a separate desktop application for the MVP.

The Administrator should access the same production system through a browser.

---

## 17.13 Database Backups

The production database must have automated backups.

Backup strategy should consider:

- Backup frequency.
- Retention period.
- Recovery process.
- Backup integrity.
- Protection from accidental deletion.

The exact backup configuration will depend on the selected database provider.

---

## 17.14 Disaster Recovery

The infrastructure should have a documented recovery approach for major failures.

Potential failure scenarios include:

- Database corruption.
- Hosting failure.
- Accidental deletion.
- Deployment failure.
- Authentication configuration failure.
- External integration failure.

Recovery procedures should prioritize restoration of authoritative business data.

---

## 17.15 Deployment Process

Production deployments should follow a controlled process.

Conceptually:

    Code Change
        ↓
    Development
        ↓
    Testing
        ↓
    Build
        ↓
    Deployment
        ↓
    Production
        ↓
    Verification

The system should avoid making untested direct changes to production.

---

## 17.16 Database Migrations

If the selected database requires schema migrations, changes must be managed through version-controlled migration processes.

A production database must not be modified manually as the normal development workflow.

Migration procedures must consider:

- Backward compatibility.
- Existing production data.
- Rollback or recovery strategy.
- Data transformation.
- Downtime requirements.

---

## 17.17 Monitoring

Production infrastructure should provide basic monitoring for:

- Application availability.
- Backend health.
- Database connectivity.
- Significant errors.
- External integration failures.

The MVP does not require an extensive enterprise monitoring platform.

Monitoring should provide enough information to identify meaningful failures quickly.

---

## 17.18 Logging Infrastructure

Production logs should be centralized where practical.

Logs should support diagnosis of:

- Application failures.
- Backend errors.
- Authentication failures.
- Database errors.
- WhatsApp integration failures.
- Export failures.

Logs must not contain:

- Passwords.
- API secrets.
- Authentication tokens.
- Unnecessary customer personal information.

---

## 17.19 Cost Management

Infrastructure costs must be considered because the business is currently a single car wash operation.

The architecture should avoid:

- Over-provisioned servers.
- Unnecessary managed services.
- Complex distributed infrastructure.
- Paid services with no meaningful MVP benefit.

The preferred approach is:

    Start Simple
         ↓
    Measure Usage
         ↓
    Identify Bottlenecks
         ↓
    Scale Where Necessary

---

## 17.20 Scalability

The infrastructure should support future growth without requiring a complete rewrite.

Potential growth includes:

- More Staff.
- More devices.
- More daily transactions.
- More historical data.
- More branches.
- More customers.
- More integrations.

However, the MVP does not require infrastructure designed for massive scale.

The system should scale proportionally to actual business growth.

---

## 17.21 Multi-Branch Future

The current business model is based on a single operating location.

Future expansion may introduce multiple branches.

The infrastructure should avoid decisions that make multi-branch support impossible.

However, branch-aware data models and infrastructure should not be unnecessarily introduced into the MVP if they complicate the current system without business value.

---

## 17.22 Availability

The POS should aim for high practical availability during business operating hours.

The most important requirement is that Staff can reliably:

- Search vehicles.
- Create transactions.
- Record payments.
- Retrieve history.

Advanced high-availability infrastructure is not currently justified.

---

## 17.23 Network Dependency

The application is expected to use network connectivity because the core data is centrally hosted.

The system must nevertheless handle temporary connectivity failures gracefully.

Network-dependent operations must:

- Provide clear feedback.
- Avoid duplicate submissions.
- Preserve already persisted data.
- Allow safe retries.

Offline-first operation remains an architectural option rather than a locked MVP requirement.

---

## 17.24 External Integration Infrastructure

External integrations such as WhatsApp should be isolated from the core infrastructure.

The architecture should prevent:

    WhatsApp outage
          ↓
    Entire POS outage

Instead:

    WhatsApp outage
          ↓
    Communication unavailable
          ↓
    POS continues operating

This separation is mandatory for business continuity.

---

## 17.25 Storage

The system may require storage for generated artifacts such as:

- E-Bills.
- Export files.
- Future uploaded documents.

The architecture should distinguish between:

- Business database records.
- Generated files.
- Temporary files.

Temporary files should not be retained indefinitely.

---

## 17.26 Infrastructure Security

Infrastructure access must be restricted to authorized technical administrators.

Production infrastructure credentials must not be shared with Staff.

The system should follow the principle of least privilege for:

- Cloud accounts.
- Database access.
- Deployment credentials.
- API credentials.
- Storage access.

---

## 17.27 Infrastructure Architecture Principle

The preferred infrastructure model is:

    USERS
      │
      ▼
    HTTPS
      │
      ▼
    FRONTEND
      │
      ▼
    BACKEND
      │
      ▼
    DATABASE
      │
    ┌─┴─────────────┐
    ▼               ▼
 STORAGE       EXTERNAL APIs
                   │
                   ▼
                WhatsApp

With:

- Secure authentication.
- Automated backups.
- Controlled deployments.
- Basic monitoring.
- Secure secrets.
- Responsive web access.

---

## 17.28 Infrastructure Architecture Decision

The infrastructure must prioritize:

1. Reliability.
2. Security.
3. Low operational complexity.
4. Reasonable cost.
5. Automated backups.
6. Secure deployment.
7. Mobile accessibility.
8. External integration support.
9. Future scalability.
10. Avoidance of premature infrastructure complexity.

The exact technology stack will be selected after evaluating the complete architecture and implementation requirements.

# 18. Security Architecture

Security must protect the business and its customers without making the normal Staff workflow unnecessarily difficult.

The POS handles:

- Customer information.
- Vehicle information.
- Phone numbers.
- Transaction records.
- Payment information.
- Business financial information.
- Pricing configuration.
- Administrative data.
- WhatsApp integration credentials.

The security architecture must therefore protect both business data and access to business operations.

---

## 18.1 Security Principles

The system must follow these principles:

1. Least privilege.
2. Secure by default.
3. Backend-enforced authorization.
4. Data minimization.
5. Secure communication.
6. Protected credentials and secrets.
7. Historical data integrity.
8. Safe error handling.
9. Controlled administrative actions.
10. Practical security without unnecessary operational friction.

---

## 18.2 Authentication Security

All protected application functionality must require authentication.

Authentication must be handled using an established and secure authentication mechanism.

The system should avoid implementing custom authentication protocols unnecessarily.

Authentication credentials must never be exposed to:

- Other Staff users.
- Customers.
- Frontend source code.
- Logs.
- URLs.

---

## 18.3 Authorization Security

Authentication alone is insufficient.

After authentication, the system must determine what the user is allowed to do.

The current authorization model is:

    Administrator
        ↓
    Management + Configuration + Analytics

    Staff
        ↓
    Operational Transactions

Authorization must be enforced at the backend or authoritative data-access layer.

---

## 18.4 Least Privilege

Users should receive only the permissions necessary for their responsibilities.

For example:

    Staff
    ├── Search vehicle
    ├── Create transaction
    ├── Record payment
    └── View relevant history

    Administrator
    ├── Everything required for Staff
    ├── Manage pricing
    ├── Manage services
    ├── Reports
    ├── Analytics
    ├── Excel export
    └── Staff management

The system should not grant Staff unrestricted database or administrative access.

---

## 18.5 Secure Communication

All production communication must use HTTPS.

Sensitive information must not be transmitted over unencrypted connections.

This includes:

- Authentication information.
- Customer information.
- Transaction data.
- Administrative requests.
- API requests.

---

## 18.6 Database Security

The database must not be directly accessible to normal application users.

The preferred flow is:

    Client
      ↓
    Authorized Application Layer
      ↓
    Database

The application layer controls:

- Authentication.
- Authorization.
- Validation.
- Business rules.
- Data access.

Direct unrestricted database access from the client must be avoided.

---

## 18.7 Customer Data Protection

Customer information should be protected according to its sensitivity.

Potentially personal information includes:

- Customer name.
- Phone number.
- Customer history.

The system should only expose this information to users who require it.

Customer data must not unnecessarily appear in:

- Public URLs.
- Logs.
- Error messages.
- Client-side analytics.
- Unprotected exports.

---

## 18.8 Phone Number Protection

Phone numbers are particularly important because they may be used for WhatsApp communication.

The system should avoid exposing phone numbers unnecessarily.

For example, logs should not contain full phone numbers unless there is a genuine debugging or audit requirement.

---

## 18.9 Payment Data Security

The POS records payment method and transaction amount.

Current payment methods are:

- Cash.
- UPI.

The system should not store sensitive banking credentials, UPI PINs, or other authentication secrets.

The POS records the business transaction, not the customer's banking credentials.

---

## 18.10 UPI Security

The POS must not attempt to capture or store:

- UPI PIN.
- Bank password.
- Card PIN.
- Authentication credentials.

If future UPI payment integrations are introduced, they must use the payment provider's secure mechanisms.

---

## 18.11 Secrets Management

The following must be treated as secrets:

- Database credentials.
- Authentication secrets.
- WhatsApp API credentials.
- API keys.
- Cloud credentials.
- Signing keys.

Secrets must:

- Remain server-side.
- Not be committed to source control.
- Not be embedded in frontend code.
- Not be exposed in logs.

Environment variables or an appropriate secret-management system should be used.

---

## 18.12 Source Control Security

Sensitive files must not be committed to source control.

Examples include:

- `.env` files containing real secrets.
- API credentials.
- Production database credentials.
- Authentication private keys.

The project should maintain appropriate ignore rules and secret-management practices.

---

## 18.13 Input Validation

All user-provided input must be validated.

Potential inputs include:

- Vehicle registration number.
- Customer name.
- Phone number.
- Service selection.
- Vehicle category.
- Price adjustment.
- Payment amount.
- Search terms.

Validation should occur on the backend even when frontend validation already exists.

---

## 18.14 Output Encoding

User-provided information must be safely rendered in the application and generated documents.

This helps prevent malicious content from being interpreted as executable code.

The system must treat customer-entered information as data rather than trusted application code.

---

## 18.15 Injection Protection

The application must protect against injection attacks.

This includes appropriate protection against:

- SQL injection.
- NoSQL injection where applicable.
- Command injection.
- Script injection.
- Malicious file content.

The selected backend and database libraries should use parameterized or safe query mechanisms.

---

## 18.16 Cross-Site Scripting Protection

The frontend must safely render user-generated information.

Potentially user-controlled values include:

- Customer name.
- Vehicle number.
- Custom job descriptions.
- Other transaction notes.

The system must not blindly render these values as executable HTML or scripts.

---

## 18.17 Cross-Site Request Protection

If the chosen authentication and application architecture requires protection against cross-site request attacks, appropriate mechanisms must be implemented.

The exact approach depends on the selected frontend/backend authentication model.

Security controls must be evaluated based on the actual technology stack rather than added mechanically.

---

## 18.18 API Security

Backend APIs must:

- Require authentication where appropriate.
- Validate input.
- Enforce authorization.
- Return safe errors.
- Avoid exposing unnecessary data.
- Rate-limit sensitive endpoints where appropriate.

Administrative APIs require particular protection.

---

## 18.19 Rate Limiting

Rate limiting may be applied to operations that could be abused.

Potential candidates include:

- Authentication attempts.
- Password recovery.
- Publicly exposed endpoints.
- WhatsApp-related operations.
- Export generation.

The MVP should avoid aggressive limits that interfere with normal Staff usage.

---

## 18.20 Brute Force Protection

Authentication systems should provide appropriate protection against repeated failed login attempts.

The exact mechanism depends on the selected authentication provider.

The system should prefer established provider-level protections rather than implementing custom security logic unnecessarily.

---

## 18.21 Administrative Security

Administrator accounts have access to sensitive business functions.

Administrative security should therefore be stronger than normal Staff access.

Potential protections include:

- Strong authentication.
- Individual Administrator accounts.
- Session management.
- Reauthentication for highly sensitive operations.
- Audit logging.

The exact security controls will be determined during implementation.

---

## 18.22 Pricing Security

Pricing configuration directly affects revenue.

Only authorized Administrators should be able to:

- Create prices.
- Modify prices.
- Deactivate prices.
- Change service pricing rules.

Pricing changes should be attributable to the Administrator who performed them.

---

## 18.23 Transaction Correction Security

Corrections to completed transactions can affect financial records.

Therefore:

- Corrections must be controlled.
- Important corrections should be attributable to a user.
- Historical information should remain recoverable.
- Unauthorized Staff should not be able to freely rewrite completed transactions.

The exact correction permissions will be finalized during transaction implementation.

---

## 18.24 Transaction Deletion

Completed transactions should not normally be physically deleted.

Instead, where a transaction is invalid:

    Original Transaction
            ↓
       Void / Correction
            ↓
    Historical Record Preserved

This protects the integrity of reports and provides accountability.

The exact void model will be defined during transaction implementation.

---

## 18.25 Audit Logging

Important security-sensitive or business-critical actions should be auditable.

Potential audit events include:

- Login failures.
- Price changes.
- Service configuration changes.
- Transaction corrections.
- Transaction voids.
- Staff account changes.
- Important administrative configuration changes.

The system does not need to audit every screen view or button click.

---

## 18.26 Audit Log Integrity

Audit records should not be freely editable by normal application users.

Where practical, audit information should be append-oriented.

For example:

    Price changed
        ↓
    Audit Record Created
        ↓
    Record Preserved

The Administrator should not be able to silently rewrite the historical audit trail.

---

## 18.27 Logging Privacy

Logs must be designed carefully.

The system should avoid logging:

- Passwords.
- Authentication tokens.
- API secrets.
- Full sensitive customer information unnecessarily.

Logs should contain enough technical context to diagnose problems without becoming a secondary source of sensitive data exposure.

---

## 18.28 Error Security

Errors shown to Staff should be understandable but should not expose internal system details.

Do not expose:

- Database errors.
- Stack traces.
- Internal server paths.
- API credentials.
- Authentication implementation details.

The application should provide a safe user-facing message while retaining appropriate technical details in secure logs.

---

## 18.29 File Security

Generated files such as:

- Excel exports.
- E-Bills.

may contain business or customer information.

The system must ensure that files are not unintentionally exposed publicly.

Temporary files should be:

- Protected.
- Accessible only to authorized users where applicable.
- Deleted when no longer required.

---

## 18.30 WhatsApp Security

WhatsApp integration credentials must remain server-side.

The frontend should request an E-Bill operation rather than directly communicating with the WhatsApp API.

The architecture should be:

    Staff
      ↓
    POS Backend
      ↓
    WhatsApp Provider

not:

    Staff
      ↓
    WhatsApp API directly

---

## 18.31 Infrastructure Security

Production infrastructure should be protected through:

- Restricted administrative access.
- Strong account security.
- Secure deployment credentials.
- Secret management.
- Network security appropriate to the selected platform.
- Regular dependency updates.
- Backup protection.

Infrastructure access should not be granted to Staff users.

---

## 18.32 Dependency Security

Third-party libraries and frameworks introduce potential security vulnerabilities.

The project should:

- Keep important dependencies reasonably up to date.
- Monitor known security vulnerabilities.
- Avoid unnecessary dependencies.
- Remove unused packages.

Security updates should be evaluated before production deployment.

---

## 18.33 Dependency Principle

The project should prefer mature, well-maintained libraries over custom security implementations.

Examples:

    Prefer established authentication provider
            over
    Custom authentication system

    Prefer established validation library
            over
    Handwritten security validation

    Prefer parameterized database access
            over
    Manually constructed queries

---

## 18.34 Security vs Staff Usability

Security must not make normal Staff operations unnecessarily difficult.

The system should avoid requiring Staff to repeatedly perform excessive authentication steps during normal operations.

The principle is:

    Strong Security
          +
    Low Operational Friction

rather than:

    Maximum Security Controls
          +
    Poor Staff Experience

Sensitive administrative operations may justify additional security friction.

---

## 18.35 Security Incident Principle

If a security incident occurs, the system should prioritize:

1. Protecting business data.
2. Preventing further unauthorized access.
3. Preserving evidence and logs.
4. Restoring secure operation.
5. Assessing affected information.
6. Correcting the underlying vulnerability.

The exact incident-response procedure will depend on the deployed infrastructure.

---

## 18.36 Security Architecture Principle

The security architecture can be summarized as:

    AUTHENTICATE
         ↓
    AUTHORIZE
         ↓
    VALIDATE
         ↓
    EXECUTE
         ↓
    PROTECT DATA
         ↓
    AUDIT IMPORTANT ACTIONS

The fundamental principle is:

> Security should protect the business and its customers without turning a simple car-wash transaction into a complicated workflow.

The MVP should implement strong foundational security while avoiding enterprise-level security infrastructure that is not justified by the current scale.

# 19. Integration Architecture

The POS may interact with external services to provide capabilities that are not part of the core transaction system.

Current integration requirements are primarily:

- WhatsApp E-Billing.
- Excel generation/export.

Future integrations may include:

- Accounting systems.
- Payment providers.
- Loyalty systems.
- Fleet/customer systems.
- Additional communication channels.

The integration architecture must keep external services isolated from the core business system.

---

## 19.1 Integration Principle

External services are supporting components.

The POS remains the source of truth for business data.

The architecture should follow:

    CORE POS
       │
       ├── WhatsApp
       ├── Excel
       └── Future Integrations

External integrations must not become the authority for:

- Transactions.
- Payments.
- Pricing.
- Customer history.
- Vehicle history.
- Business analytics.

---

## 19.2 Integration Boundary

Each external integration should have a clear boundary between the POS and the external service.

For example:

    POS Business Logic
            ↓
    Integration Layer
            ↓
    External Provider

This prevents external provider-specific logic from spreading throughout the application.

---

## 19.3 WhatsApp Integration

WhatsApp is the primary external communication integration.

Its current purpose is:

- E-Bill delivery.

The integration should receive the required information from the POS and attempt delivery.

The transaction must not depend on WhatsApp success.

---

## 19.4 WhatsApp Integration Flow

The logical flow is:

    Completed Transaction
            ↓
       Generate E-Bill
            ↓
    WhatsApp Integration
            ↓
      External Provider
            ↓
       Customer Number
            ↓
        Delivery Result

The delivery result should be returned to the POS where supported.

---

## 19.5 WhatsApp Provider Independence

The business should avoid coupling the entire application to one WhatsApp provider.

The integration layer should make it possible to replace the provider without redesigning:

- Transactions.
- Customers.
- Vehicles.
- Payments.
- Reporting.

For example:

    POS
     ↓
    WhatsApp Interface
     ↓
    Provider A

Later:

    POS
     ↓
    WhatsApp Interface
     ↓
    Provider B

The business logic remains unchanged.

---

## 19.6 WhatsApp Failure Isolation

A WhatsApp failure must not cause:

- Transaction rollback.
- Payment rollback.
- Loss of customer history.
- Loss of vehicle history.
- Reporting failure.

Instead:

    Transaction Completed
           ↓
    WhatsApp Attempt
           ↓
        Failure
           ↓
    Record Failure
           ↓
    Retry Later

---

## 19.7 WhatsApp Retry

Where supported, the system should allow an E-Bill delivery attempt to be retried.

Retry operations must be associated with the existing transaction.

A retry must not create:

- A new transaction.
- A new payment.
- A new customer.
- A new vehicle.

Only the communication attempt is repeated.

---

## 19.8 WhatsApp Credentials

WhatsApp API credentials must remain server-side.

They must not be:

- Embedded in frontend code.
- Sent to Staff devices.
- Stored in public repositories.
- Included in client-side configuration.

Credentials must be managed using secure infrastructure configuration.

---

## 19.9 WhatsApp Provider Constraints

The selected WhatsApp integration may impose requirements such as:

- Message templates.
- Approved message formats.
- Recipient consent requirements.
- Rate limits.
- Delivery limitations.
- Pricing.
- Authentication requirements.

These constraints must be evaluated before implementation.

The product workflow should be adapted to the actual provider capabilities rather than assuming unrestricted WhatsApp automation.

---

## 19.10 Excel Integration

Excel export is not an external API integration in the same sense as WhatsApp.

It is an output integration between the reporting layer and a spreadsheet format.

The flow is:

    Transaction Data
          ↓
    Reporting Logic
          ↓
    Excel Generator
          ↓
    .xlsx File

The generated file is not the source of truth.

---

## 19.11 Excel Generation Independence

Excel generation should operate independently of WhatsApp.

The system must be able to generate the daily sales report even when WhatsApp is unavailable.

---

## 19.12 E-Bill Generation

E-Bill generation should be implemented as a separate logical capability from WhatsApp delivery.

This distinction is important:

    E-Bill
      ≠
    WhatsApp

The system first produces the billing information.

WhatsApp is one possible delivery mechanism.

This allows future delivery through:

- Email.
- Direct download.
- SMS.
- Other messaging platforms.

without redesigning transaction logic.

---

## 19.13 Integration Failure States

External integrations should expose meaningful failure states.

Examples:

    SUCCESS
    FAILED
    PENDING
    NOT_ATTEMPTED

The exact states depend on the integration.

The core business transaction must not inherit these states as its own transaction state.

---

## 19.14 Integration Logging

Important integration events should be logged.

For WhatsApp, this may include:

- Delivery requested.
- Delivery attempted.
- Delivery succeeded.
- Delivery failed.
- Retry attempted.

The system should avoid logging unnecessary sensitive data.

---

## 19.15 Integration Idempotency

External operations must be designed to reduce duplicate effects.

For example, if the Staff member accidentally triggers E-Bill delivery twice, the system should have a mechanism to identify or control duplicate requests where practical.

This is particularly important for external communication because duplicate customer messages can negatively affect the business experience.

---

## 19.16 Integration Timeouts

External requests must have reasonable timeout handling.

The POS must not remain indefinitely blocked waiting for an external service.

For example:

    POS
     ↓
    WhatsApp Request
     ↓
    Timeout
     ↓
    Mark Attempt Failed / Pending
     ↓
    Continue POS Operation

The Staff workflow should not freeze indefinitely because an external API is slow.

---

## 19.17 Integration Queuing

A queue or background processing system may be introduced for external operations if required.

For example:

    Completed Transaction
           ↓
    Communication Job
           ↓
        Queue
           ↓
      WhatsApp Worker
           ↓
       Customer

However, the MVP should not introduce a message queue merely because it is architecturally fashionable.

A simpler synchronous or lightweight asynchronous mechanism may be sufficient initially.

The decision should be based on:

- Expected transaction volume.
- WhatsApp provider response time.
- Reliability requirements.
- Retry requirements.
- Infrastructure cost.
- Operational complexity.

---

## 19.18 Future Integrations

The architecture should leave room for future integrations such as:

### Accounting

Potential future use:

- Sales synchronization.
- Financial records.
- Accounting reports.

### Payment

Potential future use:

- Payment gateway integration.
- UPI payment confirmation.
- Digital receipts.

### Customer Communication

Potential future use:

- Service reminders.
- Pickup reminders.
- Loyalty messages.
- Feedback requests.

### Fleet Management

Potential future use:

- Organization accounts.
- Multiple vehicles.
- Central billing.
- Recurring customers.

These capabilities are outside the current MVP.

---

## 19.19 Integration Security

Every integration must follow security requirements appropriate to the service.

The POS should:

- Authenticate with providers securely.
- Protect API credentials.
- Validate external responses.
- Handle provider errors safely.
- Avoid exposing provider credentials to clients.

External services should be treated as untrusted dependencies from the perspective of core business integrity.

---

## 19.20 Integration Versioning

External APIs can change independently of the POS.

The integration layer should isolate provider-specific API versions and implementation details.

A provider API update should ideally require changes primarily within:

    Integration Layer

rather than:

    Entire POS Application

---

## 19.21 Integration Monitoring

The system should monitor important integration failures.

For example:

    WhatsApp Failure Rate
    E-Bill Generation Failure Rate
    Export Failure Rate

This can help identify provider outages or implementation problems.

The MVP should maintain only the monitoring necessary for practical operation.

---

## 19.22 Integration Architecture

The complete integration model is:

    ┌─────────────────────────────┐
    │          CORE POS           │
    │                             │
    │ Transactions                │
    │ Customers                   │
    │ Vehicles                    │
    │ Pricing                     │
    │ Payments                    │
    │ Reporting                  │
    └──────────────┬──────────────┘
                   │
            Integration Layer
                   │
       ┌───────────┼────────────┐
       ▼           ▼            ▼
   WhatsApp      Excel       Future
   Provider      Export     Integrations
       │
       ▼
   Customer

The integration layer prevents external services from becoming deeply coupled to the core business system.

---

## 19.23 Integration Architecture Decision

The integration architecture must prioritize:

1. Core POS independence.
2. External-service failure isolation.
3. Secure credentials.
4. Retry capability.
5. Duplicate protection.
6. Provider replaceability.
7. Clear integration boundaries.
8. Reasonable implementation complexity.
9. Future extensibility.
10. No unnecessary infrastructure for the MVP.

# 20. API Architecture

The API is the controlled interface through which the client communicates with the backend business logic.

The API must expose business operations rather than exposing the underlying database structure directly.

---

## 20.1 API Principle

The API should represent business actions.

For example:

    Create Transaction
    Record Payment
    Search Vehicle
    Get Vehicle History
    Update Price
    Generate E-Bill
    Generate Excel Export

rather than exposing unrestricted database operations such as:

    INSERT
    UPDATE
    DELETE

The client should request business operations, and the backend should determine how those operations are executed.

---

## 20.2 API Layers

The logical API flow is:

    Client
      ↓
    API Endpoint
      ↓
    Authentication
      ↓
    Authorization
      ↓
    Validation
      ↓
    Business Logic
      ↓
    Data Access
      ↓
    Database

External integrations should be accessed through the appropriate backend integration layer.

---

## 20.3 API Authentication

Protected API endpoints must require an authenticated user where appropriate.

The API must determine:

- Who is making the request.
- Whether the session is valid.
- What role the user has.
- Whether the user is authorized for the requested operation.

---

## 20.4 API Authorization

Authorization must be enforced for every protected operation.

For example:

    POST /transactions
          ↓
        Staff ✓

    POST /pricing
          ↓
        Staff ✗
        Admin ✓

The frontend must not be relied upon to enforce these restrictions.

---

## 20.5 API Validation

The backend must validate all incoming API data.

Validation should include:

- Required fields.
- Data types.
- Value ranges.
- Valid relationships.
- Business rules.
- Authorization requirements.

Frontend validation improves user experience but does not replace backend validation.

---

## 20.6 Vehicle Search API

Vehicle search is one of the most important Staff operations.

The API should support fast vehicle-number lookup.

Conceptually:

    Vehicle Number
          ↓
    Search API
          ↓
    Vehicle
          +
    Customer
          +
    Relevant History

The API should return only the information required by the requesting user and workflow.

---

## 20.7 Customer Search API

Customer search may support:

- Phone number.
- Name.

Customer search is secondary to vehicle-number search for normal Staff workflow.

The API should avoid returning unnecessary customer information.

---

## 20.8 Transaction API

The transaction API should support operations such as:

- Create transaction.
- Retrieve transaction.
- Search transactions.
- Update permitted transaction information.
- Correct permitted transaction information.
- Void a transaction where authorized.

The API must enforce transaction business rules.

---

## 20.9 Transaction Creation API

Transaction creation should validate:

- Vehicle exists or can be created.
- Service exists and is active.
- Vehicle category is valid.
- Vehicle variant is valid where required.
- Applicable standard price exists.
- Actual price is valid.
- User has permission to create the transaction.

The backend should capture the historical price information during transaction creation.

---

## 20.10 Payment API

The payment API should support recording payment against an existing transaction.

The request should include information such as:

- Transaction reference.
- Amount.
- Payment method.

The backend must validate:

- Transaction exists.
- Transaction is eligible for payment.
- Amount is valid.
- Payment method is supported.
- User is authorized.

Current payment methods are:

- Cash.
- UPI.

---

## 20.11 Pricing API

Pricing endpoints should be restricted to authorized users.

Potential operations include:

- Retrieve current prices.
- Create price configuration.
- Update price configuration.
- Deactivate price configuration.
- Retrieve historical pricing information.

Staff may retrieve applicable prices but must not modify standard pricing.

---

## 20.12 Service API

Service endpoints should support management of service packages.

The Administrator may:

- View services.
- Create services.
- Modify services.
- Activate/deactivate services.

Staff should primarily retrieve active services for transaction creation.

Historical transactions must retain the service information applicable when they were created.

---

## 20.13 Vehicle Category API

The Administrator may manage:

- Vehicle categories.
- Vehicle variants.
- Pricing relationships.

Staff should retrieve the applicable active categories and variants during transaction creation.

Historical transactions must not depend on current category configuration.

---

## 20.14 Reporting API

Reporting endpoints should return aggregated business information rather than unnecessarily transferring all raw transactions.

Potential reporting requests include:

    Daily Sales
    Weekly Sales
    Monthly Sales
    Yearly Sales
    Custom Date Range
    Service Analytics
    Vehicle Analytics
    Payment Analytics
    Customer Analytics

The reporting API must apply the correct transaction-state rules.

---

## 20.15 Excel Export API

The Administrator should be able to request an Excel export through the API.

Conceptually:

    Export Request
          ↓
    Authentication
          ↓
    Authorization
          ↓
    Validate Filters
          ↓
    Retrieve Transactions
          ↓
    Generate Excel
          ↓
    Return File

The API must not expose unrestricted database data.

---

## 20.16 E-Bill API

The E-Bill API should support:

- Generate E-Bill.
- Retrieve E-Bill where applicable.
- Initiate WhatsApp delivery.
- Retry delivery where authorized.
- Retrieve delivery status.

The E-Bill must always derive its information from the associated transaction.

---

## 20.17 WhatsApp API Boundary

The POS API should not expose raw WhatsApp provider operations to the frontend.

Instead:

    Client
      ↓
    POS API
      ↓
    WhatsApp Integration Layer
      ↓
    WhatsApp Provider

This protects provider credentials and isolates provider-specific implementation.

---

## 20.18 API Idempotency

Important write operations should be designed to prevent accidental duplication.

This is especially important for:

- Transaction creation.
- Payment recording.
- E-Bill delivery.

The API may use idempotency keys, unique operation identifiers, or equivalent mechanisms depending on the selected technology.

---

## 20.19 API Error Responses

API errors should be structured consistently.

The client should be able to distinguish between:

- Validation failure.
- Authentication failure.
- Authorization failure.
- Resource not found.
- Business-rule violation.
- External-service failure.
- Temporary server failure.

The API should not expose raw stack traces or internal database errors.

---

## 20.20 API Response Principle

Responses should contain only the information necessary for the client to perform its task.

For example, a Staff vehicle search does not need to return:

- Full administrative analytics.
- Internal database identifiers unnecessarily.
- Other customers' information.
- Administrative configuration.

This reduces data exposure and improves performance.

---

## 20.21 Pagination

List-based API endpoints should support pagination where appropriate.

Potential examples include:

- Transaction history.
- Customer lists.
- Vehicle lists.
- Staff lists.
- Administrative records.

The Staff vehicle search workflow should prioritize fast search rather than requiring pagination through large datasets.

---

## 20.22 Filtering and Sorting

Administrative APIs should support appropriate filtering and sorting.

Examples:

    Transactions
    ├── Date
    ├── Vehicle category
    ├── Service
    ├── Payment method
    └── Vehicle number

The exact API parameters will be defined during implementation.

---

## 20.23 API Versioning

The API should have a strategy for handling future changes.

A versioning approach may be used where breaking API changes are introduced.

The exact strategy will depend on the selected backend architecture.

The MVP should avoid unnecessary versioning complexity while maintaining a clear path for future evolution.

---

## 20.24 API Rate Limiting

Rate limiting should be considered for:

- Authentication endpoints.
- Password recovery.
- Public or semi-public endpoints.
- Export generation.
- External communication operations.

Normal Staff transaction operations should not be restricted so aggressively that they interfere with legitimate busy-hour usage.

---

## 20.25 API Observability

Important API operations should be observable through appropriate logs and monitoring.

Useful information may include:

- Endpoint.
- Operation type.
- User role.
- Success/failure.
- Error category.
- Request identifier.
- Transaction reference where appropriate.

Sensitive request contents should not be logged unnecessarily.

---

## 20.26 API Architecture

The logical API structure is:

    ┌──────────────────────────────┐
    │            CLIENT            │
    │                              │
    │ Staff / Administrator        │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │             API              │
    │                              │
    │ Authentication               │
    │ Authorization                │
    │ Validation                   │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │       BUSINESS LOGIC         │
    │                              │
    │ Transactions                 │
    │ Vehicles                     │
    │ Customers                    │
    │ Services                     │
    │ Pricing                      │
    │ Payments                     │
    │ Reporting                    │
    └──────────────┬───────────────┘
                   │
             ┌─────┴─────┐
             ▼           ▼
        DATABASE     INTEGRATIONS
                         │
                  ┌──────┴──────┐
                  ▼             ▼
               WhatsApp      Excel

The API is therefore a controlled boundary between the client and the application's authoritative business logic.

20.27 API Architecture Decision

The API architecture must prioritize:

Business-oriented operations.
Backend authorization.
Strong validation.
Transaction integrity.
Fast Staff operations.
Minimal unnecessary data transfer.
External integration isolation.
Duplicate-operation protection.
Consistent error handling.
Future extensibility without unnecessary API complexity.

# 21. Database Architecture

The database is the authoritative persistence layer of the POS.

It must preserve the business records required to operate the car wash, maintain historical accuracy, support fast Staff workflows, and provide reliable reporting to the Administrator.

The database technology is intentionally not finalized in this document.

The final choice must be based on the actual requirements rather than assuming a particular database simply because it is commonly used with a chosen frontend framework.

---

## 21.1 Database Responsibilities

The database must persist:

- Users.
- Customers.
- Vehicles.
- Vehicle categories.
- Vehicle variants.
- Service packages.
- Service activities.
- Price configurations.
- Transactions.
- Payments.
- E-Bills and delivery information where required.
- Audit information.
- Business configuration.

The database must also support the relationships between these entities.

---

## 21.2 Database as Source of Truth

The database is the authoritative source of business data.

Other system components are representations or consumers of that data.

```text
                 DATABASE
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
   Dashboard     Excel       E-Bill
       │            │            │
       ▼            ▼            ▼
   Admin View    Export      WhatsApp

   The system must not treat:

Excel files.
WhatsApp messages.
Browser state.
Cached dashboard values.

as authoritative business records.

21.3 Core Data Domains

The database should logically contain the following domains:

Identity
Users.
Roles.
Authentication-related references.
Customer and Vehicle
Customers.
Vehicles.
Customer-vehicle relationships.
Business Configuration
Vehicle categories.
Vehicle variants.
Services.
Service activities.
Pricing.
Transactions
Transactions.
Transaction pricing snapshots.
Payments.
Transaction corrections or status information.
Communication
E-Bills.
Delivery attempts.
WhatsApp status.
Administration
Business configuration.
Audit records.

The exact physical schema will be designed after the database technology is selected.

21.4 Customer Data

A customer record should contain only information useful to the business.

Potential fields include:

Customer identifier.
Name.
Phone number.
Created timestamp.
Updated timestamp.

Customer name is optional.

Phone number is optional from the perspective of transaction completion.

21.5 Vehicle Data

A vehicle record should contain:

Vehicle identifier.
Normalized registration number.
Display registration number where useful.
Vehicle category.
Vehicle variant where applicable.
Customer association where known.
Created timestamp.
Updated timestamp.

The normalized registration number should have an appropriate uniqueness constraint.

21.6 Vehicle Number Indexing

Vehicle registration number search is a critical Staff operation.

The database must therefore provide an efficient lookup mechanism for normalized vehicle registration numbers.

The implementation should use an appropriate index or equivalent database optimization.

The goal is:

Vehicle Number
      ↓
Fast Database Lookup
      ↓
Vehicle Record

The Staff user should not have to wait for a full-table scan as the business grows.

21.7 Customer Search Indexing

Customer search may support:

Phone number.
Name.

Appropriate indexing should be used where useful.

However, customer search is secondary to vehicle-number search and should not receive disproportionate architectural complexity.

21.8 Transaction Data

A transaction record should contain or reference:

Transaction identifier.
Vehicle.
Customer where applicable.
Vehicle category snapshot.
Vehicle variant snapshot where applicable.
Service package.
Standard price at transaction time.
Actual price charged.
Price adjustment information where applicable.
Transaction timestamp.
User responsible.
Transaction state.

The transaction must contain sufficient historical information to reconstruct what occurred at the time of the sale.

21.9 Historical Snapshots

Mutable configuration should not be relied upon to reconstruct historical transactions.

For example, a transaction should not simply store:

service_id
price_id
vehicle_category_id

and assume that the current records will always describe the original transaction.

Instead, the transaction must preserve the historical values required for accurate reporting.

Conceptually:

Current Configuration
        │
        ▼
Transaction Created
        │
        ├── Service Snapshot
        ├── Vehicle Classification Snapshot
        ├── Standard Price Snapshot
        └── Actual Price

The exact implementation may use snapshot fields, immutable historical records, or another appropriate strategy.

21.10 Pricing Data

Current pricing configuration should be stored separately from transaction records.

A price configuration should identify the combination it applies to, such as:

Vehicle Category
+
Vehicle Variant
+
Service Package
=
Price

Where variants are not applicable, the variant component may be absent.

21.11 Price Uniqueness

The database should prevent conflicting active price configurations for the same business combination.

For example, the system should not allow two simultaneously active prices for:

Sedan + Full Wash

unless the pricing architecture explicitly supports effective-date ranges.

21.12 Effective Pricing

If effective dates are implemented, the database must ensure that the pricing configuration is unambiguous.

For example:

Price A
Effective: Jan 1 → May 31

Price B
Effective: Jun 1 → Current

A transaction should always resolve to one applicable standard price.

The exact effective-date model will depend on the final pricing implementation.

21.13 Service Data

Service packages should be stored as configurable business records.

Current standard packages are:

Body Wash.
Body & Vacuum.
Full Wash.

Service activities may be associated with service packages to describe what each package includes.

The normal transaction workflow should reference the service package rather than requiring Staff to select individual activities.

21.14 Service Versioning and Historical Integrity

If a service package's name, description, or included activities changes, historical transactions must remain understandable.

The database should therefore preserve sufficient historical information to determine what service was sold at the time.

The exact implementation may use:

Snapshot fields.
Versioned service records.
Immutable historical service definitions.

The final approach will be selected during schema design.

21.15 Vehicle Category Data

Vehicle categories should be configurable.

Examples:

Hatchback.
Sedan.
SUV.
Traveller.
Pickup.
Dost.

Categories may be:

Active.
Inactive.

Inactive categories should generally not be selectable for new transactions.

Historical transactions referencing an inactive category must remain valid.

21.16 Vehicle Variant Data

Vehicle variants should belong to a vehicle category.

For example:

Traveller
├── 10 Seat
├── 14 Seat
└── 17 Seat

Variants may be active or inactive.

A variant should not be required for categories that do not use variants.

21.17 Payment Data

Payment information should be associated with the transaction.

The database must preserve:

Payment identifier.
Transaction reference.
Amount.
Payment method.
Payment timestamp.
Payment status.
Relevant correction information where necessary.

Current methods:

Cash.
UPI.
21.18 Payment Integrity

The database should enforce appropriate constraints so that:

A payment references a valid transaction.
A payment amount is valid.
A payment method is supported.
Duplicate payment records are prevented where applicable.

The exact rules depend on whether the MVP permits:

Partial payments.
Multiple payments.
Payment corrections.

The current business workflow primarily assumes one recorded payment per completed transaction.

21.19 Transaction State Data

Transaction state must be represented explicitly enough for reporting and operational logic.

Possible states include:

Draft / incomplete.
Completed.
Voided.

The final state model will be finalized during transaction implementation.

The database must not rely on arbitrary combinations of nullable fields to determine whether a transaction is valid.

21.20 Soft Deletion

Important business records should generally not be physically deleted.

Where a record must no longer be active, the system should consider:

Inactive status.
Archived status.
Voided status.

This is particularly important for:

Services.
Vehicle categories.
Prices.
Transactions.

Physical deletion should be restricted to cases where it cannot damage business history.

21.21 Referential Integrity

Relationships between entities must remain valid.

Examples:

Customer
   │
   └── Vehicle
          │
          └── Transaction
                  │
                  └── Payment

The database or application data-access layer must prevent invalid references.

A transaction should not reference a nonexistent vehicle.

A payment should not reference a nonexistent transaction.

21.22 Cascading Deletes

Cascading deletion must be used carefully.

Deleting a customer should not automatically delete:

Vehicles.
Transactions.
Payments.
Historical records.

Similarly, deleting a vehicle must not automatically remove its historical transactions.

Historical business records must be protected.

21.23 Audit Data

The database should support audit records for important business changes.

Potential audit information:

User.
Action.
Entity affected.
Entity identifier.
Timestamp.
Relevant before/after information where appropriate.

Audit records should focus on meaningful administrative or corrective actions.

21.24 Timestamps

Important records should contain timestamps where required.

The system should consistently store timestamps using an agreed strategy.

The application-facing business timezone is:

Asia/Kolkata

The exact database timestamp strategy will depend on the selected technology.

The system must avoid mixing incompatible timezone assumptions.

21.25 Database Constraints

The database should enforce important invariants wherever practical.

Examples include:

Vehicle registration number uniqueness.
Required transaction relationships.
Valid payment methods.
Non-negative prices.
Valid transaction amounts.
Valid foreign-key relationships.
Unique active configuration combinations.

Business logic should not rely solely on frontend validation.

21.26 Database Transactions

Operations that modify multiple related records should use database transaction mechanisms where appropriate.

For example:

Create Transaction
        +
Store Historical Price
        +
Record Related Information

should either succeed consistently or fail safely.

External operations such as WhatsApp delivery must not be included in the same database transaction because they are outside the database's transactional boundary.

21.27 Concurrency

The database must support concurrent access from multiple Staff devices.

Two Staff members should be able to process different vehicles simultaneously without:

Overwriting each other's data.
Creating invalid records.
Corrupting shared configuration.
Producing incorrect reports.

The selected database technology must provide appropriate concurrency guarantees.

21.28 Reporting Queries

The database must support efficient queries for:

Daily sales.
Weekly sales.
Monthly sales.
Yearly sales.
Custom date ranges.
Service analysis.
Vehicle-category analysis.
Payment analysis.
Customer analysis.

Indexes should be added based on actual query patterns rather than indiscriminately indexing every field.

21.29 Transaction Date Indexing

Transaction date/time is a major reporting dimension.

The database should provide efficient access to transactions within a date range.

For example:

WHERE transaction_date
BETWEEN start_date AND end_date

must remain practical as historical transaction volume grows.

21.30 Database and Excel

Excel exports should query the database through the backend/reporting layer.

The database should not generate business logic specifically for Excel.

Instead:

Database
   ↓
Reporting Logic
   ↓
Excel Generator

This keeps reporting consistent across:

Dashboard.
Reports.
Excel.
21.31 Database and WhatsApp

WhatsApp delivery information may be stored in the database, but WhatsApp itself must not store or control the core transaction.

For example:

Transaction
   │
   └── E-Bill
          │
          └── Delivery Attempt
                  │
                  └── WhatsApp

A missing delivery attempt must not invalidate the transaction.

21.32 Data Retention

Historical transactions should be retained for long-term business analysis.

The system must not automatically purge historical transaction data simply to reduce database size.

Retention policies may be refined later based on:

Legal requirements.
Accounting requirements.
Business needs.
Infrastructure cost.
21.33 Database Backup

The production database must be backed up using the selected infrastructure's appropriate backup mechanisms.

Backups should support recovery from:

Accidental deletion.
Corruption.
Infrastructure failure.
Deployment mistakes.

Backup strategy is an infrastructure responsibility but is included here because database recoverability is a core data requirement.

21.34 Database Migration

Changes to the database structure must be managed through controlled migrations where the selected technology requires them.

Examples:

Version 1
   ↓
Add Loyalty Fields
   ↓
Version 2
   ↓
Add Organization Support
   ↓
Version 3

Production data must be considered whenever schema changes are introduced.

21.35 Database Performance

The MVP database should be optimized for the actual workload.

Primary performance priorities are:

Vehicle-number search.
Transaction creation.
Payment recording.
Transaction history.
Daily/weekly/monthly reporting.

The system does not currently justify:

Distributed databases.
Data warehouses.
Sharding.
Complex replication systems.

These should only be introduced if actual growth requires them.

21.36 Database Security

Database access must be restricted.

The application should use controlled credentials with only the permissions required for its operations.

Database credentials must never be exposed to the frontend.

Administrative database access should be limited to authorized technical personnel.

21.37 Database Technology Decision

The final database technology will be selected after evaluating:

Relational integrity requirements.
Transaction requirements.
Query complexity.
Reporting requirements.
Search requirements.
Concurrent Staff usage.
Authentication integration.
Backup capabilities.
Cost.
Development speed.
Operational simplicity.
Future scalability.

A relational database may be particularly suitable because the POS contains strongly related entities and requires reliable historical transactions.

However, the final decision must be based on the complete implementation requirements rather than assumption.

21.38 Database Architecture Principle

The database architecture follows:

                    DATABASE
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    Customers       Vehicles      Configuration
        │              │              │
        │              ▼              │
        │         Transactions ◄───────┘
        │              │
        │         ┌────┴────┐
        │         ▼         ▼
        │      Payment    E-Bill
        │                   │
        │                   ▼
        │                WhatsApp
        │
        └──────────────► History

The fundamental rule is:

The database must preserve what happened, not merely what is configured now.

Current configuration can change.

Historical transactions must remain historically accurate.

21.39 Database Architecture Decision

The database architecture must prioritize:

Historical integrity.
Transaction consistency.
Fast vehicle search.
Reliable reporting.
Concurrent Staff usage.
Secure access.
Backup and recovery.
Simple maintenance.
Reasonable cost.
Future scalability without premature complexity.

