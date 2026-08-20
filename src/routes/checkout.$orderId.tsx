import { createFileRoute, Link } from "@tanstack/react-router";

/**
 * SEED STUB — owned by Track B (checkout + MMQR payment).
 *
 * Build the itemised buyer/seller breakdown with <FeeBreakdown>, the MMQR panel,
 * and a callback-shaped markPaid handler here. Do not add other route files.
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order <span className="font-medium text-foreground">{orderId}</span>
      </p>
      <div className="surface-card mt-6 p-6 text-sm text-muted-foreground">
        Checkout is being built. Track B owns this route.
      </div>
      <Link to="/marketplace" search={{}} className="mt-6 inline-block text-sm text-primary">
        Back to marketplace
      </Link>
    </div>
  );
}
