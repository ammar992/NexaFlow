"use client";

import { Building, LayoutGrid, List, Lock, Mail, MapPin, Pencil, Plus, Search, ShieldCheck, Trash2, UserRound, UserRoundX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { EmployeeFormDialog } from "@/components/app/employees/employee-form";
import { EmploymentBadge } from "@/components/app/status";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog, Dialog, SheetContent } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { EmptyState, Progress, Switch } from "@/components/ui/misc";
import { Segmented, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCan } from "@/hooks/use-permission";
import { PERMISSION_GROUPS } from "@/lib/mock/seed";
import { lookup } from "@/lib/selectors";
import { formatDate } from "@/lib/utils";
import { useAppStore, useWorkspaceData } from "@/store/app-store";
import { useSession } from "@/store/session-store";
import { ROLES, type Employee, type Role } from "@/types";

const ROLE_COPY: Record<Role, string> = {
  "Super Admin": "Full control across the workspace, including billing.",
  "Company Admin": "Manages people, finance and settings.",
  Manager: "Runs projects and customer relationships.",
  Employee: "Works on assigned tasks and projects.",
};

export default function EmployeesPage() {
  return (
    <Suspense>
      <Employees />
    </Suspense>
  );
}

function Employees() {
  const params = useSearchParams();
  const router = useRouter();
  const data = useWorkspaceData();
  const canManage = useCan("employees.manage");
  const [tab, setTab] = useState(params.get("tab") ?? "directory");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(params.get("focus"));

  const openAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Employees"
        description={`${data.employees.length} people across ${data.departments.length} departments`}
        actions={<Button onClick={openAdd} disabled={!canManage}><Plus /> Add employee</Button>}
      />
      <Tabs value={tab} onValueChange={(v) => { setTab(v); router.replace(`/app/employees?tab=${v}`, { scroll: false }); }}>
        <TabsList className="mb-4">
          <TabsTrigger value="directory"><UserRound /> Directory</TabsTrigger>
          <TabsTrigger value="departments"><Building /> Departments</TabsTrigger>
          <TabsTrigger value="roles"><ShieldCheck /> Roles & permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="directory">
          <Directory onSelect={setSelectedId} onAdd={openAdd} />
        </TabsContent>
        <TabsContent value="departments">
          <Departments />
        </TabsContent>
        <TabsContent value="roles">
          <Permissions />
        </TabsContent>
      </Tabs>

      <EmployeeSheet
        id={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={(e) => { setEditing(e); setFormOpen(true); }}
      />
      <EmployeeFormDialog open={formOpen} onOpenChange={setFormOpen} employee={editing} />
    </>
  );
}

function Directory({ onSelect, onAdd }: { onSelect: (id: string) => void; onAdd: () => void }) {
  const { employees, departments } = useWorkspaceData();
  const canManage = useCan("employees.manage");
  const [q, setQ] = useState("");
  const [dep, setDep] = useState("all");
  const [view, setView] = useState<"table" | "grid">("table");
  const depOf = useMemo(() => lookup(departments), [departments]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return employees.filter((e) => (dep === "all" || e.departmentId === dep) && (!t || [e.name, e.email, e.title].some((f) => f.toLowerCase().includes(t))));
  }, [employees, q, dep]);

  const columns: Column<Employee>[] = [
    {
      id: "name",
      header: "Name",
      sortValue: (e) => e.name,
      cell: (e) => (
        <div className="flex items-center gap-3">
          <Avatar name={e.name} />
          <div className="min-w-0">
            <p className="truncate font-medium">{e.name}</p>
            <p className="truncate text-xs text-muted-foreground">{e.email}</p>
          </div>
        </div>
      ),
    },
    { id: "title", header: "Job title", sortValue: (e) => e.title, cell: (e) => e.title },
    { id: "dep", header: "Department", sortValue: (e) => depOf(e.departmentId)?.name ?? "", cell: (e) => <span className="text-muted-foreground">{depOf(e.departmentId)?.name}</span>, hideBelow: "lg" },
    { id: "role", header: "Role", sortValue: (e) => ROLES.indexOf(e.role), cell: (e) => <Badge tone={e.role === "Employee" ? "outline" : "primary"}>{e.role}</Badge> },
    { id: "status", header: "Status", sortValue: (e) => e.status, cell: (e) => <EmploymentBadge status={e.status} /> },
    { id: "joined", header: "Joined", sortValue: (e) => e.joinedAt, cell: (e) => <span className="text-muted-foreground">{formatDate(e.joinedAt)}</span>, hideBelow: "xl" },
  ];

  const empty = (
    <EmptyState
      icon={employees.length ? <UserRoundX /> : <UserRound />}
      title={employees.length ? "No one matches" : "No employees yet"}
      description={employees.length ? "Try another search or department." : "Invite your team to collaborate in this workspace."}
      action={employees.length ? <Button variant="outline" onClick={() => { setQ(""); setDep("all"); }}>Clear filters</Button> : <Button onClick={onAdd} disabled={!canManage}><Plus /> Add employee</Button>}
    />
  );

  return (
    <Card>
      <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people…" aria-label="Search employees" className="pl-9" />
        </div>
        <Select aria-label="Department" value={dep} onChange={(e) => setDep(e.target.value)} className="sm:w-48">
          <option value="all">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Segmented
          label="View"
          className="sm:ml-auto"
          value={view}
          onChange={setView}
          options={[{ value: "table", label: "Table", icon: <List /> }, { value: "grid", label: "Cards", icon: <LayoutGrid /> }]}
        />
      </div>
      {view === "table" ? (
        <DataTable
          caption="Employee directory"
          rows={rows}
          columns={columns}
          getRowId={(e) => e.id}
          onRowClick={(e) => onSelect(e.id)}
          empty={empty}
          mobileCard={(e) => (
            <div className="flex items-center gap-3">
              <Avatar name={e.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{e.name}</p>
                <p className="truncate text-xs text-muted-foreground">{e.title}</p>
              </div>
              <EmploymentBadge status={e.status} />
            </div>
          )}
        />
      ) : rows.length === 0 ? (
        empty
      ) : (
        <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onSelect(e.id)}
                className="flex w-full flex-col items-center rounded-xl border border-border p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-pop"
              >
                <Avatar name={e.name} size="lg" />
                <p className="mt-3 font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.title}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  <Badge tone="outline">{depOf(e.departmentId)?.name}</Badge>
                  <EmploymentBadge status={e.status} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function EmployeeSheet({ id, onClose, onEdit }: { id: string | null; onClose: () => void; onEdit: (e: Employee) => void }) {
  const data = useWorkspaceData();
  const deleteEmployee = useAppStore((s) => s.deleteEmployee);
  const me = useSession((s) => s.user);
  const canManage = useCan("employees.manage");
  const [confirm, setConfirm] = useState(false);
  const employee = data.employees.find((e) => e.id === id);
  const department = data.departments.find((d) => d.id === employee?.departmentId);
  const tasks = data.tasks.filter((t) => t.assigneeId === id);
  const projects = data.projects.filter((p) => id && p.memberIds.includes(id));
  const isSelf = employee?.email === me?.email;

  return (
    <Dialog open={!!employee} onOpenChange={(v) => !v && onClose()}>
      {employee && (
        <SheetContent
          title={employee.name}
          description={employee.title}
          footer={
            <>
              <Button variant="outline" disabled={!canManage || isSelf} onClick={() => setConfirm(true)}><Trash2 /> Remove</Button>
              <Button disabled={!canManage} onClick={() => { onClose(); onEdit(employee); }}><Pencil /> Edit</Button>
            </>
          }
        >
          <div className="p-5">
            <div className="flex items-center gap-4">
              <Avatar name={employee.name} size="xl" />
              <div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="primary">{employee.role}</Badge>
                  <EmploymentBadge status={employee.status} />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground"><Mail className="size-3.5" /> {employee.email}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground"><MapPin className="size-3.5" /> {employee.location}</p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border p-4 text-[13.5px]">
              <div><dt className="text-xs text-muted-foreground">Department</dt><dd className="mt-0.5 font-medium">{department?.name ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Joined</dt><dd className="mt-0.5 font-medium">{formatDate(employee.joinedAt)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Open tasks</dt><dd className="mt-0.5 font-medium tabular">{tasks.filter((t) => t.status !== "completed").length}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Projects</dt><dd className="mt-0.5 font-medium tabular">{projects.length}</dd></div>
            </dl>
            <div className="mt-5">
              <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">Productivity score</span><span className="font-semibold tabular">{employee.productivity}</span></div>
              <Progress value={employee.productivity} className="mt-2" label="Productivity" />
              <p className="mt-1.5 text-xs text-muted-foreground">Illustrative score from task throughput and on-time delivery.</p>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Projects</p>
              <ul className="space-y-1.5">
                {projects.map((p) => <li key={p.id} className="rounded-lg bg-muted px-3 py-2 text-[13px]">{p.name}</li>)}
                {!projects.length && <li className="text-sm text-muted-foreground">Not assigned to any project.</li>}
              </ul>
            </div>
          </div>
          <ConfirmDialog
            open={confirm}
            onOpenChange={setConfirm}
            title={`Remove ${employee.name}?`}
            description="They lose access to this workspace. Their tasks become unassigned."
            confirmLabel="Remove"
            onConfirm={() => {
              deleteEmployee(employee.id);
              toast.success("Employee removed", { description: employee.name });
              onClose();
            }}
          />
        </SheetContent>
      )}
    </Dialog>
  );
}

function Departments() {
  const { departments, employees } = useWorkspaceData();
  const addDepartment = useAppStore((s) => s.addDepartment);
  const canManage = useCan("employees.manage");
  const [name, setName] = useState("");
  const personOf = lookup(employees);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = name.trim().slice(0, 40);
    if (!v) return;
    if (departments.some((d) => d.name.toLowerCase() === v.toLowerCase())) return toast.error("That department already exists");
    addDepartment(v);
    setName("");
    toast.success("Department created", { description: v });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {departments.map((d) => {
        const members = employees.filter((e) => e.departmentId === d.id);
        const lead = personOf(d.leadId);
        return (
          <Card key={d.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{members.length} {members.length === 1 ? "person" : "people"}</p>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Building className="size-4" /></span>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <AvatarStack names={members.map((m) => m.name)} max={5} size="sm" />
              {lead && <p className="text-xs text-muted-foreground">Lead: <span className="font-medium text-foreground">{lead.name}</span></p>}
            </div>
          </Card>
        );
      })}
      <Card className="border-dashed p-5">
        <form onSubmit={submit}>
          <p className="font-semibold">New department</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Group people for reporting and assignment.</p>
          <div className="mt-4 flex gap-2">
            <Input aria-label="Department name" placeholder="e.g. Customer Success" value={name} onChange={(e) => setName(e.target.value)} disabled={!canManage} />
            <Button type="submit" disabled={!canManage || !name.trim()}>Add</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Permissions() {
  const { permissions, employees } = useWorkspaceData();
  const setPermission = useAppStore((s) => s.setPermission);
  const canEdit = useCan("settings.workspace");
  const myRole = useSession((s) => s.user?.role);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {ROLES.map((r) => (
          <Card key={r} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold">{r}</p>
              <span className="text-xs text-muted-foreground tabular">{employees.filter((e) => e.role === r).length} people</span>
            </div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{ROLE_COPY[r]}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Permission matrix"
          description="Changes apply to everyone with that role in this workspace. In production the API enforces this on every request."
        />
        <CardContent className="px-0 pb-2">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <caption className="sr-only">Role permissions</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-3 pl-5 text-left text-xs font-medium text-muted-foreground">Permission</th>
                  {ROLES.map((r) => (
                    <th key={r} scope="col" className="w-32 py-3 text-center text-xs font-medium text-muted-foreground">{r}</th>
                  ))}
                </tr>
              </thead>
              {PERMISSION_GROUPS.map((g) => (
                <tbody key={g.group}>
                  <tr>
                    <th colSpan={5} scope="colgroup" className="bg-subtle py-2 pl-5 text-left text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{g.group}</th>
                  </tr>
                  {g.items.map((item) => (
                    <tr key={item.key} className="border-b border-border/70 last:border-0">
                      <th scope="row" className="py-3 pl-5 text-left font-normal">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.hint}</p>
                      </th>
                      {ROLES.map((r) => {
                        const locked = r === "Super Admin" || !canEdit || (r === "Company Admin" && myRole !== "Super Admin");
                        return (
                          <td key={r} className="py-3 text-center">
                            <span className="inline-flex items-center gap-1.5">
                              <Switch
                                checked={permissions[r]?.[item.key] ?? false}
                                disabled={locked}
                                aria-label={`${item.label} for ${r}`}
                                onCheckedChange={(v) => {
                                  setPermission(r, item.key, v);
                                  toast.success(`${r}: ${item.label} ${v ? "enabled" : "disabled"}`);
                                }}
                              />
                              {r === "Super Admin" && <Lock className="size-3 text-muted-foreground" aria-label="Locked" />}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
