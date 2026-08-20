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

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="surface-card p-6">
            <h3 className="font-display text-lg font-semibold">
              No subscription at launch — on purpose
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A marketplace has a cold-start problem: without sellers there are no buyers, and
              without buyers there are no sellers. Charging a monthly fee before a business has seen
              any value is the fastest way to have neither.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              So at launch we charge only when a deal actually completes. If the platform does not
              create value, we do not get paid — our incentives and our users' point the same way.
              Subscriptions and premium tiers come once there is enough liquidity to be worth paying
              for.
            </p>
          </article>

          <article className="surface-card p-6">
            <h3 className="font-display text-lg font-semibold">What the fee pays for</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Buyers could always contact a seller directly. What they cannot get that way:
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {[
                "Verified businesses, not anonymous sellers",
                "Material specifications and photos on record",
                "Secure MMQR payment instead of transferring first and hoping",
                "Order tracking through preparation and delivery",
                "A 48-hour inspection window before the seller is paid",
                "Dispute support when the material is not what was described",
                "A verified transaction history that builds credibility",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-primary">
                    ·
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section aria-labelledby="phase-two-heading" className="mt-12">
        <h2 id="phase-two-heading" className="font-display text-2xl font-semibold">
          Phase 2
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Additional revenue we can introduce once the marketplace has enough transaction volume to
          support it. None of it is part of the launch model.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Featured listings",
              body: "Paid promotion for greater visibility on selected material listings.",
            },
            {
              title: "Business subscription",
              body: "Premium plans adding advanced analytics, AI tools and more listing capacity.",
            },
            {
              title: "Logistics partnerships",
              body: "Commission from delivery partners once volume supports negotiated rates.",
            },
            {
              title: "Integrated escrow",
              body: "A licensed settlement partner once transaction volume and trust justify it.",
            },
          ].map(({ title, body }) => (
            <article key={title} className="rounded-xl border border-dashed border-border p-5">
              <h3 className="font-display text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
