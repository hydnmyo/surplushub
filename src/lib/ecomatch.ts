import type { CategoryId, Listing } from "./data";
import {
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_LOCATIONS,
  filterMarketplaceListings,
  getSimilarMarketplaceListings,
  toMarketplaceListingView,
  type MarketplaceListingView,
} from "./marketplace-data";

export type ChatAction = "find-materials" | "find-buyers" | "estimate-price" | "create-listing";
export type FlowStep = "idle" | "select-material" | "select-location";
export type OptionKind = "action" | "category" | "location" | "back";

export interface FlowCollected {
  category: CategoryId | null;
  location: string | null;
  maxPricePerUnit: number | null;
}

export interface EcoMatchFlowState {
  action: ChatAction | null;
  step: FlowStep;
  collected: FlowCollected;
}

export interface EcoMatchOption {
  id: string;
  label: string;
  kind: OptionKind;
  action?: ChatAction;
  category?: CategoryId;
  location?: string | null;
}

export interface ListingMatch {
  listing: MarketplaceListingView;
  match: number;
}

export interface PriceEstimate {
  categoryName: string;
  min: number;
  max: number;
  median: number | null;
  unit: string;
  count: number;
}

export interface BuyerSuggestion {
  id: string;
  name: string;
  buyerType: string;
  location: string;
  likelyUse: string;
}

export interface ListingDraft {
  title: string;
  category: string;
  description: string;
  quantity: string;
  location: string;
  suggestedPrice: string;
  possibleUses: string[];
}

export interface AiAnswer {
  intent: string;
  text: string;
  note?: string;
  options?: EcoMatchOption[];
  listings?: ListingMatch[];
  similarListings?: ListingMatch[];
  estimate?: PriceEstimate;
  buyerSuggestions?: BuyerSuggestion[];
  draft?: ListingDraft;
  nextFlow: EcoMatchFlowState;
}

interface ParsedMessage {
  intent: ChatAction | "general";
  category: CategoryId | null;
  location: string | null;
  maxPricePerUnit: number | null;
}

const emptyCollected = (): FlowCollected => ({
  category: null,
  location: null,
  maxPricePerUnit: null,
});

export const createInitialFlowState = (): EcoMatchFlowState => ({
  action: null,
  step: "idle",
  collected: emptyCollected(),
});

export const AI_EXAMPLE_PROMPTS = [
  "Find PET plastic in Yangon under 700 MMK per kg.",
  "Which verified sellers have aluminium scrap?",
  "Estimate a price for metal.",
];

const ACTION_LABELS: Record<ChatAction, string> = {
  "find-materials": "Find Materials",
  "find-buyers": "Find Buyers",
  "estimate-price": "Estimate Price",
  "create-listing": "Create Listing",
};

const CATEGORY_ALIASES: Record<string, CategoryId> = {
  textile: "textile",
  fabric: "textile",
  cotton: "textile",
  denim: "textile",
  plastic: "plastic",
  pet: "plastic",
  hdpe: "plastic",
  packaging: "plastic",
  paper: "paper",
  cardboard: "paper",
  carton: "paper",
  metal: "metal",
  aluminium: "metal",
  aluminum: "metal",
  steel: "metal",
  copper: "metal",
  wood: "wood",
  timber: "wood",
  pallet: "wood",
  glass: "glass",
  rubber: "rubber",
  construction: "construction",
  tile: "construction",
  pipe: "construction",
  industrial: "industrial",
  fastener: "industrial",
  component: "industrial",
  electronic: "industrial",
  electronics: "industrial",
};

const BUYER_SUGGESTIONS: Record<CategoryId, BuyerSuggestion[]> = {
  textile: [
    {
      id: "buyer-textile-yarn",
      name: "Recycled yarn producers",
      buyerType: "Textile reprocessor",
      location: "Yangon",
      likelyUse: "Shredding fabric and denim offcuts into fibre blends.",
    },
    {
      id: "buyer-textile-craft",
      name: "Handmade product workshops",
      buyerType: "Craft manufacturer",
      location: "Mandalay",
      likelyUse: "Patchwork bags, stuffing, samples, and small accessories.",
    },
  ],
  plastic: [
    {
      id: "buyer-plastic-reprocessor",
      name: "Plastic reprocessors",
      buyerType: "Recycling plant",
      location: "Yangon",
      likelyUse: "Washing, flaking, pelletizing, and packaging inputs.",
    },
  ],
  paper: [
    {
      id: "buyer-paper-retail",
      name: "E-commerce fulfilment shops",
      buyerType: "Packaging buyer",
      location: "Mandalay",
      likelyUse: "Reusable boxes, sheet trim, layer pads, and void fill.",
    },
  ],
  metal: [
    {
      id: "buyer-metal-foundry",
      name: "Local foundries",
      buyerType: "Metal recovery buyer",
      location: "Bago",
      likelyUse: "Smelting, casting inputs, fabrication stock, and repair parts.",
    },
  ],
  wood: [
    {
      id: "buyer-wood-workshop",
      name: "Small furniture workshops",
      buyerType: "Furniture producer",
      location: "Yangon",
      likelyUse: "Drawer parts, craft blanks, packaging, and repair stock.",
    },
  ],
  glass: [
    {
      id: "buyer-glass-food",
      name: "Food and beverage makers",
      buyerType: "Container buyer",
      location: "Yangon",
      likelyUse: "Bottling, jars, displays, and non-structural fixtures.",
    },
  ],
  rubber: [
    {
      id: "buyer-rubber-gasket",
      name: "Gasket and matting workshops",
      buyerType: "Rubber parts producer",
      location: "Mandalay",
      likelyUse: "Re-cutting smaller parts, mats, padding, and granulate.",
    },
  ],
  construction: [
    {
      id: "buyer-construction-contractors",
      name: "Small contractors",
      buyerType: "Construction buyer",
      location: "Yangon",
      likelyUse: "Renovation work, fit-out projects, repairs, and site stock.",
    },
  ],
  industrial: [
    {
      id: "buyer-industrial-workshops",
      name: "Maintenance workshops",
      buyerType: "Industrial buyer",
      location: "Yangon",
      likelyUse: "Machine repair, assembly, storage, and workshop inventory.",
    },
  ],
  other: [
    {
      id: "buyer-other-recyclers",
      name: "General recyclers",
      buyerType: "Circular materials buyer",
      location: "Yangon",
      likelyUse: "Sorting, reuse, recycling, and material recovery.",
    },
  ],
};

const categoryName = (category: CategoryId) =>
  MARKETPLACE_CATEGORIES.find((item) => item.id === category)?.name ?? "Other";

const categoryOptions = (includeBack = false): EcoMatchOption[] => [
  ...MARKETPLACE_CATEGORIES.filter((category) => category.active).map((category) => ({
    id: `category-${category.id}`,
    label: category.name,
    kind: "category" as const,
    category: category.id,
  })),
  ...(includeBack
    ? [
        {
          id: "back-to-actions",
          label: "Back",
          kind: "back" as const,
        },
      ]
    : []),
];

const locationOptions = (): EcoMatchOption[] => [
  {
    id: "location-anywhere",
    label: "Anywhere",
    kind: "location",
    location: null,
  },
  ...MARKETPLACE_LOCATIONS.map((location) => ({
    id: `location-${location}`,
    label: location,
    kind: "location" as const,
    location,
  })),
  {
    id: "back-to-material",
    label: "Back",
    kind: "back",
  },
];

const createOptions = (): EcoMatchOption[] => [
  {
    id: "create-back",
    label: "Back",
    kind: "back",
  },
  {
    id: "create-dashboard",
    label: "Open listing form",
    kind: "action",
    action: "create-listing",
  },
];

const detectIntent = (message: string): ParsedMessage["intent"] => {
  if (/(estimate|price|worth|value|typical)/.test(message)) return "estimate-price";
  if (/(buyer|who needs|who might need|sell to|demand)/.test(message)) return "find-buyers";
  if (/(create|draft|listing|post)/.test(message)) return "create-listing";
  if (/(find|need|buy|source|supplier|available|under|below|less than|verified)/.test(message)) {
    return "find-materials";
  }
  return "general";
};

const detectCategory = (message: string): CategoryId | null => {
  let best: { category: CategoryId; length: number } | null = null;
  for (const [alias, category] of Object.entries(CATEGORY_ALIASES)) {
    if (message.includes(alias) && (!best || alias.length > best.length)) {
      best = { category, length: alias.length };
    }
  }
  return best?.category ?? null;
};

const detectLocation = (message: string) =>
  MARKETPLACE_LOCATIONS.find((location) => message.includes(location.toLowerCase())) ?? null;

const detectMaxPrice = (message: string) => {
  const match = message
    .replace(/,/g, "")
    .match(/(?:under|below|less than|max(?:imum)?|up to)\s*(\d+(?:\.\d+)?)/);
  if (!match?.[1]) return null;
  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) ? value : null;
};

export const parseEcoMatchMessage = (message: string): ParsedMessage => {
  const normalized = message.toLowerCase().replace(/\s+/g, " ").trim();
  return {
    intent: detectIntent(normalized),
    category: detectCategory(normalized),
    location: /anywhere|all locations/.test(normalized) ? null : detectLocation(normalized),
    maxPricePerUnit: detectMaxPrice(normalized),
  };
};

const sortListings = (listings: Listing[]) =>
  [...listings].sort(
    (a, b) => Number(!!b.featured) - Number(!!a.featured) || b.popularity - a.popularity,
  );

const toMatches = (listings: Listing[], category: CategoryId | null, location: string | null) =>
  sortListings(listings)
    .map((listing) => ({
      listing: toMarketplaceListingView(listing),
      match: Math.min(
        98,
        72 +
          (category && listing.category === category ? 16 : 0) +
          (location && listing.location === location ? 8 : 0) +
          (listing.featured ? 2 : 0),
      ),
    }))
    .slice(0, 6);

const filterByPrice = (listings: Listing[], maxPricePerUnit: number | null) =>
  maxPricePerUnit === null
    ? listings
    : listings.filter((listing) => listing.price !== null && listing.price <= maxPricePerUnit);

const materialQuestion = (action: ChatAction): AiAnswer => ({
  intent: actionLabel(action),
  text:
    action === "estimate-price"
      ? "Choose a material or category to estimate from current SurplusHub listings."
      : "Choose a material or category.",
  options: categoryOptions(true),
  nextFlow: {
    action,
    step: "select-material",
    collected: emptyCollected(),
  },
});

const locationQuestion = (category: CategoryId, maxPricePerUnit: number | null): AiAnswer => ({
  intent: "Find Materials",
  text: `Where should I search for ${categoryName(category)}?`,
  options: locationOptions(),
  nextFlow: {
    action: "find-materials",
    step: "select-location",
    collected: {
      category,
      location: null,
      maxPricePerUnit,
    },
  },
});

const searchListings = (collected: FlowCollected): AiAnswer => {
  const exact = filterByPrice(
    filterMarketplaceListings({
      category: collected.category,
      location: collected.location,
    }),
    collected.maxPricePerUnit,
  );

  const exactMatches = toMatches(exact, collected.category, collected.location);
  const similar =
    exactMatches.length === 0
      ? toMatches(
          filterByPrice(
            getSimilarMarketplaceListings({
              category: collected.category,
              location: collected.location,
            }),
            collected.maxPricePerUnit,
          ),
          collected.category,
          null,
        )
      : [];

  return {
    intent: "Current Marketplace Results",
    text:
      exactMatches.length > 0
        ? `I found ${exactMatches.length} matching current SurplusHub listing${exactMatches.length === 1 ? "" : "s"}.`
        : "I couldn’t find an exact match in the current SurplusHub listings.",
    listings: exactMatches,
    similarListings: similar,
    ...(similar.length > 0
      ? { note: "Similar listings are related current Marketplace items, not exact matches." }
      : {}),
    nextFlow: createInitialFlowState(),
  };
};

const normalizePriceUnit = (unit: string) => {
  const normalized = unit.toLowerCase().trim();
  if (normalized === "kg" || normalized === "kgs") return "kg";
  if (["unit", "units", "piece", "pieces"].includes(normalized)) return "unit";
  if (normalized === "box" || normalized === "boxes") return "box";
  if (normalized === "sheet" || normalized === "sheets") return "sheet";
  if (normalized === "roll" || normalized === "rolls") return "roll";
  if (normalized === "pallet" || normalized === "pallets") return "pallet";
  return normalized;
};

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? null;
  const left = sorted[middle - 1];
  const right = sorted[middle];
  return left === undefined || right === undefined ? null : Math.round((left + right) / 2);
};

const estimateFromListings = (category: CategoryId): AiAnswer => {
  const priced = filterMarketplaceListings({ category })
    .filter((listing) => typeof listing.price === "number" && Number.isFinite(listing.price))
    .filter((listing) => (listing.price ?? 0) > 0);

  const groups = new Map<string, Listing[]>();
  for (const listing of priced) {
    const unit = normalizePriceUnit(listing.priceUnit);
    groups.set(unit, [...(groups.get(unit) ?? []), listing]);
  }

  const compatibleGroups = [...groups.entries()]
    .filter(([, listings]) => listings.length >= 2)
    .sort((a, b) => b[1].length - a[1].length);
  const selected = compatibleGroups[0];

  if (!selected) {
    return {
      intent: "Price Estimate",
      text: "There isn’t enough listing data to estimate this price yet.",
      nextFlow: createInitialFlowState(),
    };
  }

  const [unit, listings] = selected;
  const prices = listings
    .map((listing) => listing.price)
    .filter((price): price is number => typeof price === "number" && Number.isFinite(price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const typical = prices.length >= 3 ? median(prices) : null;
  const categoryLabel = categoryName(category);

  return {
    intent: "Price Estimate",
    text: `Estimated from ${prices.length} current SurplusHub listings: ${min.toLocaleString("en-US")}-${max.toLocaleString("en-US")} MMK/${unit}.${typical !== null ? ` Typical price: ${typical.toLocaleString("en-US")} MMK/${unit}.` : ""}`,
    estimate: {
      categoryName: categoryLabel,
      min,
      max,
      median: typical,
      unit,
      count: prices.length,
    },
    note: "Only compatible listing units are compared. Missing, zero, invalid, and negotiable prices are excluded.",
    nextFlow: createInitialFlowState(),
  };
};

const buyerAnswer = (category: CategoryId): AiAnswer => ({
  intent: "Buyer Suggestions",
  text: `Here are potential buyer types for ${categoryName(category)} based on the current category.`,
  buyerSuggestions: BUYER_SUGGESTIONS[category],
  note: "These are demonstration buyer-type suggestions, not confirmed live buyer requests.",
  nextFlow: createInitialFlowState(),
});

const listingDraftAnswer = (category: CategoryId): AiAnswer => {
  const examples = filterMarketplaceListings({ category });
  const first = examples[0];

  return {
    intent: "Listing Draft",
    text: "Use the current Marketplace examples as a structure, then enter your real quantity, location, and price in the listing form.",
    draft: {
      title: `${categoryName(category)} Surplus`,
      category: categoryName(category),
      description:
        first?.description ??
        "Describe the material condition, quantity, storage, pickup details, and possible reuse.",
      quantity: first ? `${first.quantity.toLocaleString("en-US")} ${first.unit}` : "Add quantity",
      location: first?.location ?? "Add location",
      suggestedPrice: first ? "Use your real asking price" : "Add expected price",
      possibleUses: first?.uses ?? ["Reuse", "Reprocessing", "Manufacturing input"],
    },
    options: createOptions(),
    note: "No listing has been published.",
    nextFlow: createInitialFlowState(),
  };
};

export const startEcoMatchAction = (action: ChatAction): AiAnswer => materialQuestion(action);

export const selectEcoMatchOption = (option: EcoMatchOption, flow: EcoMatchFlowState): AiAnswer => {
  if (option.kind === "back") {
    if (flow.step === "select-location") return materialQuestion(flow.action ?? "find-materials");
    return {
      intent: "Loopi",
      text: "Choose what you want to do next.",
      options: [
        {
          id: "action-find-materials",
          label: actionLabel("find-materials"),
          kind: "action",
          action: "find-materials",
        },
        {
          id: "action-find-buyers",
          label: actionLabel("find-buyers"),
          kind: "action",
          action: "find-buyers",
        },
        {
          id: "action-estimate-price",
          label: actionLabel("estimate-price"),
          kind: "action",
          action: "estimate-price",
        },
        {
          id: "action-create-listing",
          label: actionLabel("create-listing"),
          kind: "action",
          action: "create-listing",
        },
      ],
      nextFlow: createInitialFlowState(),
    };
  }

  const action = flow.action ?? option.action ?? "find-materials";
  if (option.kind === "category" && option.category) {
    if (action === "estimate-price") return estimateFromListings(option.category);
    if (action === "find-buyers") return buyerAnswer(option.category);
    if (action === "create-listing") return listingDraftAnswer(option.category);
    return locationQuestion(option.category, flow.collected.maxPricePerUnit);
  }

  if (option.kind === "location") {
    return searchListings({
      ...flow.collected,
      location: option.location ?? null,
    });
  }

  return materialQuestion(action);
};

export const askEcoMatch = (
  message: string,
  flow: EcoMatchFlowState = createInitialFlowState(),
): AiAnswer => {
  const parsed = parseEcoMatchMessage(message);
  const action = flow.action ?? (parsed.intent === "general" ? "find-materials" : parsed.intent);
  const category = parsed.category ?? flow.collected.category;

  if (!category) return materialQuestion(action);

  if (action === "estimate-price") return estimateFromListings(category);
  if (action === "find-buyers") return buyerAnswer(category);
  if (action === "create-listing") return listingDraftAnswer(category);

  const hasLocationInMessage = parsed.location !== null || /anywhere|all locations/i.test(message);
  if (!hasLocationInMessage && flow.step !== "select-location") {
    return locationQuestion(category, parsed.maxPricePerUnit ?? flow.collected.maxPricePerUnit);
  }

  return searchListings({
    category,
    location: parsed.location,
    maxPricePerUnit: parsed.maxPricePerUnit ?? flow.collected.maxPricePerUnit,
  });
};

export const actionLabel = (action: ChatAction) => ACTION_LABELS[action];
