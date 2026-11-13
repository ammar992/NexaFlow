"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { CornerDownLeft, FolderKanban, Receipt, Search, UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ALL_NAV } from "@/components/app/nav";
import { cn } from "@/lib/utils";
import { useWorkspaceData } from "@/store/app-store";

interface Result {
  id: string;
  group: string;
  label: string;
  sub?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function CommandSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const data = useWorkspaceData();
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(0);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    const match = (...fields: string[]) => !term || fields.some((f) => f.toLowerCase().includes(term));
    const pages: Result[] = ALL_NAV.filter((n) => match(n.label)).map((n) => ({
      id: n.href, group: "Pages", label: n.label, href: n.href, icon: n.icon,
    }));
    if (!term) return pages.slice(0, 8);
    const customers: Result[] = data.customers
      .filter((c) => match(c.company, c.name, c.email))
      .slice(0, 5)
      .map((c) => ({ id: c.id, group: "Customers", label: c.company, sub: c.name, href: `/app/customers/${c.id}`, icon: Users }));
    const projects: Result[] = data.projects
      .filter((p) => match(p.name))
      .slice(0, 4)
      .map((p) => ({ id: p.id, group: "Projects", label: p.name, sub: p.status, href: `/app/projects/${p.id}`, icon: FolderKanban }));
    const invoices: Result[] = data.invoices
      .filter((i) => match(i.number, data.customers.find((c) => c.id === i.customerId)?.company ?? ""))
      .slice(0, 4)
      .map((i) => ({ id: i.id, group: "Invoices", label: i.number, sub: data.customers.find((c) => c.id === i.customerId)?.company, href: `/app/invoices/${i.id}`, icon: Receipt }));
    const people: Result[] = data.employees
      .filter((e) => match(e.name, e.title, e.email))
      .slice(0, 4)
      .map((e) => ({ id: e.id, group: "Employees", label: e.name, sub: e.title, href: `/app/employees?focus=${e.id}`, icon: UserRound }));
    return [...pages, ...customers, ...projects, ...invoices, ...people];
  }, [q, data]);

  const onQuery = (v: string) => {
    setQ(v);
    setIndex(0);
  };

  const go = (r: Result) => {
    onOpenChange(false);
    setQ("");
    router.push(r.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && results[index]) {
      e.preventDefault();
      go(results[index]);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="nf-overlay fixed inset-0 z-50 bg-[#0b1020]/55 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          className="nf-dialog fixed top-[15%] left-1/2 z-50 w-[calc(100vw-24px)] max-w-xl -translate-x-1/2 !translate-y-0 overflow-hidden rounded-2xl border border-border bg-popover shadow-pop"
        >
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Search pages, customers, projects, invoices and people</DialogPrimitive.Description>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search customers, projects, invoices…"
              aria-label="Search"
              role="combobox"
              aria-expanded
              aria-controls="search-results"
              aria-activedescendant={results[index] ? `res-${results[index].id}` : undefined}
              className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">ESC</kbd>
          </div>
          <ul id="search-results" role="listbox" className="scrollbar-thin max-h-[min(60dvh,420px)] overflow-y-auto p-2">
            {results.length === 0 && <li className="px-3 py-10 text-center text-sm text-muted-foreground">No results for “{q}”</li>}
            {results.map((r, i) => {
              const header = i === 0 || results[i - 1].group !== r.group ? r.group : null;
              return (
                <li key={`${r.group}-${r.id}`} role="presentation">
                  {header && <p className="px-3 pt-2.5 pb-1 text-[11px] font-medium text-muted-foreground">{header}</p>}
                  <button
                    type="button"
                    id={`res-${r.id}`}
                    role="option"
                    aria-selected={i === index}
                    onMouseMove={() => setIndex(i)}
                    onClick={() => go(r)}
                    className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm", i === index && "bg-muted")}
                  >
                    <r.icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{r.label}</span>
                    {r.sub && <span className="truncate text-muted-foreground">{r.sub}</span>}
                    {i === index && <CornerDownLeft className="ml-auto size-3.5 text-muted-foreground" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
