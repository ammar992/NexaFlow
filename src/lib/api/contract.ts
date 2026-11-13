/**
 * REST contract the demo data layer is designed against.
 *
 * The browser talks to a Node.js (NestJS) API at `NEXT_PUBLIC_API_URL`.
 * Every tenant route is prefixed with the workspace id, and the API re-checks
 * that the authenticated user is a member of that workspace with the required
 * permission before touching Postgres (row-level security as a second line).
 *
 * Mapping: store action → endpoint
 */
export const API_CONTRACT = {
  auth: {
    signIn: "POST /v1/auth/sign-in", // sets httpOnly session cookie
    signUp: "POST /v1/auth/sign-up",
    signOut: "POST /v1/auth/sign-out",
    forgotPassword: "POST /v1/auth/password/forgot", // always 202, no user enumeration
    me: "GET /v1/me",
  },
  workspaces: {
    list: "GET /v1/workspaces",
    create: "POST /v1/workspaces",
    update: "PATCH /v1/workspaces/:workspaceId",
  },
  customers: {
    list: "GET /v1/workspaces/:workspaceId/customers?q=&status=&category=&page=&sort=",
    create: "POST /v1/workspaces/:workspaceId/customers", // customers.manage
    update: "PATCH /v1/workspaces/:workspaceId/customers/:id", // customers.manage
    remove: "DELETE /v1/workspaces/:workspaceId/customers/:id", // customers.manage
    addNote: "POST /v1/workspaces/:workspaceId/customers/:id/notes",
  },
  deals: {
    list: "GET /v1/workspaces/:workspaceId/deals",
    move: "PATCH /v1/workspaces/:workspaceId/deals/:id { stage }",
  },
  employees: {
    list: "GET /v1/workspaces/:workspaceId/members",
    invite: "POST /v1/workspaces/:workspaceId/invitations", // employees.manage
    update: "PATCH /v1/workspaces/:workspaceId/members/:id",
    remove: "DELETE /v1/workspaces/:workspaceId/members/:id",
    permissions: "PUT /v1/workspaces/:workspaceId/roles/:role/permissions", // settings.workspace
  },
  projects: {
    list: "GET /v1/workspaces/:workspaceId/projects",
    create: "POST /v1/workspaces/:workspaceId/projects",
    update: "PATCH /v1/workspaces/:workspaceId/projects/:id",
  },
  tasks: {
    list: "GET /v1/workspaces/:workspaceId/tasks?projectId=&status=",
    create: "POST /v1/workspaces/:workspaceId/tasks",
    move: "PATCH /v1/workspaces/:workspaceId/tasks/:id { status, position }",
  },
  invoices: {
    list: "GET /v1/workspaces/:workspaceId/invoices",
    save: "PUT /v1/workspaces/:workspaceId/invoices/:id", // totals recomputed server-side
    send: "POST /v1/workspaces/:workspaceId/invoices/:id/send",
  },
  payments: {
    // Stripe: server creates a PaymentIntent; card data never touches our servers (Stripe Elements).
    createIntent: "POST /v1/workspaces/:workspaceId/invoices/:id/payment-intent",
    webhook: "POST /v1/stripe/webhook", // signature-verified; source of truth for 'Paid'
    refund: "POST /v1/workspaces/:workspaceId/payments/:id/refund", // payments.refund
  },
  analytics: {
    summary: "GET /v1/workspaces/:workspaceId/analytics/summary?from=&to=",
    export: "POST /v1/workspaces/:workspaceId/reports/:type/export", // reports.export
  },
} as const;
