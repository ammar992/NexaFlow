"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildDemoDatabase, buildEmptyWorkspace, DEMO_WORKSPACES } from "@/lib/mock/seed";
import { uid } from "@/lib/utils";
import { useSession } from "@/store/session-store";
import type {
  Activity,
  ActivityKind,
  Customer,
  Deal,
  DealStage,
  Employee,
  ID,
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  PermissionKey,
  Plan,
  Project,
  Role,
  Task,
  TaskStatus,
  Workspace,
  WorkspaceData,
} from "@/types";

/**
 * Client-side demo data layer.
 *
 * Each action maps 1:1 to a planned REST endpoint (see src/lib/api/contract.ts).
 * All reads/writes go through `activeWorkspaceId`, mirroring how the API
 * scopes every query by tenant. Swapping this for real HTTP calls only changes
 * the action bodies, not the components that use them.
 */

export type CustomerInput = Omit<Customer, "id" | "workspaceId" | "createdAt" | "lastContactAt" | "notes">;
export type EmployeeInput = Omit<Employee, "id" | "workspaceId" | "joinedAt" | "productivity">;
export type ProjectInput = Omit<Project, "id" | "workspaceId">;
export type TaskInput = Omit<Task, "id" | "workspaceId" | "createdAt">;
export type InvoiceInput = Omit<Invoice, "id" | "workspaceId" | "number"> & { id?: ID; number?: string };

interface AppState {
  seeded: boolean;
  workspaces: Workspace[];
  activeWorkspaceId: ID;
  db: Record<ID, WorkspaceData>;

  seed: () => void;
  resetDemo: () => void;
  switchWorkspace: (id: ID) => void;
  createWorkspace: (input: { name: string; industry: string; plan: Plan; departments: string[] }) => ID;
  updateWorkspace: (patch: Partial<Pick<Workspace, "name" | "industry">>) => void;

  addCustomer: (input: CustomerInput) => ID;
  updateCustomer: (id: ID, patch: Partial<CustomerInput>) => void;
  deleteCustomer: (id: ID) => void;
  addCustomerNote: (id: ID, body: string) => void;

  addDeal: (input: Omit<Deal, "id" | "workspaceId">) => void;
  moveDeal: (id: ID, stage: DealStage) => void;

  addEmployee: (input: EmployeeInput) => ID;
  updateEmployee: (id: ID, patch: Partial<EmployeeInput>) => void;
  deleteEmployee: (id: ID) => void;
  addDepartment: (name: string) => void;
  setPermission: (role: Role, key: PermissionKey, value: boolean) => void;

  addProject: (input: ProjectInput) => ID;
  updateProject: (id: ID, patch: Partial<ProjectInput>) => void;
  deleteProject: (id: ID) => void;

  addTask: (input: TaskInput) => ID;
  updateTask: (id: ID, patch: Partial<TaskInput>) => void;
  moveTask: (id: ID, status: TaskStatus) => void;
  deleteTask: (id: ID) => void;

  saveInvoice: (input: InvoiceInput) => ID;
  setInvoiceStatus: (id: ID, status: InvoiceStatus) => void;
  deleteInvoice: (id: ID) => void;

  recordPayment: (input: { invoiceId: ID; method: PaymentMethod; amount: number; cardBrand?: string; last4?: string; succeed: boolean }) => Payment;
  refundPayment: (id: ID) => void;

  markNotificationRead: (id: ID) => void;
  markAllNotificationsRead: () => void;
}

const actorName = () => useSession.getState().user?.name ?? "Someone";

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      /** Apply an immutable update to the active tenant only. */
      const mutate = (fn: (d: WorkspaceData) => Partial<WorkspaceData>, log?: { kind: ActivityKind; message: string }) =>
        set((s) => {
          const wsId = s.activeWorkspaceId;
          const current = s.db[wsId];
          if (!current) return s;
          const next: WorkspaceData = { ...current, ...fn(current) };
          if (log) {
            const activity: Activity = {
              id: uid("act"),
              workspaceId: wsId,
              kind: log.kind,
              actor: actorName(),
              message: log.message,
              createdAt: new Date().toISOString(),
            };
            next.activities = [activity, ...next.activities].slice(0, 60);
          }
          return { db: { ...s.db, [wsId]: next } };
        });

      const ws = () => get().activeWorkspaceId;
      const data = () => get().db[get().activeWorkspaceId];

      return {
        seeded: false,
        workspaces: [],
        activeWorkspaceId: DEMO_WORKSPACES[0].id,
        db: {},

        seed: () => {
          if (get().seeded) return;
          set({ seeded: true, workspaces: DEMO_WORKSPACES, db: buildDemoDatabase(), activeWorkspaceId: DEMO_WORKSPACES[0].id });
        },
        resetDemo: () =>
          set({ seeded: true, workspaces: DEMO_WORKSPACES, db: buildDemoDatabase(), activeWorkspaceId: DEMO_WORKSPACES[0].id }),
        switchWorkspace: (id) => {
          if (get().db[id]) set({ activeWorkspaceId: id });
        },
        createWorkspace: ({ name, industry, plan, departments }) => {
          const id = uid("ws");
          const user = useSession.getState().user ?? { name: "Owner", email: "owner@example.com" };
          const palette = ["#795CFF", "#3D8BFF", "#14A38B", "#C47722", "#E0568F"];
          const workspace: Workspace = {
            id,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            industry,
            plan,
            currency: "USD",
            color: palette[get().workspaces.length % palette.length],
            createdAt: new Date().toISOString(),
          };
          set((s) => ({
            seeded: true,
            workspaces: [...(s.workspaces.length ? s.workspaces : DEMO_WORKSPACES), workspace],
            db: { ...(s.seeded ? s.db : buildDemoDatabase()), [id]: buildEmptyWorkspace(user, id, departments) },
            activeWorkspaceId: id,
          }));
          return id;
        },
        updateWorkspace: (patch) =>
          set((s) => ({ workspaces: s.workspaces.map((w) => (w.id === s.activeWorkspaceId ? { ...w, ...patch } : w)) })),

        /* ---------------- customers ---------------- */
        addCustomer: (input) => {
          const id = uid("cus");
          const now = new Date().toISOString();
          mutate(
            (d) => ({ customers: [{ ...input, id, workspaceId: ws(), createdAt: now, lastContactAt: now, notes: [] }, ...d.customers] }),
            { kind: "customer", message: `added ${input.company} as a new customer` },
          );
          return id;
        },
        updateCustomer: (id, patch) =>
          mutate((d) => ({ customers: d.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) }), {
            kind: "customer",
            message: `updated ${data()?.customers.find((c) => c.id === id)?.company ?? "a customer"}`,
          }),
        deleteCustomer: (id) => {
          const name = data()?.customers.find((c) => c.id === id)?.company;
          mutate(
            (d) => ({ customers: d.customers.filter((c) => c.id !== id), deals: d.deals.filter((x) => x.customerId !== id) }),
            { kind: "customer", message: `removed ${name ?? "a customer"}` },
          );
        },
        addCustomerNote: (id, body) =>
          mutate(
            (d) => ({
              customers: d.customers.map((c) =>
                c.id === id
                  ? {
                      ...c,
                      lastContactAt: new Date().toISOString(),
                      notes: [{ id: uid("note"), body, author: actorName(), createdAt: new Date().toISOString() }, ...c.notes],
                    }
                  : c,
              ),
            }),
            { kind: "customer", message: `added a note to ${data()?.customers.find((c) => c.id === id)?.company ?? "a customer"}` },
          ),

        /* ---------------- deals ---------------- */
        addDeal: (input) =>
          mutate((d) => ({ deals: [{ ...input, id: uid("deal"), workspaceId: ws() }, ...d.deals] }), {
            kind: "deal",
            message: `created deal “${input.title}”`,
          }),
        moveDeal: (id, stage) => {
          const deal = data()?.deals.find((x) => x.id === id);
          if (!deal || deal.stage === stage) return;
          mutate((d) => ({ deals: d.deals.map((x) => (x.id === id ? { ...x, stage } : x)) }), {
            kind: "deal",
            message: `moved “${deal.title}” to ${stage}`,
          });
        },

        /* ---------------- employees ---------------- */
        addEmployee: (input) => {
          const id = uid("emp");
          mutate(
            (d) => ({ employees: [...d.employees, { ...input, id, workspaceId: ws(), joinedAt: new Date().toISOString(), productivity: 0 }] }),
            { kind: "employee", message: `invited ${input.name} as ${input.role}` },
          );
          return id;
        },
        updateEmployee: (id, patch) =>
          mutate((d) => ({ employees: d.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)) }), {
            kind: "employee",
            message: `updated ${data()?.employees.find((e) => e.id === id)?.name ?? "an employee"}`,
          }),
        deleteEmployee: (id) => {
          const name = data()?.employees.find((e) => e.id === id)?.name;
          mutate(
            (d) => ({
              employees: d.employees.filter((e) => e.id !== id),
              tasks: d.tasks.map((t) => (t.assigneeId === id ? { ...t, assigneeId: undefined } : t)),
              projects: d.projects.map((p) => ({ ...p, memberIds: p.memberIds.filter((m) => m !== id) })),
            }),
            { kind: "employee", message: `removed ${name ?? "an employee"} from the workspace` },
          );
        },
        addDepartment: (name) =>
          mutate((d) => ({ departments: [...d.departments, { id: uid("dep"), workspaceId: ws(), name }] }), {
            kind: "employee",
            message: `created the ${name} department`,
          }),
        setPermission: (role, key, value) =>
          mutate((d) => ({ permissions: { ...d.permissions, [role]: { ...d.permissions[role], [key]: value } } })),

        /* ---------------- projects & tasks ---------------- */
        addProject: (input) => {
          const id = uid("prj");
          mutate((d) => ({ projects: [{ ...input, id, workspaceId: ws() }, ...d.projects] }), {
            kind: "project",
            message: `created project ${input.name}`,
          });
          return id;
        },
        updateProject: (id, patch) =>
          mutate((d) => ({ projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }), {
            kind: "project",
            message: `updated ${data()?.projects.find((p) => p.id === id)?.name ?? "a project"}`,
          }),
        deleteProject: (id) => {
          const name = data()?.projects.find((p) => p.id === id)?.name;
          mutate((d) => ({ projects: d.projects.filter((p) => p.id !== id), tasks: d.tasks.filter((t) => t.projectId !== id) }), {
            kind: "project",
            message: `deleted project ${name ?? ""}`.trim(),
          });
        },
        addTask: (input) => {
          const id = uid("tsk");
          mutate((d) => ({ tasks: [{ ...input, id, workspaceId: ws(), createdAt: new Date().toISOString() }, ...d.tasks] }), {
            kind: "task",
            message: `created task “${input.title}”`,
          });
          return id;
        },
        updateTask: (id, patch) => mutate((d) => ({ tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
        moveTask: (id, status) => {
          const task = data()?.tasks.find((t) => t.id === id);
          if (!task || task.status === status) return;
          const label = { todo: "To Do", in_progress: "In Progress", in_review: "In Review", completed: "Completed" }[status];
          mutate((d) => ({ tasks: d.tasks.map((t) => (t.id === id ? { ...t, status } : t)) }), {
            kind: "task",
            message: status === "completed" ? `completed “${task.title}”` : `moved “${task.title}” to ${label}`,
          });
        },
        deleteTask: (id) => mutate((d) => ({ tasks: d.tasks.filter((t) => t.id !== id) })),

        /* ---------------- invoices ---------------- */
        saveInvoice: (input) => {
          const existing = input.id ? data()?.invoices.find((i) => i.id === input.id) : undefined;
          const id = existing?.id ?? uid("inv");
          const number = existing?.number ?? input.number ?? nextInvoiceNumber(data()?.invoices ?? []);
          const invoice: Invoice = { ...input, id, number, workspaceId: ws() };
          mutate(
            (d) => ({ invoices: existing ? d.invoices.map((i) => (i.id === id ? invoice : i)) : [...d.invoices, invoice] }),
            { kind: "invoice", message: existing ? `updated ${number}` : `created ${number}` },
          );
          return id;
        },
        setInvoiceStatus: (id, status) => {
          const inv = data()?.invoices.find((i) => i.id === id);
          mutate(
            (d) => ({
              invoices: d.invoices.map((i) =>
                i.id === id ? { ...i, status, paidAt: status === "Paid" ? new Date().toISOString() : i.paidAt } : i,
              ),
            }),
            { kind: "invoice", message: `marked ${inv?.number ?? "an invoice"} as ${status}` },
          );
        },
        deleteInvoice: (id) => {
          const inv = data()?.invoices.find((i) => i.id === id);
          mutate((d) => ({ invoices: d.invoices.filter((i) => i.id !== id) }), {
            kind: "invoice",
            message: `deleted ${inv?.number ?? "an invoice"}`,
          });
        },

        /* ---------------- payments (simulated Stripe) ---------------- */
        recordPayment: ({ invoiceId, method, amount, cardBrand, last4, succeed }) => {
          const inv = data()?.invoices.find((i) => i.id === invoiceId);
          const now = new Date().toISOString();
          const payment: Payment = {
            id: uid("pay"),
            workspaceId: ws(),
            invoiceId,
            customerId: inv?.customerId ?? "",
            amount,
            method,
            status: succeed ? "Succeeded" : "Failed",
            reference: `pi_demo_${uid("x").slice(2)}`,
            cardBrand,
            last4,
            createdAt: now,
          };
          mutate(
            (d) => ({
              payments: [payment, ...d.payments],
              invoices: succeed ? d.invoices.map((i) => (i.id === invoiceId ? { ...i, status: "Paid", paidAt: now } : i)) : d.invoices,
              notifications: [
                {
                  id: uid("ntf"),
                  workspaceId: ws(),
                  kind: "payment",
                  title: succeed ? "Payment received" : "Payment failed",
                  body: `${inv?.number ?? "Invoice"} · simulated ${method.toLowerCase()} payment`,
                  read: false,
                  createdAt: now,
                },
                ...d.notifications,
              ],
            }),
            { kind: "payment", message: succeed ? `collected payment for ${inv?.number}` : `payment attempt failed for ${inv?.number}` },
          );
          return payment;
        },
        refundPayment: (id) =>
          mutate((d) => ({ payments: d.payments.map((p) => (p.id === id ? { ...p, status: "Refunded" } : p)) }), {
            kind: "payment",
            message: "issued a refund (simulated)",
          }),

        markNotificationRead: (id) =>
          mutate((d) => ({ notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
        markAllNotificationsRead: () => mutate((d) => ({ notifications: d.notifications.map((n) => ({ ...n, read: true })) })),
      };
    },
    {
      name: "nexaflow-demo-db-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function nextInvoiceNumber(invoices: Invoice[]) {
  const year = new Date().getFullYear();
  const max = invoices.reduce((m, i) => {
    const n = Number(i.number.split("-").pop());
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `INV-${year}-${String(max + 1).padStart(4, "0")}`;
}

const EMPTY: WorkspaceData = {
  customers: [], deals: [], departments: [], employees: [], projects: [], tasks: [], invoices: [], payments: [],
  activities: [], notifications: [], metrics: [],
  permissions: {} as WorkspaceData["permissions"],
};

/** Data for the active tenant only — components never see other workspaces. */
export function useWorkspaceData(): WorkspaceData {
  return useAppStore((s) => s.db[s.activeWorkspaceId] ?? EMPTY);
}

export function useActiveWorkspace(): Workspace | undefined {
  return useAppStore((s) => s.workspaces.find((w) => w.id === s.activeWorkspaceId));
}
