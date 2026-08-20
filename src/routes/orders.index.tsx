import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PackageSearch } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useOrders } from "@/components/orders/OrderProvider";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryName, formatMMK } from "@/lib/data";
import {
  ORDER_STATUS_LABELS,
  orderLabel,
  ordersForBuyer,
  type Order,
  type OrderStatus,
} from "@/lib/orders";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My Orders | SurplusHub" },
      {
        name: "description",
        content: "Track your material orders, delivery status and inspection windows.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { currentUser } = useAuth();
  const { orders, isLoading } = useOrders();
  const buyerOrders =
    currentUser?.role === "buyer" ? ordersForBuyer(orders, currentUser.id) : orders;
  const newestOrders = [...buyerOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">My Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track payment, fulfillment and inspection status for surplus material purchases.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/marketplace">
            <PackageSearch className="size-4" /> Browse materials
          </Link>
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="surface-card p-6 text-sm text-muted-foreground">Loading orders…</div>
        ) : newestOrders.length === 0 ? (
          <div className="surface-card p-6 text-sm text-muted-foreground">No buyer orders yet.</div>
        ) : null}

        {newestOrders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <div className="surface-card flex flex-wrap items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{order.listingTitle}</p>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {orderLabel(order)} - {categoryName(order.category)} -{" "}
          {order.quantity.toLocaleString("en-US")} {order.unit} - seller {order.sellerName}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums">{formatMMK(order.totals.buyerTotal)}</p>
        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
      </div>
      <Button size="sm" variant="outline" asChild>
        <Link to="/orders/$id" params={{ id: order.id }}>
          View <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
