"use client";

import { ArrowLeft, FileSearch } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { InvoiceEditor } from "@/components/app/invoices/invoice-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { useWorkspaceData } from "@/store/app-store";

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const invoice = useWorkspaceData().invoices.find((i) => i.id === id);
  if (!invoice) {
    return (
      <Card>
        <EmptyState
          icon={<FileSearch />}
          title="Invoice not found"
          description="It may have been deleted, or belongs to another workspace."
          action={<Button asChild variant="outline"><Link href="/app/invoices"><ArrowLeft /> All invoices</Link></Button>}
        />
      </Card>
    );
  }
  return <InvoiceEditor key={invoice.id} invoice={invoice} />;
}
