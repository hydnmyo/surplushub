import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  CATEGORIES,
  CONDITIONS,
  LOCATIONS,
  type CategoryId,
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
] as const;

function Marketplace() {
  const { category } = Route.useSearch();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(category ?? "all");
  const [cond, setCond] = useState<string>("all");
  const [loc, setLoc] = useState<string>("all");
  const [sort, setSort] = useState<string>("Recommended");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minQty, setMinQty] = useState(0);

  // Fetch listings directly from Supabase based on active filters
  useEffect(() => {
    async function fetchListings() {
      setLoading(true);

      let query = supabase.from("listings").select("*");

      if (q.trim()) {
        query = query.ilike("title", `%${q.trim()}%`);
      }

      if (cat !== "all") {
        query = query.eq("category", cat);
      }

      if (cond !== "all") {
        query = query.eq("condition", cond);
      }

      if (loc !== "all") {
        query = query.eq("location", loc);
      }

      query = query.lte("price_mmk", maxPrice);

      if (minQty > 0) {
        query = query.gte("quantity_available", minQty);
      }

      switch (sort) {
        case "Newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "Price Low to High":
          query = query.order("price_mmk", { ascending: true });
          break;
        case "Price High to Low":
          query = query.order("price_mmk", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (!error && data) {
        setListings(data);
      }
      setLoading(false);
    }

    const handler = setTimeout(() => {
      fetchListings();
    }, 300);

    return () => clearTimeout(handler);
  }, [q, cat, cond, loc, sort, maxPrice, minQty]);

  const selectedCategoryName = (CATEGORIES as any[]).find(
    (c) => (c.id ?? c.key ?? c.slug) === cat
  )?.name;

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
            placeholder="Search materials by name..."
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
              options={(CATEGORIES as unknown as any[]).map((c) => ({
                value: String(c.id ?? c.key ?? c.slug ?? c.name),
                label: String(c.name ?? c.label),
              }))}
            />
            <FilterSelect
              label="Condition"
              value={cond}
              onChange={setCond}
              options={CONDITIONS.map((c) => ({
                value: String(c),
                label: String(c),
              }))}
            />
            <FilterSelect
              label="Location"
              value={loc}
              onChange={setLoc}
              options={LOCATIONS.map((l) => ({
                value: String(l),
                label: String(l),
              }))}
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
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{listings.length}</span> materials found
            </p>
            {cat !== "all" && selectedCategoryName && (
              <Badge variant="soft">{selectedCategoryName}</Badge>
            )}
          </div>

          {loading ? (
            <div className="surface-card p-10 text-center text-muted-foreground">
              Loading marketplace items...
            </div>
          ) : listings.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <p className="font-display text-lg font-semibold">No materials match these filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening your filters or search criteria.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  setQ("");
                  setCat("all");
                  setCond("all");
                  setLoc("all");
                  setMaxPrice(50000);
                  setMinQty(0);
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