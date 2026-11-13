"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => format(v));
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, value, mv]);
  return (
    <>
      <motion.span ref={ref} aria-hidden>
        {text}
      </motion.span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}

export function StatCard({
  label,
  value,
  format,
  delta,
  deltaLabel = "vs last month",
  icon,
  invertDelta,
  className,
  index = 0,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  delta?: number;
  deltaLabel?: string;
  icon: React.ReactNode;
  /** For metrics where down is good (e.g. pending invoices). */
  invertDelta?: boolean;
  className?: string;
  index?: number;
}) {
  const up = (delta ?? 0) >= 0;
  const good = invertDelta ? !up : up;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      className={cn("group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-pop sm:p-5", className)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary transition-transform group-hover:scale-105 [&_svg]:size-4">
          {icon}
        </span>
      </div>
      <p className="mt-2 font-display text-[22px] font-semibold tracking-[-0.03em] tabular sm:text-[26px]">
        <AnimatedNumber value={value} format={format} />
      </p>
      {delta !== undefined && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("inline-flex items-center gap-0.5 font-semibold", good ? "text-success" : "text-danger")}>
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="truncate">{deltaLabel}</span>
        </p>
      )}
    </motion.div>
  );
}
