import {
  BarChart3,
  Briefcase,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Receipt,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { href: "/app", label: "Overview", icon: LayoutDashboard },
      { href: "/app/crm", label: "CRM", icon: Briefcase },
      { href: "/app/customers", label: "Customers", icon: Users },
      { href: "/app/employees", label: "Employees", icon: UserRound },
    ],
  },
  {
    label: "Work",
    items: [
      { href: "/app/projects", label: "Projects", icon: FolderKanban },
      { href: "/app/tasks", label: "Tasks", icon: ListChecks },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/app/invoices", label: "Invoices", icon: Receipt },
      { href: "/app/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/app/reports", label: "Reports", icon: FileText },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = { href: "/app/settings", label: "Settings", icon: Settings };

export const ALL_NAV: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), SETTINGS_ITEM];

export function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
}
