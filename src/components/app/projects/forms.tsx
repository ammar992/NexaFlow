"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/misc";
import { toDateInput } from "@/lib/utils";
import { projectSchema, taskSchema, type ProjectValues, type TaskValues } from "@/lib/validation";
import { useAppStore, useWorkspaceData } from "@/store/app-store";
import { PRIORITIES, TASK_STATUSES, type Project, type Task, type TaskStatus } from "@/types";

const iso = (d: string) => new Date(`${d}T12:00:00`).toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project?: Project;
  onSaved?: (id: string) => void;
}) {
  const { customers, employees } = useWorkspaceData();
  const addProject = useAppStore((s) => s.addProject);
  const updateProject = useAppStore((s) => s.updateProject);
  const staff = employees.filter((e) => e.status !== "Inactive");

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (!open) return;
    reset(
      project
        ? {
            name: project.name,
            description: project.description,
            customerId: project.customerId ?? "",
            status: project.status,
            priority: project.priority,
            startDate: toDateInput(project.startDate),
            dueDate: toDateInput(project.dueDate),
            budget: project.budget,
            memberIds: project.memberIds,
          }
        : { name: "", description: "", customerId: "", status: "Planning", priority: "Medium", startDate: today(), dueDate: plusDays(45), budget: 10000, memberIds: [] },
    );
  }, [open, project, reset]);

  const onSubmit = async (v: ProjectValues) => {
    await new Promise((r) => setTimeout(r, 400));
    const payload = { ...v, customerId: v.customerId || undefined, startDate: iso(v.startDate), dueDate: iso(v.dueDate) };
    if (project) {
      updateProject(project.id, payload);
      toast.success("Project updated");
      onSaved?.(project.id);
    } else {
      const id = addProject(payload);
      toast.success("Project created", { description: v.name });
      onSaved?.(id);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={project ? "Edit project" : "Create project"}
        description="Set the scope, deadline and who’s working on it."
        className="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" form="project-form" loading={isSubmitting}>{project ? "Save changes" : "Create project"}</Button>
          </>
        }
      >
        <form id="project-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name" htmlFor="p-name" error={errors.name?.message} className="sm:col-span-2">
            <Input id="p-name" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <Field label="Description" htmlFor="p-desc" error={errors.description?.message} className="sm:col-span-2">
            <Textarea id="p-desc" maxLength={600} {...register("description")} />
          </Field>
          <Field label="Customer" htmlFor="p-customer" hint="Optional — leave empty for internal work">
            <Select id="p-customer" {...register("customerId")}>
              <option value="">Internal project</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
            </Select>
          </Field>
          <Field label="Budget (USD)" htmlFor="p-budget" error={errors.budget?.message}>
            <Input id="p-budget" type="number" min={0} inputMode="numeric" {...register("budget", { valueAsNumber: true })} />
          </Field>
          <Field label="Status" htmlFor="p-status">
            <Select id="p-status" {...register("status")}>
              {["Planning", "Active", "On hold", "Completed"].map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Priority" htmlFor="p-priority">
            <Select id="p-priority" {...register("priority")}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Start date" htmlFor="p-start" error={errors.startDate?.message}>
            <Input id="p-start" type="date" {...register("startDate")} />
          </Field>
          <Field label="Deadline" htmlFor="p-due" error={errors.dueDate?.message}>
            <Input id="p-due" type="date" aria-invalid={!!errors.dueDate} {...register("dueDate")} />
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-[13px] font-medium">Team members</legend>
            <Controller
              control={control}
              name="memberIds"
              render={({ field }) => (
                <ul className="scrollbar-thin grid max-h-52 gap-1 overflow-y-auto rounded-lg border border-border p-1.5 sm:grid-cols-2">
                  {staff.map((e) => {
                    const checked = field.value?.includes(e.id);
                    return (
                      <li key={e.id}>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(c) => field.onChange(c ? [...(field.value ?? []), e.id] : (field.value ?? []).filter((x) => x !== e.id))}
                          />
                          <Avatar name={e.name} size="xs" />
                          <span className="min-w-0 truncate text-[13px]">{e.name}</span>
                          <span className="ml-auto hidden truncate text-[11px] text-muted-foreground sm:inline">{e.title}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            />
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultProjectId,
  defaultStatus = "todo",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task;
  defaultProjectId?: string;
  defaultStatus?: TaskStatus;
}) {
  const { projects, employees } = useWorkspaceData();
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<TaskValues>({ resolver: zodResolver(taskSchema) });
  const projectId = useWatch({ control, name: "projectId" });
  const project = projects.find((p) => p.id === projectId);
  const assignable = project?.memberIds.length ? employees.filter((e) => project.memberIds.includes(e.id)) : employees;

  useEffect(() => {
    if (!open) return;
    reset(
      task
        ? { title: task.title, description: task.description, projectId: task.projectId, status: task.status, priority: task.priority, assigneeId: task.assigneeId ?? "", dueDate: toDateInput(task.dueDate) }
        : { title: "", description: "", projectId: defaultProjectId ?? projects[0]?.id ?? "", status: defaultStatus, priority: "Medium", assigneeId: "", dueDate: plusDays(7) },
    );
  }, [open, task, defaultProjectId, defaultStatus, projects, reset]);

  const onSubmit = async (v: TaskValues) => {
    await new Promise((r) => setTimeout(r, 300));
    const payload = { ...v, assigneeId: v.assigneeId || undefined, dueDate: iso(v.dueDate) };
    if (task) {
      updateTask(task.id, payload);
      toast.success("Task updated");
    } else {
      addTask(payload);
      toast.success("Task created", { description: v.title });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={task ? "Edit task" : "New task"}
        footer={
          <>
            {task && (
              <Button
                variant="ghost"
                className="mr-auto text-danger hover:bg-danger-soft hover:text-danger"
                onClick={() => {
                  deleteTask(task.id);
                  toast.success("Task deleted");
                  onOpenChange(false);
                }}
              >
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" form="task-form" loading={isSubmitting}>{task ? "Save" : "Create task"}</Button>
          </>
        }
      >
        <form id="task-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="t-title" error={errors.title?.message} className="sm:col-span-2">
            <Input id="t-title" aria-invalid={!!errors.title} {...register("title")} />
          </Field>
          <Field label="Description" htmlFor="t-desc" className="sm:col-span-2">
            <Textarea id="t-desc" maxLength={1000} {...register("description")} />
          </Field>
          <Field label="Project" htmlFor="t-project" error={errors.projectId?.message}>
            <Select id="t-project" {...register("projectId")}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Assignee" htmlFor="t-assignee">
            <Select id="t-assignee" {...register("assigneeId")}>
              <option value="">Unassigned</option>
              {assignable.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </Field>
          <Field label="Status" htmlFor="t-status">
            <Select id="t-status" {...register("status")}>
              {TASK_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </Select>
          </Field>
          <Field label="Priority" htmlFor="t-priority">
            <Select id="t-priority" {...register("priority")}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Due date" htmlFor="t-due" error={errors.dueDate?.message}>
            <Input id="t-due" type="date" {...register("dueDate")} />
          </Field>
        </form>
      </DialogContent>
    </Dialog>
  );
}
