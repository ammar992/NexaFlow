"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { customerSchema, type CustomerValues } from "@/lib/validation";
import { useAppStore, useWorkspaceData } from "@/store/app-store";
import type { Customer } from "@/types";

const EMPTY: CustomerValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  status: "Lead",
  category: "SMB",
  ownerId: "",
  city: "",
  country: "",
  website: "",
  industry: "",
  lifetimeValue: 0,
};

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer?: Customer;
  onSaved?: (id: string) => void;
}) {
  const { employees } = useWorkspaceData();
  const addCustomer = useAppStore((s) => s.addCustomer);
  const updateCustomer = useAppStore((s) => s.updateCustomer);
  const staff = employees.filter((e) => e.status !== "Inactive");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerValues>({ resolver: zodResolver(customerSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      customer
        ? {
            name: customer.name,
            company: customer.company,
            email: customer.email,
            phone: customer.phone,
            status: customer.status,
            category: customer.category,
            ownerId: customer.ownerId,
            city: customer.city,
            country: customer.country,
            website: customer.website,
            industry: customer.industry,
            lifetimeValue: customer.lifetimeValue,
          }
        : { ...EMPTY, ownerId: staff[0]?.id ?? "" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer, reset]);

  const onSubmit = async (v: CustomerValues) => {
    await new Promise((r) => setTimeout(r, 450));
    if (customer) {
      updateCustomer(customer.id, v);
      toast.success("Customer updated", { description: v.company });
      onSaved?.(customer.id);
    } else {
      const id = addCustomer(v);
      toast.success("Customer added", { description: `${v.company} is now in your CRM.` });
      onSaved?.(id);
    }
    onOpenChange(false);
  };

  const err = (k: keyof CustomerValues) => errors[k]?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={customer ? "Edit customer" : "Add customer"}
        description={customer ? `Update details for ${customer.company}` : "Add a new contact and company to your CRM."}
        className="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form="customer-form" loading={isSubmitting}>
              {customer ? "Save changes" : "Add customer"}
            </Button>
          </>
        }
      >
        <form id="customer-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Contact</legend>
            <Field label="Contact name" htmlFor="c-name" error={err("name")}>
              <Input id="c-name" aria-invalid={!!errors.name} {...register("name")} />
            </Field>
            <Field label="Email" htmlFor="c-email" error={err("email")}>
              <Input id="c-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
            </Field>
            <Field label="Phone" htmlFor="c-phone" error={err("phone")}>
              <Input id="c-phone" type="tel" placeholder="+1 (555) 000-0000" aria-invalid={!!errors.phone} {...register("phone")} />
            </Field>
            <Field label="Account owner" htmlFor="c-owner" error={err("ownerId")}>
              <Select id="c-owner" aria-invalid={!!errors.ownerId} {...register("ownerId")}>
                <option value="">Select…</option>
                {staff.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </Field>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Company</legend>
            <Field label="Company" htmlFor="c-company" error={err("company")}>
              <Input id="c-company" aria-invalid={!!errors.company} {...register("company")} />
            </Field>
            <Field label="Industry" htmlFor="c-industry" error={err("industry")}>
              <Input id="c-industry" {...register("industry")} />
            </Field>
            <Field label="Website" htmlFor="c-website" error={err("website")}>
              <Input id="c-website" placeholder="https://" aria-invalid={!!errors.website} {...register("website")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" htmlFor="c-city" error={err("city")}>
                <Input id="c-city" {...register("city")} />
              </Field>
              <Field label="Country" htmlFor="c-country" error={err("country")}>
                <Input id="c-country" {...register("country")} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-3">
            <legend className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Classification</legend>
            <Field label="Status" htmlFor="c-status" error={err("status")}>
              <Select id="c-status" {...register("status")}>
                {["Lead", "Active", "Inactive", "Churned"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Category" htmlFor="c-category" error={err("category")}>
              <Select id="c-category" {...register("category")}>
                {["Enterprise", "Mid-market", "SMB", "Startup"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Lifetime value (USD)" htmlFor="c-ltv" error={err("lifetimeValue")}>
              <Input id="c-ltv" type="number" min={0} step="1" inputMode="numeric" aria-invalid={!!errors.lifetimeValue} {...register("lifetimeValue", { valueAsNumber: true })} />
            </Field>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
