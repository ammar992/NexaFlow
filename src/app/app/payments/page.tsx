"use client";

import { CheckCircle2, CircleDashed, CreditCard, Download, MoreHorizontal, Percent, RotateCcw, Search, ShieldCheck, Wallet, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { SERIES, GroupedBarChart } from "@/components/app/charts";
import { StatCard } from "@/components/app/stat-card";
import { PaymentStatusBadge } from "@/components/app/status";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { useCan } from "@/hooks/use-permission";
import { lookup, monthlySeries } from "@/lib/selectors";
import { daysUntil, downloadCsv, formatCurrency, formatDate } from "@/lib/utils";
import { useAppStore, useActiveWorkspace, useWorkspaceData } from "@/store/app-store";
import type { Payment, PaymentStatus } from "@/types";

export default function PaymentsPage() {
  const data = useWorkspaceData();
  const workspace = useActiveWorkspace();
  const refund = useAppStore((s) => s.refundPayment);
  const canRefund = useCan("payments.refund");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [refunding, setRefunding] = useState<Payment | undefined>();
  const customerOf = useMemo(() => lookup(data.customers), [data.customers]);
  const invoiceOf = useMemo(() => lookup(data.invoices), [data.invoices]);

  const stats = useMemo(() => {
    const last30 = data.payments.filter((p) => daysUntil(p.createdAt) >= -30);
    const ok = last30.filter((p) => p.status === "Succeeded");
    const attempted = last30.filter((p) => p.status !== "Processing");
    return {
      volume: ok.reduce((s, p) => s + p.amount, 0),
      successRate: attempted.length ? (ok.length / attempted.length) * 100 : 100,
      refunded: data.payments.filter((p) => p.status === "Refunded").reduce((s, p) => s + p.amount, 0),
      processing: data.payments.filter((p) => p.status === "Processing").reduce((s, p) => s + p.amount, 0),
    };
  }, [data.payments]);

  const series = useMemo(() => monthlySeries(data).slice(-6), [data]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.payments.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (!t || p.reference.includes(t) || (customerOf(p.customerId)?.company ?? "").toLowerCase().includes(t) || (invoiceOf(p.invoiceId)?.number ?? "").toLowerCase().includes(t)),
    );
  }, [data.payments, q, status, customerOf, invoiceOf]);

  const columns: Column<Payment>[] = [
    { id: "amount", header: "Amount", sortValue: (p) => p.amount, cell: (p) => <span className={p.status === "Refunded" ? "font-semibold text-muted-foreground line-through" : "font-semibold"}>{formatCurrency(p.amount, "USD", { cents: true })}</span> },
    { id: "status", header: "Status", sortValue: (p) => p.status, cell: (p) => <PaymentStatusBadge status={p.status} /> },
    {
      id: "customer",
      header: "Customer",
      sortValue: (p) => customerOf(p.customerId)?.company ?? "",
      cell: (p) => <span className="flex items-center gap-2"><Avatar name={customerOf(p.customerId)?.company ?? "?"} size="xs" />{customerOf(p.customerId)?.company ?? "—"}</span>,
    },
    {
      id: "invoice",
      header: "Invoice",
      hideBelow: "lg",
      cell: (p) => {
        const inv = invoiceOf(p.invoiceId);
        return inv ? <Link href={`/app/invoices/${inv.id}`} className="font-mono text-[13px] text-primary hover:underline">{inv.number}</Link> : "—";
      },
    },
    { id: "method", header: "Method", cell: (p) => <span className="text-muted-foreground">{p.cardBrand ?? p.method}{p.last4 ? ` •••• ${p.last4}` : ""}</span>, hideBelow: "lg" },
    { id: "ref", header: "Reference", cell: (p) => <span className="font-mono text-xs text-muted-foreground">{p.reference}</span>, hideBelow: "xl" },
    { id: "date", header: "Date", sortValue: (p) => p.createdAt, cell: (p) => <span className="text-muted-foreground">{formatDate(p.createdAt)}</span> },
    {
      id: "menu",
      header: "",
      className: "w-12",
      cell: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for payment ${p.reference}`}><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled={!canRefund || p.status !== "Succeeded"} onSelect={() => setRefunding(p)}><RotateCcw /> Refund payment</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        description="Online payments collected through Stripe."
        actions={
          <Button variant="outline" disabled={!rows.length} onClick={() => downloadCsv("payments.csv", rows.map((p) => ({ reference: p.reference, amount: p.amount, status: p.status, method: p.method, customer: customerOf(p.customerId)?.company ?? "", date: p.createdAt.slice(0, 10) })))}>
            <Download /> Export
          </Button>
        }
      />

      <Card className="mb-5 overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-[#635BFF] text-white"><Zap className="size-5" /></span>
          <div className="flex-1">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              Stripe account connected <Badge tone="warning">Test mode · simulated</Badge>
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              acct_demo_{workspace?.slug.replace(/-/g, "").slice(0, 10)} · Cards, ACH and wire · Payouts every 2 business days. No real Stripe credentials are used in this demo.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-success" /> Webhooks verified</div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard index={0} label="Gross volume (30d)" value={stats.volume} format={(n) => formatCurrency(n)} icon={<Wallet />} />
        <StatCard index={1} label="Success rate (30d)" value={stats.successRate} format={(n) => `${n.toFixed(1)}%`} icon={<Percent />} />
        <StatCard index={2} label="Processing" value={stats.processing} format={(n) => formatCurrency(n)} icon={<CircleDashed />} />
        <StatCard index={3} label="Refunded" value={stats.refunded} format={(n) => formatCurrency(n)} icon={<RotateCcw />} />
      </div>

      <Card className="mt-4">
        <CardHeader title="Invoiced vs. collected" description="Last 6 months" />
        <CardContent className="pt-3">
          <GroupedBarChart
            data={series}
            xKey="month"
            height={240}
            series={[
              { key: "invoiced", name: "Invoiced", color: SERIES.invoiced },
              { key: "collected", name: "Collected", color: SERIES.collected },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer, invoice or reference…" aria-label="Search payments" className="pl-9" />
          </div>
          <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus | "all")} className="sm:w-44">
            <option value="all">All statuses</option>
            {["Succeeded", "Processing", "Failed", "Refunded"].map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <DataTable
          caption="Payment history"
          rows={rows}
          columns={columns}
          getRowId={(p) => p.id}
          initialSort={{ id: "date", dir: "desc" }}
          mobileCard={(p) => (
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {p.status === "Succeeded" ? <CheckCircle2 className="size-4 text-success" /> : <CreditCard className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{customerOf(p.customerId)?.company ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)} · {p.method}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular">{formatCurrency(p.amount)}</p>
                <PaymentStatusBadge status={p.status} />
              </div>
            </div>
          )}
          empty={<EmptyState icon={<CreditCard />} title="No payments" description="Collect a payment from any pending invoice." action={<Button asChild variant="outline"><Link href="/app/invoices">Go to invoices</Link></Button>} />}
        />
      </Card>

      <ConfirmDialog
        open={!!refunding}
        onOpenChange={(v) => !v && setRefunding(undefined)}
        title="Refund this payment?"
        description={`${formatCurrency(refunding?.amount ?? 0, "USD", { cents: true })} will be returned to the customer (simulated). This can’t be undone.`}
        confirmLabel="Refund"
        onConfirm={() => {
          if (!refunding) return;
          refund(refunding.id);
          toast.success("Refund issued (simulated)");
        }}
      />
    </>
  );
}
