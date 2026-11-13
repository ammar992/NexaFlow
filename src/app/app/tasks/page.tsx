"use client";

import { Kanban, List, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { TaskFormDialog } from "@/components/app/projects/forms";
import { TaskViews } from "@/components/app/projects/task-board";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { useCan } from "@/hooks/use-permission";
import { useWorkspaceData } from "@/store/app-store";
import { useSession } from "@/store/session-store";
import { PRIORITIES } from "@/types";

export default function TasksPage() {
  const data = useWorkspaceData();
  const me = useSession((s) => s.user);
  const canManage = useCan("tasks.manage");
  const [view, setView] = useState<"board" | "list">("board");
  const [project, setProject] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [priority, setPriority] = useState("all");
  const [mine, setMine] = useState(false);
  const [open, setOpen] = useState(false);

  const myId = data.employees.find((e) => e.email === me?.email)?.id;
  const tasks = useMemo(
    () =>
      data.tasks.filter(
        (t) =>
          (project === "all" || t.projectId === project) &&
          (assignee === "all" || (assignee === "none" ? !t.assigneeId : t.assigneeId === assignee)) &&
          (priority === "all" || t.priority === priority) &&
          (!mine || t.assigneeId === myId),
      ),
    [data.tasks, project, assignee, priority, mine, myId],
  );
  const open_ = data.tasks.filter((t) => t.status !== "completed").length;

  return (
    <>
      <PageHeader
        title="Tasks"
        description={`${open_} open across ${data.projects.length} projects`}
        actions={<Button onClick={() => setOpen(true)} disabled={!canManage || !data.projects.length}><Plus /> New task</Button>}
      />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Select aria-label="Filter by project" value={project} onChange={(e) => setProject(e.target.value)} className="sm:w-56">
          <option value="all">All projects</option>
          {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select aria-label="Filter by assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} className="sm:w-44">
            <option value="all">Anyone</option>
            <option value="none">Unassigned</option>
            {data.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
          <Select aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="sm:w-36">
            <option value="all">Any priority</option>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </Select>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-muted-foreground sm:ml-2">
          <Switch checked={mine} onCheckedChange={setMine} aria-label="Only my tasks" /> My tasks
        </label>
        <Segmented
          label="Task view"
          className="sm:ml-auto"
          value={view}
          onChange={setView}
          options={[{ value: "board", label: "Board", icon: <Kanban /> }, { value: "list", label: "List", icon: <List /> }]}
        />
      </div>
      <TaskViews tasks={tasks} view={view} />
      <TaskFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
