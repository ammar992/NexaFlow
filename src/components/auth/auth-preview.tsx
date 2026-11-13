"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/marketing/svg-charts";

const EASE = [0.16, 1, 0.3, 1] as const;

export function AuthPreview() {
  return (
    <div className="relative mx-auto h-full max-h-[420px] w-full max-w-[520px] [perspective:1600px]">
      <motion.div
        initial={{ opacity: 0, rotateX: 20, rotateY: -18, y: 30 }}
        animate={{ opacity: 1, rotateX: 12, rotateY: -12, y: 0 }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{ transformStyle: "preserve-3d" }}
        className="absolute inset-x-0 top-6 rounded-2xl border border-white/10 bg-[#11182b] p-5 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]"
      >
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-white/50">Monthly revenue</p>
          <span className="inline-flex items-center gap-0.5 rounded-md bg-[#14A38B]/15 px-1.5 py-0.5 text-[11px] text-[#7ee0c2]">
            <ArrowUpRight className="size-3" /> 9.8%
          </span>
        </div>
        <p className="mt-1 font-display text-3xl font-semibold tracking-tight tabular">$96,840</p>
        <div className="mt-4 h-24">
          <Sparkline id="auth-spark" points={[30, 34, 31, 40, 44, 41, 50, 56, 53, 61, 66, 72]} height={96} width={460} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.07] pt-4">
          {[["Customers", "312"], ["Open tasks", "84"], ["Paid invoices", "92%"]].map(([k, v]) => (
            <div key={k}>
              <p className="text-[11px] text-white/45">{k}</p>
              <p className="mt-0.5 font-display text-lg font-semibold tabular">{v}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
        className="glass absolute right-[-4%] bottom-0 w-60 rounded-2xl border border-white/10 p-4 shadow-2xl"
      >
        <div className="animate-float">
          <p className="text-[12.5px] font-medium">Deal won · Halcyon Media</p>
          <p className="mt-0.5 text-[11.5px] text-white/50">$22,000 · moved by Priya</p>
        </div>
      </motion.div>
      <p className="sr-only">Illustrative preview of the NexaFlow dashboard.</p>
    </div>
  );
}
