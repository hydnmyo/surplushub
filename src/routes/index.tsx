import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Boxes, LineChart, Search, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-warehouse.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MaterialCard } from "@/components/site/MaterialCard";
import { CATEGORIES, LISTINGS, WANTED, listingCountByCategory } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SurplusHub — Turn Surplus Into Opportunity" },
      {
        name: "description",
        content:
          "A circular B2B marketplace where Myanmar businesses sell surplus materials and find the production resources they need.",
      },
      { property: "og:title", content: "SurplusHub — Turn Surplus Into Opportunity" },
      {
        property: "og:description",
        content:
          "Sell surplus materials, discover affordable production inputs, and match supply with demand using Loopi.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = LISTINGS.filter((l) => l.featured).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Warehouse with organised pallets of surplus fabric, cardboard, plastic and timber"
            width={1600}
            height={1008}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero opacity-[0.93]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <Badge className="border border-forest-foreground/25 bg-forest-foreground/10 text-forest-foreground">
            Circular B2B marketplace · Myanmar
          </Badge>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-forest-foreground sm:text-5xl lg:text-6xl">
            Turn Surplus Into Opportunity.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-forest-foreground/80">
            A circular B2B marketplace where businesses can sell surplus materials and find the resources
            they need.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="xl" variant="hero" asChild>
              <Link to="/marketplace">
                Explore Materials <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="xl" variant="onDark" asChild>
              <Link to="/dashboard">Sell Surplus</Link>
            </Button>
            <Button size="xl" variant="onDark" asChild>
              <Link to="/wanted">Post What You Need</Link>
            </Button>
          </div>

        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Boxes,
              title: "Businesses have surplus",
              body: "Offcuts, excess inventory, packaging and recyclable material sitting idle in warehouses.",
            },
            {
              icon: Search,
              title: "Other businesses need materials",
              body: "Manufacturers, packers and builders looking for affordable, available production inputs.",
            },
            {
              icon: Sparkles,
              title: "We connect them",
              body: "Loopi matches supply with demand, then the platform tracks and verifies the deal.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="surface-card p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-mint text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionHead
          eyebrow="Marketplace categories"
          title="Every industrial material stream"
          action={{ to: "/marketplace" as const, label: "Browse marketplace" }}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/marketplace"
              search={{ category: c.id }}
              className="group surface-card overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <div className="aspect-[5/3] overflow-hidden bg-muted">
                <img
                  src={c.image}
                  alt={`${c.name} surplus materials`}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="font-display text-sm font-semibold">
                  {c.name}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.blurb}</p>
                <p className="mt-3 text-xs font-medium text-primary">
                  {listingCountByCategory(c.id)} {listingCountByCategory(c.id) === 1 ? "listing" : "listings"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead
          eyebrow="Featured listings"
          title="Available surplus right now"
          action={{ to: "/marketplace", label: "View all materials" }}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((l) => (
            <MaterialCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* Wanted + AI */}
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div className="surface-card p-7">
          <Badge variant="soft">Material Wanted</Badge>
          <h2 className="mt-4 font-display text-2xl font-semibold">
            Can't find what you need? Tell businesses what you're looking for.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Post a requirement and verified suppliers with matching stock can send you offers directly.
          </p>
          <ul className="mt-5 space-y-3">
            {WANTED.slice(0, 3).map((w) => (
              <li key={w.id} className="rounded-xl border border-border bg-secondary/60 p-3.5">
                <p className="text-sm font-semibold">{w.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {w.quantity} · {w.budget} · {w.location} · Use: {w.use}
                </p>
              </li>
            ))}
          </ul>
          <Button className="mt-6" asChild>
            <Link to="/wanted">Post a Requirement</Link>
          </Button>
        </div>

        <div className="surface-card gradient-mint p-7">
          <Badge variant="verified" className="gap-1">
            <Sparkles className="size-3" /> Loopi
          </Badge>
          <h2 className="mt-4 font-display text-2xl font-semibold">
            AI-powered material discovery and supply–demand matching.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Loopi is more than a chatbot — it reads live marketplace data to recommend materials,
            find buyers for your surplus, estimate prices and draft listings.
          </p>
          <div className="mt-5 space-y-2.5">
            {[
              "\"I need packaging materials for my small business.\"",
              "\"Find PET plastic scrap in Yangon under 700 MMK per kg.\"",
              "\"I have 200kg of wood offcuts. Who might need them?\"",
            ].map((q) => (
              <p key={q} className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm">
                {q}
              </p>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Open Loopi from the button in the bottom-right corner of any page.
          </p>
        </div>
      </section>

      {/* Trust + impact strip */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="surface-card grid gap-6 p-8 md:grid-cols-3">
          {[
            { icon: BadgeCheck, title: "Verified businesses", body: "Company documents reviewed before a verified badge is issued." },
            { icon: LineChart, title: "Tracked transactions", body: "Every deal has an ID, a status trail and QR-based completion." },
            { icon: Sparkles, title: "Verified reviews only", body: "Only buyers with a completed transaction can review a business." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-display text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { to: "/marketplace" | "/wanted"; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">{title}</h2>
      </div>
      {action && (
        <Button variant="outline" asChild>
          <Link to={action.to}>
            {action.label} <ArrowRight className="size-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
