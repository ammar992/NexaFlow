"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { InvoiceEditor } from "@/components/app/invoices/invoice-editor";

function NewInvoice() {
  const params = useSearchParams();
  return <InvoiceEditor defaultCustomerId={params.get("customer") ?? undefined} />;
}

export default function NewInvoicePage() {
  return (
    <Suspense>
      <NewInvoice />
    </Suspense>
  );
}
