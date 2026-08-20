import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { FeeBreakdown } from "@/components/orders/FeeBreakdown";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { useOrders } from "@/components/orders/OrderProvider";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { categoryName, formatMMK } from "@/lib/data";
import { canTransition, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order | SurplusHub" },
      { name: "description", content: "Order status, delivery tracking and payment summary." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { getOrder, updateOrder } = useOrders();
  const order = getOrder(id);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const countdown = useInspectionCountdown(order?.inspectionDeadline);

  const detailRows = useMemo(() => {
    if (!order) return [];
    return [
      ["Material", order.listingTitle],
      ["Category", categoryName(order.category)],
      ["Quantity", `${order.quantity.toLocaleString("en-US")} ${order.unit}`],
      ["Seller", order.sellerName],
      ["Buyer", order.buyerName],
      ["Unit price", formatMMK(order.unitPrice)],
    ];
  }, [order]);

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Button variant="ghost" asChild>
          <Link to="/orders">
            <ArrowLeft className="size-4" /> Back to orders
          </Link>
        </Button>
        <div className="surface-card mt-6 p-6">
          <h1 className="font-display text-2xl font-semibold">Order not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This order may have been removed from local storage.
          </p>
        </div>
      </div>
    );
  }

  const canAccept = order.status === "DELIVERED" && canTransition(order.status, "COMPLETED");
  const canDispute = order.status === "DELIVERED" && canTransition(order.status, "DISPUTED");

  const acceptOrder = () => {
    if (!canTransition(order.status, "COMPLETED")) {
      toast.error("This order cannot be accepted from its current status.");
      return;
    }

    updateOrder(order.id, {
      status: "COMPLETED",
      acceptedAt: new Date().toISOString(),
      payoutStatus: "PENDING",
    });
    toast.success("Order accepted", {
      description: "Seller payout has been queued for admin review.",
    });
  };

  const reportProblem = () => {
    const reason = disputeReason.trim();
    if (!reason) {
      toast.error("Add a short problem report first.");
      return;
    }
    if (!canTransition(order.status, "DISPUTED")) {
      toast.error("This order cannot be disputed from its current status.");
      return;
    }

    updateOrder(order.id, {
      status: "DISPUTED",
      disputeReason: reason,
      payoutStatus: order.payoutStatus,
    });
    setIsDisputeOpen(false);
    toast.success("Problem reported", {
      description: "The seller payout remains paused.",
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Button variant="ghost" asChild>
        <Link to="/orders">
          <ArrowLeft className="size-4" /> Back to orders
        </Link>
      </Button>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-semibold">Order {id}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.listingTitle} - {formatMMK(order.totals.buyerTotal)}
          </p>
        </div>
        {canAccept || canDispute ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={acceptOrder} disabled={!canAccept}>
              <CheckCircle2 className="size-4" /> Accept
            </Button>
            <Dialog open={isDisputeOpen} onOpenChange={setIsDisputeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!canDispute}>
                  <AlertCircle className="size-4" /> Report a problem
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report a problem</DialogTitle>
                  <DialogDescription>
                    Describe what was wrong with the delivered material.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={disputeReason}
                  onChange={(event) => setDisputeReason(event.target.value)}
                  placeholder="Damaged goods, wrong quantity, or material does not match the listing."
                  rows={5}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDisputeOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={reportProblem}>
                    Submit report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : null}
      </div>

      {order.status === "DELIVERED" && order.inspectionDeadline ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-md border border-warning/40 bg-warning/15 p-4 text-sm">
          <Clock className="size-4 text-warning-foreground" aria-hidden="true" />
          <div>
            <p className="font-semibold">Inspection window</p>
            <p className="text-muted-foreground">
              {countdown.remainingMs > 0
                ? `${formatDuration(countdown.remainingMs)} remaining`
                : "Inspection window ended"}{" "}
              - deadline {formatDateTime(order.inspectionDeadline)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="surface-card p-6">
          <h2 className="font-display text-xl font-semibold">Fulfillment timeline</h2>
          <OrderTimeline className="mt-5" status={order.status} />
        </div>

        <div className="surface-card p-6">
          <h2 className="font-display text-xl font-semibold">Payment summary</h2>
          <div className="mt-5">
            <FeeBreakdown totals={order.totals} variant="buyer" />
          </div>
        </div>
      </div>

      <div className="surface-card mt-5 p-6">
        <h2 className="font-display text-xl font-semibold">Order details</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {detailRows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-sm font-medium">{value}</dd>
            </div>
          ))}
          {order.deliveredAt ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Delivered</dt>
              <dd className="mt-1 text-sm font-medium">{formatDateTime(order.deliveredAt)}</dd>
            </div>
          ) : null}
          {order.acceptedAt ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Accepted</dt>
              <dd className="mt-1 text-sm font-medium">{formatDateTime(order.acceptedAt)}</dd>
            </div>
          ) : null}
        </dl>
        {order.disputeReason ? (
          <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm font-semibold text-destructive">Problem report</p>
            <p className="mt-1 text-sm text-muted-foreground">{order.disputeReason}</p>
          </div>
        ) : null}
      </div>
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

function useInspectionCountdown(deadline?: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return undefined;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [deadline]);

  const deadlineMs = deadline ? new Date(deadline).getTime() : now;
  return { remainingMs: Math.max(0, deadlineMs - now) };
}

function formatDuration(value: number) {
  const totalSeconds = Math.ceil(value / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
