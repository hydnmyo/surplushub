import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { FeeBreakdown } from "@/components/orders/FeeBreakdown";
import { useOrders } from "@/components/orders/OrderProvider";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMMK } from "@/lib/data";
import {
  canTransition,
  inspectionDeadlineFrom,
  ORDER_STATUS_LABELS,
  ordersForSeller,
  type Order,
  type OrderStatus,
} from "@/lib/orders";

export function SellerOrderList({ businessId }: { businessId: string }) {
  const { orders, updateOrder } = useOrders();
  const sellerOrders = ordersForSeller(orders, businessId);
  const visibleOrders = (
    sellerOrders.length > 0
      ? sellerOrders
      : orders.filter((order) => order.paymentStatus === "PAID")
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const isDemoFallback = sellerOrders.length === 0 && visibleOrders.length > 0;

  const advanceOrder = (order: Order) => {
    const next = sellerNextStatus(order.status);

    if (!next || !canTransition(order.status, next)) {
      toast.error("This order cannot advance from its current status.");
      return;
    }

    const changes: Partial<Order> = { status: next };

    if (next === "DELIVERED") {
      const deliveredAt = new Date().toISOString();
      changes.deliveredAt = deliveredAt;
      changes.inspectionDeadline = inspectionDeadlineFrom(deliveredAt);
    }

    updateOrder(order.id, changes);
    toast.success(`Order moved to ${ORDER_STATUS_LABELS[next].toLowerCase()}`);
  };

  return (
    <div className="space-y-4">
      {isDemoFallback ? (
        <div className="rounded-md border border-warning/40 bg-warning/15 p-4 text-sm text-muted-foreground">
          Showing seeded seller orders because this demo business has no paid orders yet.
        </div>
      ) : null}

      {visibleOrders.length === 0 ? (
        <div className="surface-card p-6 text-sm text-muted-foreground">
          No paid seller orders yet.
        </div>
      ) : null}

      {visibleOrders.map((order) => {
        const next = sellerNextStatus(order.status);
        const canAdvance = Boolean(next && canTransition(order.status, next));

        return (
          <div key={order.id} className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{order.listingTitle}</h3>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {order.id} - buyer {order.buyerName} - {order.quantity.toLocaleString("en-US")}{" "}
                  {order.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {formatMMK(order.totals.sellerNet)}
                </p>
                <p className="text-xs text-muted-foreground">seller net</p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-md border border-border p-4">
                <FeeBreakdown totals={order.totals} variant="seller" />
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {order.paidAt ? (
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                      Paid {formatDateTime(order.paidAt)}
                    </p>
                  ) : null}
                  {order.deliveredAt ? (
                    <p className="flex items-center gap-2">
                      <PackageCheck className="size-4 text-primary" aria-hidden="true" />
                      Delivered {formatDateTime(order.deliveredAt)}
                    </p>
                  ) : null}
                  {order.inspectionDeadline ? (
                    <p className="flex items-center gap-2">
                      <Clock className="size-4 text-warning-foreground" aria-hidden="true" />
                      Inspection deadline {formatDateTime(order.inspectionDeadline)}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/orders/$id" params={{ id: order.id }}>
                      Buyer view <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button size="sm" onClick={() => advanceOrder(order)} disabled={!canAdvance}>
                    {next ? `Mark ${ORDER_STATUS_LABELS[next].toLowerCase()}` : "No next step"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function sellerNextStatus(
  status: OrderStatus,
): Extract<OrderStatus, "PREPARING" | "SHIPPED" | "DELIVERED"> | null {
  if (status === "PAID") return "PREPARING";
  if (status === "PREPARING") return "SHIPPED";
  if (status === "SHIPPED") return "DELIVERED";
  return null;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const variantByStatus: Partial<Record<OrderStatus, BadgeProps["variant"]>> = {
    PENDING_PAYMENT: "warning",
    PAID: "verified",
    PREPARING: "soft",
    SHIPPED: "soft",
    DELIVERED: "warning",
    COMPLETED: "verified",
    DISPUTED: "destructive",
    REFUNDED: "outlineMuted",
    CANCELLED: "outlineMuted",
  };

  return <Badge variant={variantByStatus[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
