import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { AuthPreview } from "@/components/auth/auth-preview";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <main className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">Demo · mock auth</span>
        </div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">{children}</div>
        <p className="text-center text-xs text-muted-foreground lg:text-left">
          Demo environment. No passwords are stored or sent anywhere.
        </p>
      </main>

      <aside className="relative hidden overflow-hidden bg-[#0b1020] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div aria-hidden className="grid-backdrop absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_70%_40%,#000,transparent_75%)]" />
        <div aria-hidden className="absolute top-1/4 -right-1/4 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgb(121_92_255/0.35),transparent)] blur-2xl" />
        <div className="relative">
          <p className="label-caps text-[#a99bff]">NexaFlow workspace</p>
          <h2 className="mt-4 max-w-md font-display text-4xl leading-[1.05] font-semibold tracking-[-0.035em] xl:text-5xl">
            One workspace. Complete business control.
          </h2>
        </div>
        <div className="relative my-10 flex-1">
          <AuthPreview />
        </div>
        <ul className="relative grid gap-3 text-[14px] text-white/65 xl:grid-cols-2">
          {["Customers, deals & notes", "Projects, tasks & Kanban", "Invoices & simulated payments", "Isolated multi-company data"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#8fb6ff]" />
              {t}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
