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
  LOCATIONS,
  MATERIAL_TYPES,
  type CategoryId,
  type Condition,
  type Listing,
  type MaterialType,
} from "@/lib/data";
import { supabase } from "@/lib/supabase";

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

type ListingRow = {
  id: string;
  title: string;
  category: CategoryId;
  material_type: MaterialType;
  condition: Condition;
  composition: string;
  quantity: number;
  unit: string;
  price: number | null;
  price_unit: string;
  min_order: string;
  location: string;
  available_from: string;
  seller_id: string;
  requires_processing: boolean;
  pickup_available: boolean;
  featured: boolean;
  views: number;
  inquiries: number;
  popularity: number;
  status: Listing["status"];
  description: string;
  uses: string[];
  created_at: string;
  businesses?: {
    id: string;
    name: string;
    verified: boolean;
    rating: number;
  } | null;
};

function sellerIdForCard(row: ListingRow) {
  const seller = BUSINESSES.find(
    (business) => business.id === row.seller_id || business.name === row.businesses?.name,
  );

  return seller?.id ?? row.seller_id;
}

function toListing(row: ListingRow): Listing {
  const createdAt = row.created_at ? new Date(row.created_at).getTime() : Date.now();
  const postedDaysAgo = Number.isFinite(createdAt)
    ? Math.max(0, Math.floor((Date.now() - createdAt) / 86_400_000))
    : 0;
  const seller = row.businesses
    ? {
        id: row.businesses.id,
        name: row.businesses.name,
        verified: row.businesses.verified,
        rating: Number(row.businesses.rating),
      }
    : null;

  const listing: Listing = {
    id: row.id,
    title: row.title,
    category: row.category,
    materialType: row.material_type,
    condition: row.condition,
    composition: row.composition,
    quantity: Number(row.quantity),
    unit: row.unit,
    price: row.price === null ? null : Number(row.price),
    priceUnit: row.price_unit,
    minOrder: row.min_order,
    location: row.location,
    availableFrom: row.available_from,
    sellerId: sellerIdForCard(row),
    requiresProcessing: row.requires_processing,
    pickupAvailable: row.pickup_available,
    featured: row.featured,
    views: row.views,
    inquiries: row.inquiries,
    popularity: row.popularity,
    postedDaysAgo,
    status: row.status,
    description: row.description,
    uses: row.uses ?? [],
  };

  if (seller) listing.seller = seller;

  return listing;
}

function Marketplace() {
  const { category } = Route.useSearch();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(category ?? "all");
  const [type, setType] = useState<string>("all");
  const [cond, setCond] = useState<string>("all");
  const [loc, setLoc] = useState<string>("all");
  const [sort, setSort] = useState<string>("Recommended");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minQty, setMinQty] = useState(0);
  const [minRating, setMinRating] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [pickupOnly, setPickupOnly] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      setIsLoading(true);

      try {
        let query = supabase
          .from("listings")
          .select("*, businesses(id, name, verified, rating)")
          .neq("status", "Hidden");

        const search = q.trim();
        if (search) {
          const escaped = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
          query = query.or(
            `title.ilike.%${escaped}%,composition.ilike.%${escaped}%,description.ilike.%${escaped}%`,
          );
        }

        if (cat !== "all") query = query.eq("category", cat as CategoryId);
        if (type !== "all") query = query.eq("material_type", type as MaterialType);
        if (cond !== "all") query = query.eq("condition", cond as Condition);
        if (loc !== "all") query = query.eq("location", loc);
        if (pickupOnly) query = query.eq("pickup_available", true);
        if (processing) query = query.eq("requires_processing", true);

        query = query.lte("price", maxPrice).gte("quantity", minQty);

        switch (sort) {
          case "Newest":
            query = query.order("created_at", { ascending: false });
            break;
          case "Price Low to High":
            query = query.order("price", { ascending: true, nullsFirst: false });
            break;
          case "Price High to Low":
            query = query.order("price", { ascending: false, nullsFirst: false });
            break;
          case "Most Popular":
            query = query.order("views", { ascending: false });
            break;
          default:
            query = query
              .order("featured", { ascending: false })
              .order("popularity", { ascending: false });
            break;
        }

        const { data, error } = await query;
        if (error) throw error;

        let next = ((data ?? []) as unknown as ListingRow[]).map(toListing);

        if (minRating !== "all" || verifiedOnly || sort === "Highest Rated") {
          next = next.filter((listing) => {
            const seller =
              listing.seller ?? BUSINESSES.find((business) => business.id === listing.sellerId);
            if (minRating !== "all" && (seller?.rating ?? 0) < Number(minRating)) return false;
            if (verifiedOnly && !seller?.verified) return false;
            return true;
          });
        }

        if (sort === "Highest Rated") {
          next = [...next].sort((a, b) => {
            const aRating =
              a.seller?.rating ??
              BUSINESSES.find((business) => business.id === a.sellerId)?.rating ??
              0;
            const bRating =
              b.seller?.rating ??
              BUSINESSES.find((business) => business.id === b.sellerId)?.rating ??
              0;
            return bRating - aRating;
          });
        }

        if (!cancelled) setListings(next);
      } catch (error) {
        console.error("Unable to fetch marketplace listings from Supabase.", error);
        if (!cancelled) setListings([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    const handler = window.setTimeout(() => {
      void fetchListings();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(handler);
    };
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
                  setMaxPrice(50000);
                  setMinQty(0);
                  setMinRating("all");
                  setVerifiedOnly(false);
                  setPickupOnly(false);
                  setProcessing(false);
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
