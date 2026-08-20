import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUSINESSES, categoryName, listingsBySeller } from "@/lib/data";

export const Route = createFileRoute("/businesses/")({
  head: () => ({
    meta: [
      { title: "Verified Businesses — Surplus Material Suppliers | SurplusHub" },
      {
        name: "description",
        content:
          "Discover verified Myanmar businesses supplying surplus textile, plastic, paper, metal, wood, glass and construction materials.",
      },
      { property: "og:title", content: "Verified Businesses on SurplusHub" },
      {
        property: "og:description",
        content:
          "Company profiles, ratings and verified transaction history for surplus material suppliers.",
      },
    ],
  }),
  component: BusinessesPage,
});

function BusinessesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Businesses</h1>
      <p className="mt-2 text-muted-foreground">
        Suppliers and buyers active on the SurplusHub marketplace.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BUSINESSES.map((b) => (
          <article key={b.id} className="surface-card flex flex-col p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-mint font-display text-lg font-semibold text-accent-foreground">
                {b.initials}
              </span>
              <div>
                <h2 className="font-display font-semibold">{b.name}</h2>
                <p className="text-xs text-muted-foreground">{b.industry}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{b.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {b.categories.map((c) => (
                <Badge key={c} variant="soft">
                  {categoryName(c)}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {b.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 fill-warning text-warning" />
                {b.rating}
              </span>
              <span>{b.transactions} verified transactions</span>
              {b.verified && (
                <span className="inline-flex items-center gap-1 text-primary">
                  <BadgeCheck className="size-3.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 pt-4">
              <span className="text-xs text-muted-foreground">
                {listingsBySeller(b.id).length} active listings
              </span>
              <Button size="sm" asChild>
                <Link to="/businesses/$id" params={{ id: b.id }}>
                  View Profile
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
