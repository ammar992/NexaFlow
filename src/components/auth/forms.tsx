"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { ArrowLeft, Eye, EyeOff, MailCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { forwardRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/misc";
import { DEMO_USER } from "@/lib/mock/seed";
import { cn } from "@/lib/utils";
import {
  forgotSchema,
  passwordStrength,
  safeNext,
  signInSchema,
  signUpSchema,
  type ForgotValues,
  type SignInValues,
  type SignUpValues,
} from "@/lib/validation";
import { useAppStore } from "@/store/app-store";
import { useSession } from "@/store/session-store";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={show ? "text" : "password"} className="h-11 pr-11" {...props} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

function Heading({ title, sub }: { title: string; sub: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-[28px] font-semibold tracking-[-0.03em]">{title}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function useDemoLogin() {
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);
  const seed = useAppStore((s) => s.seed);
  return (next = "/app") => {
    seed();
    signIn(DEMO_USER);
    toast.success("Welcome to the NexaFlow demo", { description: "You’re signed in as Alex Morgan (Super Admin)." });
    router.push(next);
  };
}

/* -------------------------------------------------------------------------- */

export function SignInForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);
  const seed = useAppStore((s) => s.seed);
  const demoLogin = useDemoLogin();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "", remember: true } });

  const onSubmit = async (v: SignInValues) => {
    await wait(900); // simulate network round-trip
    seed();
    const local = v.email.split("@")[0].replace(/[._-]+/g, " ");
    const name = local.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 40) || "Demo User";
    signIn({ id: "usr_demo", name, email: v.email, role: "Super Admin" });
    toast.success("Signed in", { description: "Mock authentication — any email and password work in this demo." });
    router.push(next);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Heading
        title="Welcome back"
        sub={
          <>
            New to NexaFlow?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        }
      />

      <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => demoLogin(next)}>
        <Sparkles className="text-primary" />
        Continue with demo account
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or sign in with email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        <Field label="Work email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="h-11"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
        </Field>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Controller
              control={control}
              name="remember"
              render={({ field }) => <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />}
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-[13px] font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

export function SignUpForm() {
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);
  const setOnboarded = useSession((s) => s.setOnboarded);
  const seed = useAppStore((s) => s.seed);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", terms: false as unknown as true },
  });
  const password = useWatch({ control, name: "password" }) ?? "";
  const strength = passwordStrength(password);

  const onSubmit = async (v: SignUpValues) => {
    await wait(1000);
    seed();
    // The password is validated and then discarded — never persisted in the demo.
    signIn({ id: "usr_demo", name: v.name, email: v.email, role: "Super Admin" });
    setOnboarded(false);
    toast.success("Account created", { description: "Let’s set up your company workspace." });
    router.push("/onboarding");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Heading
        title="Create your account"
        sub={
          <>
            Already have one?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        }
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" placeholder="Jordan Lee" className="h-11" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Work email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" className="h-11" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" placeholder="At least 10 characters" aria-invalid={!!errors.password} {...register("password")} />
          <div className="mt-1 flex items-center gap-2" aria-live="polite">
            <div className="grid flex-1 grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 rounded-full bg-muted transition-colors",
                    password && strength.level >= i && (strength.level <= 1 ? "bg-danger" : strength.level === 2 ? "bg-warning" : "bg-success"),
                  )}
                />
              ))}
            </div>
            <span className="w-16 text-right text-[11px] text-muted-foreground">{password ? strength.label : ""}</span>
          </div>
        </Field>
        <div className="grid gap-1.5">
          <label className="flex items-start gap-2.5 text-[13px] leading-snug text-muted-foreground">
            <Controller
              control={control}
              name="terms"
              render={({ field }) => (
                <Checkbox className="mt-0.5" checked={!!field.value} onCheckedChange={(c) => field.onChange(c === true)} aria-invalid={!!errors.terms} />
              )}
            />
            I agree to the Terms of Service and Privacy Policy (demo).
          </label>
          {errors.terms && <p role="alert" className="text-xs font-medium text-danger">{errors.terms.message}</p>}
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  const onSubmit = async (v: ForgotValues) => {
    await wait(900);
    setSentTo(v.email);
  };

  if (sentTo) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <MailCheck className="size-6" />
        </div>
        <h1 className="mt-6 font-display text-[26px] font-semibold tracking-[-0.03em]">Check your inbox</h1>
        {/* Generic wording on purpose: never confirm whether an account exists. */}
        <p className="mt-2 text-[15px] text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, you’ll receive a reset link within a few minutes.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">Demo: no email is actually sent.</p>
        <Button asChild variant="outline" size="lg" className="mt-8 w-full">
          <Link href="/sign-in">
            <ArrowLeft /> Back to sign in
          </Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Heading title="Reset your password" sub="Enter the email you use for NexaFlow and we’ll send you a reset link." />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        <Field label="Work email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" className="h-11" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
        <Link href="/sign-in" className="mx-auto mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
      </form>
    </motion.div>
  );
}
