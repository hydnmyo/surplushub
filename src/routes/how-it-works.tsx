import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularLoop } from "@/components/site/CircularLoop";
import { TX_FLOW } from "@/lib/data";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Sell, Discover and Verify Surplus | SurplusHub" },
      { name: "description", content: "How SurplusHub works for sellers, buyers and transactions: list surplus, discover materials, negotiate, verify with a transaction QR." },
      { property: "og:title", content: "How SurplusHub Works" },
      { property: "og:description", content: "Surplus → Discovery → AI Match → Connect → Deal → Verify → Reuse." },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">How It Works</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        SurplusHub is a discovery, matching and verification layer for B2B material trade. Buyers and
        sellers settle payment directly — the platform records and verifies the deal.
      </p>

      <div className="mt-10"><CircularLoop /></div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {[
          { title: "For sellers", items: ["Create a company profile and get verified", "Upload surplus with photos, quantity and condition", "Let Loopi draft the listing and estimate price", "Receive inquiries and offers", "Accept, reject or counter", "Confirm the sale and collect verified reviews"] },
          { title: "For buyers", items: ["Search and filter by category, price, location, condition", "Check verified badges and seller ratings", "Request to Buy with quantity and offered price", "Negotiate or request an inspection", "Complete the deal with a transaction QR", "Leave a verified purchase review"] },
          { title: "For the platform", items: ["Business verification and document review", "Listing moderation and reporting", "Transaction records and status tracking", "Category management", "Analytics and circular-economy metrics"] },
        ].map((c) => (
          <div key={c.title} className="surface-card p-6">
            <h2 className="font-display text-lg font-semibold">{c.title}</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {c.items.map((i) => <li key={i} className="flex gap-2"><span className="text-primary">→</span>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="surface-card mt-12 p-7">
        <Badge variant="soft">Transaction verification</Badge>
        <h2 className="mt-3 font-display text-2xl font-semibold">Every deal has a tracked status trail</h2>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {TX_FLOW.map((s, i) => (
            <li key={s} className="rounded-xl border border-border bg-secondary/50 p-3 text-sm">
              <span className="mr-2 font-display font-semibold text-primary">{i + 1}</span>{s}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-muted-foreground">
          Integrated payment and escrow can be introduced in a future phase.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild><Link to="/marketplace" search={{}}>Explore Materials</Link></Button>
          <Button variant="outline" asChild><Link to="/wanted">Post What You Need</Link></Button>
        </div>
      </div>
    </div>
  );
}
