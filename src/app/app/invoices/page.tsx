"use client";

import { AlertTriangle, CheckCircle2, Clock, Copy, Download, Eye, FileEdit, MoreHorizontal, Pencil, Plus, Receipt, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { StatCard } from "@/components/app/stat-card";
import { InvoiceStatusBadge } from "@/components/app/status";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { useCan } from "@/hooks/use-permission";
import { invoiceBreakdown, invoiceTotal, lookup } from "@/lib/selectors";
import { cn, daysUntil, downloadCsv, effectiveStatus, formatCurrency, formatDate, uid } from "@/lib/utils";
import { useAppStore, useWorkspaceData } from "@/store/app-store";
import type { Invoice, InvoiceStatus } from "@/types";

const TABS: (InvoiceStatus | "All")[] = ["All", "Draft", "Pending", "Overdue", "Paid"];

export default function InvoicesPage() {
  const router = useRouter();
  const data = useWorkspaceData();
  const deleteInvoice = useAppStore((s) => s.deleteInvoice);
  const saveInvoice = useAppStore((s) => s.saveInvoice);
  const setStatus = useAppStore((s) => s.setInvoiceStatus);
  const canManage = useCan("invoices.manage");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<Invoice | undefined>();
  const customerOf = useMemo(() => lookup(data.customers), [data.customers]);

  const breakdown = useMemo(() => invoiceBreakdown(data.invoices), [data.invoices]);
  const paid30 = useMemo(
    () => data.invoices.filter((i) => i.paidAt && daysUntil(i.paidAt) >= -30).reduce((s, i) => s + invoiceTotal(i), 0),
    [data.invoices],
  );

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.invoices
      .filter((i) => tab === "All" || effectiveStatus(i) === tab)
      .filter((i) => !t || i.number.toLowerCase().includes(t) || (customerOf(i.customerId)?.company ?? "").toLowerCase().includes(t));
  }, [data.invoices, tab, q, customerOf]);

  const duplicate = (inv: Invoice) => {
    const id = saveInvoice({
      customerId: inv.customerId,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      status: "Draft",
      items: inv.items.map((i) => ({ ...i, id: uid("li") })),
      taxRate: inv.taxRate,
      discount: inv.discount,
      notes: inv.notes,
    });
    toast.success("Invoice duplicated as draft");
    router.push(`/app/invoices/${id}/edit`);
  };

  const columns: Column<Invoice>[] = [
    { id: "number", header: "Invoice", sortValue: (i) => i.number, cell: (i) => <span className="font-mono text-[13px] font-medium">{i.number}</span> },
    {
      id: "customer",
      header: "Customer",
      sortValue: (i) => customerOf(i.customerId)?.company ?? "",
      cell: (i) => {
        const c = customerOf(i.customerId);
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={c?.company ?? "?"} size="xs" />
            <span className="truncate">{c?.company ?? "Deleted customer"}</span>
          </div>
        );
      },
    },
    { id: "issued", header: "Issued", sortValue: (i) => i.issueDate, cell: (i) => <span className="text-muted-foreground">{formatDate(i.issueDate)}</span>, hideBelow: "lg" },
    {
      id: "due",
      header: "Due",
      sortValue: (i) => i.dueDate,
      cell: (i) => {
        const s = effectiveStatus(i);
        const d = daysUntil(i.dueDate);
        return (
          <span className={cn("text-muted-foreground", s === "Overdue" && "font-medium text-danger")}>
            {formatDate(i.dueDate)}
            {s === "Overdue" && <span className="block text-[11px]">{Math.abs(d)} days late</span>}
          </span>
        );
      },
    },
    { id: "status", header: "Status", sortValue: (i) => effectiveStatus(i), cell: (i) => <InvoiceStatusBadge status={effectiveStatus(i)} /> },
    { id: "amount", header: "Amount", align: "right", sortValue: (i) => invoiceTotal(i), cell: (i) => <span className="font-semibold">{formatCurrency(invoiceTotal(i), "USD", { cents: true })}</span> },
    {
      id: "menu",
      header: "",
      className: "w-12",
      cell: (i) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${i.number}`}><MoreHorizontal /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => router.push(`/app/invoices/${i.id}`)}><Eye /> View</DropdownMenuItem>
              <DropdownMenuItem disabled={!canManage} onSelect={() => router.push(`/app/invoices/${i.id}/edit`)}><Pencil /> Edit</DropdownMenuItem>
              <DropdownMenuItem disabled={!canManage} onSelect={() => duplicate(i)}><Copy /> Duplicate</DropdownMenuItem>
              {effectiveStatus(i) !== "Paid" && (
                <DropdownMenuItem disabled={!canManage} onSelect={() => { setStatus(i.id, "Paid"); toast.success(`${i.number} marked as paid`); }}>
                  <CheckCircle2 /> Mark as paid
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive disabled={!canManage} onSelect={() => setDeleting(i)}><Trash2 /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Create, send and track invoices."
        actions={
          <>
            <Button
              variant="outline"
              disabled={!rows.length}
              onClick={() =>
                downloadCsv("invoices.csv", rows.map((i) => ({ number: i.number, customer: customerOf(i.customerId)?.company ?? "", issued: i.issueDate.slice(0, 10), due: i.dueDate.slice(0, 10), status: effectiveStatus(i), total: invoiceTotal(i) })))
              }
            >
              <Download /> Export
            </Button>
            <Button asChild disabled={!canManage}>
              <Link href="/app/invoices/new"><Plus /> Create invoice</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard index={0} label="Outstanding" value={breakdown.amounts.Pending + breakdown.amounts.Overdue} format={(n) => formatCurrency(n)} icon={<Clock />} />
        <StatCard index={1} label="Overdue" value={breakdown.amounts.Overdue} format={(n) => formatCurrency(n)} icon={<AlertTriangle />} />
        <StatCard index={2} label="Collected (30 days)" value={paid30} format={(n) => formatCurrency(n)} icon={<CheckCircle2 />} />
        <StatCard index={3} label="Drafts" value={breakdown.counts.Draft} format={(n) => String(Math.round(n))} icon={<FileEdit />} />
      </div>

      <Card className="mt-5">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
                className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors", tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted")}
              >
                {t}
                <span className="text-xs opacity-60 tabular">{t === "All" ? data.invoices.length : breakdown.counts[t]}</span>
              </button>
            ))}
          </div>
          <div className="relative lg:ml-auto lg:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search number or customer…" aria-label="Search invoices" className="pl-9" />
          </div>
        </div>
        <DataTable
          caption="Invoices"
          rows={rows}
          columns={columns}
          getRowId={(i) => i.id}
          onRowClick={(i) => router.push(`/app/invoices/${i.id}`)}
          initialSort={{ id: "issued", dir: "desc" }}
          mobileCard={(i) => (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{customerOf(i.customerId)?.company ?? "—"}</p>
                <p className="font-mono text-xs text-muted-foreground">{i.number} · due {formatDate(i.dueDate, "short")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular">{formatCurrency(invoiceTotal(i))}</p>
                <div className="mt-1"><InvoiceStatusBadge status={effectiveStatus(i)} /></div>
              </div>
            </div>
          )}
          empty={
            <EmptyState
              icon={<Receipt />}
              title={data.invoices.length ? `No ${tab.toLowerCase()} invoices` : "No invoices yet"}
              description={data.invoices.length ? "Try another filter or search." : "Create your first invoice in under a minute."}
              action={<Button asChild><Link href="/app/invoices/new"><Plus /> Create invoice</Link></Button>}
            />
          }
        />
      </Card>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(undefined)}
        title={`Delete ${deleting?.number}?`}
        description="Deleted invoices can’t be recovered. Consider voiding instead in production."
        onConfirm={() => {
          if (!deleting) return;
          deleteInvoice(deleting.id);
          toast.success("Invoice deleted");
        }}
      />
    </>
  );
}
