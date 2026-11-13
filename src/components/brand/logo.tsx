import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="nf-mark" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B72FF" />
          <stop offset="1" stopColor="#5A9CFF" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#nf-mark)" />
      <path d="M9.5 22.5V10.2c0-.9 1.1-1.3 1.7-.7l9.6 10.9c.6.7 1.7.2 1.7-.7V9.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22.5" cy="22.5" r="1.9" fill="#fff" />
    </svg>
  );
}

export function Logo({ className, href = "/", tone = "auto" }: { className?: string; href?: string; tone?: "auto" | "light" }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-lg", className)} aria-label="NexaFlow home">
      <LogoMark />
      <span
        className={cn(
          "font-display text-[17px] font-semibold tracking-[-0.02em]",
          tone === "light" ? "text-white" : "text-foreground",
        )}
      >
        NexaFlow
      </span>
    </Link>
  );
}
