"use client";

import { AnimatePresence, motion } from "motion/react";
import { Building2, Check, CreditCard, Lock, ShieldAlert, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn, formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { Invoice, PaymentMethod } from "@/types";

/**
 * Simulated Stripe checkout.
 *
 * Deliberately has NO free-text card fields: the demo never collects card
 * data. In production, card entry is a Stripe Elements iframe so card numbers
 * never touch NexaFlow's servers, and "Paid" is set only by a signature-verified
 * `payment_intent.succeeded` webhook — never by the browser.
 */
const OPTIONS: { id: string; method: PaymentMethod; label: string; sub: string; brand?: string; last4?: string; succeed: boolean; icon: React.ReactNode }[] = [
  { id: "visa", method: "Card", label: "Visa test card", sub: "•••• 4242 · succeeds", brand: "Visa", last4: "4242", succeed: true, icon: <CreditCard /> },
  { id: "mc", method: "Card", label: "Mastercard test card", sub: "•••• 4444 · succeeds", brand: "Mastercard", last4: "4444", succeed: true, icon: <CreditCard /> },
  { id: "decline", method: "Card", label: "Declined test card", sub: "•••• 0002 · fails", brand: "Visa", last4: "0002", succeed: false, icon: <ShieldAlert /> },
  { id: "ach", method: "ACH", label: "US bank account (ACH)", sub: "Test account · succeeds", succeed: true, icon: <Building2 /> },
];

export function PaymentDialog({ open, onOpenChange, invoice, amount, company }: { open: boolean; onOpenChange: (v: boolean) => void; invoice: Invoice; amount: number; company?: string }) {
  const recordPayment = useAppStore((s) => s.recordPayment);
  const [choice, setChoice] = useState("visa");
  const [phase, setPhase] = useState<"form" | "processing" | "success" | "failed">("form");

  const reset = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(() => setPhase("form"), 200);
  };

  const pay = async () => {
    const opt = OPTIONS.find((o) => o.id === choice)!;
    setPhase("processing");
    await new Promise((r) => setTimeout(r, 1600));
    recordPayment({ invoiceId: invoice.id, method: opt.method, amount, cardBrand: opt.brand, last4: opt.last4, succeed: opt.succeed });
    setPhase(opt.succeed ? "success" : "failed");
    if (opt.succeed) toast.success("Payment succeeded", { description: `${invoice.number} marked as paid (simulated)` });
    else toast.error("Payment declined", { description: "The test card was declined. No charge was made." });
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent title="Collect payment" description={`${invoice.number}${company ? ` · ${company}` : ""}`} className="max-w-md">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "form" || phase === "processing" ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-xl bg-subtle p-4 text-center">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-display text-3xl font-semibold tracking-tight tabular">{formatCurrency(amount, "USD", { cents: true })}</p>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2.5 text-xs text-warning">
                <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                Simulated Stripe test mode. Choose a test method — no real card details are ever requested.
              </div>
              <fieldset className="mt-4" disabled={phase === "processing"}>
                <legend className="mb-2 text-[13px] font-medium">Payment method</legend>
                <div className="grid gap-2">
                  {OPTIONS.map((o) => (
                    <label
                      key={o.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                        choice === o.id ? "border-primary bg-primary-soft/50 ring-1 ring-primary" : "border-border hover:border-input",
                      )}
                    >
                      <input type="radio" name="pm" value={o.id} checked={choice === o.id} onChange={() => setChoice(o.id)} className="sr-only" />
                      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">{o.icon}</span>
                      <span className="flex-1">
                        <span className="block text-[13.5px] font-medium">{o.label}</span>
                        <span className="block text-xs text-muted-foreground">{o.sub}</span>
                      </span>
                      {choice === o.id && <Check className="size-4 text-primary" />}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button className="mt-5 w-full" size="lg" onClick={pay} loading={phase === "processing"}>
                {phase === "processing" ? "Processing…" : <><Lock /> Pay {formatCurrency(amount, "USD", { cents: true })}</>}
              </Button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">Powered by Stripe (simulated) · PCI scope stays with Stripe in production</p>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className={cn("mx-auto flex size-16 items-center justify-center rounded-full", phase === "success" ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}
              >
                {phase === "success" ? <Check className="size-8" strokeWidth={3} /> : <XCircle className="size-8" />}
              </motion.div>
              <p className="mt-5 font-display text-xl font-semibold tracking-tight">{phase === "success" ? "Payment succeeded" : "Payment declined"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {phase === "success" ? "The invoice is now marked as paid." : "No charge was made. Try another method."}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                {phase === "failed" && <Button variant="outline" onClick={() => setPhase("form")}>Try again</Button>}
                <Button onClick={() => reset(false)}>Done</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
