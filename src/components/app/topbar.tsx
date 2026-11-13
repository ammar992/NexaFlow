"use client";

import {
  Bell,
  Check,
  ChevronsUpDown,
  CircleHelp,
  Keyboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { CommandSearch } from "@/components/app/command-search";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/misc";
import { cn, timeAgo } from "@/lib/utils";
import { useActiveWorkspace, useAppStore, useWorkspaceData } from "@/store/app-store";
import { useSession } from "@/store/session-store";

export function WorkspaceMark({ name, color, size = "md" }: { name: string; color: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-display font-semibold text-white",
        size === "md" ? "size-7 text-[13px]" : "size-6 text-[11px]",
      )}
      style={{ background: color }}
      aria-hidden
    >
      {name.replace(/[^A-Za-z]/g, "")[0]?.toUpperCase()}
    </span>
  );
}

function WorkspaceSwitcher() {
  const router = useRouter();
  const workspaces = useAppStore((s) => s.workspaces);
  const switchWorkspace = useAppStore((s) => s.switchWorkspace);
  const active = useActiveWorkspace();
  if (!active) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 min-w-0 items-center gap-2.5 rounded-lg px-2 text-left transition-colors hover:bg-muted data-[state=open]:bg-muted"
          aria-label={`Current workspace: ${active.name}. Switch workspace`}
        >
          <WorkspaceMark name={active.name} color={active.color} />
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-[180px] truncate text-[13.5px] leading-tight font-semibold">{active.name}</span>
            <span className="block text-[11px] leading-tight text-muted-foreground">{active.industry}</span>
          </span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onSelect={() => {
              if (w.id === active.id) return;
              switchWorkspace(w.id);
              toast.success(`Switched to ${w.name}`, { description: "Showing this workspace’s data only." });
            }}
          >
            <WorkspaceMark name={w.name} color={w.color} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-foreground">{w.name}</span>
              <span className="block text-xs text-muted-foreground">{w.plan} · {w.industry}</span>
            </span>
            {w.id === active.id && <Check className="!text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/onboarding")}>
          <Plus /> Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notifications() {
  const { notifications } = useWorkspaceData();
  const markAll = useAppStore((s) => s.markAllNotificationsRead);
  const markOne = useAppStore((s) => s.markNotificationRead);
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <DropdownMenu>
      <Tooltip content="Notifications">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Notifications, ${unread} unread`} className="relative">
            <Bell />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white ring-2 ring-background">
                {unread}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent className="w-[min(92vw,360px)] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button type="button" onClick={markAll} disabled={!unread} className="text-xs font-medium text-primary disabled:text-muted-foreground">
            Mark all as read
          </button>
        </div>
        <div className="scrollbar-thin max-h-[380px] overflow-y-auto p-1">
          {notifications.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">You’re all caught up.</p>}
          {notifications.slice(0, 12).map((n) => (
            <DropdownMenuItem key={n.id} onSelect={(e) => { e.preventDefault(); markOne(n.id); }} className="items-start py-2.5">
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[13px] text-foreground", !n.read && "font-semibold")}>{n.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{n.body}</span>
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const emptySubscribe = () => () => {};

function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  return (
    <DropdownMenu>
      <Tooltip content="Theme">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Change theme">
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent className="w-44">
        <DropdownMenuRadioGroup value={mounted ? theme : undefined} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light"><Sun /> Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark"><Moon /> Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system"><Monitor /> System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HelpMenu() {
  const reset = useAppStore((s) => s.resetDemo);
  const [confirm, setConfirm] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  return (
    <>
      <DropdownMenu>
        <Tooltip content="Help">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Help" className="hidden sm:inline-flex">
              <CircleHelp />
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onSelect={() => setShortcuts(true)}><Keyboard /> Keyboard shortcuts</DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/"><CircleHelp /> About NexaFlow</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => setConfirm(true)}><RotateCcw /> Reset demo data</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Reset demo data?"
        description="All workspaces return to their original sample data. Changes you made in this browser will be lost."
        confirmLabel="Reset data"
        onConfirm={() => {
          reset();
          toast.success("Demo data reset");
        }}
      />
      <Dialog open={shortcuts} onOpenChange={setShortcuts}>
        <DialogContent title="Keyboard shortcuts">
          <ul className="divide-y divide-border text-sm">
            {[
              ["Open search", "⌘ K  /  Ctrl K"],
              ["Search (quick)", "/"],
              ["Close dialog", "Esc"],
              ["Move through results", "↑ ↓"],
            ].map(([k, v]) => (
              <li key={k} className="flex justify-between py-2.5">
                {k}
                <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-xs">{v}</kbd>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UserMenu() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="ml-1 rounded-full" aria-label="Account menu">
          <Avatar name={user.name} size="sm" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <div className="flex items-center gap-3 px-2.5 py-2.5">
          <Avatar name={user.name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <p className="mx-2.5 mb-1.5 inline-flex rounded-md bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">{user.role}</p>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/app/settings"><UserRound /> Profile</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/app/settings?tab=workspace"><Settings /> Workspace settings</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            signOut();
            toast("Signed out");
            router.push("/sign-in");
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="print:hidden sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-5">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={onOpenMobileNav}>
        <Menu />
      </Button>
      <WorkspaceSwitcher />

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="mx-auto hidden h-9 w-full max-w-md items-center gap-2.5 rounded-lg border border-border bg-card px-3 text-[13px] text-muted-foreground shadow-card transition-colors hover:border-input md:flex"
      >
        <Search className="size-4" />
        Search customers, projects, invoices…
        <kbd className="ml-auto rounded border border-border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-0.5 md:ml-0">
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" onClick={() => setSearchOpen(true)}>
          <Search />
        </Button>
        <Notifications />
        <HelpMenu />
        <ThemeMenu />
        <UserMenu />
      </div>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
