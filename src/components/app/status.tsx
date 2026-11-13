import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, CircleDashed, Clock, FileEdit, Minus, RotateCcw, XCircle } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { CustomerStatus, EmploymentStatus, InvoiceStatus, PaymentStatus, Priority, ProjectStatus } from "@/types";

const customerTone: Record<CustomerStatus, BadgeTone> = { Active: "success", Lead: "info", Inactive: "neutral", Churned: "danger" };
export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <Badge tone={customerTone[status]} dot>{status}</Badge>;
}

const invoiceMeta: Record<InvoiceStatus, { tone: BadgeTone; icon: React.ReactNode }> = {
  Draft: { tone: "neutral", icon: <FileEdit /> },
  Pending: { tone: "info", icon: <Clock /> },
  Paid: { tone: "success", icon: <CheckCircle2 /> },
  Overdue: { tone: "danger", icon: <AlertTriangle /> },
};
export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const m = invoiceMeta[status];
  return <Badge tone={m.tone}>{m.icon}{status}</Badge>;
}

const paymentMeta: Record<PaymentStatus, { tone: BadgeTone; icon: React.ReactNode }> = {
  Succeeded: { tone: "success", icon: <CheckCircle2 /> },
  Processing: { tone: "info", icon: <CircleDashed /> },
  Failed: { tone: "danger", icon: <XCircle /> },
  Refunded: { tone: "warning", icon: <RotateCcw /> },
};
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const m = paymentMeta[status];
  return <Badge tone={m.tone}>{m.icon}{status}</Badge>;
}

const projectTone: Record<ProjectStatus, BadgeTone> = { Active: "primary", Planning: "info", "On hold": "warning", Completed: "success" };
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={projectTone[status]} dot>{status}</Badge>;
}

const employmentTone: Record<EmploymentStatus, BadgeTone> = { Active: "success", "On leave": "warning", Invited: "info", Inactive: "neutral" };
export function EmploymentBadge({ status }: { status: EmploymentStatus }) {
  return <Badge tone={employmentTone[status]} dot>{status}</Badge>;
}

const priorityMeta: Record<Priority, { tone: BadgeTone; icon: React.ReactNode }> = {
  Low: { tone: "neutral", icon: <ArrowDown /> },
  Medium: { tone: "info", icon: <Minus /> },
  High: { tone: "warning", icon: <ArrowUp /> },
  Urgent: { tone: "danger", icon: <AlertTriangle /> },
};
export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = priorityMeta[priority];
  return <Badge tone={m.tone}>{m.icon}{priority}</Badge>;
}
