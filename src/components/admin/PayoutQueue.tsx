/**
 * SEED STUB — owned by Track D (admin payout, revenue, business model).
 *
 * List orders where status === "COMPLETED" && payoutStatus === "PENDING", show
 * order.totals.sellerNet as the amount owed, and let an admin record a transfer
 * reference via updateOrder(id, { payoutStatus: "PAID", payoutRef, payoutAt }).
 */
export function PayoutQueue() {
  return (
    <div className="surface-card p-6 text-sm text-muted-foreground">
      The payout queue is being built. Track D owns this component.
    </div>
  );
}
