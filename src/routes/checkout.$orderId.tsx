import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { FeeBreakdown } from "@/components/orders/FeeBreakdown";
import { MMQRPaymentPanel } from "@/components/payments/MMQRPaymentPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/components/orders/OrderProvider";
import { canTransition, orderLabel } from "@/lib/orders";
import { formatMMK } from "@/lib/data";

/**
 * Checkout — the buyer pays here, and both sides see exactly what they get.
 *
 * Payment is confirmed through markPaid(), which is shaped like the provider
 * callback a real MMQR integration would call. The demo button walks the same
 * code path deliberately: no screenshot upload, no manual admin confirmation.
 */

export const Route = createFileRoute("/checkout/$orderId")({
  head: () => ({
    meta: [
      { title: "Checkout | SurplusHub" },
      {
        name: "description",
        content: "Review your order total and pay securely through SurplusHub.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { orderId } = Route.useParams();
  const { getOrder, updateOrder, isLoading } = useOrders();
  const order = getOrder(orderId);

  const markPaid = async (id: string, paymentRef: string) => {
    const current = getOrder(id);

    if (!current) {
      toast.error("Order not found. Payment callback was not applied.");
      return;
    }

    if (!canTransition(current.status, "PAID")) {
      toast.info("This order has already moved past payment.");
      return;
    }

    try {
      await updateOrder(id, {
        status: "PAID",
        paymentStatus: "PAID",
        paymentRef,
        paidAt: new Date().toISOString(),
      });
      toast.success("Provider callback received. Payment marked as paid.");
    } catch {
      toast.error("Could not confirm the payment. Try again.");
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="surface-card p-8 text-center text-sm text-muted-foreground">
          Loading order…
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="surface-card p-8 text-center">
          <PackageCheck className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Order not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We could not find checkout details for order{" "}
            <span className="font-medium text-foreground">{orderId}</span>.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/marketplace" search={{}}>
              Back to marketplace
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  // Totals are locked when the quote is accepted. Recalculating here would re-price
  // an agreed deal if the fee rates ever change, which is exactly what the price
  // lock exists to prevent.
  const totals = order.totals;

  if (order.status !== "PENDING_PAYMENT") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="surface-card p-8">
          <Badge variant="verified" className="gap-1">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Payment already processed
          </Badge>
          <h1 className="mt-4 font-display text-3xl font-semibold">Order {orderLabel(order)}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This order is already past checkout. Current status:{" "}
            <span className="font-medium text-foreground">{order.status}</span>.
          </p>
          <div className="mt-5 grid gap-3 rounded-lg border border-border bg-secondary/40 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Paid amount</p>
              <p className="font-semibold">{formatMMK(totals.buyerTotal)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment reference</p>
              <p className="font-semibold">{order.paymentRef ?? "Pending provider reference"}</p>
            </div>
          </div>
          <Button className="mt-6" asChild>
            <Link to="/orders/$id" params={{ id: order.id }}>
              View order
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge variant="warning" className="gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            Awaiting MMQR payment
          </Badge>
          <h1 className="mt-3 font-display text-3xl font-semibold">Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Order <span className="font-medium text-foreground">{orderLabel(order)}</span> ·{" "}
            {order.listingTitle}
          </p>
        </div>
        <div className="text-sm md:text-right">
          <p className="text-muted-foreground">Buyer</p>
          <p className="font-medium">{order.buyerName}</p>
          <p className="mt-2 text-muted-foreground">Seller</p>
          <p className="font-medium">{order.sellerName}</p>
        </div>
      </div>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="surface-card p-6">
          <div className="mb-5">
            <p className="font-display text-xl font-semibold">Buyer payment</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Material price, platform service, delivery and final MMQR amount.
            </p>
          </div>
          <FeeBreakdown totals={totals} variant="buyer" />
        </div>

        <div className="surface-card p-6">
          <div className="mb-5">
            <p className="font-display text-xl font-semibold">Seller payout preview</p>
            <p className="mt-1 text-sm text-muted-foreground">
              What the seller receives after the platform success fee.
            </p>
          </div>
          <FeeBreakdown totals={totals} variant="seller" />
        </div>
      </section>

      <div className="mt-6">
        <MMQRPaymentPanel order={{ ...order, totals }} onProviderCallback={markPaid} />
      </div>

      <Link to="/marketplace" search={{}} className="mt-6 inline-block text-sm text-primary">
        Back to marketplace
      </Link>
    </main>
  );
}
