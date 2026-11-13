"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, GripVertical, Pencil, Plus, Save, Send, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { InvoiceDocument } from "@/components/app/invoices/invoice-document";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/tabs";
import { formatCurrency, invoiceTotals, lineTotal, toDateInput, uid } from "@/lib/utils";
import { invoiceSchema, type InvoiceValues } from "@/lib/validation";
import { nextInvoiceNumber, useActiveWorkspace, useAppStore, useWorkspaceData } from "@/store/app-store";
import type { Invoice } from "@/types";

const iso = (d: string) => new Date(`${d}T12:00:00`).toISOString();

export function InvoiceEditor({ invoice, defaultCustomerId }: { invoice?: Invoice; defaultCustomerId?: string }) {
  const router = useRouter();
  const data = useWorkspaceData();
  const workspace = useActiveWorkspace();
  const saveInvoice = useAppStore((s) => s.saveInvoice);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState<"draft" | "send" | null>(null);

  const number = invoice?.number ?? nextInvoiceNumber(data.invoices);
  const [{ today, in30 }] = useState(() => ({
    today: new Date().toISOString().slice(0, 10),
    in30: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
  }));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice
      ? {
          customerId: invoice.customerId,
          issueDate: toDateInput(invoice.issueDate),
          dueDate: toDateInput(invoice.dueDate),
          taxRate: invoice.taxRate,
          discount: invoice.discount,
          notes: invoice.notes,
          items: invoice.items,
        }
      : {
          customerId: defaultCustomerId ?? "",
          issueDate: today,
          dueDate: in30,
          taxRate: 8.5,
          discount: 0,
          notes: "Thank you for your business. Payment is due within 30 days.",
          items: [{ id: uid("li"), description: "", quantity: 1, unitPrice: 0 }],
        },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const values = useWatch({ control }) as InvoiceValues;
  const safeItems = useMemo(
    () => (values.items ?? []).map((i) => ({ id: i?.id ?? "", description: i?.description ?? "", quantity: Number(i?.quantity) || 0, unitPrice: Number(i?.unitPrice) || 0 })),
    [values.items],
  );
  const totals = invoiceTotals({ items: safeItems, taxRate: Number(values.taxRate) || 0, discount: Number(values.discount) || 0 });
  const customer = data.customers.find((c) => c.id === values.customerId);

  const submit = (mode: "draft" | "send") =>
    handleSubmit(
      async (v) => {
        setSaving(mode);
        await new Promise((r) => setTimeout(r, 600));
        const id = saveInvoice({
          id: invoice?.id,
          number,
          customerId: v.customerId,
          issueDate: iso(v.issueDate),
          dueDate: iso(v.dueDate),
          status: mode === "draft" ? "Draft" : invoice?.status === "Paid" ? "Paid" : "Pending",
          items: v.items,
          taxRate: v.taxRate,
          discount: v.discount,
          notes: v.notes,
          paidAt: invoice?.paidAt,
        });
        toast.success(mode === "draft" ? "Draft saved" : `${number} sent`, {
          description: mode === "send" ? `Emailed to ${customer?.email} (simulated)` : undefined,
        });
        setSaving(null);
        router.push(`/app/invoices/${id}`);
      },
      () => {
        setMobileView("edit");
        toast.error("Please fix the highlighted fields");
      },
    )();

  const preview = (
    <InvoiceDocument
      workspace={workspace}
      customer={customer}
      number={number}
      issueDate={values.issueDate ? iso(values.issueDate) : ""}
      dueDate={values.dueDate ? iso(values.dueDate) : ""}
      status={invoice?.status ?? "Draft"}
      items={safeItems}
      taxRate={Number(values.taxRate) || 0}
      discount={Number(values.discount) || 0}
      notes={values.notes ?? ""}
      className="text-[12px] sm:p-8"
    />
  );

  return (
    <>
      <Link href={invoice ? `/app/invoices/${invoice.id}` : "/app/invoices"} className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> {invoice ? number : "Invoices"}
      </Link>
      <PageHeader
        title={invoice ? `Edit ${number}` : "New invoice"}
        description="Totals, tax and discounts update as you type."
        actions={
          <>
            <Button variant="outline" onClick={() => submit("draft")} loading={saving === "draft"} disabled={!!saving}>
              <Save /> Save draft
            </Button>
            <Button onClick={() => submit("send")} loading={saving === "send"} disabled={!!saving}>
              <Send /> {invoice?.status === "Paid" ? "Save" : "Save & send"}
            </Button>
          </>
        }
      />

      <Segmented
        label="Editor view"
        className="mb-4 w-full xl:hidden [&>button]:flex-1 [&>button]:justify-center"
        value={mobileView}
        onChange={setMobileView}
        options={[{ value: "edit", label: "Edit", icon: <Pencil /> }, { value: "preview", label: "Preview", icon: <Eye /> }]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <form noValidate onSubmit={(e) => e.preventDefault()} className={mobileView === "preview" ? "hidden xl:block" : ""}>
          <Card>
            <CardHeader title="Details" />
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer" htmlFor="i-customer" error={errors.customerId?.message} className="sm:col-span-2">
                <Select id="i-customer" aria-invalid={!!errors.customerId} {...register("customerId")}>
                  <option value="">Select a customer…</option>
                  {data.customers.map((c) => <option key={c.id} value={c.id}>{c.company} — {c.name}</option>)}
                </Select>
              </Field>
              <Field label="Invoice number" htmlFor="i-number" hint="Assigned automatically">
                <Input id="i-number" value={number} readOnly className="bg-muted font-mono" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Issue date" htmlFor="i-issue" error={errors.issueDate?.message}>
                  <Input id="i-issue" type="date" {...register("issueDate")} />
                </Field>
                <Field label="Due date" htmlFor="i-due" error={errors.dueDate?.message}>
                  <Input id="i-due" type="date" aria-invalid={!!errors.dueDate} {...register("dueDate")} />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader title="Line items" description={errors.items?.root?.message ?? errors.items?.message} />
            <CardContent>
              <div className="hidden grid-cols-[16px_minmax(0,1fr)_72px_108px_96px_32px] gap-2 px-1 pb-2 text-xs font-medium text-muted-foreground sm:grid">
                <span />
                <span>Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit price</span>
                <span className="text-right">Amount</span>
                <span />
              </div>
              <ul className="space-y-3 sm:space-y-2">
                <AnimatePresence initial={false}>
                  {fields.map((f, idx) => {
                    const e = errors.items?.[idx];
                    return (
                      <motion.li
                        key={f.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-[minmax(0,1fr)_72px_32px] items-start gap-2 rounded-lg border border-border p-2.5 sm:grid-cols-[16px_minmax(0,1fr)_72px_108px_96px_32px] sm:border-0 sm:p-0"
                      >
                        <GripVertical className="mt-2.5 hidden size-4 text-muted-foreground/50 sm:block" aria-hidden />
                        <div className="col-span-3 sm:col-span-1">
                          <Input aria-label={`Item ${idx + 1} description`} placeholder="Item or service" aria-invalid={!!e?.description} {...register(`items.${idx}.description`)} />
                          {e?.description && <p className="mt-1 text-xs text-danger">{e.description.message}</p>}
                        </div>
                        <Input
                          aria-label={`Item ${idx + 1} quantity`}
                          type="number"
                          step="any"
                          min={0}
                          inputMode="decimal"
                          className="text-right tabular"
                          aria-invalid={!!e?.quantity}
                          {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                        />
                        <Input
                          aria-label={`Item ${idx + 1} unit price`}
                          type="number"
                          step="0.01"
                          min={0}
                          inputMode="decimal"
                          className="text-right tabular"
                          aria-invalid={!!e?.unitPrice}
                          {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })}
                        />
                        <p className="col-span-2 flex h-9 items-center justify-end text-sm font-medium tabular sm:col-span-1">
                          {formatCurrency(lineTotal(safeItems[idx] ?? { quantity: 0, unitPrice: 0 }), "USD", { cents: true })}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove item ${idx + 1}`}
                          disabled={fields.length === 1}
                          onClick={() => remove(idx)}
                          className="row-start-1 col-start-3 sm:row-auto sm:col-auto"
                        >
                          <Trash2 />
                        </Button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => append({ id: uid("li"), description: "", quantity: 1, unitPrice: 0 })}>
                <Plus /> Add line item
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="grid grid-cols-2 gap-3 self-start">
                <Field label="Tax rate (%)" htmlFor="i-tax" error={errors.taxRate?.message}>
                  <Input id="i-tax" type="number" step="0.1" min={0} max={100} inputMode="decimal" {...register("taxRate", { valueAsNumber: true })} />
                </Field>
                <Field label="Discount (%)" htmlFor="i-discount" error={errors.discount?.message}>
                  <Input id="i-discount" type="number" step="0.5" min={0} max={100} inputMode="decimal" {...register("discount", { valueAsNumber: true })} />
                </Field>
                <Field label="Notes" htmlFor="i-notes" className="col-span-2">
                  <Textarea id="i-notes" maxLength={800} {...register("notes")} />
                </Field>
              </div>
              <dl className="space-y-2.5 rounded-xl bg-subtle p-4 text-sm" aria-live="polite">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular">{formatCurrency(totals.subtotal, "USD", { cents: true })}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="tabular">−{formatCurrency(totals.discountAmount, "USD", { cents: true })}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd className="tabular">{formatCurrency(totals.tax, "USD", { cents: true })}</dd></div>
                <div className="flex items-baseline justify-between border-t border-border pt-3">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-display text-2xl font-semibold tracking-tight tabular">{formatCurrency(totals.total, "USD", { cents: true })}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </form>

        <div className={mobileView === "edit" ? "hidden xl:block" : ""}>
          <div className="xl:sticky xl:top-24">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
            {preview}
          </div>
        </div>
      </div>
    </>
  );
}
