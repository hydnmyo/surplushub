import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CATEGORY_SALES, PLATFORM_STATS } from "@/lib/data";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Circular Impact — Give Materials a Second Life | SurplusHub" },
      { name: "description", content: "Prototype metrics showing surplus materials exchanged, businesses connected and value recovered through the SurplusHub circular marketplace." },
      { property: "og:title", content: "Circular Impact — SurplusHub" },
      { property: "og:description", content: "Give materials a second life instead of discarding usable resources." },
    ],
  }),
  component: Impact,
});

const LOOP = ["Surplus material", "Digital marketplace", "AI matching", "Business transaction", "Reuse / recycling", "New value", "Less unnecessary waste"];

function Impact() {
  const maxTons = Math.max(...CATEGORY_SALES.map((c) => c.tons));
  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Badge className="border border-forest-foreground/25 bg-forest-foreground/10 text-forest-foreground">Prototype / Demo Metrics</Badge>
          <h1 className="mt-4 font-display text-4xl font-semibold text-forest-foreground">Give Materials a Second Life.</h1>
          <p className="mt-3 max-w-2xl text-forest-foreground/80">
            We help businesses exchange surplus and recyclable materials instead of allowing usable
            resources to be unnecessarily discarded.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Materials exchanged", PLATFORM_STATS.materialsExchanged],
            ["Businesses connected", `${PLATFORM_STATS.businesses}+`],
            ["Completed transactions", String(PLATFORM_STATS.completedTransactions)],
            ["Surplus value recovered", PLATFORM_STATS.transactionValue],
            ["Active listings", PLATFORM_STATS.activeListings.toLocaleString("en-US")],
          ].map(([k, v]) => (
            <div key={k} className="surface-card p-5">
              <p className="font-display text-2xl font-semibold text-primary">{v}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-6">
            <h2 className="font-display text-xl font-semibold">Materials by category</h2>
            <div className="mt-5 space-y-4">
              {CATEGORY_SALES.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-sm">
                    <span>{c.category}</span>
                    <span className="font-medium">{c.tons} tons</span>
                  </div>
                  <Progress className="mt-1.5" value={(c.tons / maxTons) * 100} />
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Prototype / demo metrics. We do not claim exact carbon or environmental impact without a
              verified calculation methodology.
            </p>
          </div>

          <div className="surface-card p-6">
            <h2 className="font-display text-xl font-semibold">The impact loop</h2>
            <ol className="mt-5 space-y-2.5">
              {LOOP.map((s, i) => (
                <li key={s} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3 text-sm">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-mint font-display text-xs font-semibold text-accent-foreground">{i + 1}</span>
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
