"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { employeeSchema, type EmployeeValues } from "@/lib/validation";
import { useAppStore, useWorkspaceData } from "@/store/app-store";
import { useSession } from "@/store/session-store";
import { ROLES, type Employee } from "@/types";

export function EmployeeFormDialog({ open, onOpenChange, employee }: { open: boolean; onOpenChange: (v: boolean) => void; employee?: Employee }) {
  const { departments } = useWorkspaceData();
  const addEmployee = useAppStore((s) => s.addEmployee);
  const updateEmployee = useAppStore((s) => s.updateEmployee);
  const myRole = useSession((s) => s.user?.role);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
  });

  useEffect(() => {
    if (!open) return;
    reset(
      employee
        ? { name: employee.name, email: employee.email, title: employee.title, departmentId: employee.departmentId, role: employee.role, status: employee.status, location: employee.location }
        : { name: "", email: "", title: "", departmentId: departments[0]?.id ?? "", role: "Employee", status: "Invited", location: "" },
    );
  }, [open, employee, departments, reset]);

  const onSubmit = async (v: EmployeeValues) => {
    // Privilege guard: only Super Admins may grant Super Admin (enforced server-side in production).
    if (v.role === "Super Admin" && myRole !== "Super Admin") {
      toast.error("Only a Super Admin can grant the Super Admin role");
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
    if (employee) {
      updateEmployee(employee.id, v);
      toast.success("Employee updated", { description: v.name });
    } else {
      addEmployee(v);
      toast.success(v.status === "Invited" ? "Invitation sent (simulated)" : "Employee added", { description: `${v.name} · ${v.role}` });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={employee ? "Edit employee" : "Add employee"}
        description={employee ? employee.email : "Invite someone to this workspace and choose their role."}
        className="max-w-xl"
        footer={
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" form="employee-form" loading={isSubmitting}>{employee ? "Save changes" : "Add employee"}</Button>
          </>
        }
      >
        <form id="employee-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="e-name" error={errors.name?.message}>
            <Input id="e-name" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <Field label="Work email" htmlFor="e-email" error={errors.email?.message}>
            <Input id="e-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
          </Field>
          <Field label="Job title" htmlFor="e-title" error={errors.title?.message}>
            <Input id="e-title" aria-invalid={!!errors.title} {...register("title")} />
          </Field>
          <Field label="Department" htmlFor="e-dep" error={errors.departmentId?.message}>
            <Select id="e-dep" {...register("departmentId")}>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Field>
          <Field label="Role" htmlFor="e-role" hint="Controls what they can see and change">
            <Select id="e-role" {...register("role")}>
              {ROLES.map((r) => <option key={r} disabled={r === "Super Admin" && myRole !== "Super Admin"}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Status" htmlFor="e-status">
            <Select id="e-status" {...register("status")}>
              {["Active", "On leave", "Invited", "Inactive"].map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Location" htmlFor="e-loc" className="sm:col-span-2">
            <Input id="e-loc" placeholder="City" {...register("location")} />
          </Field>
        </form>
      </DialogContent>
    </Dialog>
  );
}
