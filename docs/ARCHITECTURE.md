# NexaFlow — Architecture

This repository contains the **frontend** of NexaFlow plus the plan for its backend. The demo runs entirely in the browser with illustrative data; this document describes how it connects to a production backend.

## 1. Frontend (this repo)

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 with design tokens in `src/app/globals.css` (light + dark) |
| Components | shadcn-style primitives on Radix UI (`src/components/ui`) |
| Motion | Motion (Framer Motion) — reveals, page transitions, layout animation; honours `prefers-reduced-motion` |
| Charts | Recharts with a colour-blind-validated categorical palette (`--chart-1..5`) |
| Forms | React Hook Form + Zod (`src/lib/validation.ts`) |
| State | Zustand stores (`src/store`) persisted to `localStorage` **for the demo only** |
| Drag & drop | dnd-kit (pointer, touch and keyboard sensors) |

### Route map

```
/                     marketing landing page          src/app/(marketing)/page.tsx
/sign-in /sign-up /forgot-password                    (app)/(auth)/*
/onboarding           company → workspace → team wizard
/demo                 one-click demo sign-in
/app                  overview dashboard               AppShell (sidebar, top bar, guard)
/app/crm              deal pipeline (Kanban) + leads
/app/customers[/id]   CRM table, profile, notes, invoices
/app/employees        directory, departments, roles & permission matrix
/app/projects[/id]    projects, detail with task board
/app/tasks            all tasks — board / list
/app/invoices[/new|/id|/id/edit]  invoice dashboard, editor, print view
/app/payments         Stripe (simulated) payments, refunds
/app/analytics        trends, comparisons, retention, productivity
/app/reports          CSV exports, AR aging
/app/settings         profile, workspace, billing, security
```

### Data layer seam

Components never talk to storage directly. They call store actions (`useAppStore`) and read the active tenant through `useWorkspaceData()`. Each action corresponds 1:1 to an endpoint in `src/lib/api/contract.ts`. To go live:

1. Replace action bodies with `fetch` calls through a small API client (or TanStack Query mutations).
2. Replace `useWorkspaceData()` reads with queries keyed by `[workspaceId, resource]`.
3. Delete `src/lib/mock` and the `persist` middleware.

Pure derivations (`src/lib/selectors.ts`, `invoiceTotals`) move to the API and are reused there.

## 2. Backend plan

```
Browser ──HTTPS──▶ CloudFront ──▶ Next.js (ECS Fargate / Amplify)
                                │
                                └──▶ ALB ──▶ NestJS API (ECS Fargate, 2+ tasks, multi-AZ)
                                              │   ├── Prisma ──▶ RDS PostgreSQL (Multi-AZ, encrypted, RLS)
                                              │   ├── Redis (ElastiCache) — rate limits, sessions cache, queues
                                              │   ├── S3 — attachments, generated PDFs (private, presigned URLs)
                                              │   └── SQS + worker — emails (SES), PDF rendering, exports
                                              └── Stripe API  ◀── webhooks (signature-verified)
Secrets: AWS Secrets Manager · Keys: KMS · Logs/metrics: CloudWatch + OpenTelemetry · WAF on CloudFront/ALB
```

- **Framework:** NestJS (modules per domain: auth, workspaces, customers, people, projects, finance, analytics), Prisma ORM, PostgreSQL 16.
- **API style:** REST, versioned under `/v1`, JSON, cursor pagination, `Idempotency-Key` header on POSTs that create money-related records.
- **Validation:** shared Zod schemas (monorepo package) on both sides; the server is the authority.

### Authentication

- Email + password (argon2id) and optional SSO (OIDC/SAML on Scale plan); TOTP 2FA.
- Server-issued **opaque session token in an httpOnly, Secure, SameSite=Lax cookie**; only its SHA-256 hash is stored (`Session.tokenHash`). Sliding expiry, revocable from Settings → Security.
- CSRF: SameSite cookies plus a double-submit token on state-changing requests.
- Next.js `proxy.ts` redirects unauthenticated users away from `/app` (UX only); the API enforces auth on every call.
- Forgot-password always returns 202 with generic copy (no account enumeration); reset tokens are single-use, hashed, 30-minute expiry.

### Tenant isolation

1. Every tenant route is `/v1/workspaces/:workspaceId/...`.
2. A guard loads the caller's `Membership` for that workspace (404 if none — never reveal existence) and attaches `{workspaceId, role}` to the request context.
3. Repositories require `workspaceId` and add it to every `where` clause (Prisma client extension enforces it; queries without it throw).
4. **Postgres Row-Level Security** on all tenant tables: the API sets `SET LOCAL app.workspace_id = $1` per transaction; policies check `workspace_id = current_setting('app.workspace_id')::uuid`.
5. Cross-entity references (e.g. invoice → customer) are validated to belong to the same workspace.
6. Integration tests attempt cross-tenant reads/writes for every endpoint.

### Authorization (RBAC)

- Roles: Super Admin, Company Admin, Manager, Employee, with a per-workspace permission matrix (`RolePermission`).
- `@RequirePermission("invoices.manage")` decorator on each handler; checked server-side on every request. The UI's `useCan()` only hides controls.
- Privilege rules: only Super Admins can grant Super Admin or change billing; users cannot modify their own role; the last Super Admin cannot be removed.
- Role/permission changes, exports, refunds and sign-ins are written to `AuditLog`.

### Payments (Stripe)

- **Billing** (NexaFlow subscription): Stripe Billing + Checkout; plan/seat sync from `customer.subscription.*` webhooks.
- **Invoice collection**: Stripe Connect per workspace; server creates a PaymentIntent; the browser uses Stripe Elements so card data never touches NexaFlow (PCI SAQ-A).
- An invoice becomes **Paid only from a verified `payment_intent.succeeded` webhook**, processed idempotently by `stripePaymentIntentId`.
- Refunds require `payments.refund` and are audited.
- The demo uses simulated payments with fixed test methods and no card input.

### Money & time

Amounts stored as integer cents (`BigInt`), rates in basis points; invoice totals recomputed on the server. Timestamps in UTC; display in the workspace time zone.
