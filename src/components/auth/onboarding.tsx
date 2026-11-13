"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Building2, Check, Layers, Plus, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { companySchema, workspaceSchema } from "@/lib/validation";
import { useAppStore } from "@/store/app-store";
import { useSession } from "@/store/session-store";
import type { Plan } from "@/types";

const STEPS = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "workspace", label: "Workspace", icon: Layers },
  { id: "team", label: "Team", icon: Users },
] as const;

const INDUSTRIES = ["Creative agency", "Professional services", "Logistics", "Healthcare", "Retail & e-commerce", "Construction", "Software", "Other"];
const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];
const PLANS: { id: Plan; price: string; note: string }[] = [
  { id: "Starter", price: "$19", note: "Up to 10 people" },
  { id: "Growth", price: "$39", note: "Unlimited people" },
  { id: "Scale", price: "$79", note: "Unlimited workspaces" },
];

type CompanyValues = z.infer<typeof companySchema>;
type WorkspaceValues = z.infer<typeof workspaceSchema>;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);

export function OnboardingWizard() {
  const hydrated = useHydrated();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const setOnboarded = useSession((s) => s.setOnboarded);
  const createWorkspace = useAppStore((s) => s.createWorkspace);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [company, setCompany] = useState<CompanyValues | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceValues | null>(null);
  const [departments, setDepartments] = useState(["Operations", "Sales", "Finance"]);
  const [invites, setInvites] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace("/sign-in?next=/onboarding");
  }, [hydrated, user, router]);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const finish = async () => {
    if (!company || !workspace) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1200));
    createWorkspace({ name: workspace.workspace, industry: company.industry, plan: workspace.plan, departments });
    setOnboarded(true);
    toast.success(`${workspace.workspace} is ready`, {
      description: invites.length ? `${invites.length} invite(s) queued (simulated).` : "Add your first customer to get started.",
    });
    router.push("/app");
  };

  if (!hydrated || !user) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-10 h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <Logo href="/" />
        <button
          type="button"
          onClick={() => {
            setOnboarded(true);
            router.push("/app");
          }}
          className="text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          Skip — explore demo data
        </button>
      </header>

      <div className="mx-auto max-w-xl px-5 pb-16 sm:pt-6">
        {/* stepper */}
        <ol className="mb-10 flex items-center gap-2" aria-label="Setup progress">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  i < step && "border-primary bg-primary text-white",
                  i === step && "border-primary bg-primary-soft text-primary",
                  i > step && "border-border text-muted-foreground",
                )}
                aria-current={i === step ? "step" : undefined}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className={cn("hidden text-[13px] font-medium sm:inline", i === step ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              {i < STEPS.length - 1 && (
                <span className="h-px flex-1 overflow-hidden bg-border">
                  <motion.span className="block h-full bg-primary" initial={false} animate={{ width: i < step ? "100%" : "0%" }} />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="relative rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -24 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <CompanyStep
                  defaults={company}
                  onNext={(v) => {
                    setCompany(v);
                    go(1);
                  }}
                />
              )}
              {step === 1 && (
                <WorkspaceStep
                  defaults={workspace ?? { workspace: company?.company ?? "", slug: slugify(company?.company ?? ""), plan: "Growth" }}
                  onBack={() => go(0)}
                  onNext={(v) => {
                    setWorkspace(v);
                    go(2);
                  }}
                />
              )}
              {step === 2 && (
                <TeamStep
                  departments={departments}
                  setDepartments={setDepartments}
                  invites={invites}
                  setInvites={setInvites}
                  onBack={() => go(1)}
                  onFinish={finish}
                  creating={creating}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
      <p className="mt-1.5 text-[14.5px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function CompanyStep({ defaults, onNext }: { defaults: CompanyValues | null; onNext: (v: CompanyValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: defaults ?? { company: "", industry: "", size: "" },
  });
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="grid gap-4">
      <StepTitle title="Tell us about your company" sub="This sets up your first workspace. You can change it later." />
      <Field label="Company name" htmlFor="company" error={errors.company?.message}>
        <Input id="company" placeholder="Acme Studio" className="h-11" aria-invalid={!!errors.company} {...register("company")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Industry" htmlFor="industry" error={errors.industry?.message}>
          <Select id="industry" className="h-11" aria-invalid={!!errors.industry} {...register("industry")}>
            <option value="">Select…</option>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </Select>
        </Field>
        <Field label="Team size" htmlFor="size" error={errors.size?.message}>
          <Select id="size" className="h-11" aria-invalid={!!errors.size} {...register("size")}>
            <option value="">Select…</option>
            {SIZES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
      </div>
      <Button type="submit" size="lg" className="mt-3">
        Continue <ArrowRight />
      </Button>
    </form>
  );
}

function WorkspaceStep({ defaults, onBack, onNext }: { defaults: WorkspaceValues; onBack: () => void; onNext: (v: WorkspaceValues) => void }) {
  const { register, handleSubmit, setValue, control, formState: { errors, dirtyFields } } = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: defaults,
  });
  const plan = useWatch({ control, name: "plan" });
  const nameField = register("workspace");
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="grid gap-4">
      <StepTitle title="Create your workspace" sub="Each workspace keeps its own customers, people, projects and invoices." />
      <Field label="Workspace name" htmlFor="workspace" error={errors.workspace?.message}>
        <Input
          id="workspace"
          className="h-11"
          aria-invalid={!!errors.workspace}
          {...nameField}
          onChange={(e) => {
            nameField.onChange(e);
            if (!dirtyFields.slug) setValue("slug", slugify(e.target.value));
          }}
        />
      </Field>
      <Field label="Workspace URL" htmlFor="slug" error={errors.slug?.message}>
        <div className="flex h-11 items-center overflow-hidden rounded-lg border border-input bg-card focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15">
          <span className="border-r border-border bg-muted px-3 text-sm leading-[2.75rem] text-muted-foreground">nexaflow.app/</span>
          <input id="slug" className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" aria-invalid={!!errors.slug} {...register("slug")} />
        </div>
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium">Plan</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PLANS.map((p) => (
            <label
              key={p.id}
              className={cn(
                "relative cursor-pointer rounded-xl border p-3.5 transition-colors",
                plan === p.id ? "border-primary bg-primary-soft/60 ring-1 ring-primary" : "border-border hover:border-input",
              )}
            >
              <input type="radio" value={p.id} className="sr-only" {...register("plan")} />
              <span className="block text-sm font-semibold">{p.id}</span>
              <span className="block text-xs text-muted-foreground">{p.price}/user · {p.note}</span>
              {plan === p.id && <Check className="absolute top-3 right-3 size-4 text-primary" />}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">14-day trial on every plan. Billing is simulated in this demo.</p>
      </fieldset>
      <div className="mt-3 flex gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button type="submit" size="lg" className="flex-1">
          Continue <ArrowRight />
        </Button>
      </div>
    </form>
  );
}

function TeamStep({
  departments,
  setDepartments,
  invites,
  setInvites,
  onBack,
  onFinish,
  creating,
}: {
  departments: string[];
  setDepartments: (d: string[]) => void;
  invites: string[];
  setInvites: (i: string[]) => void;
  onBack: () => void;
  onFinish: () => void;
  creating: boolean;
}) {
  const [dep, setDep] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const addDep = () => {
    const v = dep.trim().slice(0, 40);
    if (v && !departments.includes(v)) setDepartments([...departments, v]);
    setDep("");
  };
  const addInvite = () => {
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setEmailError("Enter a valid email address");
    if (invites.includes(v)) return setEmailError("Already added");
    setInvites([...invites, v]);
    setEmail("");
    setEmailError("");
  };

  return (
    <div className="grid gap-6">
      <StepTitle title="Set up your team" sub="Add departments and invite colleagues. Both are optional." />
      <div>
        <p className="mb-2 text-[13px] font-medium">Departments</p>
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 rounded-lg bg-muted py-1 pr-1 pl-2.5 text-[13px]">
              {d}
              <button type="button" aria-label={`Remove ${d}`} onClick={() => setDepartments(departments.filter((x) => x !== d))} className="rounded p-0.5 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            aria-label="New department"
            placeholder="e.g. Marketing"
            value={dep}
            onChange={(e) => setDep(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDep();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addDep}>
            <Plus /> Add
          </Button>
        </div>
      </div>
      <div>
        <Field label="Invite teammates" htmlFor="invite" error={emailError}>
          <div className="flex gap-2">
            <Input
              id="invite"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              aria-invalid={!!emailError}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInvite();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addInvite}>
              Invite
            </Button>
          </div>
        </Field>
        {invites.length > 0 && (
          <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
            {invites.map((i) => (
              <li key={i} className="flex items-center justify-between px-3 py-2 text-[13px]">
                {i}
                <span className="text-xs text-muted-foreground">Employee · pending</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={creating}>
          <ArrowLeft /> Back
        </Button>
        <Button type="button" size="lg" className="flex-1" onClick={onFinish} loading={creating}>
          {creating ? "Creating workspace…" : "Create workspace"}
        </Button>
      </div>
    </div>
  );
}
