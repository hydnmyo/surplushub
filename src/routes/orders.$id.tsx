import { createFileRoute } from "@tanstack/react-router";

/**
 * SEED STUB — owned by Track C (fulfillment, inspection window, accept).
 *
 * Build the order detail, <OrderTimeline>, the inspection countdown, Accept and
 * "Report a problem" here. Do not add other route files.
 */

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Order {id}</h1>
      <div className="surface-card mt-6 p-6 text-sm text-muted-foreground">
        Order tracking is being built. Track C owns this route.
      </div>
    </div>
  );
}
