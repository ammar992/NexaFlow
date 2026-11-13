"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  Play,
  Receipt,
  Search,
  Settings,
  Users,
  UserRoundPlus,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Ring, smoothPath, Sparkline } from "@/components/marketing/svg-charts";

const EASE = [0.16, 1, 0.3, 1] as const;
const REVENUE = [42, 48, 45, 53, 58, 55, 64, 70, 67, 76, 84, 92];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Composition flattens slightly as you scroll past it.
  const scrollTilt = useTransform(scrollYProgress, [0, 1], [11, 3]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Gentle pointer parallax on desktop.
  const px = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const rotateY = useTransform(px, (v) => -11 + v * 5);
  const rotateX = useTransform([scrollTilt, py], ([s, v]: number[]) => s - v * 4);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  };

  return (
    <section ref={ref} id="product" onPointerMove={onMove} className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 lg:pb-32">
      {/* backdrop: hairline grid + one soft key light */}
      <div aria-hidden className="grid-backdrop absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_30%,#000_30%,transparent_75%)]" />
      <div aria-hidden className="absolute top-[18%] right-[-10%] -z-10 h-[620px] w-[820px] rounded-full bg-[radial-gradient(closest-side,rgb(121_92_255/0.28),rgb(90_156_255/0.10)_55%,transparent)] blur-2xl" />

      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-8">
        <div className="relative z-10 lg:col-span-6 lg:pt-6">
          <motion.a
            href="#features"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pr-3 pl-1 text-[13px] text-white/70 transition-colors hover:border-white/20"
          >
            <span className="rounded-full bg-[#795CFF] px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
            Multi-workspace billing and roles
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </motion.a>

          <h1 className="mt-7 font-display text-[clamp(2.4rem,3.3vw+0.9rem,4.1rem)] leading-[1] font-semibold tracking-[-0.045em] text-white">
            {["Run your entire", "business from one", "powerful workspace."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.08 + i * 0.09 }}
                >
                  {i === 2 ? (
                    <>
                      <span className="bg-gradient-to-r from-[#a99bff] via-[#8fb6ff] to-[#5A9CFF] bg-clip-text text-transparent">powerful</span>{" "}
                      workspace.
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
            className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-white/60 sm:text-lg"
          >
            Manage customers, teams, projects, invoices, and everyday operations through one intelligent business management platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/sign-up"
              className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#795CFF] px-6 text-[15px] font-semibold text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_30px_-10px_rgb(121_92_255/0.8)] transition-transform active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Start free trial
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/[0.07]"
            >
              <Play className="size-4 fill-current" />
              Explore platform
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/45"
          >
            {["14-day trial, no card required", "Unlimited workspaces on Scale", "Live interactive demo"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#8fb6ff]" />
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* 3D product composition */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
          style={{ y: lift }}
          className="relative lg:col-span-6"
        >
          <div className="relative mx-auto w-full max-w-[720px] [perspective:2200px] lg:absolute lg:top-4 lg:left-0 lg:w-[calc(100%+120px)] lg:max-w-none">
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative max-lg:![transform:rotateX(8deg)_rotateY(-6deg)]"
            >
              <AppWindow />

              {/* floating cards — each sits on its own depth plane, over low-value areas of the window */}
              <FloatCard className="top-[-9%] right-[5%] w-[min(230px,52%)]" z={90} delay={0.7} float="animate-float">
                <RevenueCard />
              </FloatCard>
              <FloatCard className="bottom-[-12%] left-[-3%] w-[min(250px,62%)]" z={120} delay={0.85} float="animate-float-slow">
                <ProjectCard />
              </FloatCard>
              <FloatCard className="right-[3%] bottom-[-8%] hidden w-[250px] sm:block" z={150} delay={1}>
                <NotificationCard />
              </FloatCard>
              <FloatCard className="top-[46%] left-[4%] hidden w-[200px] xl:block" z={70} delay={1.15} float="animate-float-slow">
                <ActivityCard />
              </FloatCard>
            </motion.div>
          </div>
          <div className="h-[290px] sm:h-[440px] lg:h-[500px]" aria-hidden />
        </motion.div>
      </div>
      <p className="sr-only">Product interface shown with illustrative demo data.</p>
    </section>
  );
}

function FloatCard({
  children,
  className,
  z,
  delay,
  float,
}: {
  children: React.ReactNode;
  className: string;
  z: number;
  delay: number;
  float?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      style={{ z }}
      className={`absolute ${className}`}
    >
      <div className={float}>
        <div className="glass rounded-2xl border border-white/[0.09] p-4 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8),0_0_0_1px_rgb(255_255_255/0.02)]">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function AppWindow() {
  const { line, area } = smoothPath(REVENUE, 520, 150, 4);
  const nav = [LayoutDashboard, Users, FolderKanban, Receipt, BarChart3, Settings];
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/[0.09] bg-[#0e1426] shadow-[0_60px_120px_-30px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.03)_inset]">
      {/* title bar */}
      <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] px-4">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <div className="mx-auto flex h-6 w-1/2 items-center gap-2 rounded-md bg-white/[0.04] px-2.5 text-[10px] text-white/35">
          <Search className="size-3" /> app.nexaflow.demo/overview
        </div>
      </div>
      <div className="flex">
        <aside className="hidden w-[52px] flex-col items-center gap-3 border-r border-white/[0.06] py-4 sm:flex">
          <LogoMark size={22} />
          {nav.map((Icon, i) => (
            <span key={i} className={`flex size-8 items-center justify-center rounded-lg ${i === 0 ? "bg-[#795CFF]/20 text-[#b3a6ff]" : "text-white/30"}`}>
              <Icon className="size-4" />
            </span>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/40">Lumen &amp; Pine Studio</p>
              <p className="font-display text-[15px] font-semibold tracking-tight text-white">Good morning, Alex</p>
            </div>
            <div className="flex -space-x-1.5">
              {["#c9bfff", "#a9cbff", "#9fe5d4", "#f5c99a"].map((c) => (
                <span key={c} className="size-6 rounded-full ring-2 ring-[#0e1426]" style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              ["Revenue", "$128.4k", "+12.6%"],
              ["Customers", "1,284", "+4.1%"],
              ["Active projects", "36", "+3"],
              ["Pending invoices", "$18.2k", "9 open"],
            ].map(([k, v, d]) => (
              <div key={k} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                <p className="text-[10px] text-white/40">{k}</p>
                <p className="mt-1 font-display text-[15px] font-semibold tracking-tight text-white tabular">{v}</p>
                <p className="mt-0.5 text-[10px] text-[#7ee0c2]">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-5">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 sm:col-span-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-white/70">Monthly revenue</p>
                <p className="text-[10px] text-white/35">12 months</p>
              </div>
              <svg viewBox="0 0 520 150" className="mt-2 h-[110px] w-full" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#795CFF" stopOpacity="0.38" />
                    <stop offset="1" stopColor="#795CFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[30, 70, 110].map((y) => (
                  <line key={y} x1="0" x2="520" y1={y} y2={y} stroke="rgb(255 255 255 / 0.05)" />
                ))}
                <path d={area} fill="url(#hero-area)" />
                <motion.path
                  d={line}
                  fill="none"
                  stroke="#9c88ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, ease: EASE, delay: 0.6 }}
                />
              </svg>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 sm:col-span-2">
              <p className="text-[11px] font-medium text-white/70">Recent transactions</p>
              <ul className="mt-2 space-y-2">
                {[
                  ["Kestrel Analytics", "+$4,200", "#9fe5d4"],
                  ["Copperleaf Foods", "+$1,860", "#a9cbff"],
                  ["Sable Peak Labs", "+$7,450", "#c9bfff"],
                  ["Harrow Media", "+$980", "#f5c99a"],
                ].map(([n, a, c]) => (
                  <li key={n} className="flex items-center gap-2 text-[10.5px]">
                    <span className="size-5 shrink-0 rounded-md" style={{ background: `${c}33`, boxShadow: `inset 0 0 0 1px ${c}55` }} />
                    <span className="truncate text-white/65">{n}</span>
                    <span className="ml-auto text-white/85 tabular">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueCard() {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-white/50">Revenue this month</p>
        <span className="inline-flex items-center gap-0.5 rounded-md bg-[#14A38B]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#7ee0c2]">
          <ArrowUpRight className="size-3" />
          12.6%
        </span>
      </div>
      <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-white tabular">$128,420</p>
      <div className="mt-2 h-9">
        <Sparkline id="hero-spark" points={[12, 18, 14, 22, 19, 27, 25, 33]} height={36} color="#5A9CFF" />
      </div>
    </>
  );
}

function ProjectCard() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative shrink-0">
        <Ring value={72} size={52} />
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white tabular">72%</span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-white/50">Design system v3</p>
        <p className="mt-0.5 text-[13px] font-medium text-white">18 of 25 tasks done</p>
        <div className="mt-1.5 flex gap-1">
          {["To do", "Review", "Done"].map((s, i) => (
            <span key={s} className={`rounded px-1.5 py-0.5 text-[9.5px] ${i === 2 ? "bg-[#795CFF]/25 text-[#c9bfff]" : "bg-white/[0.06] text-white/50"}`}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationCard() {
  return (
    <div className="flex gap-3">
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#795CFF]/20 text-[#c9bfff]">
        <Bell className="size-4" />
        <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-[#5A9CFF] ring-2 ring-[#151c32]" />
      </span>
      <div>
        <p className="text-[12.5px] font-medium text-white">Invoice INV-0142 paid</p>
        <p className="mt-0.5 text-[11px] leading-snug text-white/50">Sable Peak Labs · $7,450.00 via card</p>
        <p className="mt-1.5 text-[10px] text-white/35">just now</p>
      </div>
    </div>
  );
}

function ActivityCard() {
  return (
    <>
      <p className="text-[11px] text-white/50">Customer activity</p>
      <ul className="mt-2.5 space-y-2.5">
        {[
          [UserRoundPlus, "New lead added", "Juniper Labs"],
          [CheckCircle2, "Deal won", "Halcyon Media"],
        ].map(([Icon, t, s]) => {
          const I = Icon as typeof Bell;
          return (
            <li key={t as string} className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/[0.06] text-[#8fb6ff]">
                <I className="size-3.5" />
              </span>
              <span>
                <span className="block text-[11.5px] font-medium text-white">{t as string}</span>
                <span className="block text-[10.5px] text-white/45">{s as string}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
