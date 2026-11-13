import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Invoice, InvoiceStatus, LineItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${rand}`;
}

const currencyCache = new Map<string, Intl.NumberFormat>();
export function formatCurrency(value: number, currency = "USD", opts?: { compact?: boolean; cents?: boolean }) {
  const key = `${currency}-${opts?.compact}-${opts?.cents}`;
  let fmt = currencyCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: opts?.compact ? "compact" : "standard",
      maximumFractionDigits: opts?.compact ? 1 : opts?.cents ? 2 : 0,
      minimumFractionDigits: opts?.cents ? 2 : 0,
    });
    currencyCache.set(key, fmt);
  }
  return fmt.format(value);
}

export function formatNumber(value: number, compact = false) {
  return new Intl.NumberFormat("en-US", { notation: compact ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value >= 0 ? "" : "−"}${Math.abs(value).toFixed(digits)}%`;
}

export function formatDate(iso: string, style: "short" | "medium" | "long" = "medium") {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const options: Intl.DateTimeFormatOptions =
    style === "short"
      ? { month: "short", day: "numeric" }
      : style === "long"
        ? { month: "long", day: "numeric", year: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" };
  return d.toLocaleDateString("en-US", options);
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const m = 60_000, h = 60 * m, d = 24 * h;
  const future = diff < 0;
  const wrap = (s: string) => (future ? `in ${s}` : `${s} ago`);
  if (abs < m) return "just now";
  if (abs < h) return wrap(`${Math.round(abs / m)}m`);
  if (abs < d) return wrap(`${Math.round(abs / h)}h`);
  if (abs < 30 * d) return wrap(`${Math.round(abs / d)}d`);
  return formatDate(iso);
}

export function daysUntil(iso: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(iso);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic hue for avatars, derived from a string. */
export function hueFrom(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 360;
  return h;
}

/* ----------------------------- Invoices -------------------------------- */

export function lineTotal(item: Pick<LineItem, "quantity" | "unitPrice">) {
  return round2((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0));
}

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function invoiceTotals(inv: Pick<Invoice, "items" | "taxRate" | "discount">) {
  const subtotal = round2(inv.items.reduce((s, i) => s + lineTotal(i), 0));
  const discountAmount = round2(subtotal * (clamp(inv.discount, 0, 100) / 100));
  const taxable = subtotal - discountAmount;
  const tax = round2(taxable * (clamp(inv.taxRate, 0, 100) / 100));
  const total = round2(taxable + tax);
  return { subtotal, discountAmount, tax, total };
}

/** Pending invoices past their due date read as Overdue. */
export function effectiveStatus(inv: Pick<Invoice, "status" | "dueDate">): InvoiceStatus {
  if (inv.status === "Pending" && daysUntil(inv.dueDate) < 0) return "Overdue";
  return inv.status;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number(n) || 0));
}

export function sum<T>(rows: T[], pick: (r: T) => number) {
  return rows.reduce((s, r) => s + pick(r), 0);
}

export function pctChange(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

export function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    let s = String(v ?? "");
    // Neutralise spreadsheet formula injection (CSV injection).
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
