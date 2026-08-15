import { createFileRoute, notFound } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialCard } from "@/components/site/MaterialCard";
import { businessById, categoryName, listingsBySeller, reviewsFor } from "@/lib/data";
import heroImg from "@/assets/hero-warehouse.jpg";

export const Route = createFileRoute("/businesses/$id")({
  loader: ({ params }) => {
    const business = businessById(params.id);
    if (!business) throw notFound();
    return { business };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Business unavailable — SurplusHub" }, { name: "robots", content: "noindex" }] };
    const b = loaderData.business;
    const title = `${b.name} — ${b.industry}, ${b.location} | SurplusHub`;
    const description = `${b.name} supplies surplus materials from ${b.location}. ${b.transactions} verified transactions, rated ${b.rating}.`;
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }] };
  },
  component: BusinessProfile,
});

function BusinessProfile() {
  const { business: b } = Route.useLoaderData();
  const listings = listingsBySeller(b.id);
  const reviews = reviewsFor(b.id);

  return (
    <div>
      <div className="relative h-52 overflow-hidden">
        <img src={heroImg} alt={`${b.name} facility`} width={1600} height={1008} className="size-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="surface-card -mt-16 flex flex-wrap items-center gap-5 p-6">
          <span className="flex size-20 items-center justify-center rounded-2xl bg-mint font-display text-2xl font-semibold text-accent-foreground">{b.initials}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold">{b.name}</h1>
              {b.verified && <Badge variant="verified" className="gap-1"><BadgeCheck className="size-3.5" />Verified Business</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {b.industry} · <MapPin className="inline size-3.5" /> {b.location} · Member since {b.since}
            </p>
          </div>
          <div className="flex gap-8">
            <div><p className="font-display text-xl font-semibold">{b.rating} <Star className="inline size-4 fill-warning text-warning" /></p><p className="text-xs text-muted-foreground">Rating</p></div>
            <div><p className="font-display text-xl font-semibold">{b.transactions}</p><p className="text-xs text-muted-foreground">Verified transactions</p></div>
            <div><p className="font-display text-xl font-semibold">{listings.length}</p><p className="text-xs text-muted-foreground">Active listings</p></div>
          </div>
        </div>

        <Tabs defaultValue="materials" className="mt-8 pb-4">
          <TabsList>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => <MaterialCard key={l.id} listing={l} />)}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 space-y-4">
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">No verified reviews yet.</p>}
            {reviews.map((r) => (
              <div key={r.id} className="surface-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{r.buyer}</p>
                  <Badge variant="verified">✓ Verified Purchase</Badge>
                  <span className="text-xs text-muted-foreground">{r.date} · {r.material}</span>
                </div>
                <p className="mt-2 text-sm">{r.text}</p>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                  <span>Product accuracy {r.accuracy}/5</span>
                  <span>Material quality {r.quality}/5</span>
                  <span>Communication {r.communication}/5</span>
                  <span>Reliability {r.reliability}/5</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="surface-card grid gap-6 p-6 md:grid-cols-2">
              <div>
                <h2 className="font-display text-lg font-semibold">Company description</h2>
                <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {b.categories.map((c) => <Badge key={c} variant="soft">{categoryName(c)}</Badge>)}
                </div>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Contact information</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li>{b.contact.person}</li>
                  <li>{b.contact.phone}</li>
                  <li>{b.contact.email}</li>
                  <li>{b.contact.address}</li>
                  <li>Business hours: {b.hours}</li>
                  <li>{b.website}</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
