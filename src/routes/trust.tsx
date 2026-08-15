import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, FileCheck2, Flag, ScrollText, Star } from "lucide-react";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & Safety Center | SurplusHub" },
      { name: "description", content: "How SurplusHub builds trust: business verification, verified purchase reviews, material information, transaction records and reporting." },
      { property: "og:title", content: "Trust Center — SurplusHub" },
      { property: "og:description", content: "Verification, verified reviews and transaction records for B2B material trade." },
    ],
  }),
  component: Trust,
});

const ITEMS = [
  { icon: BadgeCheck, title: "Verified Businesses", body: "Business verification helps buyers identify credible suppliers. Documents are reviewed by the platform before a badge is issued." },
  { icon: Star, title: "Verified Purchase Reviews", body: "Only completed transactions can generate reviews. Anonymous visitors cannot review businesses." },
  { icon: FileCheck2, title: "Material Information", body: "Sellers can upload photos, specifications and supporting material information or certificates when available." },
  { icon: ScrollText, title: "Transaction Records", body: "The platform records transaction requests, negotiation history and completion status for both parties." },
  { icon: Flag, title: "Report System", body: "Users can report suspicious listings and businesses. Reports are queued for admin moderation." },
];

function Trust() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Trust & Safety</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Trust is the product. Every mechanism below exists so businesses can transact with suppliers they
        have never met before.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="surface-card p-6">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-mint text-accent-foreground"><Icon className="size-5" /></span>
            <h2 className="mt-4 font-display text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
