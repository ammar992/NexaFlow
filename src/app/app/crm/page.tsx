"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft, CalendarDays, MoreHorizontal, Plus, Target, TrendingUp, Trophy, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/app/app-shell";
import { KanbanBoard } from "@/components/app/kanban";
import { StatCard } from "@/components/app/stat-card";
import { CustomerStatusBadge } from "@/components/app/status";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, Input, Select } from "@/components/ui/input";
import { useCan } from "@/hooks/use-permission";
import { lookup } from "@/lib/selectors";
import { cn, daysUntil, formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { useAppStore, useWorkspaceData } from "@/store/app-store";
import { DEAL_STAGES, type Deal, type DealStage } from "@/types";

const STAGE_COLORS: Record<DealStage, string> = {
  Lead: "var(--chart-axis)",
  Qualified: "var(--chart-3)",
  Proposal: "var(--chart-1)",
  Negotiation: "var(--chart-4)",
  Won: "var(--chart-2)",
};
const PROBABILITY: Record<DealStage, number> = { Lead: 0.1, Qualified: 0.3, Proposal: 0.5, Negotiation: 0.75, Won: 1 };

const dealSchema = z.object({
  title: z.string().trim().min(3, "Give the deal a name").max(90),
  customerId: z.string().min(1, "Choose a customer"),
  ownerId: z.string().min(1, "Choose an owner"),
  value: z.number({ error: "Enter a value" }).positive("Must be greater than 0").max(100_000_000),
  stage: z.enum(["Lead", "Qualified", "Proposal", "Negotiation", "Won"]),
  closeDate: z.string().min(1, "Pick a close date"),
});
type DealValues = z.infer<typeof dealSchema>;

export default function CrmPage() {
  const data = useWorkspaceData();
  const moveDeal = useAppStore((s) => s.moveDeal);
  const canManage = useCan("customers.manage");
  const [open, setOpen] = useState(false);
  const customerOf = useMemo(() => lookup(data.customers), [data.customers]);
  const ownerOf = useMemo(() => lookup(data.employees), [data.employees]);

  const stats = useMemo(() => {
    const open = data.deals.filter((d) => d.stage !== "Won");
    const won = data.deals.filter((d) => d.stage === "Won");
    return {
      pipeline: open.reduce((s, d) => s + d.value, 0),
      weighted: open.reduce((s, d) => s + d.value * PROBABILITY[d.stage], 0),
      won: won.reduce((s, d) => s + d.value, 0),
      winRate: data.deals.length ? (won.length / data.deals.length) * 100 : 0,
      openCount: open.length,
    };
  }, [data.deals]);

  const leads = data.customers.filter((c) => c.status === "Lead").slice(0, 6);

  const move = (id: string, stage: DealStage) => {
    if (!canManage) return toast.error("You don’t have permission to move deals");
    moveDeal(id, stage);
    const deal = data.deals.find((d) => d.id === id);
    if (stage === "Won") toast.success("Deal won", { description: deal?.title });
    else toast(`Moved to ${stage}`, { description: deal?.title });
  };

  return (
    <>
      <PageHeader
        title="CRM"
        description="Sales pipeline and leads. Drag deals between stages."
        actions={<Button onClick={() => setOpen(true)} disabled={!canManage}><Plus /> New deal</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard index={0} label="Open pipeline" value={stats.pipeline} format={(n) => formatCurrency(n)} icon={<Wallet />} />
        <StatCard index={1} label="Weighted forecast" value={stats.weighted} format={(n) => formatCurrency(n)} icon={<TrendingUp />} />
        <StatCard index={2} label="Won (all time)" value={stats.won} format={(n) => formatCurrency(n)} icon={<Trophy />} />
        <StatCard index={3} label="Win rate" value={stats.winRate} format={(n) => `${n.toFixed(1)}%`} icon={<Target />} />
      </div>

      <div className="mt-5">
        <KanbanBoard<Deal, DealStage>
          label="Deal pipeline"
          columns={DEAL_STAGES.map((s) => ({ id: s, label: s, color: STAGE_COLORS[s] }))}
          items={data.deals}
          getId={(d) => d.id}
          getColumn={(d) => d.stage}
          onMove={move}
          columnMeta={(items) => formatCurrency(items.reduce((s, d) => s + d.value, 0), "USD", { compact: true })}
          emptyLabel="Drag a deal here"
          renderCard={(d) => {
            const customer = customerOf(d.customerId);
            const owner = ownerOf(d.ownerId);
            const due = daysUntil(d.closeDate);
            return (
              <article className="rounded-lg border border-border bg-card p-3 shadow-card transition-shadow hover:shadow-pop">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13.5px] leading-snug font-medium">{d.title}</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        aria-label={`Move ${d.title}`}
                        className="-mt-1 -mr-1 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Move to stage</DropdownMenuLabel>
                      {DEAL_STAGES.filter((s) => s !== d.stage).map((s) => (
                        <DropdownMenuItem key={s} onSelect={() => move(d.id, s)}>
                          <ArrowRightLeft /> {s}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {customer && (
                  <Link
                    href={`/app/customers/${customer.id}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="mt-1 block truncate text-xs text-muted-foreground hover:text-primary"
                  >
                    {customer.company}
                  </Link>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[13.5px] font-semibold tabular">{formatCurrency(d.value)}</span>
                  <span className="flex items-center gap-2">
                    <span className={cn("flex items-center gap-1 text-[11px]", d.stage !== "Won" && due < 0 ? "text-danger" : "text-muted-foreground")}>
                      <CalendarDays className="size-3" />
                      {formatDate(d.closeDate, "short")}
                    </span>
                    {owner && <Avatar name={owner.name} size="xs" />}
                  </span>
                </div>
              </article>
            );
          }}
        />
      </div>

      <Card className="mt-5">
        <CardHeader
          title="Newest leads"
          description="Customers marked as Lead"
          action={<Link href="/app/customers" className="text-[13px] font-medium text-primary hover:underline">All customers</Link>}
        />
        <CardContent className="pt-3">
          {leads.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No leads right now.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {leads.map((c) => (
                <li key={c.id}>
                  <Link href={`/app/customers/${c.id}`} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-subtle">
                    <Avatar name={c.company} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{c.company}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.name} · added {timeAgo(c.createdAt)}</p>
                    </div>
                    <CustomerStatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <NewDealDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function NewDealDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { customers, employees } = useWorkspaceData();
  const addDeal = useAppStore((s) => s.addDeal);
  const [inMonth] = useState(() => new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DealValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: { title: "", customerId: "", ownerId: employees[0]?.id ?? "", value: 5000, stage: "Lead", closeDate: inMonth },
  });

  const onSubmit = (v: DealValues) => {
    addDeal({ ...v, closeDate: new Date(v.closeDate).toISOString() });
    toast.success("Deal created", { description: v.title });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="New deal"
        description="Add an opportunity to the pipeline."
        footer={
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" form="deal-form">Create deal</Button>
          </>
        }
      >
        <form id="deal-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Deal name" htmlFor="d-title" error={errors.title?.message} className="sm:col-span-2">
            <Input id="d-title" placeholder="e.g. Website redesign" aria-invalid={!!errors.title} {...register("title")} />
          </Field>
          <Field label="Customer" htmlFor="d-customer" error={errors.customerId?.message}>
            <Select id="d-customer" aria-invalid={!!errors.customerId} {...register("customerId")}>
              <option value="">Select…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
            </Select>
          </Field>
          <Field label="Owner" htmlFor="d-owner" error={errors.ownerId?.message}>
            <Select id="d-owner" {...register("ownerId")}>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </Field>
          <Field label="Value (USD)" htmlFor="d-value" error={errors.value?.message}>
            <Input id="d-value" type="number" min={0} inputMode="numeric" aria-invalid={!!errors.value} {...register("value", { valueAsNumber: true })} />
          </Field>
          <Field label="Stage" htmlFor="d-stage">
            <Select id="d-stage" {...register("stage")}>
              {DEAL_STAGES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Expected close" htmlFor="d-close" error={errors.closeDate?.message}>
            <Input id="d-close" type="date" {...register("closeDate")} />
          </Field>
        </form>
      </DialogContent>
    </Dialog>
  );
}
