import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMMK } from "@/lib/data";
import { buyerFeeLabel, sellerFeeLabel, type OrderTotals } from "@/lib/fees";

/**
 * Itemised money breakdown, shown to both sides of a deal.
 *
 * Shared by checkout, order detail and the admin payout queue — keep it purely
 * presentational so every surface shows identical numbers.
 */

const FEE_JUSTIFICATION = [
  "Verified business checks",
  "Material specs and photos on record",
  "Secure MMQR payment",
  "Order tracking and delivery status",
  "48-hour inspection window",
  "Dispute support",
  "Verified transaction history",
];

function Row({
  label,
  value,
  hint,
  emphasis,
  negative,
}: {
  label: string;
  value: number;
  hint?: string;
  emphasis?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "flex items-center justify-between gap-4 border-t border-border pt-3 text-base font-semibold"
          : "flex items-center justify-between gap-4 text-sm"
      }
    >
      <span className={emphasis ? "" : "flex items-center gap-1.5 text-muted-foreground"}>
        {label}
        {hint ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`What ${label.toLowerCase()} pays for`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Info className="size-3.5" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">{hint}</p>
                <ul className="mt-1.5 space-y-0.5">
                  {FEE_JUSTIFICATION.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </span>
      <span className={negative ? "tabular-nums text-muted-foreground" : "tabular-nums"}>
        {negative ? `− ${formatMMK(value)}` : formatMMK(value)}
      </span>
    </div>
  );
}

export function FeeBreakdown({
  totals,
  variant,
}: {
  totals: OrderTotals;
  variant: "buyer" | "seller";
}) {
  if (variant === "seller") {
    return (
      <div className="space-y-3">
        <Row label="Material price" value={totals.materialPrice} />
        <Row
          label={`Success fee (${sellerFeeLabel})`}
          value={totals.sellerFee}
          negative
          hint={`The ${sellerFeeLabel} success fee is charged only when a deal completes.`}
        />
        <Row label="You receive" value={totals.sellerNet} emphasis />
        <p className="text-xs text-muted-foreground">
          Delivery and tax are settled separately and are never part of the fee base.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Row label="Material price" value={totals.materialPrice} />
      <Row
        label={`Service fee (${buyerFeeLabel})`}
        value={totals.buyerFee}
        hint={`The ${buyerFeeLabel} service fee is what buying through SurplusHub gives you.`}
      />
      {totals.deliveryFee > 0 ? <Row label="Delivery" value={totals.deliveryFee} /> : null}
      {totals.tax > 0 ? <Row label="Tax" value={totals.tax} /> : null}
      <Row label="Total to pay" value={totals.buyerTotal} emphasis />
    </div>
  );
}
