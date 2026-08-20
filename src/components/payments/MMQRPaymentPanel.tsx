import { ShieldCheck, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode } from "@/components/site/QrCode";
import { formatMMK } from "@/lib/data";
import type { Order } from "@/lib/orders";

const SUPPORTED_WALLETS = ["KBZPay", "WavePay", "AYA Pay"];

export function MMQRPaymentPanel({
  order,
  onProviderCallback,
}: {
  order: Order;
  onProviderCallback: (orderId: string, paymentRef: string) => void;
}) {
  const paymentValue = `MMQR|${order.id}|${order.totals.buyerTotal}|${order.buyerId}`;

  return (
    <section className="surface-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xl font-semibold">MMQR payment</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pay the exact checkout total through a supported Myanmar wallet.
          </p>
        </div>
        <Badge variant="verified" className="gap-1">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Provider callback ready
        </Badge>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <QrCode value={paymentValue} size={192} />
          <p className="mt-3 text-xs font-medium text-muted-foreground">Order {order.id}</p>
        </div>

        <div className="flex flex-col justify-between gap-5">
          <div>
            <p className="text-sm text-muted-foreground">Amount to pay</p>
            <p className="mt-1 font-display text-3xl font-semibold">
              {formatMMK(order.totals.buyerTotal)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUPPORTED_WALLETS.map((wallet) => (
                <Badge key={wallet} variant="outlineMuted" className="gap-1.5">
                  <Smartphone className="size-3.5" aria-hidden="true" />
                  {wallet}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border bg-secondary/40 p-4">
            <p className="text-sm font-medium">Demo provider callback</p>
            <p className="mt-1 text-xs text-muted-foreground">
              In production, the MMQR provider calls this integration point after payment clears.
            </p>
            <Button
              className="mt-3 w-full sm:w-auto"
              onClick={() => onProviderCallback(order.id, `MMQR-${Date.now()}`)}
              type="button"
            >
              Simulate provider callback
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
