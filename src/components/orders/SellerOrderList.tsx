/**
 * SEED STUB — owned by Track C (fulfillment, inspection window, accept).
 *
 * Seller-side order list for the dashboard Orders tab. Advance status one step at
 * a time (PAID -> PREPARING -> SHIPPED -> DELIVERED), guarding every change with
 * canTransition() from @/lib/orders.
 */
export function SellerOrderList({ businessId }: { businessId: string }) {
  return (
    <div className="surface-card p-6 text-sm text-muted-foreground">
      Seller order management for {businessId} is being built. Track C owns this component.
    </div>
  );
}
