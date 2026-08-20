import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BUSINESSES, CATEGORIES, LISTINGS, TRANSACTIONS } from "@/lib/data";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Circular Impact — Give Materials a Second Life | SurplusHub" },
      {
        name: "description",
        content:
          "Current marketplace metrics showing active surplus listings, participating businesses, completed transactions and recovered value.",
      },
      { property: "og:title", content: "Circular Impact — SurplusHub" },
      {
        property: "og:description",
        content: "Give materials a second life instead of discarding usable resources.",
      },
    ],
  }),
  component: Impact,
});

const LOOP = [
  "Surplus material",
  "Digital marketplace",
  "AI matching",
  "Business transaction",
  "Reuse / recycling",
  "New value",
  "Less unnecessary waste",
];

function Impact() {
  const activeListings = LISTINGS.filter((listing) => listing.status === "Active");
  const completedTransactions = TRANSACTIONS.filter(
    (transaction) => transaction.status === "Completed",
  );
  const completedValue = completedTransactions.reduce(
    (total, transaction) => total + transaction.value,
    0,
  );
  const categoryListings = CATEGORIES.map((category) => ({
    category: category.name,
    count: activeListings.filter((listing) => listing.category === category.id).length,
  })).filter((category) => category.count > 0);
  const maxListings = Math.max(...categoryListings.map((category) => category.count));

  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Badge className="border border-forest-foreground/25 bg-forest-foreground/10 text-forest-foreground">
            Live Marketplace Snapshot
          </Badge>
          <h1 className="mt-4 font-display text-4xl font-semibold text-forest-foreground">
            Give Materials a Second Life.
          </h1>
          <p className="mt-3 max-w-2xl text-forest-foreground/80">
            We help businesses exchange surplus and recyclable materials instead of allowing usable
            resources to be unnecessarily discarded.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Material categories", String(categoryListings.length)],
            ["Businesses connected", String(BUSINESSES.length)],
            ["Completed transactions", String(completedTransactions.length)],
            ["Surplus value recovered", `${(completedValue / 1_000_000).toFixed(2)}M MMK`],
            ["Active listings", String(activeListings.length)],
          ].map(([k, v]) => (
            <div key={k} className="surface-card p-5">
              <p className="font-display text-2xl font-semibold text-primary">{v}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-6">
            <h2 className="font-display text-xl font-semibold">Active listings by category</h2>
            <div className="mt-5 space-y-4">
              {categoryListings.map((category) => (
                <div key={category.category}>
                  <div className="flex justify-between text-sm">
                    <span>{category.category}</span>
                    <span className="font-medium">{category.count} listings</span>
                  </div>
                  <Progress className="mt-1.5" value={(category.count / maxListings) * 100} />
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Counts are calculated from the marketplace's current listings and transaction records.
            </p>
          </div>

          <div className="surface-card p-6">
            <h2 className="font-display text-xl font-semibold">The impact loop</h2>
            <ol className="mt-5 space-y-2.5">
              {LOOP.map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3 text-sm"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-mint font-display text-xs font-semibold text-accent-foreground">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
