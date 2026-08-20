import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaterialCard } from "@/components/site/MaterialCard";
import {
  BUSINESSES,
  CATEGORIES,
  CONDITIONS,
  LISTINGS,
  LOCATIONS,
  MATERIAL_TYPES,
  type CategoryId,
  type Listing,
} from "@/lib/data";

export const Route = createFileRoute("/marketplace/")({
  validateSearch: (s: Record<string, unknown>): { category?: CategoryId } =>
    typeof s["category"] === "string" ? { category: s["category"] as CategoryId } : {},
  head: () => ({
    meta: [
      { title: "Marketplace — Surplus & Recyclable Materials | SurplusHub" },
      {
        name: "description",
        content:
          "Browse verified surplus, reusable and recyclable industrial materials from businesses in Yangon, Mandalay and Bago.",
      },
      { property: "og:title", content: "SurplusHub Marketplace" },
      {
        property: "og:description",
        content:
          "Search textile, plastic, paper, metal, wood, glass, rubber and construction surplus.",
      },
    ],
  }),
  component: Marketplace,
});

const SORTS = [
  "Recommended",
  "Newest",
  "Price Low to High",
  "Price High to Low",
  "Highest Rated",
  "Most Popular",
] as const;

const ORIGINAL_LISTINGS = LISTINGS;
const DEFAULT_MAX_PRICE = 50000;

type MarketplaceFilters = {
  q: string;
  cat: string;
  type: string;
  cond: string;
  loc: string;
  sort: string;
  maxPrice: number;
  minQty: number;
  minRating: string;
  verifiedOnly: boolean;
  pickupOnly: boolean;
  processing: boolean;
};

function filterListings(filters: MarketplaceFilters) {
  const search = filters.q.trim().toLowerCase();

  let next = ORIGINAL_LISTINGS.filter((listing) => {
    const seller = BUSINESSES.find((business) => business.id === listing.sellerId);
    const searchableText = [
      listing.title,
      listing.composition,
      listing.description,
      listing.materialType,
      listing.condition,
      listing.category,
      listing.location,
      seller?.name,
      seller?.industry,
      ...listing.uses,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (search && !searchableText.includes(search)) return false;
    if (filters.cat !== "all" && listing.category !== filters.cat) return false;
    if (filters.type !== "all" && listing.materialType !== filters.type) return false;
    if (filters.cond !== "all" && listing.condition !== filters.cond) return false;
    if (filters.loc !== "all" && listing.location !== filters.loc) return false;
    if (filters.pickupOnly && !listing.pickupAvailable) return false;
    if (filters.processing && !listing.requiresProcessing) return false;
    if (listing.price !== null && listing.price > filters.maxPrice) return false;
    if (listing.quantity < filters.minQty) return false;
    if (filters.minRating !== "all" && (seller?.rating ?? 0) < Number(filters.minRating)) {
      return false;
    }
    if (filters.verifiedOnly && !seller?.verified) return false;

    return true;
  });

  switch (filters.sort) {
    case "Newest":
      next = [...next].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
      break;
    case "Price Low to High":
      next = [...next].sort((a, b) => priceForSort(a) - priceForSort(b));
      break;
    case "Price High to Low":
      next = [...next].sort((a, b) => priceForSort(b) - priceForSort(a));
      break;
    case "Highest Rated":
      next = [...next].sort((a, b) => sellerRating(b) - sellerRating(a));
      break;
    case "Most Popular":
      next = [...next].sort((a, b) => b.views - a.views);
      break;
    default:
      next = [...next].sort(
        (a, b) =>
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.popularity - a.popularity,
      );
      break;
  }

  return next;
}

function priceForSort(listing: Listing) {
  return listing.price ?? Number.POSITIVE_INFINITY;
}

function sellerRating(listing: Listing) {
  return BUSINESSES.find((business) => business.id === listing.sellerId)?.rating ?? 0;
}

function Marketplace() {
  const { category } = Route.useSearch();
  const [listings, setListings] = useState<Listing[]>(ORIGINAL_LISTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(category ?? "all");
  const [type, setType] = useState<string>("all");
  const [cond, setCond] = useState<string>("all");
  const [loc, setLoc] = useState<string>("all");
  const [sort, setSort] = useState<string>("Recommended");
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [minQty, setMinQty] = useState(0);
  const [minRating, setMinRating] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [pickupOnly, setPickupOnly] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    setListings(
      filterListings({
        q,
        cat,
        type,
        cond,
        loc,
        sort,
        maxPrice,
        minQty,
        minRating,
        verifiedOnly,
        pickupOnly,
        processing,
      }),
    );
  }, [
    q,
    cat,
    type,
    cond,
    loc,
    sort,
    maxPrice,
    minQty,
    minRating,
    verifiedOnly,
    pickupOnly,
    processing,
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Marketplace</h1>
      <p className="mt-2 text-muted-foreground">
        Surplus, reusable and recyclable materials from verified Myanmar businesses.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search materials, categories, suppliers..."
            className="h-11 pl-9"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-11 sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="surface-card h-fit space-y-5 p-5">
          <p className="flex items-center gap-2 font-display text-sm font-semibold">
            <SlidersHorizontal className="size-4" /> Filters
          </p>

          <FilterSelect
            label="Category"
            value={cat}
            onChange={setCat}
            options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
          />
          <FilterSelect
            label="Material Type"
            value={type}
            onChange={setType}
            options={MATERIAL_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <FilterSelect
            label="Condition"
            value={cond}
            onChange={setCond}
            options={CONDITIONS.map((c) => ({ value: c, label: c }))}
          />
          <FilterSelect
            label="Location"
            value={loc}
            onChange={setLoc}
            options={LOCATIONS.map((l) => ({ value: l, label: l }))}
          />
          <FilterSelect
            label="Seller Rating"
            value={minRating}
            onChange={setMinRating}
            options={[
              { value: "4.8", label: "4.8+" },
              { value: "4.5", label: "4.5+" },
              { value: "4", label: "4.0+" },
            ]}
          />

          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Max unit price — {maxPrice.toLocaleString("en-US")} MMK
            </Label>
            <Slider
              className="mt-3"
              value={[maxPrice]}
              min={200}
              max={50000}
              step={200}
              onValueChange={([v]) => setMaxPrice(v ?? 50000)}
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Min quantity — {minQty.toLocaleString("en-US")}
            </Label>
            <Slider
              className="mt-3"
              value={[minQty]}
              min={0}
              max={2000}
              step={20}
              onValueChange={([v]) => setMinQty(v ?? 0)}
            />
          </div>

          <div className="space-y-2.5 border-t border-border pt-4">
            <Toggle label="Verified Business" checked={verifiedOnly} onChange={setVerifiedOnly} />
            <Toggle label="Available for Pickup" checked={pickupOnly} onChange={setPickupOnly} />
            <Toggle label="Requires Processing" checked={processing} onChange={setProcessing} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{listings.length}</span> materials
              found
            </p>
            {cat !== "all" && (
              <Badge variant="soft">{CATEGORIES.find((c) => c.id === cat)?.name}</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="surface-card p-10 text-center text-muted-foreground">
              Loading marketplace items...
            </div>
          ) : listings.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <p className="font-display text-lg font-semibold">No materials match these filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening your filters, or post a Material Wanted requirement instead.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  setQ("");
                  setCat("all");
                  setType("all");
                  setCond("all");
                  setLoc("all");
                  setSort("Recommended");
                  setMaxPrice(DEFAULT_MAX_PRICE);
                  setMinQty(0);
                  setMinRating("all");
                  setVerifiedOnly(false);
                  setPickupOnly(false);
                  setProcessing(false);
                  setIsLoading(false);
                  setListings(ORIGINAL_LISTINGS);
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <MaterialCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      {label}
    </label>
  );
}
