import { effectiveStatus, invoiceTotals, monthLabel, pctChange, sum } from "@/lib/utils";
import type { Invoice, Project, Task, WorkspaceData } from "@/types";

/** Pure derivations over one tenant's data. Mirrors what the analytics API would return. */

export function lookup<T extends { id: string }>(rows: T[]) {
  const map = new Map(rows.map((r) => [r.id, r]));
  return (id?: string) => (id ? map.get(id) : undefined);
}

export function invoiceTotal(inv: Invoice) {
  return invoiceTotals(inv).total;
}

export function projectProgress(project: Project, tasks: Task[]) {
  const own = tasks.filter((t) => t.projectId === project.id);
  if (!own.length) return project.status === "Completed" ? 100 : 0;
  return Math.round((own.filter((t) => t.status === "completed").length / own.length) * 100);
}

export function overviewKpis(d: WorkspaceData) {
  const m = d.metrics;
  const totalRevenue = sum(m, (x) => x.revenue);
  const last3 = sum(m.slice(-3), (x) => x.revenue);
  const prev3 = sum(m.slice(-6, -3), (x) => x.revenue);

  const open = d.invoices.filter((i) => ["Pending", "Overdue"].includes(effectiveStatus(i)));
  const pendingAmount = sum(open, invoiceTotal);
  const overdueCount = open.filter((i) => effectiveStatus(i) === "Overdue").length;

  const activeCustomers = d.customers.filter((c) => c.status !== "Churned").length;
  const lastMonth = m[m.length - 1];
  const customerGrowth = activeCustomers ? ((lastMonth?.newCustomers ?? 0) - (lastMonth?.churned ?? 0)) / activeCustomers * 100 : 0;

  return {
    totalRevenue,
    revenueDelta: pctChange(last3, prev3),
    customers: d.customers.length,
    customerGrowth,
    activeProjects: d.projects.filter((p) => p.status === "Active").length,
    totalProjects: d.projects.length,
    pendingAmount,
    pendingCount: open.length,
    overdueCount,
    teamMembers: d.employees.filter((e) => e.status === "Active" || e.status === "On leave").length,
    invitedMembers: d.employees.filter((e) => e.status === "Invited").length,
  };
}

export function monthlySeries(d: WorkspaceData) {
  let running = Math.max(0, d.customers.length - sum(d.metrics, (x) => x.newCustomers - x.churned));
  return d.metrics.map((x) => {
    running += x.newCustomers - x.churned;
    return {
      month: monthLabel(x.month),
      key: x.month,
      revenue: x.revenue,
      expenses: x.expenses,
      profit: x.revenue - x.expenses,
      invoiced: x.invoiced,
      collected: x.collected,
      newCustomers: x.newCustomers,
      churned: x.churned,
      totalCustomers: running,
      retention: running ? Math.max(0, 100 - (x.churned / Math.max(1, running)) * 100) : 100,
      collectionRate: x.invoiced ? (x.collected / x.invoiced) * 100 : 0,
    };
  });
}

export function invoiceBreakdown(invoices: Invoice[]) {
  const by = { Draft: 0, Pending: 0, Paid: 0, Overdue: 0 } as Record<string, number>;
  const amounts = { Draft: 0, Pending: 0, Paid: 0, Overdue: 0 } as Record<string, number>;
  for (const inv of invoices) {
    const s = effectiveStatus(inv);
    by[s]++;
    amounts[s] += invoiceTotal(inv);
  }
  return { counts: by, amounts };
}
