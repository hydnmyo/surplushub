import {
  BUSINESSES,
  CATEGORIES,
  LISTINGS,
  categoryImage,
  categoryName,
  priceLabel,
  type CategoryId,
  type Listing,
} from "./data";

export interface MarketplaceListingView {
  listing: Listing;
  sellerName: string;
  sellerVerified: boolean;
  categoryName: string;
  image: string;
  priceLabel: string;
  detailUrl: string;
}

export interface MarketplaceListingFilters {
  category?: CategoryId | null;
  location?: string | null;
}

export const MARKETPLACE_LISTINGS = LISTINGS;

export const MARKETPLACE_CATEGORIES = CATEGORIES;

export const MARKETPLACE_LOCATIONS = Array.from(
  new Set(MARKETPLACE_LISTINGS.map((listing) => listing.location)),
).sort();

export const getMarketplaceSeller = (sellerId: string) =>
  BUSINESSES.find((business) => business.id === sellerId);

export const toMarketplaceListingView = (listing: Listing): MarketplaceListingView => {
  const seller = getMarketplaceSeller(listing.sellerId);

  return {
    listing,
    sellerName: seller?.name ?? "SurplusHub seller",
    sellerVerified: seller?.verified ?? false,
    categoryName: categoryName(listing.category),
    image: categoryImage(listing.category),
    priceLabel: priceLabel(listing),
    detailUrl: `/marketplace/${listing.id}`,
  };
};

export const filterMarketplaceListings = ({ category, location }: MarketplaceListingFilters = {}) =>
  MARKETPLACE_LISTINGS.filter((listing) => {
    if (listing.status === "Hidden") return false;
    if (category && listing.category !== category) return false;
    if (location && listing.location !== location) return false;
    return true;
  });

export const getSimilarMarketplaceListings = ({
  category,
  location,
}: MarketplaceListingFilters = {}) =>
  MARKETPLACE_LISTINGS.filter((listing) => {
    if (listing.status === "Hidden") return false;
    if (category && listing.category === category) return true;
    if (location && listing.location === location) return true;
    return false;
  }).slice(0, 4);
