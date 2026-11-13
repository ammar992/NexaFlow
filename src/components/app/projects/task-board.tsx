"use client";

import { ArrowRightLeft, CalendarDays, CheckCircle2, Circle, ListChecks, MoreHorizontal, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { KanbanBoard } from "@/components/app/kanban";
import { TaskFormDialog } from "@/components/app/projects/forms";
import { PriorityBadge } from "@/components/app/status";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/misc";
import { useCan } from "@/hooks/use-permission";
import { lookup } from "@/lib/selectors";
import { cn, daysUntil, formatDate } from "@/lib/utils";
import { useAppStore, useWorkspaceData } from "@/store/app-store";
import { PRIORITIES, TASK_STATUSES, type Task, type TaskStatus } from "@/types";

const COLORS: Record<TaskStatus, string> = {
  todo: "var(--chart-axis)",
  in_progress: "var(--chart-3)",
  in_review: "var(--chart-4)",
  completed: "var(--chart-2)",
};
const LABEL = Object.fromEntries(TASK_STATUSES.map((s) => [s.id, s.label])) as Record<TaskStatus, string>;

export function TaskViews({
  tasks,
  view,
  projectId,
  showProject = true,
}: {
  tasks: Task[];
  view: "board" | "list";
  projectId?: string;
  showProject?: boolean;
}) {
  const data = useWorkspaceData();
  const moveTask = useAppStore((s) => s.moveTask);
  const canManage = useCan("tasks.manage");
  const [editing, setEditing] = useState<Task | undefined>();
  const [creating, setCreating] = useState<TaskStatus | null>(null);
  const personOf = useMemo(() => lookup(data.employees), [data.employees]);
  const projectOf = useMemo(() => lookup(data.projects), [data.projects]);

  const move = (id: string, status: TaskStatus) => {
    if (!canManage) return toast.error("You don’t have permission to move tasks");
    moveTask(id, status);
    const t = data.tasks.find((x) => x.id === id);
    if (status === "completed") toast.success("Task completed", { description: t?.title });
    else toast(`Moved to ${LABEL[status]}`, { description: t?.title });
  };

  const Menu = ({ t }: { t: Task }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Task actions for ${t.title}`}
          className="-mt-1 -mr-1 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => setEditing(t)}><Pencil /> Edit task</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Move to</DropdownMenuLabel>
        {TASK_STATUSES.filter((s) => s.id !== t.status).map((s) => (
          <DropdownMenuItem key={s.id} onSelect={() => move(t.id, s.id)}><ArrowRightLeft /> {s.label}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const DueLabel = ({ t }: { t: Task }) => {
    const d = daysUntil(t.dueDate);
    const late = t.status !== "completed" && d < 0;
    return (
      <span className={cn("inline-flex items-center gap-1 text-[11px]", late ? "font-medium text-danger" : "text-muted-foreground")}>
        <CalendarDays className="size-3" />
        {late ? `${Math.abs(d)}d late` : d === 0 && t.status !== "completed" ? "Today" : formatDate(t.dueDate, "short")}
      </span>
    );
  };

  const columns: Column<Task>[] = [
    {
      id: "title",
      header: "Task",
      sortValue: (t) => t.title,
      cell: (t) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={t.status === "completed" ? `Reopen ${t.title}` : `Complete ${t.title}`}
            onClick={(e) => { e.stopPropagation(); move(t.id, t.status === "completed" ? "todo" : "completed"); }}
            className="text-muted-foreground hover:text-success"
          >
            {t.status === "completed" ? <CheckCircle2 className="size-[18px] text-success" /> : <Circle className="size-[18px]" />}
          </button>
          <div className="min-w-0">
            <p className={cn("truncate font-medium", t.status === "completed" && "text-muted-foreground line-through")}>{t.title}</p>
            {showProject && <p className="truncate text-xs text-muted-foreground">{projectOf(t.projectId)?.name}</p>}
          </div>
        </div>
      ),
    },
    { id: "status", header: "Status", sortValue: (t) => TASK_STATUSES.findIndex((s) => s.id === t.status), cell: (t) => (
      <span className="inline-flex items-center gap-1.5 text-[13px]"><span className="size-2 rounded-full" style={{ background: COLORS[t.status] }} />{LABEL[t.status]}</span>
    ) },
    { id: "priority", header: "Priority", sortValue: (t) => PRIORITIES.indexOf(t.priority), cell: (t) => <PriorityBadge priority={t.priority} /> },
    { id: "assignee", header: "Assignee", sortValue: (t) => personOf(t.assigneeId)?.name ?? "~", hideBelow: "lg", cell: (t) => {
      const p = personOf(t.assigneeId);
      return p ? <span className="flex items-center gap-2"><Avatar name={p.name} size="xs" /><span className="truncate text-[13px]">{p.name}</span></span> : <span className="text-muted-foreground">Unassigned</span>;
    } },
    { id: "due", header: "Due", sortValue: (t) => t.dueDate, cell: (t) => <DueLabel t={t} /> },
    { id: "menu", header: "", className: "w-10", cell: (t) => <Menu t={t} /> },
  ];

  return (
    <>
      {view === "board" ? (
        <KanbanBoard<Task, TaskStatus>
          label="Task board"
          columns={TASK_STATUSES.map((s) => ({ id: s.id, label: s.label, color: COLORS[s.id] }))}
          items={tasks}
          getId={(t) => t.id}
          getColumn={(t) => t.status}
          onMove={move}
          emptyLabel="No tasks — drag one here"
          renderCard={(t) => {
            const p = personOf(t.assigneeId);
            return (
              <article
                className="group rounded-lg border border-border bg-card p-3 shadow-card transition-shadow hover:shadow-pop"
                onDoubleClick={() => setEditing(t)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-[13.5px] leading-snug font-medium", t.status === "completed" && "text-muted-foreground line-through")}>{t.title}</p>
                  <Menu t={t} />
                </div>
                {showProject && <p className="mt-1 truncate text-xs text-muted-foreground">{projectOf(t.projectId)?.name}</p>}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <PriorityBadge priority={t.priority} />
                  <span className="flex items-center gap-2">
                    <DueLabel t={t} />
                    {p && <Avatar name={p.name} size="xs" />}
                  </span>
                </div>
              </article>
            );
          }}
        />
      ) : (
        <Card>
          <DataTable
            caption="Tasks"
            rows={tasks}
            columns={columns}
            getRowId={(t) => t.id}
            onRowClick={(t) => setEditing(t)}
            pageSize={12}
            initialSort={{ id: "due", dir: "asc" }}
            empty={<EmptyState icon={<ListChecks />} title="No tasks" description="Create a task to start tracking work." />}
            mobileCard={(t) => (
              <div className="flex items-start gap-3">
                <span className="mt-1 size-2 shrink-0 rounded-full" style={{ background: COLORS[t.status] }} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[14px] font-medium", t.status === "completed" && "text-muted-foreground line-through")}>{t.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{LABEL[t.status]} · {projectOf(t.projectId)?.name}</p>
                </div>
                <div className="flex flex-col items-end gap-1"><PriorityBadge priority={t.priority} /><DueLabel t={t} /></div>
              </div>
            )}
          />
        </Card>
      )}

      <div className="mt-3 flex justify-start">
        <Button variant="ghost" size="sm" onClick={() => setCreating("todo")} disabled={!canManage || !data.projects.length}>
          <Plus /> Add task
        </Button>
      </div>

      <TaskFormDialog open={!!editing} onOpenChange={(v) => !v && setEditing(undefined)} task={editing} />
      <TaskFormDialog open={!!creating} onOpenChange={(v) => !v && setCreating(null)} defaultProjectId={projectId} defaultStatus={creating ?? "todo"} />
    </>
  );
}
