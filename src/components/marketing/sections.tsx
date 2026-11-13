"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CircleDollarSign,
  FolderKanban,
  Layers,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Reveal, SectionLabel, Stagger, StaggerItem, TiltCard } from "@/components/marketing/motion";
import { Bars, Ring, Sparkline } from "@/components/marketing/svg-charts";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Illustrative brand strip                                                   */
/* -------------------------------------------------------------------------- */

const DEMO_BRANDS = [
  { name: "Kestrel", shape: "M4 16 12 4l8 12H4Z" },
  { name: "Harborline", shape: "M3 14c3-4 6-4 9 0s6 4 9 0M3 9c3-4 6-4 9 0s6 4 9 0" },
  { name: "Lumen & Pine", shape: "M12 3v18M5 10l7-7 7 7" },
  { name: "Verdant", shape: "M5 5c8 0 14 6 14 14C11 19 5 13 5 5Z" },
  { name: "Copperleaf", shape: "M12 3a9 9 0 1 0 0 18V3Z" },
  { name: "Sable Peak", shape: "M3 19 9 7l4 7 3-5 5 10H3Z" },
];

export function BrandStrip() {
  return (
    <section aria-labelledby="brands-title" className="border-y border-white/[0.06] py-10">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-center lg:gap-14">
        <p id="brands-title" className="shrink-0 text-[13px] leading-snug text-white/45 lg:max-w-[200px]">
          Built for growing businesses like these
          <span className="block text-[11px] text-white/30">Illustrative demo brands</span>
        </p>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <motion.ul
            className="flex w-max gap-12"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 38, ease: "linear", repeat: Infinity }}
          >
            {[...DEMO_BRANDS, ...DEMO_BRANDS].map((b, i) => (
              <li key={i} className="flex items-center gap-2 text-white/40" aria-hidden={i >= DEMO_BRANDS.length}>
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                  <path d={b.shape} />
                </svg>
                <span className="font-display text-[17px] font-semibold tracking-[-0.02em] whitespace-nowrap">{b.name}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Challenges → solutions                                                     */
/* -------------------------------------------------------------------------- */

const CHALLENGES = [
  {
    problem: "Customer history lives in inboxes and a spreadsheet only one person updates.",
    solution: "One customer record with deals, notes, invoices and every touchpoint on a single timeline.",
  },
  {
    problem: "Project status means asking around on chat every Monday morning.",
    solution: "Boards, deadlines and owners everyone can see, with progress that updates as work moves.",
  },
  {
    problem: "Invoices are built by hand and late payments are noticed weeks later.",
    solution: "Invoices generated from line items, taxed and discounted correctly, with overdue alerts the day they slip.",
  },
  {
    problem: "Every new hire gets the same access, because roles are too much admin.",
    solution: "Four clear roles and a permission matrix you can adjust in a minute, per workspace.",
  },
];

export function Challenges() {
  return (
    <section id="solutions" className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <SectionLabel>The problem</SectionLabel>
            <h2 className="mt-5 font-display text-[clamp(2rem,3.6vw+0.6rem,3.75rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-white">
              Most growing teams run on seven tools and a spreadsheet{" "}
              <span className="text-white/35">nobody fully trusts.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="self-end lg:col-span-4">
            <p className="text-[16px] leading-relaxed text-white/55">
              NexaFlow replaces the patchwork with one workspace where sales, delivery, people and finance share the same data — so the
              numbers on Friday match the numbers on Monday.
            </p>
          </Reveal>
        </div>

        <ol className="mt-16 border-t border-white/[0.08] lg:mt-20">
          {CHALLENGES.map((c, i) => (
            <Reveal as="li" key={i} delay={i * 0.05} className="group grid gap-4 border-b border-white/[0.08] py-7 sm:py-9 lg:grid-cols-12 lg:gap-8">
              <span className="font-mono text-[12px] text-white/30 lg:col-span-1">0{i + 1}</span>
              <p className="text-[16px] leading-relaxed text-white/45 line-through decoration-white/20 decoration-1 lg:col-span-5">{c.problem}</p>
              <p className="flex gap-3 text-[16px] leading-relaxed text-white lg:col-span-6">
                <ArrowRight className="mt-1 size-4 shrink-0 text-[#a99bff] transition-transform duration-300 group-hover:translate-x-1" />
                {c.solution}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Interactive feature showcase                                               */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  {
    id: "crm",
    icon: Users,
    title: "CRM & customers",
    body: "Track every lead through a visual pipeline, keep notes and history on each account, and see lifetime value at a glance.",
  },
  {
    id: "projects",
    icon: FolderKanban,
    title: "Projects & tasks",
    body: "Kanban and list views, priorities, due dates and assignees — with progress that rolls up to the project automatically.",
  },
  {
    id: "invoices",
    icon: CircleDollarSign,
    title: "Invoicing & payments",
    body: "Build invoices from line items with tax and discounts, track payment status, and collect online through Stripe.",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics & reports",
    body: "Revenue, retention, collection rate and team throughput, compared month over month and exportable in a click.",
  },
] as const;

export function FeatureShowcase() {
  const [active, setActive] = useState<(typeof FEATURES)[number]["id"]>("crm");
  return (
    <section id="features" className="relative overflow-hidden bg-[#0e1426] py-24 sm:py-32 lg:py-36">
      <div aria-hidden className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(90_156_255/0.12),transparent)]" />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <SectionLabel>Platform</SectionLabel>
          <h2 className="mt-5 font-display text-[clamp(2rem,3vw+0.8rem,3.4rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-white">
            Four modules. One source of truth.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div role="tablist" aria-label="Platform modules" className="grid gap-2 lg:col-span-5">
            {FEATURES.map((f) => {
              const on = active === f.id;
              return (
                <button
                  key={f.id}
                  role="tab"
                  id={`tab-${f.id}`}
                  aria-selected={on}
                  aria-controls={`panel-${f.id}`}
                  onClick={() => setActive(f.id)}
                  onMouseEnter={() => setActive(f.id)}
                  className={cn(
                    "relative rounded-2xl border p-5 text-left transition-colors duration-300",
                    on ? "border-white/12 bg-white/[0.045]" : "border-transparent hover:bg-white/[0.025]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-xl transition-colors",
                        on ? "bg-[#795CFF] text-white" : "bg-white/[0.06] text-white/55",
                      )}
                    >
                      <f.icon className="size-[18px]" />
                    </span>
                    <span className={cn("text-[16px] font-semibold transition-colors", on ? "text-white" : "text-white/60")}>{f.title}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden pl-12 text-[14.5px] leading-relaxed text-white/55"
                      >
                        <span className="block pt-2">{f.body}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {on && (
                    <motion.span layoutId="feature-bar" className="absolute top-5 bottom-5 left-0 w-[2px] rounded-full bg-[#8B72FF]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7">
            <TiltCard className="rounded-3xl" max={4}>
              <div
                role="tabpanel"
                id={`panel-${active}`}
                aria-labelledby={`tab-${active}`}
                className="relative h-[420px] overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#151d35] to-[#0f1528] p-5 sm:h-[460px] sm:p-7"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="h-full"
                  >
                    {active === "crm" && <PipelineVisual />}
                    {active === "projects" && <BoardVisual />}
                    {active === "invoices" && <InvoiceVisual />}
                    {active === "analytics" && <AnalyticsVisual />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Visual mocks ------------------------------- */

const panel = "rounded-xl border border-white/[0.07] bg-white/[0.03]";

function PipelineVisual() {
  const cols = [
    { name: "Qualified", total: "$48k", deals: [["Juniper Labs", "$12,400"], ["Alder Coffee", "$6,800"]] },
    { name: "Proposal", total: "$61k", deals: [["Halcyon Media", "$22,000"], ["Fernway Realty", "$9,600"], ["Zephyr Fitness", "$4,100"]] },
    { name: "Won", total: "$94k", deals: [["Kestrel Analytics", "$31,500"], ["Sable Peak Labs", "$18,200"]] },
  ];
  return (
    <div className="flex h-full flex-col">
      <Header title="Sales pipeline" meta="Q4 · 23 open deals" />
      <div className="mt-5 grid flex-1 grid-cols-3 gap-3">
        {cols.map((c, ci) => (
          <div key={c.name} className={cn(panel, "p-2.5")}>
            <div className="flex items-center justify-between px-1 pb-2.5">
              <span className="text-[11px] font-medium text-white/70">{c.name}</span>
              <span className="text-[10px] text-white/40 tabular">{c.total}</span>
            </div>
            <div className="space-y-2">
              {c.deals.map(([n, v], i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * (ci * 2 + i) }}
                  className="rounded-lg border border-white/[0.07] bg-[#1a2340] p-2.5"
                >
                  <p className="truncate text-[11.5px] font-medium text-white">{n}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10.5px] text-white/50 tabular">{v}</span>
                    <span className="size-4 rounded-full" style={{ background: ["#c9bfff", "#a9cbff", "#9fe5d4"][i % 3] }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardVisual() {
  const cols = [
    ["To do", ["Wireframe checkout", "Content inventory"]],
    ["In progress", ["Hero animation", "Component audit", "QA on staging"]],
    ["In review", ["Logo lockups"]],
    ["Done", ["Moodboard round 2", "Stakeholder interviews"]],
  ] as const;
  return (
    <div className="flex h-full flex-col">
      <Header title="Design system v3" meta="72% complete · due in 12 days" />
      <div className="mt-5 grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
        {cols.map(([name, items], ci) => (
          <div key={name} className={cn(panel, "p-2", ci > 1 && "hidden sm:block")}>
            <p className="px-1 pb-2 text-[11px] font-medium text-white/60">
              {name} <span className="text-white/30">{items.length}</span>
            </p>
            <div className="space-y-1.5">
              {items.map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.06 * (ci + i) }}
                  className="rounded-lg border border-white/[0.07] bg-[#1a2340] p-2"
                >
                  <p className="text-[11px] leading-snug text-white">{t}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={cn("rounded px-1.5 text-[9px]", i % 2 ? "bg-[#C47722]/20 text-[#f3c58b]" : "bg-[#795CFF]/20 text-[#c9bfff]")}>
                      {i % 2 ? "High" : "Medium"}
                    </span>
                    <span className="size-4 rounded-full bg-[#a9cbff]" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoiceVisual() {
  return (
    <div className="relative h-full">
      <div className="absolute inset-y-0 left-0 w-[78%] rounded-2xl bg-[#f6f7fb] p-5 text-[#0d1226] shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">Invoice</p>
            <p className="text-[11px] text-[#5b6378]">INV-2026-0142</p>
          </div>
          <span className="rounded-md bg-[#e3f6ee] px-2 py-0.5 text-[10px] font-semibold text-[#138a5e]">Paid</span>
        </div>
        <div className="mt-5 space-y-2 text-[11.5px]">
          {[
            ["Brand identity package", "1 × $12,500", "$12,500.00"],
            ["UX research sprint", "1 × $6,800", "$6,800.00"],
            ["Frontend development", "24 × $140", "$3,360.00"],
          ].map(([d, q, t]) => (
            <div key={d} className="flex justify-between gap-3 border-b border-[#e3e6ef] pb-2">
              <span>
                {d}
                <span className="block text-[10px] text-[#7a8297]">{q}</span>
              </span>
              <span className="tabular">{t}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 ml-auto w-1/2 space-y-1 text-[11px]">
          <div className="flex justify-between text-[#5b6378]"><span>Discount 5%</span><span className="tabular">−$1,133.00</span></div>
          <div className="flex justify-between text-[#5b6378]"><span>Tax 8.5%</span><span className="tabular">$1,829.71</span></div>
          <div className="flex justify-between border-t border-[#e3e6ef] pt-1.5 text-[13px] font-semibold"><span>Total</span><span className="tabular">$23,356.71</span></div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
        className="glass absolute right-0 bottom-6 w-[56%] rounded-2xl border border-white/10 p-4 shadow-2xl"
      >
        <p className="text-[11px] text-white/50">Stripe payment · simulated</p>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11.5px] text-white/80">
          <span className="rounded bg-white/90 px-1 text-[9px] font-bold text-[#1a1f71]">VISA</span>
          •••• 4242
        </div>
        <div className="mt-3 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#795CFF] text-[12px] font-semibold text-white">
          <Check className="size-3.5" /> Payment succeeded
        </div>
      </motion.div>
    </div>
  );
}

function AnalyticsVisual() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Business analytics" meta="Last 12 months" />
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {[
          ["Net revenue", "$1.42M", "#8B72FF", [3, 4, 4, 5, 6, 6, 7, 8]],
          ["Retention", "94.2%", "#14A38B", [8, 7, 8, 8, 9, 8, 9, 9]],
          ["Collection", "91.6%", "#5A9CFF", [5, 6, 5, 7, 6, 8, 7, 8]],
        ].map(([k, v, c, p]) => (
          <div key={k as string} className={cn(panel, "p-3")}>
            <p className="text-[10px] text-white/45">{k as string}</p>
            <p className="mt-0.5 font-display text-[16px] font-semibold text-white tabular">{v as string}</p>
            <div className="mt-2 h-7">
              <Sparkline id={`an-${k}`} points={p as number[]} height={28} color={c as string} />
            </div>
          </div>
        ))}
      </div>
      <div className={cn(panel, "mt-2.5 flex flex-1 flex-col p-3")}>
        <p className="text-[11px] font-medium text-white/70">Revenue vs. expenses</p>
        <div className="mt-auto pt-3">
          <Bars values={[42, 48, 45, 53, 58, 55, 64, 70, 67, 76, 84, 92]} height={130} color="#8B72FF" />
        </div>
      </div>
    </div>
  );
}

function Header({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-end justify-between">
      <p className="font-display text-[17px] font-semibold tracking-tight text-white">{title}</p>
      <p className="text-[11px] text-white/40">{meta}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Module deep-dives (light section for rhythm)                               */
/* -------------------------------------------------------------------------- */

export function Modules() {
  return (
    <section aria-label="Modules" className="bg-[#f6f7fb] py-24 text-[#0d1226] sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1240px] space-y-28 px-5 sm:px-8 lg:space-y-40">
        {/* CRM — visual left 7 / text right 5 */}
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="order-2 lg:order-1 lg:col-span-7">
            <div className="rounded-3xl border border-[#e3e6ef] bg-white p-5 shadow-[0_30px_60px_-30px_rgb(16_24_40/0.25)] sm:p-6">
              <div className="flex items-center gap-4 border-b border-[#eef0f6] pb-5">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#efebff] font-display text-lg font-semibold text-[#795CFF]">KA</span>
                <div>
                  <p className="font-semibold">Kestrel Analytics</p>
                  <p className="text-[13px] text-[#5b6378]">Mid-market · Austin, US · Owner: Priya Raman</p>
                </div>
                <span className="ml-auto hidden rounded-md bg-[#e3f6ee] px-2 py-0.5 text-xs font-medium text-[#138a5e] sm:inline">Active</span>
              </div>
              <div className="grid gap-4 pt-5 sm:grid-cols-3">
                {[["Lifetime value", "$84,200"], ["Open deals", "2 · $31.5k"], ["Last contact", "2 days ago"]].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-[#7a8297]">{k}</p>
                    <p className="mt-1 font-display text-lg font-semibold tracking-tight tabular">{v}</p>
                  </div>
                ))}
              </div>
              <ol className="mt-6 space-y-4 border-l border-[#e3e6ef] pl-5">
                {[
                  ["Invoice INV-0142 paid", "Payment · $23,356.71", "#14A38B"],
                  ["Proposal sent for Q1 retainer", "Deal moved to Proposal", "#795CFF"],
                  ["Call notes added", "“Wants a case-study summary to share internally.”", "#3D8BFF"],
                ].map(([t, s, c]) => (
                  <li key={t} className="relative">
                    <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full ring-4 ring-white" style={{ background: c }} />
                    <p className="text-[14px] font-medium">{t}</p>
                    <p className="text-[13px] text-[#5b6378]">{s}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="order-1 lg:order-2 lg:col-span-5">
            <ModuleCopy
              label="CRM"
              title="Every customer, with the whole story attached."
              body="Contacts, company details, deals, notes and invoices sit on one record. Filter by status or segment, see who owns the relationship, and pick up any conversation with context."
              points={["Visual deal pipeline", "Notes & activity timeline", "Segments, statuses and owners"]}
            />
          </Reveal>
        </div>

        {/* Projects — heading row, then full-width board */}
        <div>
          <div className="grid gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-6">
              <ModuleCopy label="Projects & tasks" title="Plan the work, then watch it move." />
            </Reveal>
            <Reveal delay={0.1} className="self-end lg:col-span-5 lg:col-start-8">
              <p className="text-[16px] leading-relaxed text-[#5b6378]">
                Create projects for clients or internal initiatives, assign people, and track tasks across To Do, In Progress, In Review and
                Completed. Drag cards between columns; progress updates itself.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="mt-12">
            <div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              <div className="grid min-w-[760px] grid-cols-4 gap-4 rounded-3xl border border-[#e3e6ef] bg-white p-4 shadow-[0_30px_60px_-30px_rgb(16_24_40/0.2)]">
                {[
                  ["To Do", "#7a8297", ["Analytics events spec", "Usability test plan"]],
                  ["In Progress", "#3D8BFF", ["Checkout wireframes", "Component audit", "Hero animation"]],
                  ["In Review", "#C47722", ["Logo lockups", "Accessibility pass"]],
                  ["Completed", "#14A38B", ["Moodboard round 2", "Stakeholder interviews"]],
                ].map(([name, color, items]) => (
                  <div key={name as string} className="rounded-2xl bg-[#f6f7fb] p-3">
                    <p className="flex items-center gap-2 px-1 pb-3 text-[13px] font-semibold">
                      <span className="size-2 rounded-full" style={{ background: color as string }} />
                      {name as string}
                      <span className="font-normal text-[#7a8297]">{(items as string[]).length}</span>
                    </p>
                    <div className="space-y-2">
                      {(items as string[]).map((t, i) => (
                        <div key={t} className="rounded-xl border border-[#e3e6ef] bg-white p-3 transition-transform hover:-translate-y-0.5">
                          <p className="text-[13px] font-medium">{t}</p>
                          <div className="mt-3 flex items-center justify-between text-[11px] text-[#7a8297]">
                            <span>Due {["Nov 18", "Nov 21", "Nov 24"][i % 3]}</span>
                            <span className="size-5 rounded-full" style={{ background: ["#d9d1ff", "#cfe2ff", "#c8f0e4"][i % 3] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Team — text left 5 / permissions right 7 */}
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <ModuleCopy
              label="Employees & teams"
              title="The right access for every role, without the admin."
              body="A shared directory with departments, titles and employment status. Choose from Super Admin, Company Admin, Manager and Employee, then fine-tune exactly what each role can see and change."
              points={["Departments & team assignment", "Role-based permission matrix", "Invite, deactivate, reassign"]}
            />
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-[#e3e6ef] bg-white shadow-[0_30px_60px_-30px_rgb(16_24_40/0.25)]">
              <div className="grid grid-cols-[1.6fr_repeat(4,1fr)] border-b border-[#eef0f6] bg-[#fafbfd] px-5 py-3 text-[11px] font-medium text-[#5b6378]">
                <span>Permission</span>
                {["Super", "Admin", "Manager", "Employee"].map((r) => (
                  <span key={r} className="text-center">{r}</span>
                ))}
              </div>
              {[
                ["Manage customers", [1, 1, 1, 0]],
                ["Manage invoices", [1, 1, 0, 0]],
                ["Issue refunds", [1, 1, 0, 0]],
                ["Manage tasks", [1, 1, 1, 1]],
                ["Export reports", [1, 1, 1, 0]],
                ["Billing", [1, 0, 0, 0]],
              ].map(([label, vals]) => (
                <div key={label as string} className="grid grid-cols-[1.6fr_repeat(4,1fr)] items-center border-b border-[#eef0f6] px-5 py-3 text-[13px] last:border-0">
                  <span className="font-medium">{label as string}</span>
                  {(vals as number[]).map((v, i) => (
                    <span key={i} className="flex justify-center">
                      <span className={cn("flex h-5 w-9 items-center rounded-full p-0.5", v ? "bg-[#795CFF]" : "bg-[#dfe3ee]")}>
                        <span className={cn("size-4 rounded-full bg-white shadow transition-transform", v && "translate-x-4")} />
                      </span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Invoicing & analytics — two-up with oversized numbers */}
        <div className="grid gap-6 lg:grid-cols-12">
          <Reveal className="rounded-3xl bg-[#0b1020] p-7 text-white sm:p-10 lg:col-span-7">
            <ModuleCopy
              dark
              label="Invoicing & payments"
              title="Send accurate invoices. Get paid sooner."
              body="Pick a customer, add line items, apply tax and discounts — totals calculate as you type. Track Draft, Pending, Paid and Overdue, print a clean PDF, and take card payments through Stripe."
            />
            <ol className="mt-10 flex items-center gap-2 border-t border-white/10 pt-8 text-[13px]" aria-label="Invoice lifecycle">
              {[["Draft", "#7d86a2"], ["Pending", "#5A9CFF"], ["Paid", "#3ccf91"]].map(([s, c], i) => (
                <li key={s} className="flex flex-1 items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/80">
                    <span className="size-2 rounded-full" style={{ background: c }} aria-hidden />
                    {s}
                  </span>
                  {i < 2 && <span className="h-px flex-1 bg-gradient-to-r from-white/25 to-white/5" aria-hidden />}
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-[#e3e6ef] bg-white p-7 sm:p-10 lg:col-span-5">
            <ModuleCopy
              label="Analytics"
              title="Know where the business stands."
              body="Revenue trends, acquisition and retention, project completion and collection rates — with date ranges and exports."
            />
            <div className="mt-8 flex items-center gap-5">
              <div className="relative">
                <Ring value={91} size={84} stroke={8} color="#795CFF" />
                <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-semibold tabular">91%</span>
              </div>
              <p className="text-[13px] leading-snug text-[#5b6378]">
                Collection rate in the sample workspace
                <span className="block text-[11px] text-[#7a8297]">Illustrative demo data</span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ModuleCopy({
  label,
  title,
  body,
  points,
  dark,
}: {
  label: string;
  title: string;
  body?: string;
  points?: string[];
  dark?: boolean;
}) {
  return (
    <div>
      <p className={cn("label-caps", dark ? "text-[#a99bff]" : "text-[#6544f5]")}>{label}</p>
      <h3 className="mt-4 font-display text-[clamp(1.75rem,2.2vw+0.8rem,2.6rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
        {title}
      </h3>
      {body && <p className={cn("mt-5 max-w-[32rem] text-[16px] leading-relaxed", dark ? "text-white/60" : "text-[#5b6378]")}>{body}</p>}
      {points && (
        <ul className="mt-7 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-[15px] font-medium">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#efebff] text-[#6544f5]">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Multi-tenant                                                               */
/* -------------------------------------------------------------------------- */

const TENANTS = [
  { name: "Lumen & Pine Studio", industry: "Creative agency", color: "#795CFF", rows: ["48 customers", "18 people", "7 projects"] },
  { name: "Harborline Logistics", industry: "Freight & logistics", color: "#3D8BFF", rows: ["64 customers", "26 people", "9 projects"] },
  { name: "Verdant Wellness Group", industry: "Wellness clinics", color: "#14A38B", rows: ["30 customers", "12 people", "5 projects"] },
];

export function MultiTenant() {
  const [active, setActive] = useState(0);
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <SectionLabel>Multi-company workspaces</SectionLabel>
          <h2 className="mt-5 font-display text-[clamp(2rem,3vw+0.8rem,3.4rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-white">
            Run several companies. Keep their data apart.
          </h2>
          <p className="mt-6 max-w-[30rem] text-[16px] leading-relaxed text-white/55">
            Each workspace is its own tenant with separate customers, people, projects, invoices and analytics. Switch between them in one
            click — access is checked per workspace, every time.
          </p>
          <ul className="mt-9 grid gap-4 sm:grid-cols-2">
            {[
              [Layers, "Isolated data per workspace"],
              [ShieldCheck, "Roles scoped to each company"],
              [Building2, "Separate billing & branding"],
              [Workflow, "One login across all of them"],
            ].map(([Icon, t]) => {
              const I = Icon as typeof Layers;
              return (
                <li key={t as string} className="flex items-center gap-3 text-[14.5px] text-white/80">
                  <I className="size-[18px] text-[#a99bff]" />
                  {t as string}
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
          <div className="relative rounded-3xl border border-white/[0.08] bg-[#0e1426] p-3 sm:p-4">
            <div className="grid gap-2" role="radiogroup" aria-label="Example workspaces">
              {TENANTS.map((t, i) => (
                <button
                  key={t.name}
                  role="radio"
                  aria-checked={active === i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-colors",
                    active === i ? "border-white/12 bg-white/[0.05]" : "border-transparent hover:bg-white/[0.025]",
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-[15px] font-semibold text-white" style={{ background: t.color }}>
                    {t.name[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold text-white">{t.name}</span>
                    <span className="block text-[12.5px] text-white/45">{t.industry}</span>
                  </span>
                  {active === i && (
                    <motion.span layoutId="tenant-check" className="flex size-6 items-center justify-center rounded-full bg-[#795CFF]">
                      <Check className="size-3.5 text-white" strokeWidth={3} />
                    </motion.span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-2xl border border-white/[0.07] bg-[#0b1020] p-4 font-mono text-[12px]">
              <p className="text-white/35">-- every query is scoped to the active tenant</p>
              <p className="mt-1.5 text-white/75">
                <span className="text-[#a99bff]">SELECT</span> * <span className="text-[#a99bff]">FROM</span> customers
              </p>
              <p className="text-white/75">
                <span className="text-[#a99bff]">WHERE</span> workspace_id = <AnimatePresence mode="wait">
                  <motion.span
                    key={active}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="inline-block text-[#7ee0c2]"
                  >
                    &apos;{["ws_lumen", "ws_harbor", "ws_verdant"][active]}&apos;
                  </motion.span>
                </AnimatePresence>
                ;
              </p>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                {TENANTS[active].rows.map((r) => (
                  <span key={r} className="rounded-md bg-white/[0.05] px-2 py-1 text-[11px] text-white/60">{r}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pricing                                                                    */
/* -------------------------------------------------------------------------- */

const PLANS = [
  {
    name: "Starter",
    price: 19,
    blurb: "For small teams getting organised.",
    features: ["Up to 10 people", "CRM, projects & invoicing", "1 workspace", "Email support"],
  },
  {
    name: "Growth",
    price: 39,
    blurb: "For businesses scaling operations.",
    features: ["Unlimited people", "Everything in Starter", "Advanced analytics & exports", "Custom roles & permissions", "Stripe payments"],
    featured: true,
  },
  {
    name: "Scale",
    price: 79,
    blurb: "For groups running several companies.",
    features: ["Unlimited workspaces", "Everything in Growth", "SSO & audit log", "Priority support"],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  return (
    <section id="pricing" className="bg-[#f6f7fb] py-24 text-[#0d1226] sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <p className="label-caps text-[#6544f5]">Pricing</p>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(2rem,3vw+0.8rem,3.4rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
              Simple pricing that grows with you.
            </h2>
            <p className="mt-3 text-[13px] text-[#7a8297]">Illustrative pricing for this product demo.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-xl border border-[#e3e6ef] bg-white p-1">
              {[false, true].map((a) => (
                <button
                  key={String(a)}
                  role="radio"
                  aria-checked={annual === a}
                  onClick={() => setAnnual(a)}
                  className="relative h-9 rounded-lg px-4 text-[13.5px] font-medium"
                >
                  {annual === a && <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-lg bg-[#0b1020]" />}
                  <span className={cn("relative", annual === a ? "text-white" : "text-[#5b6378]")}>
                    {a ? "Annual · save 20%" : "Monthly"}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid gap-5 lg:grid-cols-3">
          {PLANS.map((p) => {
            const price = annual ? Math.round(p.price * 0.8) : p.price;
            return (
              <StaggerItem
                key={p.name}
                className={cn(
                  "relative flex flex-col rounded-3xl border p-7 sm:p-8",
                  p.featured ? "border-[#0b1020] bg-[#0b1020] text-white shadow-[0_40px_80px_-40px_rgb(121_92_255/0.6)]" : "border-[#e3e6ef] bg-white",
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold tracking-tight">{p.name}</h3>
                  {p.featured && <span className="rounded-full bg-[#795CFF] px-2.5 py-1 text-[11px] font-semibold">Most popular</span>}
                </div>
                <p className={cn("mt-2 text-[14px]", p.featured ? "text-white/55" : "text-[#5b6378]")}>{p.blurb}</p>
                <p className="mt-8 flex items-baseline gap-1.5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={price}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="font-display text-5xl font-semibold tracking-[-0.04em] tabular"
                    >
                      ${price}
                    </motion.span>
                  </AnimatePresence>
                  <span className={cn("text-[14px]", p.featured ? "text-white/50" : "text-[#7a8297]")}>per user / month</span>
                </p>
                <Link
                  href="/sign-up"
                  className={cn(
                    "mt-8 inline-flex h-11 items-center justify-center rounded-xl text-[14.5px] font-semibold transition-colors",
                    p.featured ? "bg-[#795CFF] text-white hover:bg-[#6544f5]" : "border border-[#dfe3ee] hover:bg-[#f6f7fb]",
                  )}
                >
                  Start free trial
                </Link>
                <ul className="mt-8 space-y-3 border-t pt-8 text-[14.5px] [border-color:inherit]">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <Check className={cn("size-4", p.featured ? "text-[#a99bff]" : "text-[#6544f5]")} strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
