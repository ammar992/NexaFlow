"use client";

import { ArrowLeft, CalendarDays, FolderSearch, Kanban, List, Pencil, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { ProjectFormDialog } from "@/components/app/projects/forms";
import { TaskViews } from "@/components/app/projects/task-board";
import { PriorityBadge, ProjectStatusBadge } from "@/components/app/status";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState, Progress } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { useCan } from "@/hooks/use-permission";
import { lookup, projectProgress } from "@/lib/selectors";
import { cn, daysUntil, formatCurrency, formatDate } from "@/lib/utils";
import { useAppStore, useWorkspaceData } from "@/store/app-store";
import { TASK_STATUSES } from "@/types";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const data = useWorkspaceData();
  const deleteProject = useAppStore((s) => s.deleteProject);
  const canManage = useCan("projects.manage");
  const [view, setView] = useState<"board" | "list">("board");
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [now] = useState(() => Date.now());
  const personOf = useMemo(() => lookup(data.employees), [data.employees]);

  const project = data.projects.find((p) => p.id === id);
  const tasks = useMemo(() => data.tasks.filter((t) => t.projectId === id), [data.tasks, id]);

  if (!project) {
    return (
      <Card>
        <EmptyState
          icon={<FolderSearch />}
          title="Project not found"
          description="It may have been deleted, or it belongs to a different workspace."
          action={<Button asChild variant="outline"><Link href="/app/projects"><ArrowLeft /> All projects</Link></Button>}
        />
      </Card>
    );
  }

  const pct = projectProgress(project, data.tasks);
  const due = daysUntil(project.dueDate);
  const customer = data.customers.find((c) => c.id === project.customerId);
  const totalDays = Math.max(1, (new Date(project.dueDate).getTime() - new Date(project.startDate).getTime()) / 86_400_000);
  const elapsed = Math.min(100, Math.max(0, ((now - new Date(project.startDate).getTime()) / 86_400_000 / totalDays) * 100));

  return (
    <>
      <Link href="/app/projects" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Projects
      </Link>
      <PageHeader
        title={project.name}
        eyebrow={<div className="flex flex-wrap items-center gap-2"><ProjectStatusBadge status={project.status} /><PriorityBadge priority={project.priority} /></div>}
        description={customer ? <>For <Link className="text-primary hover:underline" href={`/app/customers/${customer.id}`}>{customer.company}</Link></> : "Internal project"}
        actions={
          <>
            <Button variant="outline" onClick={() => setEdit(true)} disabled={!canManage}><Pencil /> Edit</Button>
            <Button variant="outline" onClick={() => setConfirm(true)} disabled={!canManage} aria-label="Delete project"><Trash2 /></Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Completion</p>
              <p className="font-display text-3xl font-semibold tracking-tight tabular">{pct}%</p>
            </div>
            <p className="text-xs text-muted-foreground tabular">{tasks.filter((t) => t.status === "completed").length} of {tasks.length} tasks</p>
          </div>
          <Progress value={pct} className="mt-3 h-2" tone={pct === 100 ? "success" : "primary"} label="Completion" />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {TASK_STATUSES.map((s) => (
              <div key={s.id} className="rounded-lg bg-muted px-2.5 py-2">
                <p className="truncate text-[11px] text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold tabular">{tasks.filter((t) => t.status === s.id).length}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> Timeline</p>
          <p className={cn("mt-1 font-display text-lg font-semibold tracking-tight", project.status !== "Completed" && due < 0 && "text-danger")}>
            {project.status === "Completed" ? "Delivered" : due < 0 ? `${Math.abs(due)} days overdue` : `${due} days left`}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(project.startDate)} → {formatDate(project.dueDate)}</p>
          <Progress value={elapsed} tone={due < 0 && project.status !== "Completed" ? "warning" : "primary"} className="mt-3" label="Time elapsed" />
          <p className="mt-1.5 text-[11px] text-muted-foreground tabular">{Math.round(elapsed)}% of time elapsed</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Wallet className="size-3.5" /> Budget</p>
          <p className="mt-1 font-display text-lg font-semibold tracking-tight tabular">{formatCurrency(project.budget)}</p>
          <p className="mt-3 text-xs text-muted-foreground">Team</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {project.memberIds.map((m) => {
              const p = personOf(m);
              return p ? <li key={m} title={p.name}><Avatar name={p.name} size="sm" /></li> : null;
            })}
            {!project.memberIds.length && <li className="text-xs text-muted-foreground">No members yet</li>}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="About" />
        <CardContent className="pt-2 text-[14px] text-muted-foreground">{project.description || "No description."}</CardContent>
      </Card>

      <div className="mt-6 mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">Tasks</h2>
        <Segmented compact label="Task view" value={view} onChange={setView} options={[{ value: "board", label: "Board", icon: <Kanban /> }, { value: "list", label: "List", icon: <List /> }]} />
      </div>
      <TaskViews tasks={tasks} view={view} projectId={project.id} showProject={false} />

      <ProjectFormDialog open={edit} onOpenChange={setEdit} project={project} />
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Delete ${project.name}?`}
        description={`This permanently removes the project and its ${tasks.length} tasks.`}
        onConfirm={() => {
          deleteProject(project.id);
          toast.success("Project deleted");
          router.push("/app/projects");
        }}
      />
    </>
  );
}
