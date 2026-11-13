"use client";

import { CalendarDays, FolderKanban, LayoutGrid, List, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { ProjectFormDialog } from "@/components/app/projects/forms";
import { PriorityBadge, ProjectStatusBadge } from "@/components/app/status";
import { AvatarStack } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState, Progress } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { useCan } from "@/hooks/use-permission";
import { lookup, projectProgress } from "@/lib/selectors";
import { cn, daysUntil, formatCurrency, formatDate } from "@/lib/utils";
import { useWorkspaceData } from "@/store/app-store";
import type { Project, ProjectStatus } from "@/types";

const FILTERS: (ProjectStatus | "All")[] = ["All", "Active", "Planning", "On hold", "Completed"];

export default function ProjectsPage() {
  const router = useRouter();
  const data = useWorkspaceData();
  const canManage = useCan("projects.manage");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [open, setOpen] = useState(false);
  const personOf = useMemo(() => lookup(data.employees), [data.employees]);
  const customerOf = useMemo(() => lookup(data.customers), [data.customers]);

  const rows = data.projects.filter((p) => filter === "All" || p.status === filter);

  const Deadline = ({ p }: { p: Project }) => {
    const d = daysUntil(p.dueDate);
    const late = p.status !== "Completed" && d < 0;
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs", late ? "font-medium text-danger" : "text-muted-foreground")}>
        <CalendarDays className="size-3.5" />
        {p.status === "Completed" ? `Delivered ${formatDate(p.dueDate, "short")}` : late ? `${Math.abs(d)} days overdue` : `${d} days left`}
      </span>
    );
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${data.projects.filter((p) => p.status === "Active").length} active · ${data.projects.length} total`}
        actions={<Button onClick={() => setOpen(true)} disabled={!canManage}><Plus /> Create project</Button>}
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto [mask-image:linear-gradient(90deg,#000_85%,transparent)] sm:[mask-image:none]">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn("h-8 shrink-0 rounded-lg px-3 text-[13px] font-medium transition-colors", filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted")}
            >
              {f}
            </button>
          ))}
        </div>
        <Segmented compact label="View" className="shrink-0" value={view} onChange={setView} options={[{ value: "grid", label: "Cards", icon: <LayoutGrid /> }, { value: "list", label: "List", icon: <List /> }]} />
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderKanban />}
            title={data.projects.length ? `No ${filter.toLowerCase()} projects` : "No projects yet"}
            description="Projects group tasks, people and deadlines for a client or initiative."
            action={<Button onClick={() => setOpen(true)} disabled={!canManage}><Plus /> Create project</Button>}
          />
        </Card>
      ) : view === "grid" ? (
        <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {rows.map((p) => {
            const pct = projectProgress(p, data.tasks);
            const taskCount = data.tasks.filter((t) => t.projectId === p.id).length;
            return (
              <li key={p.id}>
                <Link
                  href={`/app/projects/${p.id}`}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-semibold group-hover:text-primary">{p.name}</p>
                      <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{customerOf(p.customerId)?.company ?? "Internal"}</p>
                    </div>
                    <ProjectStatusBadge status={p.status} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-[13px] text-muted-foreground">{p.description}</p>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-muted-foreground">{taskCount} tasks</span>
                      <span className="font-semibold tabular">{pct}%</span>
                    </div>
                    <Progress value={pct} tone={pct === 100 ? "success" : "primary"} label={`${p.name} progress`} />
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <AvatarStack names={p.memberIds.map((id) => personOf(id)?.name ?? "?")} max={4} />
                    <Deadline p={p} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Card>
          <DataTable
            caption="Projects"
            rows={rows}
            getRowId={(p) => p.id}
            onRowClick={(p) => router.push(`/app/projects/${p.id}`)}
            columns={[
              { id: "name", header: "Project", sortValue: (p) => p.name, cell: (p) => <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{customerOf(p.customerId)?.company ?? "Internal"}</p></div> },
              { id: "status", header: "Status", sortValue: (p) => p.status, cell: (p) => <ProjectStatusBadge status={p.status} /> },
              { id: "priority", header: "Priority", cell: (p) => <PriorityBadge priority={p.priority} />, hideBelow: "lg" },
              { id: "progress", header: "Progress", sortValue: (p) => projectProgress(p, data.tasks), cell: (p) => <div className="flex w-36 items-center gap-2"><Progress value={projectProgress(p, data.tasks)} /><span className="text-xs tabular">{projectProgress(p, data.tasks)}%</span></div> },
              { id: "budget", header: "Budget", align: "right", sortValue: (p) => p.budget, cell: (p) => formatCurrency(p.budget), hideBelow: "xl" },
              { id: "due", header: "Deadline", sortValue: (p) => p.dueDate, cell: (p) => <Deadline p={p} /> },
            ]}
            mobileCard={(p) => (
              <div>
                <div className="flex items-center justify-between gap-2"><p className="truncate text-[14px] font-medium">{p.name}</p><ProjectStatusBadge status={p.status} /></div>
                <Progress value={projectProgress(p, data.tasks)} className="mt-2.5" />
                <div className="mt-2"><Deadline p={p} /></div>
              </div>
            )}
          />
        </Card>
      )}

      <ProjectFormDialog open={open} onOpenChange={setOpen} onSaved={(id) => router.push(`/app/projects/${id}`)} />
    </>
  );
}
