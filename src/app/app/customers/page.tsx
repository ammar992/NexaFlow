"use client";

import { Download, Eye, MoreHorizontal, Pencil, Plus, Search, SearchX, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { CustomerFormDialog } from "@/components/app/customers/customer-form";
import { CustomerStatusBadge } from "@/components/app/status";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { useCan } from "@/hooks/use-permission";
import { lookup } from "@/lib/selectors";
import { downloadCsv, formatCurrency, timeAgo } from "@/lib/utils";
import { useAppStore, useWorkspaceData } from "@/store/app-store";
import type { Customer, CustomerCategory, CustomerStatus } from "@/types";

const STATUSES: (CustomerStatus | "All")[] = ["All", "Active", "Lead", "Inactive", "Churned"];
const CATEGORIES: (CustomerCategory | "All")[] = ["All", "Enterprise", "Mid-market", "SMB", "Startup"];

export default function CustomersPage() {
  const router = useRouter();
  const { customers, employees } = useWorkspaceData();
  const deleteCustomer = useAppStore((s) => s.deleteCustomer);
  const canManage = useCan("customers.manage");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | undefined>();
  const [deleting, setDeleting] = useState<Customer | undefined>();
  const ownerOf = useMemo(() => lookup(employees), [employees]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return customers.filter(
      (c) =>
        (status === "All" || c.status === status) &&
        (category === "All" || c.category === category) &&
        (!term || [c.name, c.company, c.email, c.city].some((f) => f.toLowerCase().includes(term))),
    );
  }, [customers, q, status, category]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { All: customers.length };
    customers.forEach((c) => (m[c.status] = (m[c.status] ?? 0) + 1));
    return m;
  }, [customers]);

  const openAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const columns: Column<Customer>[] = [
    {
      id: "company",
      header: "Customer",
      sortValue: (c) => c.company,
      cell: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.company} />
          <div className="min-w-0">
            <p className="truncate font-medium">{c.company}</p>
            <p className="truncate text-xs text-muted-foreground">{c.name} · {c.email}</p>
          </div>
        </div>
      ),
    },
    { id: "status", header: "Status", sortValue: (c) => c.status, cell: (c) => <CustomerStatusBadge status={c.status} /> },
    { id: "category", header: "Category", sortValue: (c) => c.category, cell: (c) => <Badge tone="outline">{c.category}</Badge>, hideBelow: "lg" },
    { id: "owner", header: "Owner", sortValue: (c) => ownerOf(c.ownerId)?.name ?? "", cell: (c) => <span className="text-muted-foreground">{ownerOf(c.ownerId)?.name ?? "—"}</span>, hideBelow: "xl" },
    { id: "location", header: "Location", cell: (c) => <span className="text-muted-foreground">{c.city}, {c.country}</span>, hideBelow: "xl" },
    { id: "ltv", header: "Lifetime value", align: "right", sortValue: (c) => c.lifetimeValue, cell: (c) => <span className="font-medium">{formatCurrency(c.lifetimeValue)}</span> },
    { id: "contact", header: "Last contact", sortValue: (c) => c.lastContactAt, cell: (c) => <span className="text-muted-foreground">{timeAgo(c.lastContactAt)}</span>, hideBelow: "lg" },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (c) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${c.company}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => router.push(`/app/customers/${c.id}`)}><Eye /> View profile</DropdownMenuItem>
              <DropdownMenuItem disabled={!canManage} onSelect={() => { setEditing(c); setFormOpen(true); }}><Pencil /> Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive disabled={!canManage} onSelect={() => setDeleting(c)}><Trash2 /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${customers.length} customers in this workspace`}
        actions={
          <>
            <Button
              variant="outline"
              disabled={!filtered.length}
              onClick={() =>
                downloadCsv("customers.csv", filtered.map((c) => ({ company: c.company, contact: c.name, email: c.email, phone: c.phone, status: c.status, category: c.category, lifetime_value: c.lifetimeValue })))
              }
            >
              <Download /> Export
            </Button>
            <Button onClick={openAdd} disabled={!canManage}>
              <Plus /> Add customer
            </Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                aria-pressed={status === s}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors ${status === s ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
              >
                {s}
                <span className="text-xs opacity-60 tabular">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 lg:ml-auto">
            <div className="relative flex-1 lg:w-72 lg:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, company, email…" aria-label="Search customers" className="pl-9" />
            </div>
            <Select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="w-auto">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
              ))}
            </Select>
          </div>
        </div>

        <DataTable
          caption="Customers"
          rows={filtered}
          columns={columns}
          getRowId={(c) => c.id}
          onRowClick={(c) => router.push(`/app/customers/${c.id}`)}
          initialSort={{ id: "ltv", dir: "desc" }}
          mobileCard={(c) => (
            <div className="flex items-center gap-3">
              <Avatar name={c.company} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{c.company}</p>
                <p className="truncate text-xs text-muted-foreground">{c.name}</p>
                <div className="mt-1.5"><CustomerStatusBadge status={c.status} /></div>
              </div>
              <p className="text-sm font-semibold tabular">{formatCurrency(c.lifetimeValue, "USD", { compact: true })}</p>
            </div>
          )}
          empty={
            customers.length === 0 ? (
              <EmptyState
                icon={<Users />}
                title="No customers yet"
                description="Add your first customer to start tracking deals, notes and invoices."
                action={<Button onClick={openAdd} disabled={!canManage}><Plus /> Add customer</Button>}
              />
            ) : (
              <EmptyState
                icon={<SearchX />}
                title="No matching customers"
                description="Try a different search term or clear the filters."
                action={<Button variant="outline" onClick={() => { setQ(""); setStatus("All"); setCategory("All"); }}>Clear filters</Button>}
              />
            )
          }
        />
      </Card>

      <CustomerFormDialog open={formOpen} onOpenChange={setFormOpen} customer={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(undefined)}
        title={`Delete ${deleting?.company}?`}
        description="This removes the customer and their open deals from this workspace. Invoices are kept for your records."
        onConfirm={() => {
          if (!deleting) return;
          deleteCustomer(deleting.id);
          toast.success("Customer deleted", { description: deleting.company });
        }}
      />
    </>
  );
}
