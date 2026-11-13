"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#solutions", label: "Solutions" },
  { href: "#pricing", label: "Pricing" },
  { href: "#resources", label: "Resources" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  // Highlight the section currently in view.
  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex h-14 max-w-[1240px] items-center justify-between rounded-2xl border px-3 transition-[background-color,border-color,box-shadow] duration-300 sm:px-4",
          scrolled || open
            ? "glass border-white/[0.08] shadow-[0_8px_30px_-10px_rgb(0_0_0/0.6)]"
            : "border-transparent bg-transparent",
        )}
      >
        <Logo tone="light" />

        <ul className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href} className="relative">
              <a
                href={l.href}
                className={cn(
                  "relative z-10 block rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-white/65 transition-colors hover:text-white",
                  active === l.href && "text-white",
                )}
              >
                {l.label}
              </a>
              {active === l.href && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-white/[0.07]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/sign-in" className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-white/75 transition-colors hover:text-white">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-4 text-[13.5px] font-semibold text-[#0b1020] transition-transform active:scale-[0.98]"
          >
            Get started
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass mx-auto mt-2 max-w-[1240px] rounded-2xl border border-white/[0.08] p-3 lg:hidden"
          >
            <ul className="grid">
              {LINKS.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex h-12 items-center rounded-xl px-3 text-[15px] font-medium text-white/85 active:bg-white/5"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-3">
              <Link href="/sign-in" className="flex h-11 items-center justify-center rounded-xl border border-white/10 text-sm font-medium text-white">
                Sign in
              </Link>
              <Link href="/sign-up" className="flex h-11 items-center justify-center rounded-xl bg-white text-sm font-semibold text-[#0b1020]">
                Get started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
