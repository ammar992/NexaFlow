"use client";

import { Tabs as TabsPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-card [&_svg]:size-3.5",
        className,
      )}
      {...props}
    />
  );
}

/** Segmented control for view toggles that don't need tab panels. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  compact,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; icon?: React.ReactNode }[];
  label: string;
  className?: string;
  /** Show only icons below the sm breakpoint (labels stay available to screen readers). */
  compact?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex items-center gap-1 rounded-lg bg-muted p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-3.5",
            value === o.value && "bg-card text-foreground shadow-card",
          )}
        >
          {o.icon}
          {o.icon && compact ? <span className="max-sm:sr-only">{o.label}</span> : o.label}
        </button>
      ))}
    </div>
  );
}
