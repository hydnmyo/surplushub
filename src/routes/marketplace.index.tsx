import { useMemo, useState } from "react";
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
        content: "Search textile, plastic, paper, metal, wood, glass, rubber and construction surplus.",
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

function Marketplace() {
  const { category } = Route.useSearch();
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

  const results = useMemo(() => {
    const out = LISTINGS.filter((l) => {
      const seller = BUSINESSES.find((b) => b.id === l.sellerId);
      const text = `${l.title} ${l.composition} ${seller?.name ?? ""}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (cat !== "all" && l.category !== cat) return false;
      if (type !== "all" && l.materialType !== type) return false;
      if (cond !== "all" && l.condition !== cond) return false;
      if (loc !== "all" && l.location !== loc) return false;
      if (l.price !== null && l.price > maxPrice) return false;
      if (l.quantity < minQty) return false;
      if (minRating !== "all" && (seller?.rating ?? 0) < Number(minRating)) return false;
      if (verifiedOnly && !seller?.verified) return false;
      if (pickupOnly && !l.pickupAvailable) return false;
      if (processing && !l.requiresProcessing) return false;
      return true;
    });

    const rating = (id: string) => BUSINESSES.find((b) => b.id === id)?.rating ?? 0;
    switch (sort) {
      case "Newest":
        return [...out].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
      case "Price Low to High":
        return [...out].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case "Price High to Low":
        return [...out].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "Highest Rated":
        return [...out].sort((a, b) => rating(b.sellerId) - rating(a.sellerId));
      case "Most Popular":
        return [...out].sort((a, b) => b.views - a.views);
      default:
        return [...out].sort(
          (a, b) => Number(!!b.featured) - Number(!!a.featured) || b.popularity - a.popularity,
        );
    }
  }, [q, cat, type, cond, loc, sort, maxPrice, minQty, minRating, verifiedOnly, pickupOnly, processing]);

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

          <FilterSelect label="Category" value={cat} onChange={setCat} options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))} />
          <FilterSelect label="Material Type" value={type} onChange={setType} options={MATERIAL_TYPES.map((t) => ({ value: t, label: t }))} />
          <FilterSelect label="Condition" value={cond} onChange={setCond} options={CONDITIONS.map((c) => ({ value: c, label: c }))} />
          <FilterSelect label="Location" value={loc} onChange={setLoc} options={LOCATIONS.map((l) => ({ value: l, label: l }))} />
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
              <span className="font-semibold text-foreground">{results.length}</span> materials found
            </p>
            {cat !== "all" && <Badge variant="soft">{CATEGORIES.find((c) => c.id === cat)?.name}</Badge>}
          </div>
          {results.length === 0 ? (
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
              {results.map((l) => (
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