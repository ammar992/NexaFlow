"use client";

import { motion } from "motion/react";
import { CalendarClock, Check, Download, FileSpreadsheet, FileText, FolderKanban, Lock, Receipt, Users, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/misc";
import { useCan } from "@/hooks/use-permission";
import { invoiceTotal, lookup, monthlySeries, projectProgress } from "@/lib/selectors";
import { daysUntil, downloadCsv, effectiveStatus, formatCurrency, timeAgo } from "@/lib/utils";
import { useActiveWorkspace, useWorkspaceData } from "@/store/app-store";

interface ExportRecord {
  id: string;
  name: string;
  rows: number;
  at: string;
}

export default function ReportsPage() {
  const data = useWorkspaceData();
  const workspace = useActiveWorkspace();
  const canExport = useCan("reports.export");
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState<Record<string, boolean>>({ revenue: true });
  const customerOf = useMemo(() => lookup(data.customers), [data.customers]);
  const depOf = useMemo(() => lookup(data.departments), [data.departments]);

  const aging = useMemo(() => {
    const buckets = [
      { label: "Current", min: -Infinity, max: 0 },
      { label: "1–30 days", min: 1, max: 30 },
      { label: "31–60 days", min: 31, max: 60 },
      { label: "61–90 days", min: 61, max: 90 },
      { label: "90+ days", min: 91, max: Infinity },
    ].map((b) => ({ ...b, count: 0, amount: 0 }));
    data.invoices
      .filter((i) => ["Pending", "Overdue"].includes(effectiveStatus(i)))
      .forEach((i) => {
        const late = -daysUntil(i.dueDate);
        const b = buckets.find((x) => late >= x.min && late <= x.max)!;
        b.count++;
        b.amount += invoiceTotal(i);
      });
    return buckets;
  }, [data.invoices]);
  const agingMax = Math.max(1, ...aging.map((a) => a.amount));

  const reports = [
    {
      id: "revenue",
      icon: FileSpreadsheet,
      title: "Revenue summary",
      body: "Monthly revenue, expenses, profit and collections for the last 12 months.",
      build: () => monthlySeries(data).map((m) => ({ month: m.key, revenue: m.revenue, expenses: m.expenses, profit: m.profit, invoiced: m.invoiced, collected: m.collected })),
    },
    {
      id: "aging",
      icon: Receipt,
      title: "Invoice aging",
      body: "Open invoices grouped by how many days past due they are.",
      build: () =>
        data.invoices
          .filter((i) => ["Pending", "Overdue"].includes(effectiveStatus(i)))
          .map((i) => ({ number: i.number, customer: customerOf(i.customerId)?.company ?? "", due: i.dueDate.slice(0, 10), days_late: Math.max(0, -daysUntil(i.dueDate)), amount: invoiceTotal(i) })),
    },
    {
      id: "customers",
      icon: Users,
      title: "Customer list",
      body: "All customers with status, segment, owner and lifetime value.",
      build: () => data.customers.map((c) => ({ company: c.company, contact: c.name, email: c.email, status: c.status, category: c.category, lifetime_value: c.lifetimeValue })),
    },
    {
      id: "projects",
      icon: FolderKanban,
      title: "Project status",
      body: "Progress, deadline and budget for every project.",
      build: () => data.projects.map((p) => ({ project: p.name, status: p.status, progress_pct: projectProgress(p, data.tasks), due: p.dueDate.slice(0, 10), budget: p.budget })),
    },
    {
      id: "team",
      icon: UserRound,
      title: "Team productivity",
      body: "Completed tasks and productivity score per person.",
      build: () =>
        data.employees.map((e) => ({
          name: e.name, department: depOf(e.departmentId)?.name ?? "", role: e.role, status: e.status,
          tasks_completed: data.tasks.filter((t) => t.assigneeId === e.id && t.status === "completed").length, productivity: e.productivity,
        })),
    },
  ];

  const run = async (r: (typeof reports)[number]) => {
    if (!canExport) return toast.error("You don’t have permission to export reports");
    setBusy(r.id);
    await new Promise((res) => setTimeout(res, 700));
    const rows = r.build();
    downloadCsv(`${workspace?.slug ?? "workspace"}-${r.id}-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    setHistory((h) => [{ id: `${r.id}-${Date.now()}`, name: r.title, rows: rows.length, at: new Date().toISOString() }, ...h].slice(0, 6));
    setBusy(null);
    toast.success(`${r.title} exported`, { description: `${rows.length} rows · CSV` });
  };

  return (
    <>
      <PageHeader title="Reports" description="Generate exports and review receivables." />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:col-span-2">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><r.icon className="size-5" /></span>
                  <div className="min-w-0">
                    <p className="font-semibold">{r.title}</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">{r.body}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={!!scheduled[r.id]}
                      onCheckedChange={(v) => {
                        setScheduled((s) => ({ ...s, [r.id]: v }));
                        toast(v ? "Weekly delivery on (demo)" : "Weekly delivery off", { description: r.title });
                      }}
                      aria-label={`Email ${r.title} weekly`}
                    />
                    <CalendarClock className="size-3.5" /> Weekly
                  </label>
                  <Button size="sm" variant="outline" onClick={() => run(r)} loading={busy === r.id} disabled={!canExport}>
                    {canExport ? <Download /> : <Lock />} Export CSV
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader title="Recent exports" description="This session" />
          <CardContent>
            {history.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <FileText className="size-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">Exports you generate will appear here.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => (
                  <motion.li key={h.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-success-soft text-success"><Check className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{h.name}</p>
                      <p className="text-xs text-muted-foreground">{h.rows} rows · {timeAgo(h.at)}</p>
                    </div>
                    <Badge tone="outline">CSV</Badge>
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Accounts receivable aging" description="Open invoice value by days past due" />
        <CardContent>
          <ul className="space-y-3">
            {aging.map((a, i) => (
              <li key={a.label} className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-3 text-[13px] sm:grid-cols-[120px_minmax(0,1fr)_160px]">
                <span className="text-muted-foreground">{a.label}</span>
                <span className="h-6 overflow-hidden rounded-md bg-muted">
                  <motion.span
                    className="block h-full rounded-md"
                    style={{ background: i === 0 ? "var(--chart-2)" : i < 3 ? "var(--chart-4)" : "var(--danger)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(a.amount / agingMax) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                  />
                </span>
                <span className="text-right tabular">
                  <span className="font-semibold">{formatCurrency(a.amount)}</span>
                  <span className="text-muted-foreground"> · {a.count}</span>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
