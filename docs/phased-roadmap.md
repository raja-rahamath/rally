# Rally - Phased Roadmap

## Team
- Raja (lead developer + architect)
- Claude Code with Agents (AI pair programmer)
- QA team (testing, bug reporting, extensive user testing)

## Phase Overview

| Phase | Focus | Goal |
|-------|-------|------|
| Phase 1 | Foundation + Demo | Demoable product for car dealership |
| Phase 2 | Core Engagement | Full loyalty + gamification + campaigns |
| Phase 3 | AI + Intelligence | AI chatbot, analytics, smart features |
| Phase 4 | Polish + Launch | Production-ready, white-label, i18n |

---

## Phase 1: Foundation + Demoable Product

**Goal**: Show the car dealership client a working demo with core flows.

### Infrastructure
- [ ] Monorepo scaffolding (npm workspaces)
- [ ] NestJS backend with modular architecture
- [ ] Prisma schema + PostgreSQL setup
- [ ] Redis setup
- [ ] Next.js admin portal scaffold
- [ ] Next.js customer portal scaffold
- [ ] React Native (Expo) mobile app scaffold
- [ ] Docker Compose (all services)
- [ ] Shared TypeScript types package
- [ ] CI/CD pipeline (GitHub Actions)

### Multi-Tenancy Core
- [ ] Tenant management (create, configure, activate)
- [ ] Tenant-scoped data isolation (tenant_id on all tables)
- [ ] Tenant settings/configuration engine
- [ ] Tenant branding (logo, colors, name)

### Authentication
- [ ] OTP-based customer login (SMS)
- [ ] Admin login (email/password)
- [ ] httpOnly cookies + refresh token rotation
- [ ] Role-based access control (RBAC)
- [ ] Tenant-scoped auth

### Customer Management
- [ ] Customer registration (configurable fields)
- [ ] Customer profile (view/edit)
- [ ] Customer search (admin)
- [ ] Customer 360 view (admin)
- [ ] QR code for customer identification

### Loyalty Points Engine
- [ ] Configurable points rules (points per currency unit)
- [ ] Points earning on transactions
- [ ] Points balance + history
- [ ] Points redemption (basic)
- [ ] Points expiry rules

### Asset Registry (Generic)
- [ ] Configurable asset types per tenant
- [ ] Asset registration (e.g., vehicle: make, model, year, VIN)
- [ ] Asset listing per customer
- [ ] Asset service history

### Basic Admin Portal
- [ ] Admin dashboard (stats overview)
- [ ] Customer management pages
- [ ] Transaction management
- [ ] Basic settings pages
- [ ] Tenant configuration

### Basic Customer Portal + Mobile
- [ ] Login/registration flow
- [ ] Dashboard (points balance, recent activity)
- [ ] Profile page
- [ ] Transaction history
- [ ] Asset listing (e.g., my vehicles)

### Receipt/Invoice Processing
- [ ] Receipt upload (camera + file)
- [ ] AI OCR extraction
- [ ] CSR review queue for mismatches
- [ ] Manual transaction entry

---

## Phase 2: Core Engagement Features

### Gamification
- Tier system, badges, challenges, streaks, stamp cards

### Campaign & Promotion Engine
- Campaign CRUD, vouchers, multiplier events, scheduling, targeting

### Communication Engine
- SMS, email, push, WhatsApp, in-app, automated triggers

### Service Reminders, Referrals, Booking, Surveys

---

## Phase 3: AI + Intelligence
- AI chatbot (customer + admin facing)
- Advanced analytics, CLV, churn prediction, RFM
- Smart recommendations, surprise & delight

---

## Phase 4: Polish + Production Launch
- Full white-labeling, i18n (EN + AR), security hardening
- Performance optimization, QA, documentation
