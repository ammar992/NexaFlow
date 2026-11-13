"use client";

import { ArrowLeft, CheckCircle2, CreditCard, FileSearch, Mail, Pencil, Printer, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { InvoiceDocument } from "@/components/app/invoices/invoice-document";
import { PaymentDialog } from "@/components/app/invoices/payment-dialog";
import { PaymentStatusBadge } from "@/components/app/status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { useCan } from "@/hooks/use-permission";
import { invoiceTotal } from "@/lib/selectors";
import { effectiveStatus, formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { useActiveWorkspace, useAppStore, useWorkspaceData } from "@/store/app-store";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const data = useWorkspaceData();
  const workspace = useActiveWorkspace();
  const setStatus = useAppStore((s) => s.setInvoiceStatus);
  const canManage = useCan("invoices.manage");
  const [payOpen, setPayOpen] = useState(false);

  const invoice = data.invoices.find((i) => i.id === id);
  if (!invoice) {
    return (
      <Card>
        <EmptyState
          icon={<FileSearch />}
          title="Invoice not found"
          description="It may have been deleted, or it belongs to a different workspace."
          action={<Button asChild variant="outline"><Link href="/app/invoices"><ArrowLeft /> All invoices</Link></Button>}
        />
      </Card>
    );
  }

  const customer = data.customers.find((c) => c.id === invoice.customerId);
  const status = effectiveStatus(invoice);
  const total = invoiceTotal(invoice);
  const payments = data.payments.filter((p) => p.invoiceId === invoice.id);

  return (
    <>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/app/invoices" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Invoices
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer /> Print / PDF</Button>
          <Button asChild variant="outline" disabled={!canManage}><Link href={`/app/invoices/${invoice.id}/edit`}><Pencil /> Edit</Link></Button>
          {status === "Draft" && (
            <Button disabled={!canManage} onClick={() => { setStatus(invoice.id, "Pending"); toast.success(`${invoice.number} sent`, { description: `Emailed to ${customer?.email} (simulated)` }); }}>
              <Send /> Send invoice
            </Button>
          )}
          {(status === "Pending" || status === "Overdue") && (
            <Button onClick={() => setPayOpen(true)}><CreditCard /> Collect payment</Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <InvoiceDocument
          workspace={workspace}
          customer={customer}
          number={invoice.number}
          issueDate={invoice.issueDate}
          dueDate={invoice.dueDate}
          status={status}
          items={invoice.items}
          taxRate={invoice.taxRate}
          discount={invoice.discount}
          notes={invoice.notes}
          className="mx-auto w-full max-w-[860px]"
        />

        <aside className="no-print space-y-4">
          <Card>
            <CardHeader title="Summary" />
            <CardContent className="space-y-3 text-[13.5px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold tabular">{formatCurrency(total, "USD", { cents: true })}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Issued</span><span>{formatDate(invoice.issueDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Due</span><span className={status === "Overdue" ? "font-medium text-danger" : ""}>{formatDate(invoice.dueDate)}</span></div>
              {invoice.paidAt && <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-success">{formatDate(invoice.paidAt)}</span></div>}
              {customer && (
                <Link href={`/app/customers/${customer.id}`} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-[13px] hover:text-primary">
                  <Mail className="size-3.5" /> {customer.company}
                </Link>
              )}
              {status !== "Paid" && canManage && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => { setStatus(invoice.id, "Paid"); toast.success("Marked as paid (offline payment)"); }}>
                  <CheckCircle2 /> Mark paid manually
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Payment history" />
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment attempts yet.</p>
              ) : (
                <ol className="space-y-3">
                  {payments.map((p) => (
                    <li key={p.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[13.5px] font-semibold tabular">{formatCurrency(p.amount, "USD", { cents: true })}</span>
                        <PaymentStatusBadge status={p.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.cardBrand ?? p.method}{p.last4 ? ` •••• ${p.last4}` : ""} · {timeAgo(p.createdAt)}</p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{p.reference}</p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      <PaymentDialog open={payOpen} onOpenChange={setPayOpen} invoice={invoice} amount={total} company={customer?.company} />
    </>
  );
}
