import { useState, type FormEvent } from "react";
import { CircleCheck, Landmark } from "lucide-react";
import { toast } from "sonner";
import { FeeBreakdown } from "@/components/orders/FeeBreakdown";
import { useOrders } from "@/components/orders/OrderProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMMK } from "@/lib/data";
import { orderLabel, payoutQueue, type Order } from "@/lib/orders";

function PayoutCard({
  order,
  recordPayout,
}: {
  order: Order;
  recordPayout: (reference: string) => void;
}) {
  const [reference, setReference] = useState("");

  const submitPayout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const transferReference = reference.trim();

    if (!transferReference) {
      toast.error("Enter a transfer reference before recording this payout.");
      return;
    }

    recordPayout(transferReference);
  };

  return (
    <article className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{order.sellerName}</h3>
            <Badge variant="warning">Payout pending</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {orderLabel(order)} · {order.listingTitle}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Amount owed
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-primary">
            {formatMMK(order.totals.sellerNet)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <FeeBreakdown totals={order.totals} variant="seller" />

        <form className="rounded-xl bg-secondary/60 p-4" onSubmit={submitPayout}>
          <label className="text-sm font-medium" htmlFor={`payout-reference-${order.id}`}>
            Bank or MMQR transfer reference
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Recording the reference marks this seller transfer as paid.
          </p>
          <Input
            id={`payout-reference-${order.id}`}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="e.g. KBZ-TRX-804921"
            className="mt-4 bg-background"
          />
          <Button type="submit" className="mt-3 w-full">
            <Landmark className="size-4" aria-hidden="true" />
            Record transfer
          </Button>
        </form>
      </div>
    </article>
  );
}

export function PayoutQueue() {
  const { orders, updateOrder } = useOrders();
  const pendingPayouts = payoutQueue(orders);

  const recordPayout = async (order: Order, reference: string) => {
    const paidAt = new Date().toISOString();
    try {
      await updateOrder(order.id, {
        payoutStatus: "PAID",
        payoutRef: reference,
        payoutAt: paidAt,
      });
      toast.success(`Payout recorded for ${order.sellerName}`);
    } catch {
      toast.error("Could not record the payout. Try again.");
    }
  };

  return (
    <section aria-labelledby="payout-queue-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="payout-queue-heading" className="font-display text-2xl font-semibold">
            Seller payout queue
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Completed, accepted orders waiting for an outbound seller transfer.
          </p>
        </div>
        <Badge variant={pendingPayouts.length === 0 ? "verified" : "warning"}>
          {pendingPayouts.length} pending
        </Badge>
      </div>

      {pendingPayouts.length > 0 ? (
        <div className="space-y-4">
          {pendingPayouts.map((order) => (
            <PayoutCard
              key={order.id}
              order={order}
              recordPayout={(reference) => recordPayout(order, reference)}
            />
          ))}
        </div>
      ) : (
        <div className="surface-card flex flex-col items-center px-6 py-12 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-mint text-accent-foreground">
            <CircleCheck className="size-6" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold">All payouts are up to date</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            New seller payouts appear here after buyers accept delivered orders.
          </p>
        </div>
      )}
    </section>
  );
}
