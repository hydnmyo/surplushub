import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star, Recycle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { businessById, categoryImage, categoryName, priceLabel, type Listing } from "@/lib/data";

export function MaterialCard({ listing }: { listing: Listing }) {
  const seller = businessById(listing.sellerId);

  return (
    <article className="group surface-card flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={categoryImage(listing.category)}
          alt={`${listing.title} — ${categoryName(listing.category)} surplus in ${listing.location}`}
          loading="lazy"
          width={800}
          height={600}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="forest">{categoryName(listing.category)}</Badge>
          {listing.featured && <Badge variant="warning">Featured</Badge>}
        </div>
        {listing.requiresProcessing && (
          <Badge variant="warning" className="absolute bottom-3 left-3 gap-1">
            <Recycle className="size-3" /> Requires Processing
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-base font-semibold leading-snug">{listing.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="soft">{listing.materialType}</Badge>
            <Badge variant="outlineMuted">{listing.condition}</Badge>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-lg font-semibold text-primary">{priceLabel(listing)}</p>
            <p className="text-xs text-muted-foreground">
              {listing.quantity.toLocaleString("en-US")} {listing.unit} available
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> {listing.location}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{seller?.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-warning text-warning" /> {seller?.rating}
              {seller?.verified && (
                <span className="ml-1 inline-flex items-center gap-0.5 text-primary">
                  <BadgeCheck className="size-3.5" /> Verified
                </span>
              )}
            </p>
          </div>
          <Button size="sm" asChild>
            <Link to="/marketplace/$id" params={{ id: listing.id }}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}