import { LogoMark } from "@/components/brand/logo";
import { InvoiceStatusBadge } from "@/components/app/status";
import { cn, formatCurrency, formatDate, invoiceTotals, lineTotal } from "@/lib/utils";
import type { Customer, InvoiceStatus, LineItem, Workspace } from "@/types";

/** The invoice as the customer sees it. Always rendered on a white "paper" surface; prints cleanly. */
export function InvoiceDocument({
  workspace,
  customer,
  number,
  issueDate,
  dueDate,
  status,
  items,
  taxRate,
  discount,
  notes,
  className,
}: {
  workspace?: Workspace;
  customer?: Customer;
  number: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: LineItem[];
  taxRate: number;
  discount: number;
  notes: string;
  className?: string;
}) {
  const t = invoiceTotals({ items, taxRate, discount });
  const cur = workspace?.currency ?? "USD";
  const money = (n: number) => formatCurrency(n, cur, { cents: true });

  return (
    <article
      className={cn(
        "print-area rounded-xl border border-[#e3e6ef] bg-white p-6 text-[#0d1226] shadow-card [color-scheme:light] sm:p-10",
        className,
      )}
      aria-label={`Invoice ${number}`}
    >
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="font-display text-lg font-semibold tracking-tight">{workspace?.name ?? "Your company"}</span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[#5b6378]">
            billing@{workspace?.slug ?? "company"}.demo
            <br />
            {workspace?.industry}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="font-display text-3xl font-semibold tracking-[-0.03em]">Invoice</p>
          <p className="mt-1 font-mono text-[13px] text-[#5b6378]">{number}</p>
          <div className="mt-2 sm:flex sm:justify-end [&_span]:!bg-transparent">
            <InvoiceStatusBadge status={status} />
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-6 border-y border-[#eef0f6] py-6 text-[13px] sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-[#7a8297] uppercase">Billed to</p>
          {customer ? (
            <p className="mt-2 leading-relaxed">
              <span className="font-semibold">{customer.company}</span>
              <br />
              {customer.name}
              <br />
              <span className="text-[#5b6378]">{customer.email}</span>
              <br />
              <span className="text-[#5b6378]">{customer.city}, {customer.country}</span>
            </p>
          ) : (
            <p className="mt-2 text-[#7a8297]">Select a customer</p>
          )}
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-[#7a8297] uppercase">Issue date</p>
          <p className="mt-2">{issueDate ? formatDate(issueDate, "long") : "—"}</p>
          <p className="mt-4 text-[11px] font-semibold tracking-wide text-[#7a8297] uppercase">Due date</p>
          <p className="mt-2">{dueDate ? formatDate(dueDate, "long") : "—"}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] font-semibold tracking-wide text-[#7a8297] uppercase">Amount due</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight tabular">{status === "Paid" ? money(0) : money(t.total)}</p>
        </div>
      </div>

      <table className="mt-6 w-full text-[13px]">
        <thead>
          <tr className="border-b border-[#e3e6ef] text-left text-[11px] tracking-wide text-[#7a8297] uppercase">
            <th scope="col" className="pb-2.5 font-semibold">Description</th>
            <th scope="col" className="pb-2.5 text-right font-semibold">Qty</th>
            <th scope="col" className="hidden pb-2.5 text-right font-semibold sm:table-cell">Unit price</th>
            <th scope="col" className="pb-2.5 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-b border-[#eef0f6] align-top">
              <td className="py-3 pr-3">
                {i.description || <span className="text-[#7a8297]">Item description</span>}
                <span className="block text-[11px] text-[#7a8297] sm:hidden">{money(Number(i.unitPrice) || 0)} each</span>
              </td>
              <td className="py-3 text-right tabular">{Number(i.quantity) || 0}</td>
              <td className="hidden py-3 text-right tabular sm:table-cell">{money(Number(i.unitPrice) || 0)}</td>
              <td className="py-3 text-right font-medium tabular">{money(lineTotal(i))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 ml-auto w-full max-w-[280px] space-y-2 text-[13px]">
        <div className="flex justify-between"><span className="text-[#5b6378]">Subtotal</span><span className="tabular">{money(t.subtotal)}</span></div>
        {discount > 0 && (
          <div className="flex justify-between"><span className="text-[#5b6378]">Discount ({discount}%)</span><span className="tabular">−{money(t.discountAmount)}</span></div>
        )}
        <div className="flex justify-between"><span className="text-[#5b6378]">Tax ({taxRate}%)</span><span className="tabular">{money(t.tax)}</span></div>
        <div className="flex justify-between border-t border-[#e3e6ef] pt-3 text-[15px] font-semibold"><span>Total</span><span className="tabular">{money(t.total)}</span></div>
      </div>

      {notes && (
        <div className="mt-10 rounded-lg bg-[#f6f7fb] p-4 text-[12.5px] leading-relaxed whitespace-pre-line text-[#5b6378]">
          <p className="mb-1 font-semibold text-[#0d1226]">Notes</p>
          {notes}
        </div>
      )}
      <p className="mt-8 text-center text-[11px] text-[#7a8297]">Generated with NexaFlow · Demo invoice — not a real request for payment</p>
    </article>
  );
}
