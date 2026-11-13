"use client";

import { Accordion } from "radix-ui";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/marketing/motion";

const FAQ = [
  {
    q: "Is this a live product?",
    a: "This is an interactive product demo. Everything you see in the dashboard runs in your browser with illustrative data stored locally, so you can add customers, move tasks and create invoices freely. Nothing is sent to a server.",
  },
  {
    q: "Can I manage more than one company?",
    a: "Yes. Each workspace is a separate tenant with its own customers, people, projects, invoices and analytics. Switch between workspaces from the top bar — data never crosses between them.",
  },
  {
    q: "How are roles and permissions handled?",
    a: "There are four roles — Super Admin, Company Admin, Manager and Employee — and a permission matrix per workspace. In production, the same matrix is enforced by the API on every request, not just hidden in the interface.",
  },
  {
    q: "How do online payments work?",
    a: "Invoices are designed to be paid through Stripe, with card details handled entirely by Stripe and payment status confirmed by signed webhooks. In this demo, payments are simulated and no real card data is used.",
  },
  {
    q: "Can I export my data?",
    a: "Reports and tables export to CSV, and invoices have a print-ready layout you can save as PDF from your browser.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. The dashboard has a dedicated mobile layout with a collapsible sidebar, card-based tables and touch-friendly controls.",
  },
];

export function Faq() {
  return (
    <section id="resources" className="bg-[#f6f7fb] pb-24 text-[#0d1226] sm:pb-32">
      <div className="mx-auto grid max-w-[1240px] gap-14 border-t border-[#e3e6ef] px-5 pt-24 sm:px-8 sm:pt-32 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="label-caps text-[#6544f5]">FAQ & resources</p>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,2.4vw+0.8rem,2.8rem)] leading-[1.06] font-semibold tracking-[-0.035em]">
            Questions, answered.
          </h2>
          <ul className="mt-10 space-y-1">
            {[
              { icon: Compass, label: "Take the product tour", href: "/demo" },
              { icon: BookOpen, label: "Create a workspace", href: "/sign-up" },
            ].map((r) => (
              <li key={r.label}>
                <Link href={r.href} className="group flex items-center gap-3 rounded-xl py-2.5 text-[15px] font-medium">
                  <r.icon className="size-[18px] text-[#6544f5]" />
                  {r.label}
                  <ArrowUpRight className="size-4 text-[#7a8297] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => toast("Demo build", { description: "The sales contact form isn’t connected in this demo." })}
                className="group flex items-center gap-3 rounded-xl py-2.5 text-[15px] font-medium"
              >
                <MessageCircle className="size-[18px] text-[#6544f5]" />
                Talk to sales
                <ArrowUpRight className="size-4 text-[#7a8297]" />
              </button>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6">
          <Accordion.Root type="single" collapsible defaultValue="item-0" className="divide-y divide-[#e3e6ef] border-y border-[#e3e6ef]">
            {FAQ.map((f, i) => (
              <Accordion.Item key={f.q} value={`item-${i}`}>
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-6 text-left text-[17px] font-semibold tracking-tight">
                    {f.q}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#dfe3ee] transition-transform duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:border-[#0b1020] group-data-[state=open]:bg-[#0b1020] group-data-[state=open]:text-white">
                      <Plus className="size-4" />
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[nf-fade-out_150ms] data-[state=open]:animate-[nf-fade-in_250ms]">
                  <p className="max-w-[60ch] pb-6 text-[15.5px] leading-relaxed text-[#5b6378]">{f.a}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden py-28 sm:py-36 lg:py-44">
      <div aria-hidden className="grid-backdrop absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_70%_at_30%_100%,#000,transparent_70%)]" />
      <div aria-hidden className="absolute bottom-[-30%] left-[-10%] -z-10 h-[520px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgb(121_92_255/0.3),transparent)] blur-2xl" />
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <h2 className="max-w-4xl font-display text-[clamp(2.4rem,5.5vw+0.5rem,5.5rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-white">
            Bring the whole business into one place.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-[17px] leading-relaxed text-white/55">
            Start with your customers and invoices this afternoon. Add projects and your team when you&apos;re ready.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[#0b1020]"
            >
              Start free trial
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/demo" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 px-6 text-[15px] font-semibold text-white hover:bg-white/5">
              Explore platform
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const FOOTER = [
  { title: "Product", links: [["Overview", "#product"], ["Features", "#features"], ["Pricing", "#pricing"], ["Live demo", "/demo"]] },
  { title: "Solutions", links: [["Agencies", "#solutions"], ["Logistics", "#solutions"], ["Clinics", "#solutions"], ["Multi-company", "#solutions"]] },
  { title: "Account", links: [["Sign in", "/sign-in"], ["Create account", "/sign-up"], ["Reset password", "/forgot-password"]] },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#080c19]">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-white/45">One workspace. Complete business control.</p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
          {FOOTER.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-semibold text-white">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-[14px] text-white/50 transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-5 py-6 text-[12.5px] text-white/35 sm:flex-row sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} NexaFlow. Product demo.</p>
          <p>Company names, people and figures shown are fictional and for illustration only.</p>
        </div>
      </div>
    </footer>
  );
}
