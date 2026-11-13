"use client";

import {
  ArrowRight,
  Briefcase,
  CircleDollarSign,
  Download,
  FolderKanban,
  ListChecks,
  Plus,
  Receipt,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { SERIES, GroupedBarChart, TrendAreaChart } from "@/components/app/charts";
import { StatCard } from "@/components/app/stat-card";
import { PaymentStatusBadge, PriorityBadge } from "@/components/app/status";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState, Progress } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { lookup, monthlySeries, overviewKpis, projectProgress } from "@/lib/selectors";
import { cn, daysUntil, downloadCsv, formatCurrency, formatDate, formatNumber, timeAgo } from "@/lib/utils";
import { useActiveWorkspace, useWorkspaceData } from "@/store/app-store";
import { useSession } from "@/store/session-store";
import type { ActivityKind } from "@/types";

const ACTIVITY_ICON: Record<ActivityKind, React.ComponentType<{ className?: string }>> = {
  customer: Users,
  deal: Briefcase,
  invoice: Receipt,
  payment: Wallet,
  project: FolderKanban,
  task: ListChecks,
  employee: UserRound,
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function OverviewPage() {
  const data = useWorkspaceData();
  const workspace = useActiveWorkspace();
  const user = useSession((s) => s.user);
  const [range, setRange] = useState<"6" | "12">("12");

  const kpi = useMemo(() => overviewKpis(data), [data]);
  const series = useMemo(() => monthlySeries(data), [data]);
  const shown = range === "6" ? series.slice(-6) : series;
  const customerOf = useMemo(() => lookup(data.customers), [data.customers]);
  const employeeOf = useMemo(() => lookup(data.employees), [data.employees]);
  const projectOf = useMemo(() => lookup(data.projects), [data.projects]);

  const upcoming = useMemo(
    () => data.tasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6),
    [data.tasks],
  );
  const activeProjects = data.projects.filter((p) => p.status !== "Completed").slice(0, 5);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user?.name.split(" ")[0] ?? "there"}`}
        description={`Here’s what’s happening at ${workspace?.name ?? "your workspace"} today.`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  `${workspace?.slug ?? "workspace"}-monthly-summary.csv`,
                  series.map((s) => ({ month: s.key, revenue: s.revenue, expenses: s.expenses, new_customers: s.newCustomers, churned: s.churned })),
                )
              }
            >
              <Download /> Export
            </Button>
            <Button asChild>
              <Link href="/app/invoices/new">
                <Plus /> New invoice
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          index={0}
          className="col-span-2 md:col-span-1"
          label="Total revenue"
          value={kpi.totalRevenue}
          format={(n) => formatCurrency(n, "USD", { compact: n >= 1_000_000 })}
          delta={kpi.revenueDelta}
          deltaLabel="vs prior quarter"
          icon={<CircleDollarSign />}
        />
        <StatCard index={1} label="Total customers" value={kpi.customers} format={(n) => formatNumber(Math.round(n))} delta={kpi.customerGrowth} deltaLabel="net this month" icon={<Users />} />
        <StatCard
          index={2}
          label="Active projects"
          value={kpi.activeProjects}
          format={(n) => String(Math.round(n))}
          icon={<FolderKanban />}
        />
        <StatCard
          index={3}
          label="Pending invoices"
          value={kpi.pendingAmount}
          format={(n) => formatCurrency(n)}
          icon={<Receipt />}
        />
        <StatCard index={4} label="Team members" value={kpi.teamMembers} format={(n) => String(Math.round(n))} icon={<UserRound />} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {kpi.pendingCount} open invoices{kpi.overdueCount ? `, ${kpi.overdueCount} overdue` : ""} · {kpi.invitedMembers} pending invites · Illustrative demo data
      </p>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Monthly revenue"
            description="Revenue and operating expenses"
            action={
              <Segmented
                label="Date range"
                value={range}
                onChange={setRange}
                options={[{ value: "6", label: "6M" }, { value: "12", label: "12M" }]}
              />
            }
          />
          <CardContent className="pt-3">
            <TrendAreaChart
              data={shown}
              xKey="month"
              series={[
                { key: "revenue", name: "Revenue", color: SERIES.revenue },
                { key: "expenses", name: "Expenses", color: SERIES.expenses },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Customer growth" description="New vs. churned per month" />
          <CardContent className="pt-3">
            <GroupedBarChart
              data={shown}
              xKey="month"
              format="number"
              series={[
                { key: "newCustomers", name: "New", color: SERIES.customers },
                { key: "churned", name: "Churned", color: SERIES.churn },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Recent transactions */}
        <Card>
          <CardHeader
            title="Recent transactions"
            action={<Link href="/app/payments" className="text-[13px] font-medium text-primary hover:underline">View all</Link>}
          />
          <CardContent className="pt-3">
            {data.payments.length === 0 ? (
              <EmptyState icon={<Wallet />} title="No transactions yet" description="Payments appear here once customers pay invoices." className="py-8" />
            ) : (
              <ul className="divide-y divide-border">
                {data.payments.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5">
                    <Avatar name={customerOf(p.customerId)?.company ?? "?"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{customerOf(p.customerId)?.company ?? "Unknown customer"}</p>
                      <p className="text-xs text-muted-foreground">{p.cardBrand ?? p.method}{p.last4 ? ` •••• ${p.last4}` : ""} · {timeAgo(p.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-[13.5px] font-semibold tabular", p.status === "Refunded" && "text-muted-foreground line-through")}>
                        {formatCurrency(p.amount, "USD", { cents: true })}
                      </p>
                      <div className="mt-0.5"><PaymentStatusBadge status={p.status} /></div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Project progress */}
        <Card>
          <CardHeader
            title="Project progress"
            action={<Link href="/app/projects" className="text-[13px] font-medium text-primary hover:underline">All projects</Link>}
          />
          <CardContent className="pt-3">
            {activeProjects.length === 0 ? (
              <EmptyState icon={<FolderKanban />} title="No active projects" description="Create a project to start tracking delivery." className="py-8"
                action={<Button asChild size="sm"><Link href="/app/projects">Create project</Link></Button>} />
            ) : (
              <ul className="space-y-4">
                {activeProjects.map((p) => {
                  const pct = projectProgress(p, data.tasks);
                  const due = daysUntil(p.dueDate);
                  return (
                    <li key={p.id}>
                      <Link href={`/app/projects/${p.id}`} className="group block">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-[13.5px] font-medium group-hover:text-primary">{p.name}</p>
                          <span className="text-xs font-semibold tabular">{pct}%</span>
                        </div>
                        <Progress value={pct} className="mt-2" label={`${p.name} progress`} />
                        <div className="mt-2 flex items-center justify-between">
                          <AvatarStack names={p.memberIds.map((id) => employeeOf(id)?.name ?? "?")} max={4} />
                          <span className={cn("text-xs", due < 0 ? "text-danger" : "text-muted-foreground")}>
                            {due < 0 ? `${Math.abs(due)}d overdue` : `Due ${formatDate(p.dueDate, "short")}`}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming tasks */}
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader
            title="Upcoming tasks"
            action={<Link href="/app/tasks" className="text-[13px] font-medium text-primary hover:underline">Open board</Link>}
          />
          <CardContent className="pt-3">
            {upcoming.length === 0 ? (
              <EmptyState icon={<ListChecks />} title="Nothing due" description="You’re all caught up." className="py-8" />
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.map((t) => {
                  const due = daysUntil(t.dueDate);
                  return (
                    <li key={t.id} className="flex items-start gap-3 py-2.5">
                      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", due < 0 ? "bg-danger" : due <= 2 ? "bg-warning" : "bg-border")} aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium">{t.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{projectOf(t.projectId)?.name}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <PriorityBadge priority={t.priority} />
                        <span className={cn("text-[11px]", due < 0 ? "font-medium text-danger" : "text-muted-foreground")}>
                          {due === 0 ? "Today" : due < 0 ? `${Math.abs(due)}d late` : due === 1 ? "Tomorrow" : formatDate(t.dueDate, "short")}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Recent activity" description="Everything that changed in this workspace" />
        <CardContent className="pt-4">
          {data.activities.length === 0 ? (
            <EmptyState icon={<ListChecks />} title="No activity yet" description="Actions you and your team take will appear here." className="py-8" />
          ) : (
            <ol className="grid gap-x-8 gap-y-1 md:grid-cols-2">
              {data.activities.slice(0, 10).map((a) => {
                const Icon = ACTIVITY_ICON[a.kind];
                return (
                  <li key={a.id} className="flex items-start gap-3 rounded-lg py-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <p className="min-w-0 flex-1 text-[13.5px] leading-snug">
                      <span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{a.message}</span>
                      <span className="block text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
          <Link href="/app/reports" className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline">
            View reports <ArrowRight className="size-3.5" />
          </Link>
        </CardContent>
      </Card>
    </>
  );
}
