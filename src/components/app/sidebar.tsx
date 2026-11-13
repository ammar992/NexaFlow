"use client";

import { motion } from "motion/react";
import { ChevronsLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { isActive, NAV_GROUPS, SETTINGS_ITEM, type NavItem } from "@/components/app/nav";
import { Tooltip } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import { useActiveWorkspace, useWorkspaceData } from "@/store/app-store";

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const data = useWorkspaceData();
  const openTasks = data.tasks.filter((t) => t.status !== "completed").length;
  const badges: Record<string, number | undefined> = { "/app/tasks": openTasks || undefined };

  const renderItem = (item: NavItem) => {
    const active = isActive(pathname, item.href);
    const link = (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13.5px] font-medium transition-colors",
          active ? "text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        {active && (
          <motion.span
            layoutId={onNavigate ? "sidebar-active-mobile" : "sidebar-active"}
            className="absolute inset-0 rounded-lg border border-border bg-card shadow-card dark:bg-muted"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        )}
        <item.icon className={cn("relative size-[18px] shrink-0", active && "text-primary")} />
        {!collapsed && <span className="relative truncate">{item.label}</span>}
        {!collapsed && badges[item.href] && (
          <span className="relative ml-auto rounded-md bg-primary-soft px-1.5 text-[11px] font-semibold text-primary tabular">{badges[item.href]}</span>
        )}
      </Link>
    );
    return (
      <li key={item.href}>
        {collapsed ? (
          <Tooltip content={item.label} side="right">
            {link}
          </Tooltip>
        ) : (
          link
        )}
      </li>
    );
  };

  return (
    <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-2 scrollbar-thin">
      {NAV_GROUPS.map((g) => (
        <div key={g.label}>
          {!collapsed ? (
            <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground/70 uppercase">{g.label}</p>
          ) : (
            <div className="mx-auto mb-2 h-px w-6 bg-border" aria-hidden />
          )}
          <ul className="grid gap-0.5">{g.items.map(renderItem)}</ul>
        </div>
      ))}
      <ul className="mt-auto grid gap-0.5 pt-2">{renderItem(SETTINGS_ITEM)}</ul>
    </nav>
  );
}

export function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const workspace = useActiveWorkspace();
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-subtle lg:flex print:!hidden"
    >
      <div className={cn("flex h-16 items-center gap-2.5 px-5", collapsed && "justify-center px-0")}>
        <Link href="/app" className="flex items-center gap-2.5" aria-label="NexaFlow overview">
          <LogoMark />
          {!collapsed && <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">NexaFlow</span>}
        </Link>
      </div>
      <SidebarNav collapsed={collapsed} />
      <div className="p-3">
        {!collapsed && workspace && (
          <div className="mb-3 rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <Sparkles className="size-4 text-primary" />
              {workspace.plan} plan
            </div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">Demo workspace — data resets anytime from Help.</p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <ChevronsLeft className={cn("size-[18px] transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </motion.aside>
  );
}
