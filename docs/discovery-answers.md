# Rally - Discovery Decisions Summary

| # | Question | Decision |
|---|----------|----------|
| 1 | Sectors & Tenancy | All sectors, on-prem first, SaaS-ready architecture |
| 2 | Admin App | Complete rebuild |
| 3 | Backend | NestJS + Prisma + PostgreSQL |
| 4 | Frontend | Next.js 15 + Tailwind + Shadcn/ui (both portals) |
| 5 | Mobile | React Native (Expo) |
| 6 | Database | PostgreSQL + Redis |
| 7 | AI/LLM | Multi-provider (Claude/OpenAI/Ollama), both customer + admin facing |
| 8 | Migration | Clean start, car dealership first client |
| 9 | White-label | Full white-label customer apps, "Powered by Rsquare" in admin |
| 10 | Deployment | Docker Compose on Azure VM, GitHub Actions CI/CD |
| 11 | Repo | Monorepo (npm workspaces) |
| 12 | Auth | httpOnly cookies, refresh rotation, OTP primary, Google/Apple optional |
| 13 | Features | All gamification, social, integrations — see feature-vision.md |
| 14 | Reporting | Interactive dashboards + PDF/Excel export + scheduled reports |
| 15 | Comms | All channels, SMS provider configurable per tenant |
| 16 | Payments | Not MVP, architecture supports adding later |
| 17 | Timeline | Demo ASAP for car dealership |
| 18 | Region | All GCC, Arabic + English from day 1, multi-currency, Saudi is key market |

## Key Architecture Decisions
- Multi-tenant (tenant_id on all tables)
- Industry-agnostic (configurable modules per tenant)
- Full TypeScript stack
- Docker Compose deployment
- First client: Car dealership (automobile industry)
