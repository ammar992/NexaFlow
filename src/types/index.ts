/**
 * NexaFlow domain model.
 *
 * These types mirror the planned PostgreSQL schema (see prisma/schema.prisma).
 * Every tenant-scoped entity carries a `workspaceId`, which is the tenant key
 * the API enforces on every query (see docs/ARCHITECTURE.md → Tenant isolation).
 */

export type ID = string;
export type ISODate = string;

export type Plan = "Starter" | "Growth" | "Scale";

export interface Workspace {
  id: ID;
  name: string;
  slug: string;
  industry: string;
  plan: Plan;
  currency: "USD" | "EUR" | "GBP";
  /** brand colour used for the workspace mark */
  color: string;
  createdAt: ISODate;
}

/* ----------------------------- Auth & RBAC ----------------------------- */

export type Role = "Super Admin" | "Company Admin" | "Manager" | "Employee";
export const ROLES: Role[] = ["Super Admin", "Company Admin", "Manager", "Employee"];

export type PermissionKey =
  | "customers.view"
  | "customers.manage"
  | "employees.view"
  | "employees.manage"
  | "projects.view"
  | "projects.manage"
  | "tasks.manage"
  | "invoices.view"
  | "invoices.manage"
  | "payments.refund"
  | "analytics.view"
  | "reports.export"
  | "settings.workspace"
  | "settings.billing";

export type PermissionMatrix = Record<Role, Record<PermissionKey, boolean>>;

export interface SessionUser {
  id: ID;
  name: string;
  email: string;
  role: Role;
}

/* ------------------------------- CRM ---------------------------------- */

export type CustomerStatus = "Lead" | "Active" | "Inactive" | "Churned";
export type CustomerCategory = "Enterprise" | "Mid-market" | "SMB" | "Startup";

export interface Note {
  id: ID;
  body: string;
  author: string;
  createdAt: ISODate;
}

export interface Customer {
  id: ID;
  workspaceId: ID;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  category: CustomerCategory;
  ownerId: ID;
  lifetimeValue: number;
  city: string;
  country: string;
  website: string;
  industry: string;
  createdAt: ISODate;
  lastContactAt: ISODate;
  notes: Note[];
}

export type DealStage = "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Won";
export const DEAL_STAGES: DealStage[] = ["Lead", "Qualified", "Proposal", "Negotiation", "Won"];

export interface Deal {
  id: ID;
  workspaceId: ID;
  title: string;
  customerId: ID;
  ownerId: ID;
  value: number;
  stage: DealStage;
  closeDate: ISODate;
}

/* ----------------------------- People --------------------------------- */

export type EmploymentStatus = "Active" | "On leave" | "Invited" | "Inactive";

export interface Department {
  id: ID;
  workspaceId: ID;
  name: string;
  leadId?: ID;
}

export interface Employee {
  id: ID;
  workspaceId: ID;
  name: string;
  email: string;
  title: string;
  departmentId: ID;
  role: Role;
  status: EmploymentStatus;
  location: string;
  joinedAt: ISODate;
  /** 0–100, illustrative productivity score */
  productivity: number;
}

/* ---------------------------- Projects -------------------------------- */

export type ProjectStatus = "Planning" | "Active" | "On hold" | "Completed";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Urgent"];

export interface Project {
  id: ID;
  workspaceId: ID;
  name: string;
  description: string;
  customerId?: ID;
  status: ProjectStatus;
  priority: Priority;
  startDate: ISODate;
  dueDate: ISODate;
  memberIds: ID[];
  budget: number;
}

export type TaskStatus = "todo" | "in_progress" | "in_review" | "completed";
export const TASK_STATUSES: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "completed", label: "Completed" },
];

export interface Task {
  id: ID;
  workspaceId: ID;
  projectId: ID;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: ID;
  dueDate: ISODate;
  createdAt: ISODate;
}

/* ---------------------------- Finance --------------------------------- */

export type InvoiceStatus = "Draft" | "Pending" | "Paid" | "Overdue";

export interface LineItem {
  id: ID;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: ID;
  workspaceId: ID;
  number: string;
  customerId: ID;
  issueDate: ISODate;
  dueDate: ISODate;
  /** stored status; "Overdue" is also derived at read time for past-due Pending invoices */
  status: InvoiceStatus;
  items: LineItem[];
  /** percentage, e.g. 8.5 */
  taxRate: number;
  /** percentage discount applied to subtotal */
  discount: number;
  notes: string;
  paidAt?: ISODate;
}

export type PaymentMethod = "Card" | "ACH" | "Wire";
export type PaymentStatus = "Succeeded" | "Processing" | "Failed" | "Refunded";

export interface Payment {
  id: ID;
  workspaceId: ID;
  invoiceId: ID;
  customerId: ID;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  /** simulated Stripe PaymentIntent id — never a real one */
  reference: string;
  cardBrand?: string;
  last4?: string;
  createdAt: ISODate;
}

/* --------------------------- Activity --------------------------------- */

export type ActivityKind = "customer" | "deal" | "invoice" | "payment" | "project" | "task" | "employee";

export interface Activity {
  id: ID;
  workspaceId: ID;
  kind: ActivityKind;
  actor: string;
  message: string;
  createdAt: ISODate;
}

export interface Notification {
  id: ID;
  workspaceId: ID;
  title: string;
  body: string;
  kind: ActivityKind;
  read: boolean;
  createdAt: ISODate;
}

/** Monthly illustrative financial series used by analytics. */
export interface MonthlyMetric {
  month: string; // "2026-01"
  revenue: number;
  expenses: number;
  newCustomers: number;
  churned: number;
  collected: number;
  invoiced: number;
}

/** Everything that belongs to one tenant. Never mixed across workspaces. */
export interface WorkspaceData {
  customers: Customer[];
  deals: Deal[];
  departments: Department[];
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  payments: Payment[];
  activities: Activity[];
  notifications: Notification[];
  metrics: MonthlyMetric[];
  permissions: PermissionMatrix;
}
