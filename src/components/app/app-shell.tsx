"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { motion } from "motion/react";
import { FolderKanban, LayoutDashboard, MoreHorizontal, Receipt, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { isActive } from "@/components/app/nav";
import { SidebarNav, DesktopSidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useSession } from "@/store/session-store";

/* Per-viewer UI preference (not app data) — kept in localStorage, guarded for private mode. */
const SIDEBAR_KEY = "nf-sidebar-collapsed";
const SIDEBAR_EVENT = "nf-sidebar-pref";
function readSidebarPref() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}
function setSidebarPref(v: boolean) {
  try {
    localStorage.setItem(SIDEBAR_KEY, v ? "1" : "0");
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(SIDEBAR_EVENT));
}
function subscribeSidebarPref(cb: () => void) {
  window.addEventListener(SIDEBAR_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(SIDEBAR_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const user = useSession((s) => s.user);
  const seeded = useAppStore((s) => s.seeded);
  const seed = useAppStore((s) => s.seed);
  const collapsed = useSyncExternalStore(subscribeSidebarPref, readSidebarPref, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Client-side guard for the mock session. Production uses an httpOnly cookie checked in proxy.ts + the API.
  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    else if (!seeded) seed();
  }, [hydrated, user, seeded, seed, router, pathname]);

  const toggle = () => setSidebarPref(!collapsed);

  const ready = hydrated && !!user && seeded;

  return (
    <div className="flex min-h-dvh bg-background">
      <DesktopSidebar collapsed={collapsed} onToggle={toggle} />

      {/* Mobile drawer */}
      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="nf-overlay fixed inset-0 z-50 bg-[#0b1020]/55 backdrop-blur-[2px] lg:hidden" />
          <DialogPrimitive.Content className="nf-sheet-left fixed inset-y-0 left-0 z-50 flex w-[min(86vw,300px)] flex-col border-r border-border bg-subtle shadow-pop outline-none lg:hidden">
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Dashboard sections</DialogPrimitive.Description>
            <div className="flex h-16 items-center justify-between px-5">
              <Logo href="/app" />
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close navigation">
                  <X />
                </Button>
              </DialogPrimitive.Close>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
        <main id="main" className="min-w-0 flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-7 lg:pb-12 print:p-0">
          {ready ? (
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-[1440px]"
            >
              {children}
            </motion.div>
          ) : (
            <ShellSkeleton />
          )}
        </main>
      </div>

      <MobileTabBar onMore={() => setMobileOpen(true)} />
    </div>
  );
}

const TABS = [
  { href: "/app", label: "Home", icon: LayoutDashboard },
  { href: "/app/customers", label: "Customers", icon: Users },
  { href: "/app/projects", label: "Projects", icon: FolderKanban },
  { href: "/app/invoices", label: "Invoices", icon: Receipt },
];

function MobileTabBar({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Quick navigation"
      className="print:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((t) => {
          const active = isActive(pathname, t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-medium", active ? "text-primary" : "text-muted-foreground")}
              >
                <t.icon className="size-5" />
                {t.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={onMore} className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[10.5px] font-medium text-muted-foreground">
            <MoreHorizontal className="size-5" />
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}

function ShellSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px]" aria-busy="true" aria-label="Loading workspace">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-7 grid grid-cols-2 gap-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[118px] rounded-xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[340px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-7">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.03em] sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-[14px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
