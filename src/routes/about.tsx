import { createFileRoute } from "@tanstack/react-router";
import { BadgeDollarSign, Handshake, ReceiptText } from "lucide-react";
import { formatMMK } from "@/lib/data";
import { buyerFeeLabel, calculateOrderTotals, sellerFeeLabel } from "@/lib/fees";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Business Model | SurplusHub" },
      {
        name: "description",
        content:
          "How SurplusHub creates business value and earns revenue as Myanmar's circular B2B marketplace.",
      },
    ],
  }),
  component: About,
});

const REVENUE_STREAMS = [
  {
    icon: Handshake,
    title: `Seller success fee · ${sellerFeeLabel}`,
    body: "Charged to the seller only after a marketplace order is completed and accepted.",
  },
  {
    icon: ReceiptText,
    title: `Buyer service fee · ${buyerFeeLabel}`,
    body: "Added to the negotiated material price for verified checkout, tracking and dispute support.",
  },
  {
    icon: BadgeDollarSign,
    title: "Completion-based revenue",
    body: "Both fees apply to the material price only. Delivery and tax pass through without a platform fee.",
  },
] as const;

const WORKED_EXAMPLE = calculateOrderTotals({ materialPrice: 1000000 });

function About() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        About SurplusHub
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold sm:text-4xl">
        Business value first, circular impact built in.
      </h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        SurplusHub helps businesses discover materials, find new trading partners, negotiate deals
        and build a verified transaction history. The marketplace earns revenue by making those
        exchanges easier and more valuable for both sides.
      </p>

      <section id="business-model" aria-labelledby="business-model-heading" className="mt-12">
        <h2 id="business-model-heading" className="font-display text-2xl font-semibold">
          Business Model
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          SurplusHub charges only when a transaction actually completes through the platform.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {REVENUE_STREAMS.map(({ icon: Icon, title, body }) => (
            <article key={title} className="surface-card p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-mint text-accent-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>

        <article
          className="surface-card mt-6 overflow-hidden"
          aria-labelledby="worked-example-heading"
        >
          <div className="border-b border-border bg-secondary/60 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Worked example
            </p>
            <h3 id="worked-example-heading" className="mt-1 font-display text-xl font-semibold">
              One completed marketplace order
            </h3>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Material price", WORKED_EXAMPLE.materialPrice],
              ["Buyer pays", WORKED_EXAMPLE.buyerTotal],
              ["Seller receives", WORKED_EXAMPLE.sellerNet],
              ["Platform gross", WORKED_EXAMPLE.platformRevenue],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 font-display text-lg font-semibold">
                  {formatMMK(value as number)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
