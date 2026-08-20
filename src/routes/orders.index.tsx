import { createFileRoute } from "@tanstack/react-router";

/**
 * SEED STUB — owned by Track C (fulfillment, inspection window, accept).
 *
 * Build the buyer's order list here. Do not add other route files.
 */

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
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">My Orders</h1>
      <div className="surface-card mt-6 p-6 text-sm text-muted-foreground">
        The order list is being built. Track C owns this route.
      </div>
    </div>
  );
}
