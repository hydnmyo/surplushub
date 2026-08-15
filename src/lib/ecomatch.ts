import {
  BUSINESSES,
  CATEGORIES,
  LISTINGS,
  WANTED,
  priceLabel,
  type CategoryId,
  type Listing,
  type WantedPost,
} from "./data";

export interface AiAnswer {
  intent: string;
  text: string;
  note?: string;
  listings?: { listing: Listing; match: number }[];
  wanted?: { post: WantedPost; match: number }[];
  businesses?: { id: string; name: string; line: string }[];
  bullets?: string[];
}

const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  textile: ["textile", "fabric", "cotton", "denim", "yarn", "thread", "zipper", "leather", "cloth"],
  plastic: ["plastic", "pet", "hdpe", "poly", "bottle", "film"],
  paper: ["paper", "cardboard", "carton", "box", "boxes", "kraft", "corrugated"],
  metal: ["metal", "aluminium", "aluminum", "steel", "copper", "wire", "iron", "scrap metal"],
  wood: ["wood", "timber", "plywood", "pallet", "sawdust", "offcut wood"],
  glass: ["glass", "bottle", "jar"],
  rubber: ["rubber", "nitrile", "gasket"],
  construction: ["construction", "tile", "pipe", "building", "cement"],
  industrial: ["fastener", "bolt", "component", "drum", "container", "industrial"],
  other: ["other", "misc"],
};

const detectCategory = (q: string): CategoryId | null => {
  let best: { id: CategoryId; score: number } | null = null;
  for (const [id, words] of Object.entries(CATEGORY_KEYWORDS) as [CategoryId, string[]][]) {
    const score = words.reduce((acc, w) => (q.includes(w) ? acc + w.length : acc), 0);
    if (score > 0 && (!best || score > best.score)) best = { id, score };
  }
  return best?.id ?? null;
};

const detectLocation = (q: string) =>
  ["yangon", "mandalay", "bago", "mawlamyine", "taunggyi", "pathein"].find((l) => q.includes(l)) ?? null;

const detectBudget = (q: string): number | null => {
  const m = q.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(k|lakh|million|m\b)?/g);
  if (!m) return null;
  const nums = m
    .map((s) => {
      const v = parseFloat(s);
      if (Number.isNaN(v)) return 0;
      if (/million|m$/.test(s)) return v * 1_000_000;
      if (/lakh/.test(s)) return v * 100_000;
      if (/k$/.test(s)) return v * 1000;
      return v;
    })
    .filter((v) => v >= 1000);
  return nums.length ? Math.max(...nums) : null;
};

const scoreListing = (l: Listing, q: string, cat: CategoryId | null, loc: string | null) => {
  let s = 55;
  if (cat && l.category === cat) s += 22;
  if (loc && l.location.toLowerCase() === loc) s += 10;
  if (q.split(/\s+/).some((w) => w.length > 3 && l.title.toLowerCase().includes(w))) s += 12;
  if (businessVerified(l.sellerId)) s += 4;
  return Math.min(98, s + Math.round(l.popularity / 25));
};

const businessVerified = (id: string) => BUSINESSES.find((b) => b.id === id)?.verified ?? false;

export const AI_SUGGESTIONS = [
  "I need packaging materials for my small business.",
  "I have 200,000 MMK — what can I buy?",
  "Find PET plastic scrap in Yangon under 700 MMK per kg.",
  "Which verified businesses sell aluminium scraps?",
  "What can cardboard surplus be used for?",
  "I have 200kg of wood offcuts. Who might need them?",
  "Help me write a listing for denim offcuts.",
  "Estimate a price for 500kg PET plastic scrap.",
];

export function askEcoMatch(question: string): AiAnswer {
  const q = question.toLowerCase().trim();
  const cat = detectCategory(q);
  const loc = detectLocation(q);
  const budget = detectBudget(q);
  const hasSupply = /(i have|we have|i've got|selling|i want to sell|dispose)/.test(q);

  // 6. Supply → demand matching
  if (hasSupply) {
    const matches = WANTED.filter((w) => (cat ? w.category === cat : true))
      .map((post) => ({
        post,
        match: Math.min(
          97,
          62 + (cat && post.category === cat ? 24 : 0) + (loc && post.location.toLowerCase() === loc ? 8 : 0) + (post.offers < 4 ? 5 : 0),
        ),
      }))
      .sort((a, b) => b.match - a.match)
      .slice(0, 5);
    return {
      intent: "Supply–Demand Matching",
      text: `EcoMatch AI found ${matches.length} potentially relevant buyer request${matches.length === 1 ? "" : "s"} for your material.`,
      wanted: matches,
      note: "Match scores are indicative and based on category, location and buyer activity.",
    };
  }

  // 8. Price estimate
  if (/(price|estimate|worth|how much (can|should))/.test(q)) {
    const pool = LISTINGS.filter((l) => (cat ? l.category === cat : true) && l.price !== null);
    const avg = pool.length ? Math.round(pool.reduce((a, l) => a + (l.price ?? 0), 0) / pool.length) : 0;
    const low = Math.round(avg * 0.85);
    const high = Math.round(avg * 1.2);
    return {
      intent: "AI Price Estimate",
      text: `Based on ${pool.length} comparable ${cat ? CATEGORIES.find((c) => c.id === cat)?.name.toLowerCase() : "marketplace"} listings, an indicative range is ${low.toLocaleString("en-US")} – ${high.toLocaleString("en-US")} MMK per unit.`,
      bullets: pool.slice(0, 4).map((l) => `${l.title} — ${priceLabel(l)} (${l.location})`),
      note: "AI Price Estimate — Not a Guaranteed Market Price.",
    };
  }

  // 7. Listing assistant
  if (/(write|create|draft|help me list|listing|title|description)/.test(q)) {
    const name = cat ? CATEGORIES.find((c) => c.id === cat)?.name : "Surplus Material";
    return {
      intent: "Listing Assistant",
      text: `Here is a draft listing you can edit and publish.`,
      bullets: [
        `Title: ${name} Surplus — Factory Direct, Yangon`,
        `Category: ${name}`,
        `Material type: Production Surplus`,
        `Description: Clean ${name?.toLowerCase()} surplus from a completed production run. Stored indoors, sorted and ready for immediate collection. Sample available on request.`,
        `Keywords: surplus, ${name?.toLowerCase()}, offcut, wholesale, Yangon, B2B, reusable`,
      ],
      note: "Review and adjust details before publishing — accurate listings receive more verified inquiries.",
    };
  }

  // 5. Material information / potential uses
  if (/(what can|used for|potential use|application)/.test(q)) {
    const sample = LISTINGS.find((l) => (cat ? l.category === cat : true));
    return {
      intent: "Material Information",
      text: `Potential business uses for ${cat ? CATEGORIES.find((c) => c.id === cat)?.name.toLowerCase() : "this material"}:`,
      bullets: sample?.uses ?? ["Manufacturing inputs", "Packaging", "Reprocessing"],
      ...(sample ? { listings: [{ listing: sample, match: 88 }] } : {}),
      note: "Potential uses are suggestions only — suitability is not guaranteed.",
    };
  }

  // 4. Supplier recommendation
  if (/(supplier|business|company|who sells|verified)/.test(q)) {
    const list = BUSINESSES.filter((b) => (cat ? b.categories.includes(cat) : true))
      .filter((b) => (/(verified)/.test(q) ? b.verified : true))
      .slice(0, 4)
      .map((b) => ({
        id: b.id,
        name: b.name,
        line: `${b.industry} · ${b.location} · ⭐ ${b.rating} · ${b.transactions} verified transactions`,
      }));
    return {
      intent: "Supplier Recommendation",
      text: `EcoMatch AI found ${list.length} matching business${list.length === 1 ? "" : "es"}.`,
      businesses: list,
    };
  }

  // 1/2/3. Product + budget + smart search
  const unitCap = q.match(/under\s*([\d,]+)/);
  const perUnitCap = unitCap?.[1] ? parseInt(unitCap[1].replace(/,/g, ""), 10) : null;

  let pool = LISTINGS.filter((l) => l.status !== "Hidden");
  if (cat) pool = pool.filter((l) => l.category === cat);
  if (loc) pool = pool.filter((l) => l.location.toLowerCase() === loc);
  if (perUnitCap) pool = pool.filter((l) => l.price === null || l.price <= perUnitCap);
  if (budget && !perUnitCap)
    pool = pool.filter((l) => l.price === null || l.price * Math.max(1, Math.min(l.quantity, 20)) <= budget * 4);
  if (/packag/.test(q))
    pool = LISTINGS.filter((l) =>
      ["paper", "plastic", "glass", "industrial"].includes(l.category),
    );

  const listings = pool
    .map((listing) => ({ listing, match: scoreListing(listing, q, cat, loc) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 4);

  if (!listings.length) {
    return {
      intent: "Smart Search",
      text: "No live listings match that exactly. Try posting a Material Wanted requirement — sellers with matching stock will be notified and can make you an offer.",
    };
  }

  return {
    intent: budget ? "Budget Recommendation" : "Material Discovery",
    text: budget
      ? `With a budget of around ${budget.toLocaleString("en-US")} MMK, these live listings are within reach:`
      : `EcoMatch AI found ${listings.length} relevant marketplace listing${listings.length === 1 ? "" : "s"}:`,
    listings,
    note: "Recommendations are generated from live marketplace data. Always verify quantity and condition with the seller.",
  };
}