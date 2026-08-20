import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, BadgeDollarSign, Handshake, Sparkles } from "lucide-react";

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
    title: "Transaction Fee",
    body: "A small seller fee on successful transactions that are completed and verified through the platform.",
  },
  {
    icon: Sparkles,
    title: "Featured Listings",
    body: "Optional paid promotion gives businesses greater visibility for selected material listings.",
  },
  {
    icon: BarChart3,
    title: "Business Subscription",
    body: "Premium plans add advanced analytics, AI tools, enhanced visibility and additional listing capacity.",
  },
  {
    icon: BadgeDollarSign,
    title: "Future Revenue",
    body: "Logistics partnerships and integrated payment or escrow may be introduced as the marketplace grows.",
  },
] as const;

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
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      </section>
    </main>
  );
}
