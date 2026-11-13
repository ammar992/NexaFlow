"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Check, CreditCard, KeyRound, Laptop, Palette, RotateCcw, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/app/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/misc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCan } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";
import { useActiveWorkspace, useAppStore, useWorkspaceData } from "@/store/app-store";
import { useSession } from "@/store/session-store";

export default function SettingsPage() {
  return (
    <Suspense>
      <Settings />
    </Suspense>
  );
}

function Settings() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab") ?? "profile";
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, workspace, billing and security." />
      <Tabs value={tab} onValueChange={(v) => router.replace(`/app/settings?tab=${v}`, { scroll: false })}>
        <TabsList className="mb-5">
          <TabsTrigger value="profile"><UserRound /> Profile</TabsTrigger>
          <TabsTrigger value="workspace"><Building2 /> Workspace</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard /> Billing</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck /> Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><Profile /></TabsContent>
        <TabsContent value="workspace"><WorkspaceSettings /></TabsContent>
        <TabsContent value="billing"><Billing /></TabsContent>
        <TabsContent value="security"><Security /></TabsContent>
      </Tabs>
    </>
  );
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().pipe(z.email("Enter a valid email")),
});

function Profile() {
  const user = useSession((s) => s.user);
  const update = useSession((s) => s.updateProfile);
  const { theme, setTheme } = useTheme();
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? "", email: user?.email ?? "" },
  });
  if (!user) return null;
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader title="Personal details" description="Shown to teammates across your workspaces." />
        <CardContent>
          <form
            noValidate
            onSubmit={handleSubmit(async (v) => {
              await new Promise((r) => setTimeout(r, 400));
              update(v);
              toast.success("Profile saved");
            })}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="flex items-center gap-4 sm:col-span-2">
              <Avatar name={user.name} size="lg" />
              <div>
                <p className="font-medium">{user.name}</p>
                <Badge tone="primary" className="mt-1">{user.role}</Badge>
              </div>
            </div>
            <Field label="Full name" htmlFor="s-name" error={errors.name?.message}>
              <Input id="s-name" aria-invalid={!!errors.name} {...register("name")} />
            </Field>
            <Field label="Email" htmlFor="s-email" error={errors.email?.message}>
              <Input id="s-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={!isDirty} loading={isSubmitting}>Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Appearance" description="Choose how NexaFlow looks for you." />
        <CardContent className="grid grid-cols-3 gap-2">
          {[
            { id: "light", label: "Light", cls: "bg-[#f6f7fb]" },
            { id: "dark", label: "Dark", cls: "bg-[#0b1020]" },
            { id: "system", label: "System", cls: "bg-gradient-to-r from-[#f6f7fb] from-50% to-[#0b1020] to-50%" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              aria-pressed={theme === t.id}
              className={cn("rounded-xl border p-2 text-left transition-colors", theme === t.id ? "border-primary ring-1 ring-primary" : "border-border hover:border-input")}
            >
              <span className={cn("block h-14 rounded-lg border border-border", t.cls)} />
              <span className="mt-2 flex items-center gap-1 text-[13px] font-medium">
                {theme === t.id && <Check className="size-3.5 text-primary" />}
                <Palette className={cn("size-3.5 text-muted-foreground", theme === t.id && "hidden")} />
                {t.label}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const wsSchema = z.object({
  name: z.string().trim().min(2, "Enter a workspace name").max(60),
  industry: z.string().trim().min(2, "Enter an industry").max(60),
});

function WorkspaceSettings() {
  const workspace = useActiveWorkspace();
  const data = useWorkspaceData();
  const update = useAppStore((s) => s.updateWorkspace);
  const reset = useAppStore((s) => s.resetDemo);
  const canEdit = useCan("settings.workspace");
  const [confirm, setConfirm] = useState(false);
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<z.infer<typeof wsSchema>>({
    resolver: zodResolver(wsSchema),
    values: { name: workspace?.name ?? "", industry: workspace?.industry ?? "" },
  });
  if (!workspace) return null;
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader title="Workspace profile" description="Each workspace is an isolated tenant with its own data and roles." />
        <CardContent>
          <form
            noValidate
            onSubmit={handleSubmit((v) => {
              update(v);
              toast.success("Workspace updated");
            })}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Workspace name" htmlFor="w-name" error={errors.name?.message}>
              <Input id="w-name" disabled={!canEdit} {...register("name")} />
            </Field>
            <Field label="Industry" htmlFor="w-industry" error={errors.industry?.message}>
              <Input id="w-industry" disabled={!canEdit} {...register("industry")} />
            </Field>
            <Field label="Workspace ID" htmlFor="w-id" hint="Tenant key used to scope every API request">
              <Input id="w-id" value={workspace.id} readOnly className="bg-muted font-mono text-xs" />
            </Field>
            <Field label="URL" htmlFor="w-slug">
              <Input id="w-slug" value={`nexaflow.app/${workspace.slug}`} readOnly className="bg-muted" />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={!canEdit || !isDirty}>Save workspace</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader title="Data in this workspace" />
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Customers", data.customers.length],
              ["Employees", data.employees.length],
              ["Projects", data.projects.length],
              ["Invoices", data.invoices.length],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-lg bg-muted px-3 py-2.5">
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="font-semibold tabular">{v}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-danger/30">
          <CardHeader title="Demo data" description="Restore all workspaces to their original sample data." />
          <CardContent>
            <Button variant="outline" className="text-danger" onClick={() => setConfirm(true)}><RotateCcw /> Reset demo data</Button>
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Reset demo data?"
        description="All changes made in this browser will be replaced with the original sample data."
        confirmLabel="Reset"
        onConfirm={() => {
          reset();
          toast.success("Demo data reset");
        }}
      />
    </div>
  );
}

const PLANS = [
  { id: "Starter", price: 19, features: ["Up to 10 people", "1 workspace", "Core modules"] },
  { id: "Growth", price: 39, features: ["Unlimited people", "Advanced analytics", "Custom permissions"] },
  { id: "Scale", price: 79, features: ["Unlimited workspaces", "SSO & audit log", "Priority support"] },
] as const;

function Billing() {
  const workspace = useActiveWorkspace();
  const data = useWorkspaceData();
  const canBill = useCan("settings.billing");
  const seats = data.employees.filter((e) => e.status !== "Inactive").length;
  const plan = PLANS.find((p) => p.id === workspace?.plan) ?? PLANS[1];
  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current plan</p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{plan.id}</p>
            <p className="text-sm text-muted-foreground">{seats} seats × ${plan.price} = <span className="font-semibold text-foreground tabular">${seats * plan.price}/month</span></p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
            <CreditCard className="size-5 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">Visa •••• 4242</p>
              <p className="text-xs text-muted-foreground">Managed by Stripe Billing (simulated)</p>
            </div>
          </div>
        </div>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        {PLANS.map((p) => (
          <Card key={p.id} className={cn("flex flex-col p-5", p.id === plan.id && "border-primary ring-1 ring-primary")}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{p.id}</p>
              {p.id === plan.id && <Badge tone="primary">Current</Badge>}
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight">${p.price}<span className="text-sm font-normal text-muted-foreground"> /user/mo</span></p>
            <ul className="mt-4 flex-1 space-y-2 text-[13px]">
              {p.features.map((f) => <li key={f} className="flex items-center gap-2"><Check className="size-3.5 text-primary" />{f}</li>)}
            </ul>
            <Button
              className="mt-5"
              variant={p.id === plan.id ? "secondary" : "outline"}
              disabled={p.id === plan.id || !canBill}
              onClick={() => toast("Plan change (demo)", { description: `In production this opens a Stripe Checkout session to switch to ${p.id}.` })}
            >
              {p.id === plan.id ? "Current plan" : `Switch to ${p.id}`}
            </Button>
          </Card>
        ))}
      </div>
      {!canBill && <p className="text-xs text-muted-foreground">Only Super Admins can change billing.</p>}
    </div>
  );
}

function Security() {
  const [mfa, setMfa] = useState(false);
  const [alerts, setAlerts] = useState(true);
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader title="Sign-in security" />
        <CardContent className="divide-y divide-border">
          <div className="flex items-center justify-between gap-4 pb-4">
            <div className="flex gap-3">
              <Smartphone className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <p className="text-[14px] font-medium">Two-factor authentication</p>
                <p className="text-[13px] text-muted-foreground">Require a code from an authenticator app at sign-in.</p>
              </div>
            </div>
            <Switch checked={mfa} onCheckedChange={(v) => { setMfa(v); toast.success(v ? "2FA enabled (demo)" : "2FA disabled (demo)"); }} aria-label="Two-factor authentication" />
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <p className="text-[14px] font-medium">New sign-in alerts</p>
                <p className="text-[13px] text-muted-foreground">Email me when my account is used on a new device.</p>
              </div>
            </div>
            <Switch checked={alerts} onCheckedChange={setAlerts} aria-label="New sign-in alerts" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Active sessions" />
        <CardContent>
          <ul className="space-y-3">
            {[
              { icon: Laptop, label: "This browser", sub: "Current session · demo", current: true },
              { icon: Smartphone, label: "Mobile app", sub: "Last active 2 days ago (illustrative)", current: false },
            ].map((s) => (
              <li key={s.label} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <s.icon className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-[13.5px] font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
                {s.current ? <Badge tone="success">Active</Badge> : <Button size="sm" variant="outline" onClick={() => toast.success("Session revoked (demo)")}>Revoke</Button>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="xl:col-span-2">
        <CardHeader title="API access" description="For integrations. Keys are created and stored server-side and shown once." />
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[13px] text-muted-foreground"><KeyRound className="size-4" /> No API keys in this demo. Real keys are never embedded in the frontend.</p>
          <Button variant="outline" onClick={() => toast("API keys (demo)", { description: "Key creation requires the production API." })}>Create API key</Button>
        </CardContent>
      </Card>
    </div>
  );
}
