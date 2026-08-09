# PROJECT CONSTITUTION

Version: 1.0
Status: Active
Document Type: Foundational Governance Document

---

# 1. Project Identity

Project Type:
Car Wash Point of Sale (POS) & Business Management Platform

Primary Purpose:
To simplify customer registration, billing, reporting, and business management for modern car wash businesses.

Target Platform:
• Staff Interface – Mobile First
• Admin Interface – Desktop First with Mobile Compatibility

This document is the highest authority for all future design, development, and architectural decisions.

Whenever another project document conflicts with this constitution, this constitution takes precedence unless officially revised.

---

# 2. Mission

To build a fast, intuitive, and reliable Car Wash POS that enables front desk staff to register customers in seconds while empowering business owners with meaningful insights to operate and grow their business.

---

# 3. Vision

To create a scalable business platform that begins as the perfect operating system for a single local car wash and evolves into an enterprise-ready ecosystem capable of supporting multiple branches, franchises, memberships, fleet customers, automation, business intelligence, and future AI capabilities without requiring a redesign of its core architecture.

---

# 4. Core Philosophy

The software must adapt to the business.

The business should never be forced to adapt to the software.

Real operational workflow always has priority over unnecessary technical complexity.

Every decision must create measurable value for the people using the system.

---

# 5. Product Philosophy

The product serves two completely different users.

STAFF

Purpose:
Register customers as quickly and accurately as possible.

Primary Objective:
Speed.

Success Metric:
A customer should be registered in under 30 seconds by an experienced staff member.

ADMIN

Purpose:
Understand, manage, and grow the business.

Primary Objective:
Insights.

Success Metric:
The owner should understand the current state of the business within a few minutes of opening the dashboard.

---

# 6. User Roles

Administrator

Full system access.

Responsible for:

• Business settings
• Pricing
• Reports
• Analytics
• User management
• Services
• Customer database
• Future branch management

Staff

Responsible only for customer-facing operational tasks.

Typical responsibilities include:

• Register customer
• Register vehicle
• Select services
• Apply discounts
• Record payment
• Generate receipt
• Share customer communication

Staff should never be required to perform unnecessary operational tracking that does not directly support customer registration or billing.

---

# 7. Design Principles

1. Speed Over Complexity

Every additional tap must justify its existence.

2. Simplicity Wins

Simple solutions are preferred over feature-rich workflows.

3. Mobile First For Staff

Staff interface is designed primarily for mobile devices.

4. Desktop First For Admin

Analytics, reports and business management are optimized for larger displays.

5. Familiar User Experience

The software should feel immediately understandable to someone who has used modern POS systems.

6. Accessibility

Large touch targets.

Readable typography.

Minimal typing.

High visibility.

Clear navigation.

---

# 8. Engineering Principles

Build for long-term scalability.

Avoid unnecessary complexity.

Modular architecture.

Reusable components.

Clean separation of frontend, backend and business logic.

Every module should be independently replaceable.

No feature should compromise future scalability.

---

# 9. Development Methodology

Every proposed feature must answer:

Why does this feature exist?

Who uses it?

What business problem does it solve?

Does it reduce work?

Does it improve decision making?

Database impact.

Backend impact.

Frontend impact.

Future scalability.

Risks.

Alternative solutions.

MVP or Future Release.

No feature proceeds into development until these questions have been answered.

---

# 10. Product Scope

The initial product focuses on:

Customer registration

Vehicle registration

Service selection

Billing

Payment recording

Customer history

Business analytics

Reports

WhatsApp communication

Excel export

The product intentionally excludes unnecessary operational tracking that slows staff without delivering meaningful value.

---

# 11. MVP Philosophy

The MVP is not a prototype.

The MVP is a production-ready product with a carefully limited feature set.

Every included feature must solve a real business problem.

Every excluded feature should already have a place within the overall architecture for future expansion.

---

# 12. Scalability Philosophy

The architecture should support future expansion into:

Multiple branches

Franchise management

Fleet customers

Memberships

Subscription plans

Inventory management

Employee attendance

Accounting integrations

GST invoicing

Online booking

Customer loyalty

AI-assisted business intelligence

Predictive reporting

without requiring architectural redesign.

---

# 13. Decision Framework

Before implementing any feature ask:

Does this make staff faster?

Does this reduce manual work?

Does this improve business understanding?

Does this improve customer experience?

Can this be automated?

Is there a simpler solution?

If the answer is no to all of these questions, the feature should not be included in the MVP.

---

# 14. Project Workflow

Business Understanding

↓

Business Specification

↓

Information Architecture

↓

Database Design

↓

Backend Architecture

↓

Frontend Architecture

↓

UI Design

↓

Implementation

↓

Testing

↓

Deployment

No implementation begins before the previous phase has been reviewed.

---

# 15. Technology Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

Backend

Firebase Authentication

Cloud Firestore

Cloud Functions

Firebase Storage

Deployment

Firebase Hosting

Additional technologies may be adopted when they provide measurable business value without compromising maintainability.

---

# 16. Future Roadmap

Future releases may include:

AI insights

Automated reminders

WhatsApp automation

Online bookings

Inventory

Branch synchronization

Franchise management

Employee attendance

Advanced dashboards

Customer loyalty

Accounting integration

Public API

Future roadmap items must not compromise MVP simplicity.

---

# 17. Non-Goals

The system is NOT intended to become:

A workforce management application.

A time-tracking application.

A complex HR platform.

An employee surveillance system.

A feature-heavy ERP.

The system exists to improve customer registration and business management.

---

# 18. Closing Statement

Every tap should save time.

Every piece of data should create value.

Every feature should help the business grow.

If a feature does not support this philosophy, it does not belong in this product.