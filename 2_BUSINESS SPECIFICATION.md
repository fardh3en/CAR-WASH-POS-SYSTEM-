# BUSINESS SPECIFICATION

Version: 1.0
Status: In Progress
Document Type: Business Requirements & Operational Workflow

---

# 1. Purpose

This document defines how the car wash business operates independently of any software implementation.

Its purpose is to capture real-world business processes, operational workflows, business rules, user responsibilities, and exceptional scenarios that the software must support.

The current business model does not require tracking wash worker activities, service progress, or bay utilization. These responsibilities are intentionally excluded from the initial system because they do not contribute to the operational responsibilities of the front desk. However, the overall architecture should remain extensible so that supervisory and workforce management capabilities can be introduced in future versions if the business expands or operational requirements change.

The Business Specification serves as the primary source of truth for understanding how the business functions and what operational problems the software is expected to solve.

---

# 2. Business Overview

The business provides vehicle cleaning and detailing services through a physical car wash facility.

Every customer interaction begins at the front desk, where the customer and vehicle are registered before any service is performed.

The front desk acts as the operational control point for customer registration, service selection, pricing, billing, payment recording, customer communication, and historical record keeping.

Service execution is performed independently by wash workers. Their primary responsibility is to deliver the requested services efficiently and safely.

The software is designed to support the responsibilities of the front desk and business owner. It is not intended to monitor or manage the day-to-day activities of wash workers unless future business requirements justify such functionality. 

The software exists to simplify business operations, reduce administrative effort, improve customer experience, and provide accurate business intelligence for management.

---

# 3. Business Objectives

The primary objectives of the business are:

• Reduce the time required to register customers.

• Eliminate manual paperwork wherever possible.

• Maintain accurate customer and vehicle history.

• Ensure consistent and transparent pricing.

• Record every completed transaction.

• Generate reliable daily, weekly, monthly, and yearly business reports.

• Reduce repetitive administrative work through automation.

• Improve customer communication through digital channels such as WhatsApp.

• Build a scalable operational system capable of supporting future business growth without disrupting existing workflows.

---

# 4. Business Model

The business operates as a service-based vehicle care center.

Revenue is generated through the sale of vehicle cleaning and detailing services.

Each customer visit results in the creation of a service transaction that records:

• Customer information
• Vehicle information
• Selected services
• Pricing
• Additional Services and Price
• Payment details
• Date and time of transaction

This transaction becomes the central business record for customer history, reporting, accounting, and future communication.

No business activity should bypass the creation of this transaction record.

# 5. Stakeholders

A stakeholder is any individual or group that directly or indirectly interacts with, benefits from, or is affected by the operation of the business and the software system.

The following stakeholders have been identified for the current business model.

---

## 5.1 Business Owner (Primary Stakeholder)

Role:
Business decision maker and system administrator.

Responsibilities:

• Monitor business performance.
• Manage pricing and services.
• Review operational reports and analytics.
• Maintain customer records.
• Manage staff accounts.
• Configure business settings.
• Make strategic business decisions based on system insights.

Primary Objectives:

• Increase operational efficiency.
• Reduce administrative workload.
• Improve customer retention.
• Increase profitability.
• Maintain accurate business records.

---

## 5.2 Front Desk Staff (Primary Operational Stakeholder)

Role:
Primary operator of the system.

Responsibilities:

• Register customers.
• Register vehicles.
• Select requested services.
• Record payments.
• Generate receipts.
• Maintain accurate customer information.

Primary Objectives:

• Register customers quickly.
• Reduce waiting time.
• Avoid billing mistakes.
• Minimize manual paperwork.

The software should prioritize speed and simplicity for this stakeholder above all other considerations.

---

## 5.3 Customers

Role:
Recipients of the vehicle cleaning services.

Customers do not directly operate the system but are affected by the quality, speed, and accuracy of the services provided.

Primary Expectations:

• Fast registration.
• Transparent pricing.
• Accurate billing.
• Professional communication.
• Consistent service experience.

Future versions of the system may introduce customer-facing features such as appointment booking, loyalty programs, digital receipts, and service reminders. but the MVP is not focused on such POS or ERP. 

---

## 5.4 Accountant (Indirect Stakeholder)

Role:
Financial record verification and bookkeeping.

The accountant does not actively use the operational features of the software but may rely on exported financial records and reports for accounting and taxation purposes.

Primary Requirements:

• Accurate transaction records.
• Excel exports.
• Revenue reports.
• Payment summaries.

---

## 5.5 Future Stakeholders

The software architecture should remain capable of supporting additional stakeholders as the business expands.

Potential future stakeholders include:

• Branch Managers
• Supervisors
• Franchise Owners
• Fleet Account Managers
• Corporate Customers
• Marketing Personnel
• Inventory Managers

Fleet Account Managers and Corporate Customers are potential future stakeholders. While the business currently serves individual vehicle owners, the software architecture should remain capable of supporting fleet accounts, corporate agreements, recurring service contracts, and centralized billing if the business expands into this market.
These stakeholders are outside the scope of the current MVP and should not influence the simplicity of the present-day operational workflow.

# 6. Vehicle Categories

Vehicle categories are practical classifications used by the business to determine the appropriate service pricing for different types and sizes of vehicles.

These classifications are based on the operational requirements of the business and do not necessarily represent formal automotive industry classifications.

The current classification system has been used successfully by the business and will serve as the initial basis for the POS.

The classification system must remain flexible because new vehicle types or pricing categories may be introduced as the business evolves.

---

## 6.1 Current Vehicle Categories

The current vehicle classification includes:

### Two-Wheelers

• Scooter
• Bike
• Bullet
• Superbike

Bullet and Superbike are treated as separate pricing categories because they require different pricing from standard bikes.

---

### Three-Wheelers

• Auto

---

### Cars

• Hatchback Car
• Sedan Car
• Compact SUV
• SUV
• Premium SUV

Vehicle models may be used as examples or references to help staff identify the appropriate category, but the vehicle category itself is the basis for pricing.

For example, individual models such as Creta, Seltos, Nexon, Alto, or Honda City do not independently determine pricing. They are classified into the appropriate business category.

---

### Traveller

Traveller vehicles are treated as one general vehicle category with different size variants:

• Traveller – 10 Seat
• Traveller – 14 Seat
• Traveller – 17 Seat

The size variant determines the applicable pricing.

---

### Pickup Vehicles

Pickup vehicles are treated as one general vehicle category with different variants:

• Pickup – Ordinary
• Pickup – Long Chassis

The variant determines the applicable pricing.

---

### Light Commercial Vehicles

Dost vehicles are treated as one general vehicle category with different variants:

• Dost – Ordinary
• Bada Dost

Additional commercial vehicle categories currently used by the business include:

• TATA ACE
• Super ACE

These classifications may be expanded as new vehicle types are encountered.

---

## 6.2 Classification and Pricing

Vehicle category is a primary factor in determining the price of a standard service package.

The applicable price is determined by the combination of:

Vehicle Category
+
Service Package
=
Applicable Price

The same service package may therefore have different prices for different vehicle categories.

For example:

A Full Wash for a Hatchback Car may have a different price from a Full Wash for an SUV.

---

## 6.3 Vehicle Models

Vehicle model information may be recorded separately from the vehicle category.

The model is useful for:

• Identifying the customer's vehicle.
• Helping staff select the correct vehicle category.
• Maintaining accurate customer and vehicle history.
• Improving future customer recognition.

The vehicle model itself does not replace the business's vehicle category classification for pricing purposes.

---

## 6.4 Future Vehicle Categories

The current categories are not considered permanently fixed.

The business may introduce new categories or modify existing classifications when:

• New vehicle types become common among customers.
• Existing categories no longer provide appropriate pricing.
• A vehicle type requires a materially different service price.
• Business operations or pricing strategy change.

New categories should be introduced through the business's administrative controls rather than requiring changes to the underlying software architecture.

---

## 6.5 Business Principle

Vehicle classification should remain practical rather than unnecessarily detailed.

The purpose of classification is to enable:

• Fast vehicle identification.
• Appropriate service pricing.
• Consistent billing.
• Useful reporting.

The system should not require staff to determine technical automotive specifications that have no meaningful impact on the business's pricing or operations.

# 7. Service Packages

The business primarily operates through a small set of standardized service packages.

A service package represents the customer's primary service selection for a visit.

The current primary service packages are:

• Body Wash
• Body & Vacuum
• Full Wash

These packages form the core of the business's service offering and are priced according to the applicable vehicle category.

---

## 7.1 Body Wash

Body Wash consists of:

• Exterior pressure wash
• Tyre polishing

Body Wash is the basic exterior-focused service package.

---

## 7.2 Body & Vacuum

Body & Vacuum consists of:

• Exterior body cleaning
• Interior vacuuming
• Dashboard polishing
• Tyre polishing

Body & Vacuum provides both exterior cleaning and basic interior cleaning.

---

## 7.3 Full Wash

Full Wash consists of:

• Exterior body cleaning
• Interior vacuuming
• Dashboard polishing
• Tyre polishing
• Underbody cleaning
• Engine room cleaning

Full Wash represents the most comprehensive standard wash package currently offered by the business.

---

## 7.4 Package Selection

The customer selects a primary service package during registration.

The package is selected based on the customer's requested service and the vehicle being serviced.

Staff should not be required to manually select or confirm every individual activity included within a standard package.

The individual activities are defined by the package itself.

For example, selecting Full Wash automatically represents the complete Full Wash package. Staff should not need to separately select:

• Body cleaning
• Vacuum
• Dashboard polishing
• Tyre polishing
• Underbody cleaning
• Engine room cleaning

This keeps the registration process fast and prevents unnecessary data entry.

---

## 7.5 Multiple Services and Additional Requests

Customers may request services beyond the standard package offerings.

These requests can vary significantly and may include uncommon or one-time cleaning requirements.

The business does not currently maintain a comprehensive standardized catalogue for every possible additional request.

Therefore, uncommon services should not be forced into the primary service selection workflow.

The system should remain capable of accommodating such requests without requiring the business to define every possible service in advance.

The exact mechanism for handling these exceptional requests is a system-design concern and will be defined in a later specification.

---

## 7.6 Service Package Management

The current service packages represent the business's present standard offerings.

The business owner may modify, add, remove, rename, or redefine service packages as the business evolves.

Changes to package definitions must not require changes to the underlying software architecture.

Service package pricing is defined separately from the package itself because pricing depends on the vehicle category.

---

## 7.7 Service Package and Vehicle Category

The applicable price for a standard service is determined by the combination of:

Vehicle Category
+
Service Package
=
Applicable Price

Therefore, the same service package may have different prices for different vehicle categories.

For example:

A Body Wash for a Hatchback Car may have a different price from a Body Wash for an SUV.

The service package and vehicle category must therefore be treated as separate business concepts.

# 8. Pricing Model

The business uses a vehicle-category-based pricing model.

The standard price of a service package is determined by the combination of:

Vehicle Category
+
Service Package
=
Standard Price

Different vehicle categories may have different prices for the same service package.

---

## 8.1 Standard Pricing

Each standard service package has a configured price for each applicable vehicle category.

For example:

• Hatchback + Body Wash
• Sedan + Body Wash
• SUV + Body Wash

may each have different standard prices.

The current prices are maintained by the business and may change as the business evolves.

The current price list is therefore considered operational data rather than a permanent business rule.

---

## 8.2 Price Management

Only the Administrator is authorized to modify standard service prices.

Staff members do not have authority to modify the standard pricing configuration.

When an Administrator changes a standard price, the new price applies only to transactions created after the change.

Previously completed transactions must retain the price that was applicable when the transaction was created.

This is required to preserve accurate historical financial records and ensure that historical business analysis is not affected by later pricing changes.

---

## 8.3 Historical Price Preservation

Every completed transaction must preserve the actual price charged at the time of the transaction.

Historical transactions must not automatically change when the Administrator modifies the current pricing configuration.

For example:

If the SUV Body Wash price is ₹300 in January and is changed to ₹350 in February:

• January transactions remain recorded at ₹300.
• February transactions use ₹350.

This allows the Administrator to accurately analyze revenue and pricing performance across different periods.

---

## 8.4 Vehicle Condition

Vehicle condition may affect the price of a service.

A vehicle requiring significantly different treatment due to its condition may not always be appropriately represented by the standard configured price.

The business therefore allows the final price of a transaction to differ from the standard configured price when the vehicle's condition justifies an adjustment.

The exact method of identifying and recording vehicle condition will be defined as part of the operational workflow and system design.

---

## 8.5 Negotiated Pricing

The standard configured price is considered the normal price for a service.

However, in real-world situations, a customer and the business may agree on a different final price.

The system should therefore support an authorized user recording a negotiated final price when necessary.

Negotiated pricing should:

• Preserve the original standard price.
• Record the actual final amount charged.
• Allow the reason or context for the adjustment to be recorded where appropriate.
• Be distinguishable from the normal configured price in administrative records.

Negotiated pricing is an exception to the standard pricing model and should not become the normal method of determining prices.

---

## 8.6 Repeat Customers and Future Loyalty Pricing

The business currently does not provide a separate repeat-customer price or loyalty discount.

However, customer and vehicle history must be preserved so that future customer loyalty features can be introduced if the business decides to implement them.

Potential future capabilities include:

• Loyalty programs.
• Repeat-customer benefits.
• Membership pricing.
• Service packages.
• Customer-specific offers.

These features are outside the current MVP.

---

## 8.7 Currency and Price Precision

The business currently operates using whole-rupee prices.

Decimal pricing is not required for the current business model.

GST or other tax-specific pricing mechanisms are not currently part of the operational pricing model.

The system should nevertheless avoid architectural assumptions that would prevent tax handling from being introduced in the future if the business grows and tax requirements become applicable.

---

## 8.8 Pricing Principle

The pricing system must distinguish between:

1. Standard Price
   The price configured by the Administrator for a vehicle category and service package.

2. Actual Transaction Price
   The final amount charged to the customer for a specific transaction.

The standard price may change over time.

The actual transaction price of a completed transaction must never change retrospectively.


# 9. Customer Journey

The customer journey describes the typical interaction between a customer and the front desk from arrival through completion of the transaction.

The journey is intentionally designed to require minimal interaction from the customer and minimal data entry from staff.

The primary objective is to register the vehicle, identify the requested service, determine the applicable price, and record the transaction without unnecessarily extending the customer's waiting time.

---

## 9.1 Customer Arrival

A customer arrives at the car wash and approaches the front desk.

The customer generally communicates the service they require rather than providing a detailed explanation of the vehicle's previous service history.

The front desk is responsible for identifying the customer's vehicle and registering the requested service.

The system should support both new and returning customers without requiring the customer to understand or interact with the software.

---

## 9.2 Customer Identification

The vehicle registration number is the primary identifier used to identify a vehicle.

The vehicle registration number is mandatory for every service transaction.

A customer's phone number is normally collected because it enables customer identification, communication, history, and future automation.

However, some customers may hesitate to provide their phone number.

The registration process should therefore be capable of being completed when a customer declines to provide a phone number.

Customer name may also be recorded but is not mandatory for the current business workflow.

---

## 9.3 New Customers

For a new customer, staff records the available customer and vehicle information.

The primary information includes:

• Vehicle registration number.
• Customer phone number, when provided.
• Customer name, when provided.

The vehicle is then classified according to the business's vehicle categories.

The customer does not need to provide additional information unless it is relevant to the transaction.

---

## 9.4 Returning Customers

Returning customers generally do not need to provide their information again.

The customer may simply state the service they require.

Staff should be able to identify the customer's previous vehicle and customer information quickly using the available history.

Customer and vehicle history is therefore an important part of the operational workflow.

The purpose of history is not only record keeping but also to reduce repeated data entry and accelerate future transactions.

---

## 9.5 Vehicle and Service Selection

Once the vehicle is identified, staff selects the appropriate vehicle category.

The customer then communicates the required service.

The applicable standard service package is selected from the available packages.

The system determines the applicable standard price using the combination of:

Vehicle Category
+
Service Package
=
Standard Price

Staff should not be required to manually calculate the standard price.

---

## 9.6 Additional or Unusual Requests

Customers may occasionally request work outside the standard service packages.

These requests are relatively unpredictable and are not part of the normal customer registration flow.

The front desk should not be required to review or select a list of additional services for every transaction.

The system must remain capable of recording unusual requests when necessary, but these requests should remain outside the primary workflow unless they become common enough to justify standardization.

---

## 9.7 Payment

Payment is normally collected after the service has been completed.

However, payment timing is not fixed and may vary depending on the customer or circumstances.

The system must therefore support a transaction being recorded before payment is received and allow payment to be recorded when payment actually occurs.

The current payment methods are:

• Cash
• UPI

The business does not currently require customers to use a digital payment method.

---

## 9.8 Receipt and E-Billing

WhatsApp E-Billing is a core business requirement, but transaction recording and business reporting must remain independent of WhatsApp availability.

The business intends to provide an electronic bill (E-Bill) to customers through WhatsApp.

WhatsApp E-Billing is a standard part of the customer transaction workflow and is not limited to institutional or business customers.

After a transaction is completed, the system should be capable of generating and sending the corresponding E-Bill to the customer's WhatsApp number.

The E-Bill should contain the relevant transaction information, including:

• Business information.
• Transaction date and time.
• Vehicle registration number.
• Vehicle category.
• Service package.
• adiditional services if any.
• Applicable price.
• Final amount charged.
• Payment method.

For customers who require formal documentation for institutional, organizational, office, school, or similar purposes, the E-Bill should also be suitable for use as their transaction record.

The business may continue to provide a physical paper bill when specifically required.

WhatsApp E-Billing is therefore considered a core business requirement rather than an optional future feature.

The exact WhatsApp integration, message format, delivery mechanism, and billing document generation will be defined in later system specifications.
---

## 9.9 Vehicle Pickup

Customers may either:

1. Remain at or near the car wash while the service is performed.
2. Leave the vehicle and return later.

When a customer leaves the vehicle, they may provide an expected return time.

The expected return time may be expressed as:

• A relative duration, such as two hours or three hours.
• A specific time, such as 3:00 PM or 6:00 PM.

This information may be recorded when it is useful to the business.

It is not required for every transaction.

The system should not interpret an expected return time as a service-status or worker-status update.

It is customer-related information intended to help the front desk remember or communicate when the vehicle is expected to be collected.

---

## 9.10 Extended Vehicle Retention

In some cases, vehicles remain at the business for an extended period.

This is particularly relevant to nearby workshops or similar business customers who may leave a vehicle for several days.

Examples include:

• Vehicle left on Friday and collected on Monday.
• Vehicle remaining at the business for multiple days due to external servicing arrangements.
• Other exceptional situations where immediate pickup is not expected.

An expected pickup date may therefore be recorded when a vehicle is expected to remain at the business beyond the normal service period.

This information is optional and should only be recorded when relevant.

---

## 9.11 Transaction Completion

Once the transaction has been completed and payment has been recorded, the front desk's primary responsibility for that transaction is complete.

The system should not require staff to record:


• Wash start time.
• Wash completion time.
• Worker assignment.
• Worker activity.
• Bay assignment.
• Service progress.

These activities are outside the current operational responsibility of the front desk.

---

## 9.12 Transaction Corrections

Completed transactions represent business records and must be treated as historical records.

Staff should not have unrestricted ability to permanently delete completed transactions.

If a staff member enters incorrect information, the system should provide a controlled correction mechanism rather than requiring deletion of the original business record.

Examples of correctable information may include:

• Incorrect vehicle category.
• Incorrect service package.
• Incorrect customer information.
• Incorrect payment information.
• Incorrect transaction amount.

The exact correction, audit, and authorization mechanism will be defined in the system and security specifications.

The underlying principle is that correcting an error must not destroy the integrity of historical business records.

---

## 9.13 Overall Customer Journey

The normal customer journey can be summarized as:

Customer Arrives
        ↓
Identify / Register Vehicle
        ↓
Select Vehicle Category
        ↓
Select Service Package
        ↓
Determine Standard Price
        ↓
Service Performed
        ↓
Payment Recorded
        ↓
Transaction Completed

Additional information such as expected pickup time, phone number, customer name, or institutional billing details is recorded only when relevant.

The workflow must remain fast enough that collecting business information does not become a source of unnecessary customer waiting time.

# 10. Operational Workflow

The front desk workflow is intentionally flexible rather than strictly sequential.

The primary operational priority is to ensure that the vehicle enters service as quickly as possible.

Staff should not be required to complete every piece of transaction information before the service can begin.

Depending on the situation, customer and vehicle information may be recorded before service, while other information may be completed during or after service.

Payment is normally recorded after service but may be recorded at a different point when circumstances require it.

The system must therefore support transactions that progress through the business workflow without requiring every field to be completed at the beginning.

---

## 10.1 Primary Operational Flow

The operational workflow is intentionally flexible.

The primary objective is to get the vehicle into service as quickly as possible while capturing the necessary transaction information.

The vehicle registration number is the only transaction information that staff can independently identify and enter without obtaining information from the customer.

The remaining transaction information is obtained through the normal interaction with the customer or becomes available later during the transaction.

The general flow is:

Customer Arrives
        ↓
Capture / Identify Vehicle Registration Number
        ↓
Obtain Required Customer and Service Information
        ↓
Vehicle Enters Service
        ↓
Complete Remaining Transaction Information
        ↓
Record Payment
        ↓
Generate E-Bill
        ↓
Transaction Complete

The sequence may vary depending on the circumstances of the visit.

---

## 10.2 Immediate Service Priority

The primary operational priority is to ensure that the vehicle enters service as quickly as possible.

Staff should not delay the vehicle's service merely because non-essential administrative information has not yet been entered.

When necessary, the vehicle registration number can be captured first so that the transaction can be identified while the remaining information is obtained from the customer.

The system must therefore support a transaction being started with only the vehicle registration number available.

---

## 10.3 Customer-Provided Information

Information such as:

• Customer phone number.
• Customer name.
• Requested service.
• Vehicle category, when it cannot be determined from available information.
• Other transaction-specific information.

is obtained through the interaction between the customer and front desk staff.

The system should not assume that staff can determine customer-specific information without asking.

Optional information should never unnecessarily delay the customer's service.

---

## 10.4 Flexible Transaction Completion

A transaction may begin with only the vehicle registration number and be completed progressively as information becomes available.

For example:

1. Vehicle arrives.
2. Staff records the vehicle registration number.
3. Customer provides the required service information.
4. Vehicle enters service.
5. Remaining information is completed when appropriate.
6. Payment is recorded.
7. E-Bill is generated and sent through WhatsApp.

This does not represent a service-status tracking system.

It simply reflects the reality that the administrative record may be completed progressively while the physical service is already taking place.

---

## 10.5 Transaction Completion

A transaction becomes complete when the required business information has been recorded and the payment has been recorded.

Once completed:

• The transaction becomes part of historical business records.
• The actual price charged is preserved.
• The payment method is preserved.
• The E-Bill can be generated and delivered through WhatsApp.
• The transaction contributes to business analytics and reporting.

Completed transactions should not be treated as temporary records.

# 11. Business Rules

Business rules define the operational requirements that the system must consistently enforce regardless of the interface or implementation.

---

## 11.1 Customer and Vehicle Rules

BR-001
Every service transaction must have a vehicle registration number.

BR-002
The vehicle registration number is mandatory.

BR-003
A customer phone number is normally collected but is not mandatory for completing a transaction.

BR-004
Customer name is optional.

BR-005
A single customer may have multiple vehicles.

BR-006
A vehicle may have historical transactions associated with it.

BR-007
The vehicle registration number may be used to identify an existing vehicle and retrieve its history.

---

## 11.2 Transaction Creation Rules

BR-008
A vehicle registration number may be captured or searched before a transaction is created.

BR-009
A service transaction is created only after the customer has selected a service package.

BR-010
A vehicle number alone does not constitute a service transaction.

BR-011
The system must allow staff to identify an existing vehicle before creating a new transaction for that vehicle.

BR-012
Returning customers should be able to begin a new transaction using existing customer and vehicle information without re-entering information unnecessarily.

---

## 11.3 Service Rules

BR-013
The customer selects a primary service package for each transaction.

BR-014
The current standard service packages are:

• Body Wash
• Body & Vacuum
• Full Wash

BR-015
Staff are not required to select the individual activities included within a standard service package.

BR-016
Uncommon customer requests should not be required to be selected from a standardized additional-service checklist.

---

## 11.4 Vehicle Classification Rules

BR-017
Each standard service transaction must have an applicable vehicle category.

BR-018
Vehicle category is determined using the practical classification system maintained by the business.

BR-019
Vehicle category is used as a factor in determining the standard service price.

BR-020
The vehicle classification system may be expanded or modified by the Administrator.

---

## 11.5 Pricing Rules

BR-021
The standard price of a service is determined by the combination of vehicle category and service package.

BR-022
Only the Administrator may modify standard service prices.

BR-023
A change to the standard price applies only to future transactions.

BR-024
Historical transaction prices must remain unchanged when standard pricing is modified.

BR-025
Every completed transaction must preserve the actual price charged to the customer.

BR-026
The standard configured price is the normal price for a service.

BR-027
A different final price may be recorded when an authorized user negotiates a price or when the vehicle's condition justifies an adjustment.

BR-028
When the final transaction price differs from the standard price, the standard price and actual charged amount must remain distinguishable.

---

## 11.6 Payment Rules

BR-029
The current accepted payment methods are:

• Cash
• UPI

BR-030
Payment is normally recorded after the service has been completed.

BR-031
Payment may be recorded at a different point when circumstances require it.

BR-032
A transaction must retain its recorded payment method and payment amount as part of its historical record.

---

## 11.7 E-Billing Rules

BR-033
WhatsApp E-Billing is a core business requirement.

BR-034
The business intends to provide an E-Bill to all customers through WhatsApp when a valid WhatsApp-capable phone number is available.

BR-035
A transaction must not be blocked solely because a customer declines to provide a phone number.

BR-036
The E-Bill must reflect the actual completed transaction and final amount charged.

---

## 11.8 Operational Rules

BR-037
The primary operational objective of the front desk is to register customers efficiently and avoid unnecessary delays to service.

BR-038
Staff should not be required to record worker activity.

BR-039
Staff should not be required to record service progress.

BR-040
Staff should not be required to record bay usage.

BR-041
The system currently records the business transaction rather than the physical execution of the wash service.

BR-042
The operational model may be expanded in the future if the business introduces supervisory roles or requires systematic workforce and service management.

---

## 11.9 Transaction Correction Rules

BR-043
Completed transactions are historical business records.

BR-044
Staff must not have unrestricted ability to permanently delete completed transactions.

BR-045
Incorrect transaction information must be corrected through a controlled correction mechanism rather than unrestricted deletion.

BR-046
Corrections must preserve the integrity of historical business records.

BR-047
The exact authorization and audit mechanism for corrections will be defined in later system specifications.

---

## 11.10 Historical Data Rules

BR-048
Historical transactions must remain available for business analysis.

BR-049
Historical transaction data must reflect the information and pricing applicable at the time the transaction occurred.

BR-050
Changes to current services, vehicle categories, pricing, or business configuration must not retroactively alter completed historical transactions.

# 12. Operational Decisions

Operational Decisions document deliberate choices made about how the business should be represented and supported by the system.

These decisions are based on the current operational reality of the business and should guide future product and technical decisions.

---

## OD-001 — Front Desk and Wash Workers Are Operationally Separate

The front desk and wash workers have different responsibilities.

Front desk staff are responsible for customer registration, service selection, pricing, payment recording, billing, and related administrative tasks.

Wash workers are responsible for physically performing the vehicle services.

The current system does not require wash workers to interact with the software.

Reason:

The two groups operate independently, and requiring front desk staff to track worker activities would introduce unnecessary administrative work without providing sufficient business value.

Future consideration:

If the business introduces supervisors or becomes more systematically organized, workforce management and service-progress capabilities may be introduced.

---

## OD-002 — The System Records the Transaction, Not the Physical Wash Process

The system primarily represents the commercial transaction between the business and the customer.

It does not currently attempt to digitally represent every physical activity involved in washing a vehicle.

Reason:

The physical execution of the service is already managed by the workers without requiring software intervention.

The system should therefore focus on information that creates business value, such as customer history, pricing, payment, billing, and analytics.

---

## OD-003 — Vehicle Registration Number Is the Primary Vehicle Identifier

The vehicle registration number is the primary identifier used by the business to recognize and retrieve a vehicle.

Reason:

Customers may return without providing their information again, and the registration number provides a practical way for staff to locate the vehicle's existing history.

---

## OD-004 — Customer History Is a Core Operational Tool

Customer and vehicle history is not merely an archival feature.

It is intended to reduce repeated data entry when returning customers visit the business.

Reason:

Returning customers generally state the service they require rather than repeating their personal and vehicle information.

The system should therefore allow staff to quickly retrieve existing information and reuse it for a new transaction.

---

## OD-005 — Service Packages Are Selected as Complete Units

The business sells standardized service packages rather than requiring staff to construct every wash from individual activities.

Reason:

The contents of a package are already defined by the business.

Requiring staff to manually select each included activity would increase transaction time and create unnecessary opportunities for mistakes.

---

## OD-006 — Uncommon Requests Should Not Become Standard Workflow

The business receives occasional requests that are too unpredictable or infrequent to justify maintaining a comprehensive catalogue of every possible service.

Reason:

Attempting to standardize every unusual request would make the normal staff workflow more complicated.

The system should remain capable of accommodating exceptional requests without allowing those exceptions to dominate the standard workflow.

---

## OD-007 — Standard Pricing Is Controlled by the Administrator

Standard service prices are controlled by the Administrator.

Staff should use the configured standard price rather than independently determining normal service prices.

Reason:

Centralized pricing maintains consistency and gives the business owner control over pricing changes.

---

## OD-008 — Historical Prices Must Be Preserved

Changes to current pricing must never modify the prices recorded in completed historical transactions.

Reason:

The Administrator needs accurate historical analysis of revenue and transaction values.

Changing historical prices would make previous business reports inaccurate.

---

## OD-009 — Negotiated Pricing Is an Exception

The configured standard price represents the normal price for a service.

However, the business may occasionally agree to a different final price because of customer negotiation or vehicle condition.

Reason:

The system must reflect real-world transactions without turning negotiated pricing into the primary pricing workflow.

---

## OD-010 — No Routine Discount System in the Current Business Model

The business does not currently operate with a standard discount or promotional pricing system.

Reason:

Discounts have not been part of the business's normal pricing practice.

Future loyalty programs, memberships, promotions, or customer-specific pricing may be introduced if business requirements change.

---

## OD-011 — Payment Is Flexible in Timing

Payment is normally collected after service but is not restricted to a single point in the workflow.

Reason:

Different customers and circumstances may require payment to be handled differently.

The system should therefore record payment when it actually occurs rather than forcing a rigid payment sequence.

---

## OD-012 — WhatsApp E-Billing Is a Core Customer Service

The business intends to provide an electronic bill through WhatsApp for all customers when a valid phone number is available.

Reason:

Digital billing reduces reliance on paper and provides customers with a convenient record of their transaction.

Institutional customers, offices, schools, workshops, and similar organizations may have additional billing requirements, but WhatsApp E-Billing is not limited to these customers.

---

## OD-013 — Phone Number Collection Must Not Block Service

Although a phone number is valuable for customer history and WhatsApp E-Billing, the business should not prevent a customer from receiving service solely because they decline to provide a phone number.

Reason:

Customer service should not be unnecessarily obstructed by data collection.

---

## OD-014 — Vehicle Service Should Begin as Quickly as Possible

The front desk workflow should prioritize getting the vehicle into service quickly.

Reason:

The desk staff's primary operational responsibility is to handle customers efficiently.

Administrative data entry should not unnecessarily delay the physical service.

---

## OD-015 — Vehicle Number Can Be Captured Before Transaction Creation

The vehicle registration number may be captured or searched before a service transaction is created.

A transaction itself is created only after the customer selects a service package.

Reason:

The vehicle number is immediately observable by staff, while the requested service must come from the customer.

This avoids creating unnecessary incomplete transactions when a customer has not yet decided on a service.

---

## OD-016 — Completed Transactions Are Historical Records

Completed transactions should not be freely deleted.

If an error occurs, the transaction should be corrected through a controlled mechanism.

Reason:

Deleting transactions would compromise financial history, analytics, and accountability.

The system should preserve the integrity of historical records while still allowing legitimate mistakes to be corrected.

---

## OD-017 — Current Vehicle Classification Is Practical Rather Than Universal

The business's vehicle categories are practical classifications developed around its actual pricing and operating requirements.

They do not need to exactly match formal automotive industry classifications.

Reason:

The purpose of classification is to support fast identification, consistent pricing, and useful reporting rather than technical vehicle categorization.

The business may introduce additional categories when required.

---

## OD-018 — The System Must Not Overmodel the Business

The system should only require information that provides meaningful operational, financial, customer, or analytical value.

The existence of a physical activity in the business does not automatically mean that activity needs to be represented in software.

Reason:

The primary purpose of the system is to reduce administrative workload and improve business visibility, not to digitally reproduce every physical action performed at the car wash.

# 13. Exception Scenarios

Exception scenarios describe situations that deviate from the normal business workflow and may require special handling.

The purpose of documenting exceptions is not to complicate the normal workflow, but to ensure that unusual situations can be handled without compromising transaction accuracy, customer records, or business data.

The standard workflow should remain simple even when the system is capable of handling exceptional situations.

---

## 13.1 Customer Does Not Provide Phone Number

Scenario:

A customer does not want to provide a phone number.

Expected Business Behavior:

The customer should still be able to receive the service.

The transaction may be completed without a customer phone number.

Impact:

• WhatsApp E-Bill cannot be delivered to that customer.
• Future customer identification may rely on available vehicle information.
• The transaction must still remain part of historical business records.

The absence of a phone number must not prevent service.

---

## 13.2 Customer Is Not Registered in the System

Scenario:

A vehicle arrives for the first time and no existing customer or vehicle record can be found.

Expected Business Behavior:

Staff creates the necessary customer and vehicle information during the transaction.

The vehicle registration number must be recorded.

---

## 13.3 Returning Customer Has Multiple Vehicles

Scenario:

A customer has more than one vehicle registered in the system.

Expected Business Behavior:

Staff must be able to identify the correct vehicle before creating the transaction.

The transaction must be associated with the vehicle that is actually being serviced.

---

## 13.4 Incorrect Vehicle Number

Scenario:

Staff enters an incorrect vehicle registration number.

Potential Impact:

The transaction may become associated with the wrong vehicle or create an incorrect vehicle record.

Expected Business Behavior:

The system must provide a controlled method for correcting the vehicle registration number without compromising historical records.

The exact correction mechanism will be defined in the technical specifications.

---

## 13.5 Incorrect Vehicle Category

Scenario:

Staff selects the wrong vehicle category.

Potential Impact:

The wrong standard price may be applied.

Expected Business Behavior:

The transaction should be correctable through a controlled mechanism.

If the incorrect category resulted in an incorrect amount being charged, the actual amount charged must remain accurately represented in the historical transaction.

---

## 13.6 Incorrect Service Package

Scenario:

Staff selects the wrong service package.

Potential Impact:

The transaction may contain an incorrect service description or price.

Expected Business Behavior:

The transaction should be correctable through a controlled mechanism while preserving the integrity of the historical record.

---

## 13.7 Vehicle Condition Requires Price Adjustment

Scenario:

A vehicle's condition requires significantly more or different work than normally represented by the selected service package.

Expected Business Behavior:

The final transaction price may differ from the standard configured price.

The standard price and actual final price should remain distinguishable.

Where appropriate, the reason for the adjustment should be recorded.

---

## 13.8 Customer Negotiates the Price

Scenario:

A customer and the business agree on a price different from the configured standard price.

Expected Business Behavior:

The final negotiated amount may be recorded.

The system should preserve the original standard price for reference and record the actual amount charged.

Negotiated pricing should remain an exception rather than becoming the normal pricing workflow.

---

## 13.9 Payment Is Not Immediately Recorded

Scenario:

The vehicle has been serviced but payment has not yet been recorded.

Expected Business Behavior:

The transaction should be capable of remaining incomplete until payment is received.

The system must not falsely represent the transaction as paid.

---

## 13.10 Payment Method Is Incorrectly Recorded

Scenario:

Staff records Cash when the customer actually paid through UPI, or vice versa.

Expected Business Behavior:

The payment information should be correctable through a controlled mechanism.

Historical transaction records should preserve the corrected information appropriately.

---

## 13.11 Duplicate Transaction

Scenario:

The same service is accidentally registered more than once.

Potential Impact:

The business may incorrectly record duplicate revenue or send duplicate E-Bills.

Expected Business Behavior:

The system should provide a controlled mechanism to identify and invalidate an accidental duplicate without permanently destroying the underlying historical record.

The exact cancellation or voiding mechanism will be defined later.

---

## 13.12 WhatsApp E-Bill Cannot Be Delivered

Scenario:
Scenario:

The customer's phone number is invalid, unavailable on WhatsApp, or the message cannot be delivered.

Expected Business Behavior:

The transaction must still be considered valid.

Failure to deliver the E-Bill must not invalidate the transaction or payment.

The system should record the communication failure so that it can be addressed if necessary.

---

## 13.13 Customer Leaves Vehicle for Later Pickup

Scenario:

The customer leaves the vehicle at the business and plans to return later.

Expected Business Behavior:

The transaction may record an expected return time when the customer provides one.

The expected return time is optional.

The system must not require staff to record a return time for every customer.

---

## 13.14 Vehicle Remains for Multiple Days

Scenario:

A vehicle remains at the business for several days, such as a vehicle left by a nearby workshop.

Expected Business Behavior:

An expected pickup date may be recorded when relevant.

This is optional and should not become part of the normal workflow.

---

## 13.15 Customer Does Not Return at the Expected Time

Scenario:

A customer provides an expected pickup time or date but does not return at that time.

Expected Business Behavior:

The expected pickup information should not be treated as a guaranteed deadline.

The transaction and vehicle record remain valid.

The system should not automatically mark the vehicle as collected simply because the expected time has passed.

---

## 13.16 Customer Requires a Paper Bill

Scenario:

A customer or organization specifically requires a physical bill.

Expected Business Behavior:

The business may provide a paper bill in addition to the standard E-Bill process.

WhatsApp E-Billing remains the standard digital billing method.

---

## 13.17 Unusual or Custom Service Request

Scenario:

A customer requests a service that is not represented by the standard service packages.

Examples may include:

• Pressure washing loose mechanical parts.
• Cleaning unusual vehicle components.
• Other one-time cleaning requests.

Expected Business Behavior:

The business must be able to handle the transaction without requiring every possible unusual service to exist as a permanent standard service.

The exact mechanism for recording such requests will be defined in the system specification.

---

## 13.18 Service Price Configuration Is Missing

Scenario:

Staff selects a combination of vehicle category and standard service package for which no current standard price has been configured.

Expected Business Behavior:

The system should not silently assume a price.

Staff should be informed that a standard price is unavailable and the transaction should require appropriate administrative resolution.

The exact handling mechanism will be defined in the system specification.

---

## 13.19 Service or Vehicle Category Is No Longer Offered

Scenario:

The Administrator removes or deactivates a service package or vehicle category from the current business configuration.

Expected Business Behavior:

The inactive option should no longer be available for new transactions.

Historical transactions using that service or category must remain intact and available for reporting.

---

## 13.20 System or Device Failure During Registration

Scenario:

The staff member is registering a transaction and the device, network, or application becomes unavailable.

Expected Business Behavior:

The system should minimize the risk of losing transaction information.

The exact offline, synchronization, recovery, and data persistence strategy will be defined in the system architecture.

---

## 13.21 Exception Handling Principle

Exceptional situations must not complicate the normal customer workflow.

The system should make the normal path extremely fast while providing controlled mechanisms for unusual circumstances.

Exceptions should be handled through:

• Correction rather than unrestricted deletion.
• Explicit adjustment rather than hidden price changes.
• Historical preservation rather than overwriting records.
• Optional information rather than mandatory forms.
• Controlled administrative intervention where required.

The goal is to protect business data and operational accuracy without turning the POS into a complex management system.

## 13.22 WhatsApp Unavailable or E-Billing Service Unavailable

Scenario:

WhatsApp integration is unavailable, a message cannot be delivered, or the customer cannot receive the E-Bill through WhatsApp.

Expected Business Behavior:

The transaction must remain valid and must not depend on successful WhatsApp delivery.

All transaction information must remain available within the system for administrative review and reporting.

The Administrator must be able to export transaction data as an Excel spreadsheet independently of the WhatsApp billing process.

Daily sales data must therefore remain accessible even when customer communication services are unavailable.

The failure of an external communication service must never result in the loss of business transaction data.

# 14. Reporting & Analytics Requirements

Reporting and analytics are primarily intended for the Administrator.

The purpose of reporting is not simply to display stored transaction data. The system should help the business owner understand sales performance, customer activity, service demand, payment patterns, and changes in business performance over time.

The Staff interface should not be burdened with administrative analytics that are unrelated to customer registration.

---

## 14.1 Reporting Periods

The Administrator must be able to review business performance across different time periods.

The primary reporting periods are:

• Day
• Week
• Month
• Year

The system should also support custom date ranges where useful.

Reports must use the actual transaction dates and times recorded by the system.

---

## 14.2 Daily Business Overview

The daily overview should provide a quick understanding of the day's performance.

Key information should include:

• Total number of vehicles serviced.
• Total sales.
• Cash sales.
• UPI sales.
• Average transaction value.
• Number of new customers.
• Number of returning customers.
• Service package distribution.
• Vehicle category distribution.

The Administrator should be able to understand the day's business performance without manually calculating totals from individual transactions.

---

## 14.3 Weekly Business Overview

The weekly overview should allow the Administrator to understand performance across the week.

Relevant information may include:

• Total vehicles serviced.
• Total sales.
• Daily sales comparison.
• Daily vehicle-count comparison.
• Cash versus UPI distribution.
• Service package popularity.
• Vehicle category distribution.
• Average transaction value.
• New versus returning customers.

The purpose is to identify patterns such as busy days, slow days, and changes in customer demand.

---

## 14.4 Monthly Business Overview

The monthly overview should provide a broader view of business performance.

Relevant information should include:

• Total vehicles serviced.
• Total sales.
• Daily or weekly sales trends.
• Service package performance.
• Vehicle category performance.
• Cash versus UPI distribution.
• Average transaction value.
• New versus returning customer activity.
• Price changes and their effect on transaction values.
• Negotiated or adjusted transaction amounts.

Where sufficient historical data exists, the Administrator should be able to compare the current month with previous months.

---

## 14.5 Yearly Business Overview

The yearly overview should allow the Administrator to understand long-term business performance.

Relevant information may include:

• Total annual vehicles serviced.
• Total annual sales.
• Monthly sales trends.
• Monthly vehicle-count trends.
• Best-performing months.
• Lowest-performing months.
• Service package performance.
• Vehicle category performance.
• Cash versus UPI distribution.
• Average transaction value.
• New versus returning customer activity.

The yearly view should help identify seasonal patterns and long-term changes in business performance.

---

## 14.6 Sales Analysis

The system should provide the Administrator with a clear view of sales performance.

Sales analysis should support:

• Total sales.
• Sales by day.
• Sales by week.
• Sales by month.
• Sales by year.
• Sales by service package.
• Sales by vehicle category.
• Sales by payment method.
• Sales by custom date range.

Where applicable, reports should distinguish between the standard configured price and the actual amount charged.

---

## 14.7 Vehicle Analysis

The system should provide information about the number and types of vehicles serviced.

Relevant analysis includes:

• Total vehicles serviced.
• Vehicles by category.
• Vehicles by service package.
• Vehicle frequency.
• Returning vehicles.
• New vehicles.
• Historical service activity for individual vehicles.

This information should help the Administrator understand the composition of the customer base and demand for different services.

---

## 14.8 Service Package Analysis

The Administrator should be able to determine which standard service packages are most frequently used and which generate the most revenue.

Relevant information includes:

• Number of Body Wash transactions.
• Number of Body & Vacuum transactions.
• Number of Full Wash transactions.
• Revenue generated by each package.
• Package distribution by vehicle category.
• Changes in package popularity over time.

Service analysis should help the Administrator understand customer demand rather than simply display transaction counts.

---

## 14.9 Payment Analysis

The system should provide a clear breakdown of payment methods.

Current payment methods are:

• Cash
• UPI

The Administrator should be able to see:

• Total cash collected.
• Total UPI collected.
• Percentage or proportion of transactions by payment method.
• Payment-method trends over time.

Future payment methods may be added without changing the overall reporting model.

---

## 14.10 Customer Analysis

Customer analysis should help the Administrator understand customer activity and retention.

Relevant information may include:

• Number of new customers.
• Number of returning customers.
• Customer visit frequency.
• Individual customer transaction history.
• Vehicle history associated with a customer.
• Customer spending history.

The system should preserve sufficient historical data to support future loyalty and retention features.

The business does not currently operate a formal loyalty program.

---

## 14.11 Price and Revenue Analysis

Because standard prices may change over time, reporting must preserve the historical pricing context of transactions.

The Administrator should be able to analyze:

• Revenue before and after price changes.
• Transaction volume before and after price changes.
• Average transaction value over time.
• Standard configured prices.
• Actual transaction prices.
• Negotiated or adjusted transaction amounts.

Historical reports must use the actual transaction price that was recorded at the time of the transaction.

---

## 14.12 Adjustment and Negotiation Analysis

Where a transaction is charged at an amount different from its standard configured price, the Administrator should be able to identify these transactions.

This may include:

• Standard price.
• Actual price charged.
• Difference between standard and actual price.
• Reason for adjustment, when recorded.

The purpose is to allow the Administrator to understand how frequently pricing adjustments occur and their effect on revenue.

---

## 14.13 Daily Sales Report

The system must be capable of generating a daily sales report for administrative review.

The report should contain relevant transaction-level information such as:

• Date and time.
• Vehicle registration number.
• Vehicle category.
• Service package.
• Standard price.
• Actual transaction price.
• Payment method.

The report should also provide summary totals such as:

• Total vehicles.
• Total sales.
• Cash total.
• UPI total.

---

## 14.14 Excel Export

The Administrator must be able to export business transaction and reporting data into an Excel-compatible spreadsheet.

At minimum, the system should support exporting daily sales data.

Future reporting periods should also be exportable, including:

• Weekly reports.
• Monthly reports.
• Yearly reports.
• Custom date-range reports.

Excel export must operate independently of WhatsApp E-Billing.

Failure of WhatsApp or another external communication service must never prevent the Administrator from accessing or exporting business records.

---

## 14.15 Report Filtering

Where appropriate, the Administrator should be able to filter reports using criteria such as:

• Date range.
• Vehicle category.
• Service package.
• Payment method.
• Customer.
• Vehicle registration number.

Additional filters may be introduced when they provide meaningful business value.

Filtering should improve analysis without making the reporting interface unnecessarily complicated.

---

## 14.16 Business Insights

The long-term purpose of analytics is to help the Administrator make better business decisions.

The system may eventually provide automatically generated insights based on historical transaction data.

Examples may include:

• Identification of unusually busy or slow periods.
• Changes in service package popularity.
• Changes in average transaction value.
• Changes in payment-method usage.
• Changes in customer return frequency.
• Effects of pricing changes.
• Significant changes in vehicle-category demand.

These insights should be derived from existing business data and should not require additional manual data entry by Staff.

Advanced AI-generated insights are considered a future capability rather than a mandatory MVP requirement.

---

## 14.17 Staff Reporting Access

Staff should not be required to interact with the full administrative analytics system.

Administrative reporting and analytics are primarily an Administrator responsibility.

The Staff interface should remain focused on customer registration, transaction handling, payment recording, and related operational tasks.

---

## 14.18 Reporting Accuracy

Reports must be based on completed and valid business transactions.

Historical transactions must retain their original transaction values even when:

• Standard prices change.
• Service packages change.
• Vehicle categories change.
• Customer information is updated.

Corrections to historical transactions must not silently distort reporting.

The exact treatment of voided, cancelled, corrected, or exceptional transactions will be defined in the system specification.

---

## 14.19 Reporting Principle

Administrative analytics should answer practical business questions rather than simply expose raw data.

The Administrator should be able to quickly answer questions such as:

• How many cars did we service today?
• How much did we earn today?
• How much was Cash versus UPI?
• Which service is most popular?
• Which vehicle category generates the most revenue?
• How is this month performing compared with previous months?
• Are customers returning?
• What happened to sales after a price change?
• How much revenue was affected by negotiated pricing?

The purpose of reporting is therefore:

Observe.
Analyze.
Understand.
Improve.
Grow.

# 15. Automation Requirements

Automation is intended to reduce repetitive administrative work without adding additional responsibilities to Staff.

The system should automate tasks that can reliably be performed using information already captured during normal business operations.

Automation must never become a reason for Staff to enter unnecessary information.

---

## 15.1 WhatsApp E-Billing

The system should generate an electronic bill for completed transactions and make it available for delivery through WhatsApp.

Where a valid customer phone number is available, the E-Bill should be sent to the customer's WhatsApp number.

The E-Bill should be generated from the completed transaction and should reflect the actual amount charged.

Staff should not be required to manually prepare the bill for every transaction.

---

## 15.2 WhatsApp Delivery Failure

If WhatsApp delivery fails, the transaction must remain valid.

A failed WhatsApp message must not:

• Delete the transaction.
• Change the transaction amount.
• Mark the transaction as unpaid.
• Prevent the transaction from appearing in reports.

The system should make the delivery status visible where useful so that the issue can be identified and addressed.

---

## 15.3 E-Bill Availability Without WhatsApp

The E-Bill should remain available as a business document even if WhatsApp delivery is unavailable.

This allows the business to retain access to the bill independently of the communication channel.

The exact downloadable or printable format will be defined in the system specification.

---

## 15.4 Excel Sales Export

The system should allow the Administrator to generate Excel-compatible reports from recorded transaction data.

At minimum:

• Daily sales export.

Future reporting exports should include:

• Weekly sales.
• Monthly sales.
• Yearly sales.
• Custom date-range sales.

The export should be generated from the same transaction records used for administrative analytics.

---

## 15.5 Automated Business Analytics

Administrative analytics should be generated automatically from transaction data.

Staff should not be required to manually prepare:

• Daily sales totals.
• Cash totals.
• UPI totals.
• Vehicle counts.
• Service counts.
• Average transaction values.
• Customer counts.

These values should be calculated from recorded transactions.

---

## 15.6 Customer History Automation

When a transaction is recorded for an existing customer or vehicle, the transaction should automatically become part of that customer's and vehicle's history.

Staff should not need to manually update customer history after every visit.

This allows returning customers to be identified quickly during future visits.

---

## 15.7 Future Customer Communication

The system may eventually support automated WhatsApp communication beyond E-Billing.

Potential future automation includes:

• Service reminders.
• Customer return reminders.
• Loyalty notifications.
• Membership renewal reminders.
• Promotional messages.
• Feedback requests.

These are future capabilities and are not required for the initial MVP unless separately approved.

---

## 15.8 Future Automated Insights

The system may eventually analyze historical business data and surface useful insights automatically.

Examples:

• Unusual changes in daily sales.
• Significant changes in service demand.
• Changes in customer return frequency.
• Effects of pricing changes.
• Unusually high or low business activity.

Advanced automated or AI-generated insights are considered future capabilities.

---

## 15.9 Automation Independence

Critical business records must never depend on the successful operation of an external automation service.

For example:

WhatsApp unavailable
        ↓
Transaction remains valid
        ↓
Analytics remain available
        ↓
Excel export remains available

External communication failures must not compromise the underlying business data.

---

## 15.10 Automation Principle

Automation should follow one fundamental rule:

> Automate work that the business already needs to perform; do not automate work that should not exist in the first place.

The system should prioritize automation that:

• Saves Staff time.
• Reduces repetitive work.
• Reduces human error.
• Improves customer communication.
• Improves administrative visibility.

Automation must not introduce unnecessary complexity into the Staff workflow.

# 16. Customer & Vehicle History

Customer and vehicle history is a core part of the business system.

The purpose of maintaining history is to:

• Reduce repeated data entry for returning customers.
• Allow Staff to quickly identify vehicles.
• Preserve a record of services provided.
• Support customer communication and E-Billing.
• Provide accurate business analytics.
• Support future customer loyalty and retention features.

Historical information must remain reliable even when current pricing, services, or business configurations change.

## 16.1 Vehicle Registration Number as the Primary Operational Identifier

The vehicle registration number is the primary operational identifier of a service visit.

It is the most important piece of information used to identify the vehicle being serviced and retrieve its relevant history.

The vehicle registration number is mandatory for every service transaction.

The system should use the vehicle registration number to quickly locate:

• The vehicle record.
• Associated customer information, when available.
• Previous service transactions.
• Previous service packages.
• Historical pricing and payment information.
• Relevant visit history.

The vehicle registration number is not considered a customer identifier.

A single customer may be associated with multiple vehicles, and each vehicle maintains its own service history.

The operational relationship can therefore be understood as:

Vehicle Registration Number
        ↓
Vehicle
        ↓
Service History
        ↓
Transactions

Customer information may be associated with the vehicle but does not replace the vehicle registration number as the primary operational identifier.

The system should prioritize fast vehicle-number search and retrieval because this directly supports the returning-customer workflow.
---

## 16.1 Customer Record

A customer record may contain:

• Customer name.
• Customer phone number.
• Associated vehicles.
• Transaction history.

Customer name is optional in the current business workflow.

A phone number is normally collected but is not mandatory for completing a transaction.

The system should not prevent a customer from receiving service solely because their name or phone number is unavailable.

---

## 16.2 Vehicle Record

A vehicle record must contain the vehicle registration number.

The vehicle may also have associated information such as:

• Vehicle category.
• Vehicle model, when provided.
• Associated customer.
• Service history.

The registration number is the primary identifier used by Staff to locate a vehicle.

---

## 16.3 Multiple Vehicles per Customer

A customer may own or regularly use multiple vehicles.

The system must therefore allow multiple vehicles to be associated with the same customer.

For example:

Customer A
├── Vehicle 1
├── Vehicle 2
└── Vehicle 3

Each vehicle maintains its own service history.

---
---

## 16.4 Vehicle History

Each vehicle should maintain a historical record of its transactions.

Vehicle history may include:

• Date and time of service.
• Service package.
• Vehicle category at the time of transaction.
• Standard price applicable at the time.
• Actual amount charged.
• Payment method.
• Relevant transaction information.

Vehicle history allows Staff to quickly understand previous visits when a returning vehicle is identified.

---

## 16.5 Customer History

Customer history should provide an overview of the customer's interactions with the business.

It may include:

• Previous transactions.
• Associated vehicles.
• Service frequency.
• Total historical spending.
• Most recent visit.
• Previous service packages.

The system should preserve this information automatically from transactions rather than requiring Staff to maintain a separate customer history record.

---

## 16.6 Returning Customer Workflow

When a returning customer arrives, Staff should be able to identify the existing vehicle and retrieve relevant historical information.

The customer should not normally need to repeat information that is already stored.

The normal returning-customer workflow is therefore:

Customer Arrives
        ↓
Vehicle Number Identified
        ↓
Existing Vehicle Found
        ↓
Relevant Customer / Vehicle Information Retrieved
        ↓
Customer Selects Service
        ↓
New Transaction Created

The purpose of retrieving history is to accelerate the current transaction rather than force Staff to review the customer's entire historical record.

---

## 16.7 Historical Information and Current Configuration

Historical transactions must retain the information that was applicable when the transaction occurred.

Changes to current business configuration must not automatically rewrite historical information.

For example:

If a service package's price changes:

• Previous transactions retain their original transaction price.
• New transactions use the new price.

If a vehicle classification changes:

• Historical transactions must retain sufficient information to preserve the context in which they occurred.
• Future transactions may use the updated classification.

---

## 16.8 Vehicle Category Changes

A vehicle may be reclassified in the future if the business changes its classification rules or determines that the vehicle was previously categorized incorrectly.

Changing the current classification of a vehicle must not silently alter the historical category recorded for previous transactions.

Historical transactions must remain representative of the business decision made at the time.

---

## 16.9 Customer Information Updates

Customer information may change over time.

For example:

• Customer changes phone number.
• Customer provides their name after previously leaving it blank.
• A customer becomes associated with another vehicle.

Current customer information may be updated when necessary.

Updating current customer information must not modify unrelated historical transaction records.

---

## 16.10 Phone Number and WhatsApp

A customer's phone number has two important business purposes:

1. Customer identification and history.
2. WhatsApp E-Billing and future communication.

If a customer provides a phone number, it should be retained for future transactions where appropriate.

If a customer declines to provide a phone number, the transaction can still be completed.

The absence of a phone number must not prevent the vehicle or transaction history from being retained.

---

## 16.11 Search and Retrieval

Vehicle and customer history must be quickly retrievable by Staff.

The vehicle registration number is the primary search method.

Additional search methods may be introduced where they provide meaningful value, such as:

• Phone number.
• Customer name.

Search should prioritize speed and practical identification over complex filtering.

---

## 16.12 Historical Data and Analytics

Customer and vehicle history forms part of the data used for administrative analytics.

Historical information may support analysis such as:

• New versus returning customers.
• Customer visit frequency.
• Vehicle service frequency.
• Customer spending patterns.
• Service preferences.
• Customer retention.

Analytics must use historical transaction records without changing them.

---

## 16.13 Future Loyalty and Retention

The business does not currently operate a formal loyalty or membership program.

However, customer and vehicle history should be preserved in sufficient detail to support future capabilities such as:

• Loyalty programs.
• Memberships.
• Repeat-customer benefits.
• Service reminders.
• Customer-specific offers.
• Retention analysis.

These capabilities are outside the current MVP.

---

## 16.14 History Principle

Customer and vehicle history exists to make the business faster and more informed.

For Staff:

> Find the vehicle → reuse known information → register the next service quickly.

For the Administrator:

> Review history → understand customer behavior → analyze business performance → make better decisions.

Historical data must therefore be treated as a valuable business asset rather than simply an archive of old transactions.

