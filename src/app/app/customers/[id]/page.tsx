"use client";

import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPin,
  MessageSquarePlus,
  Pencil,
  Phone,
  Plus,
  Receipt,
  Trash2,
  UserRoundSearch,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { CustomerFormDialog } from "@/components/app/customers/customer-form";
import { CustomerStatusBadge, InvoiceStatusBadge } from "@/components/app/status";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCan } from "@/hooks/use-permission";
import { invoiceTotal, lookup } from "@/lib/selectors";
import { effectiveStatus, formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { useAppStore, useWorkspaceData } from "@/store/app-store";

export default function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const data = useWorkspaceData();
  const addNote = useAppStore((s) => s.addCustomerNote);
  const deleteCustomer = useAppStore((s) => s.deleteCustomer);
  const canManage = useCan("customers.manage");
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [note, setNote] = useState("");

  const customer = data.customers.find((c) => c.id === id);
  const owner = useMemo(() => lookup(data.employees)(customer?.ownerId), [data.employees, customer?.ownerId]);
  const invoices = useMemo(() => data.invoices.filter((i) => i.customerId === id).sort((a, b) => b.issueDate.localeCompare(a.issueDate)), [data.invoices, id]);
  const deals = data.deals.filter((d) => d.customerId === id);
  const projects = data.projects.filter((p) => p.customerId === id);

  if (!customer) {
    return (
      <Card>
        <EmptyState
          icon={<UserRoundSearch />}
          title="Customer not found"
          description="This customer doesn’t exist in the current workspace. It may have been deleted, or belongs to another workspace."
          action={<Button asChild variant="outline"><Link href="/app/customers"><ArrowLeft /> Back to customers</Link></Button>}
        />
      </Card>
    );
  }

  const paid = invoices.filter((i) => effectiveStatus(i) === "Paid");
  const outstanding = invoices.filter((i) => ["Pending", "Overdue"].includes(effectiveStatus(i)));
  const openPipeline = deals.filter((d) => d.stage !== "Won").reduce((s, d) => s + d.value, 0);

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    const body = note.trim().slice(0, 1000);
    if (!body) return;
    addNote(customer.id, body);
    setNote("");
    toast.success("Note added");
  };

  const timeline = [
    ...customer.notes.map((n) => ({ id: n.id, at: n.createdAt, title: `${n.author} added a note`, body: n.body, tone: "primary" as const })),
    ...invoices.map((i) => ({ id: i.id, at: i.paidAt ?? i.issueDate, title: i.paidAt ? `${i.number} paid` : `${i.number} issued`, body: formatCurrency(invoiceTotal(i), "USD", { cents: true }), tone: i.paidAt ? ("success" as const) : ("info" as const) })),
    { id: "created", at: customer.createdAt, title: "Customer created", body: `Added to ${customer.status === "Lead" ? "leads" : "customers"}`, tone: "neutral" as const },
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <Link href="/app/customers" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Customers
      </Link>
      <PageHeader
        title={
          <span className="flex items-center gap-3.5">
            <Avatar name={customer.company} size="lg" />
            <span className="min-w-0">
              <span className="block truncate">{customer.company}</span>
              <span className="mt-1 flex flex-wrap items-center gap-2 text-sm font-normal tracking-normal text-muted-foreground">
                <CustomerStatusBadge status={customer.status} />
                <Badge tone="outline">{customer.category}</Badge>
                <span>Customer since {formatDate(customer.createdAt)}</span>
              </span>
            </span>
          </span>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)} disabled={!canManage}><Pencil /> Edit</Button>
            <Button variant="outline" onClick={() => setConfirm(true)} disabled={!canManage} aria-label="Delete customer"><Trash2 /></Button>
            <Button asChild><Link href={`/app/invoices/new?customer=${customer.id}`}><Plus /> New invoice</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Lifetime value", formatCurrency(customer.lifetimeValue)],
          ["Paid invoices", `${paid.length} · ${formatCurrency(paid.reduce((s, i) => s + invoiceTotal(i), 0))}`],
          ["Outstanding", formatCurrency(outstanding.reduce((s, i) => s + invoiceTotal(i), 0))],
          ["Open pipeline", formatCurrency(openPipeline)],
        ].map(([k, v]) => (
          <Card key={k} className="p-4">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="mt-1 font-display text-lg font-semibold tracking-tight tabular">{v}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardHeader title="Contact" />
            <CardContent>
              <div className="mb-4 flex items-center gap-3">
                <Avatar name={customer.name} size="md" />
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">Primary contact</p>
                </div>
              </div>
              <dl className="space-y-3 text-[13.5px]">
                {[
                  [Mail, <a key="e" href={`mailto:${customer.email}`} className="text-primary hover:underline">{customer.email}</a>],
                  [Phone, customer.phone || "—"],
                  [MapPin, `${customer.city}, ${customer.country}`],
                ].map(([Icon, v], i) => {
                  const I = Icon as typeof Mail;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <dt className="sr-only">{["Email", "Phone", "Location"][i]}</dt>
                      <I className="size-4 shrink-0 text-muted-foreground" />
                      <dd className="min-w-0 truncate">{v as React.ReactNode}</dd>
                    </div>
                  );
                })}
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Company details" />
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-[13.5px]">
                <div><dt className="text-xs text-muted-foreground">Industry</dt><dd className="mt-0.5 flex items-center gap-1.5"><Building2 className="size-3.5 text-muted-foreground" />{customer.industry || "—"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Segment</dt><dd className="mt-0.5">{customer.category}</dd></div>
                <div className="col-span-2"><dt className="text-xs text-muted-foreground">Website</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 truncate"><Globe className="size-3.5 text-muted-foreground" />
                    {customer.website ? <a href={customer.website} target="_blank" rel="noopener noreferrer nofollow" className="truncate text-primary hover:underline">{customer.website.replace(/^https?:\/\//, "")}</a> : "—"}
                  </dd>
                </div>
                <div><dt className="text-xs text-muted-foreground">Account owner</dt><dd className="mt-0.5">{owner?.name ?? "—"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Last contact</dt><dd className="mt-0.5">{timeAgo(customer.lastContactAt)}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card className="xl:col-span-2">
          <Tabs defaultValue="activity">
            <div className="border-b border-border px-5 pt-4 pb-3">
              <TabsList>
                <TabsTrigger value="activity">Notes & activity</TabsTrigger>
                <TabsTrigger value="invoices">Invoices <span className="text-muted-foreground">{invoices.length}</span></TabsTrigger>
                <TabsTrigger value="deals">Deals & projects <span className="text-muted-foreground">{deals.length + projects.length}</span></TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="activity" className="p-5">
              <form onSubmit={submitNote} className="rounded-xl border border-border bg-subtle p-3">
                <label htmlFor="note" className="sr-only">Add a note</label>
                <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Add a note about a call, meeting or next step…" className="min-h-[72px] border-0 bg-transparent shadow-none focus-visible:ring-0" />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground tabular">{note.length}/1000</span>
                  <Button type="submit" size="sm" disabled={!note.trim()}><MessageSquarePlus /> Add note</Button>
                </div>
              </form>
              <ol className="relative mt-6 space-y-5 border-l border-border pl-6">
                {timeline.map((t) => (
                  <li key={t.id} className="relative">
                    <span
                      className={`absolute top-1 -left-[29px] size-2.5 rounded-full ring-4 ring-card ${{ primary: "bg-primary", success: "bg-success", info: "bg-info", neutral: "bg-muted-foreground" }[t.tone]}`}
                      aria-hidden
                    />
                    <p className="text-[13.5px] font-medium">{t.title}</p>
                    <p className="mt-0.5 text-[13.5px] whitespace-pre-line text-muted-foreground">{t.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(t.at)} · {timeAgo(t.at)}</p>
                  </li>
                ))}
              </ol>
            </TabsContent>

            <TabsContent value="invoices">
              {invoices.length === 0 ? (
                <EmptyState icon={<Receipt />} title="No invoices yet" description="Create an invoice for this customer to get paid."
                  action={<Button asChild size="sm"><Link href={`/app/invoices/new?customer=${customer.id}`}>Create invoice</Link></Button>} />
              ) : (
                <ul className="divide-y divide-border">
                  {invoices.map((i) => (
                    <li key={i.id}>
                      <Link href={`/app/invoices/${i.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-subtle">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{i.number}</p>
                          <p className="text-xs text-muted-foreground">Issued {formatDate(i.issueDate)} · Due {formatDate(i.dueDate)}</p>
                        </div>
                        <InvoiceStatusBadge status={effectiveStatus(i)} />
                        <p className="w-28 text-right font-semibold tabular">{formatCurrency(invoiceTotal(i), "USD", { cents: true })}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="deals" className="p-5">
              {deals.length + projects.length === 0 ? (
                <EmptyState icon={<Building2 />} title="Nothing linked yet" description="Deals and projects for this customer will show here." />
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Deals</p>
                    <ul className="space-y-2">
                      {deals.map((d) => (
                        <li key={d.id} className="rounded-lg border border-border p-3">
                          <p className="text-[13.5px] font-medium">{d.title}</p>
                          <p className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{d.stage}</span><span className="tabular">{formatCurrency(d.value)}</span></p>
                        </li>
                      ))}
                      {!deals.length && <li className="text-sm text-muted-foreground">No deals</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Projects</p>
                    <ul className="space-y-2">
                      {projects.map((p) => (
                        <li key={p.id}>
                          <Link href={`/app/projects/${p.id}`} className="block rounded-lg border border-border p-3 hover:bg-subtle">
                            <p className="text-[13.5px] font-medium">{p.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{p.status} · due {formatDate(p.dueDate)}</p>
                          </Link>
                        </li>
                      ))}
                      {!projects.length && <li className="text-sm text-muted-foreground">No projects</li>}
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <CustomerFormDialog open={editOpen} onOpenChange={setEditOpen} customer={customer} />
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Delete ${customer.company}?`}
        description="This removes the customer and their open deals from this workspace."
        onConfirm={() => {
          deleteCustomer(customer.id);
          toast.success("Customer deleted");
          router.push("/app/customers");
        }}
      />
    </>
  );
}
