"use client";

import { Activity, CircleDollarSign, Download, Percent, Repeat, TrendingUp, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { DonutChart, GroupedBarChart, SERIES, TrendAreaChart, TrendLineChart } from "@/components/app/charts";
import { StatCard } from "@/components/app/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { invoiceBreakdown, lookup, monthlySeries } from "@/lib/selectors";
import { downloadCsv, formatCurrency, pctChange, sum } from "@/lib/utils";
import { useActiveWorkspace, useWorkspaceData } from "@/store/app-store";

type Range = "3" | "6" | "12";

export default function AnalyticsPage() {
  const data = useWorkspaceData();
  const workspace = useActiveWorkspace();
  const [range, setRange] = useState<Range>("6");
  const [department, setDepartment] = useState("all");

  const all = useMemo(() => monthlySeries(data), [data]);
  const n = Number(range);
  const current = all.slice(-n);
  // Previous period of equal length; for 12M we only have 12 months, so compare halves.
  const previous = n === 12 ? all.slice(0, 6) : all.slice(-2 * n, -n);
  const compareBase = n === 12 ? all.slice(6) : current;

  const revenue = sum(current, (m) => m.revenue);
  const revDelta = pctChange(sum(compareBase, (m) => m.revenue), sum(previous, (m) => m.revenue));
  const profit = sum(current, (m) => m.profit);
  const margin = revenue ? (profit / revenue) * 100 : 0;
  const newCustomers = sum(current, (m) => m.newCustomers);
  const acqDelta = pctChange(sum(compareBase, (m) => m.newCustomers), sum(previous, (m) => m.newCustomers));
  const retention = current.length ? sum(current, (m) => m.retention) / current.length : 0;
  const collection = sum(current, (m) => m.invoiced) ? (sum(current, (m) => m.collected) / sum(current, (m) => m.invoiced)) * 100 : 0;

  const comparison = current.map((m, i) => ({ month: m.month, current: m.revenue, previous: (previous[i] ?? previous[previous.length - 1])?.revenue ?? 0 }));

  const projectStatus = ["Active", "Planning", "On hold", "Completed"].map((s, i) => ({
    name: s,
    value: data.projects.filter((p) => p.status === s).length,
    color: ["var(--chart-1)", "var(--chart-3)", "var(--chart-4)", "var(--chart-2)"][i],
  }));
  const taskDone = data.tasks.filter((t) => t.status === "completed").length;

  const segments = (["Enterprise", "Mid-market", "SMB", "Startup"] as const).map((c, i) => ({
    name: c,
    value: sum(data.customers.filter((x) => x.category === c), (x) => x.lifetimeValue),
    color: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"][i],
  }));

  const depOf = lookup(data.departments);
  const productivity = data.employees
    .filter((e) => e.status === "Active" && (department === "all" || e.departmentId === department))
    .map((e) => ({ ...e, done: data.tasks.filter((t) => t.assigneeId === e.id && t.status === "completed").length }))
    .sort((a, b) => b.productivity - a.productivity)
    .slice(0, 8);

  const inv = invoiceBreakdown(data.invoices);

  const exportCsv = () =>
    downloadCsv(`${workspace?.slug}-analytics-${range}m.csv`, current.map((m) => ({
      month: m.key, revenue: m.revenue, expenses: m.expenses, profit: m.profit, new_customers: m.newCustomers, churned: m.churned,
      retention_pct: m.retention.toFixed(1), invoiced: m.invoiced, collected: m.collected, collection_rate_pct: m.collectionRate.toFixed(1),
    })));

  const rangeLabel = n === 12 ? "vs first half" : `vs previous ${n} months`;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Business performance across revenue, customers, delivery and collections."
        actions={
          <>
            <Segmented label="Date range" value={range} onChange={setRange} options={[{ value: "3", label: "3M" }, { value: "6", label: "6M" }, { value: "12", label: "12M" }]} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><Download /> Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={exportCsv}>Download CSV</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => window.print()}>Print / save as PDF</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast("Scheduled export (demo)", { description: "Weekly email delivery would be configured server-side." })}>Schedule weekly email</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard index={0} className="col-span-2 md:col-span-1" label="Revenue" value={revenue} format={(v) => formatCurrency(v, "USD", { compact: v > 999_999 })} delta={revDelta} deltaLabel={rangeLabel} icon={<CircleDollarSign />} />
        <StatCard index={1} label="Profit margin" value={margin} format={(v) => `${v.toFixed(1)}%`} icon={<TrendingUp />} />
        <StatCard index={2} label="New customers" value={newCustomers} format={(v) => String(Math.round(v))} delta={acqDelta} deltaLabel={rangeLabel} icon={<UserPlus />} />
        <StatCard index={3} label="Avg. retention" value={retention} format={(v) => `${v.toFixed(1)}%`} icon={<Repeat />} />
        <StatCard index={4} label="Collection rate" value={collection} format={(v) => `${v.toFixed(1)}%`} icon={<Percent />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue trend" description="Revenue and expenses by month" />
          <CardContent className="pt-3">
            <TrendAreaChart data={current} xKey="month" series={[{ key: "revenue", name: "Revenue", color: SERIES.revenue }, { key: "expenses", name: "Expenses", color: SERIES.expenses }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Revenue by segment" description="Lifetime value by customer category" />
          <CardContent>
            <DonutChart data={segments} format="currency" centerLabel="total LTV" centerValue={formatCurrency(sum(segments, (s) => s.value), "USD", { compact: true })} height={170} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Monthly comparison" description={n === 12 ? "Second half vs. first half of the year" : `This period vs. previous ${n} months`} />
          <CardContent className="pt-3">
            <GroupedBarChart
              data={n === 12 ? all.slice(6).map((m, i) => ({ month: m.month, current: m.revenue, previous: all[i].revenue })) : comparison}
              xKey="month"
              series={[{ key: "previous", name: "Previous period", color: "var(--chart-3)" }, { key: "current", name: "Current period", color: "var(--chart-1)" }]}
              height={250}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Customer acquisition" description="New and churned customers" />
          <CardContent className="pt-3">
            <GroupedBarChart data={current} xKey="month" format="number" height={250} series={[{ key: "newCustomers", name: "New", color: SERIES.customers }, { key: "churned", name: "Churned", color: SERIES.churn }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Customer retention" description="Share of customers retained each month" />
          <CardContent className="pt-3">
            <TrendLineChart data={current} xKey="month" format="percent" domain={[90, 100]} series={[{ key: "retention", name: "Retention", color: SERIES.collected }]} height={230} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Invoice collection" description="Collected as a share of invoiced" />
          <CardContent className="pt-3">
            <TrendLineChart data={current} xKey="month" format="percent" domain={[80, 100]} series={[{ key: "collectionRate", name: "Collection rate", color: SERIES.invoiced }]} height={230} />
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {(["Paid", "Pending", "Overdue", "Draft"] as const).map((s) => (
                <div key={s} className="rounded-lg bg-muted px-2 py-2">
                  <p className="text-[11px] text-muted-foreground">{s}</p>
                  <p className="text-sm font-semibold tabular">{inv.counts[s]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Project completion" description={`${taskDone} of ${data.tasks.length} tasks completed`} />
          <CardContent>
            <DonutChart data={projectStatus} centerLabel="projects" centerValue={String(data.projects.length)} height={170} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader
            title="Employee productivity"
            description="Illustrative score with completed tasks"
            action={
              <Select aria-label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="h-8 w-40 text-[13px]">
                <option value="all">All departments</option>
                {data.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            }
          />
          <CardContent>
            {productivity.length === 0 ? (
              <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Activity className="size-4" /> No active people in this department.</p>
            ) : (
              <ul className="space-y-3.5">
                {productivity.map((e) => (
                  <li key={e.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] items-center gap-3">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={e.name} size="xs" />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium">{e.name}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{depOf(e.departmentId)?.name}</span>
                      </span>
                    </span>
                    <Progress value={e.productivity} label={`${e.name} productivity`} />
                    <span className="w-24 text-right text-xs text-muted-foreground tabular">
                      <span className="font-semibold text-foreground">{e.productivity}</span> · {e.done} done
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">All figures are illustrative demo data for {workspace?.name}.</p>
    </>
  );
}
