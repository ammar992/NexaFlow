# NexaFlow

**One Workspace. Complete Business Control.**

NexaFlow is a multi-tenant SaaS CRM and business management platform for small and medium-sized businesses: customers and deals, employees and roles, projects and tasks, invoices and payments, analytics and reports, across multiple companies.

This repository is an **interactive product demo**. The frontend is complete and production-structured. Data is illustrative and stored in your browser, authentication is mocked, and Stripe payments are simulated. The backend is fully planned in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`prisma/schema.prisma`](prisma/schema.prisma).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

- Open **/** for the marketing site.
- Click **Explore platform** (or visit `/demo`) to enter the dashboard as the demo Super Admin.
- Or **Sign up** to go through onboarding and create your own empty workspace.
- Reset the sample data any time from **Help → Reset demo data**.

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`.

## What's inside

| Area | Highlights |
| --- | --- |
| Landing page | 3D product composition, interactive feature showcase, module deep-dives, multi-tenant explainer, pricing toggle, FAQ |
| Auth & onboarding | Sign in / up / reset with Zod validation, password visibility and strength, 3-step company → workspace → team wizard |
| Overview | KPIs with animated counters, revenue & customer-growth charts, transactions, project progress, upcoming tasks, activity feed |
| CRM | Drag-and-drop deal pipeline, weighted forecast, lead list |
| Customers | Sortable, filterable, paginated table (cards on mobile), add/edit/delete, profile with notes timeline, invoices, deals |
| Employees | Directory (table/cards), profile panel, departments, role-based permission matrix |
| Projects & tasks | Project cards/list, detail with progress and timeline, Kanban (To Do → Completed) and list views, task editor |
| Invoices | Editor with line items, tax, discount and live preview; statuses; print-ready layout; simulated Stripe checkout |
| Payments | Stripe account panel (simulated), volume / success rate, refunds, history |
| Analytics & reports | Date ranges, period comparison, acquisition, retention, collection, productivity; CSV exports; AR aging |
| Workspaces | Three isolated sample companies; switch from the top bar; create new ones |

Light and dark themes, ⌘K search, toasts, skeletons, reduced-motion support, and responsive layouts for desktop, tablet and mobile (bottom tab bar, drawer navigation, card tables).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Radix UI (shadcn-style components) · Motion · Recharts · React Hook Form · Zod · Zustand · dnd-kit · Lucide.

## Project layout

```
src/
  app/                  routes — (marketing), (auth), onboarding, demo, app/*
  components/
    ui/                 primitives: button, input, dialog/sheet, dropdown, tabs, data-table…
    app/                dashboard shell, charts, kanban, module components
    marketing/          landing page sections
    auth/               auth forms, onboarding wizard
  lib/                  utils, validation schemas, selectors, mock seed, API contract
  store/                session + tenant-scoped data stores (demo persistence)
  hooks/                hydration, permissions, media queries
  types/                domain model (mirrors prisma/schema.prisma)
docs/                   ARCHITECTURE.md, SECURITY.md
prisma/                 planned PostgreSQL schema
```

## Disclaimer

All companies, people, figures and brand marks shown are fictional and for illustration only. No real payment credentials are used.
