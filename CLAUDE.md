# Rally - Customer Engagement Platform

## Project Overview
Rally is Rsquare Technologies' multi-tenant customer engagement platform. Industry-agnostic, configurable per tenant. First client: car dealership (automobile).

## Tech Stack
- **Backend**: NestJS + Prisma + PostgreSQL + Redis (`apps/api/`)
- **Admin Portal**: Next.js 15 + Tailwind + Shadcn/ui (`apps/admin/`)
- **Customer Portal**: Next.js 15 + Tailwind + Shadcn/ui (`apps/customer/`)
- **Mobile App**: React Native (Expo) (`apps/mobile/`)
- **Shared Types**: TypeScript (`packages/shared/`)
- **Monorepo**: npm workspaces
- **Language**: TypeScript (full stack)
- **Auth**: httpOnly cookies, refresh token rotation, OTP + social login
- **i18n**: English + Arabic (RTL) from day 1

## Commands
```bash
npm install              # Install all workspace dependencies
npm run dev:api          # Start NestJS backend (port 4000)
npm run dev:admin        # Start admin portal (port 3000)
npm run dev:customer     # Start customer portal (port 3001)
npm run docker:up        # Start PostgreSQL + Redis
npm run docker:down      # Stop Docker services
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed demo data
```

## Architecture
- Multi-tenant: `tenant_id` on all data tables
- API response format: `{ success: boolean, data?: T, meta?: PaginationMeta, errors?: ApiError[] }`
- Modules: auth, tenant, customer, points, asset, transaction
- Guards: JwtAuthGuard, RolesGuard
- Decorators: @CurrentUser(), @Roles()

## Key Conventions
- All IDs are UUIDs
- Database columns use snake_case (via Prisma @@map)
- TypeScript interfaces in `packages/shared/src/types/`
- NestJS modules are self-contained (module + service + controller)
- Tenant isolation enforced at service level (always filter by tenantId)
- Points balance cached in Redis, invalidated on mutation

## Project Structure
```
rally/
├── apps/
│   ├── api/          # NestJS backend
│   │   ├── prisma/   # Schema + migrations + seed
│   │   └── src/
│   │       ├── modules/    # Feature modules
│   │       ├── prisma/     # Prisma service
│   │       └── redis/      # Redis service
���   ├── admin/        # Next.js admin portal
│   ├── customer/     # Next.js customer portal
│   └── mobile/       # React Native (Expo) app
├── packages/
│   └── shared/       # Shared TypeScript types
├── docs/             # Project documentation
└── docker-compose.yml
```

## Demo Credentials (after seed)
- Tenant: Al Jazeera Motors (slug: al-jazeera-motors)
- Admin: admin@rally.app / admin123
- CSR: csr@rally.app / admin123
- Customer: +973 33001234 (OTP logged to console in dev)

## Current Phase: Phase 1 (Foundation + Demo)
See `docs/phased-roadmap.md` for full roadmap.
