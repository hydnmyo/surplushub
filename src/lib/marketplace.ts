import { supabase } from "@/lib/supabase";
import type {
  CategoryId,
  Inserts,
  ListingStatus,
  MaterialType,
  Tables,
} from "@/types/database.types";

export type ListingFilters = {
  category?: CategoryId;
  materialType?: MaterialType;
  location?: string;
  search?: string;
};

export type Business = Tables<"businesses">;
export type Listing = Tables<"listings">;
export type WantedPost = Tables<"wanted_posts">;
export type CreateListingInput = Inserts<"listings">;
export type CreateWantedPostInput = Inserts<"wanted_posts">;

function assertSupabaseSuccess<T>(data: T, error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function requireActiveSession(action: string) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session) {
    throw new Error(`You must be signed in to ${action}.`);
  }
}

export async function getListings(filters: ListingFilters = {}) {
  let query = supabase
    .from("listings")
    .select("*, businesses(*)")
    .eq("status", "Active")
    .order("featured", { ascending: false })
    .order("popularity", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.materialType) {
    query = query.eq("material_type", filters.materialType);
  }

  if (filters.location) {
    query = query.eq("location", filters.location);
  }

  const search = filters.search?.trim();
  if (search) {
    const escapedSearch = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `title.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%,composition.ilike.%${escapedSearch}%`,
    );
  }

  const { data, error } = await query;
  return assertSupabaseSuccess(data, error);
}

export async function getListingById(id: string) {
  const { error: viewError } = await supabase.rpc("increment_listing_views", {
    listing_id: id,
  });

  if (viewError) {
    throw new Error(viewError.message);
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*, businesses(*)")
    .eq("id", id)
    .single();

  return assertSupabaseSuccess(data, error);
}

export async function createListing(listingData: CreateListingInput) {
  await requireActiveSession("create a listing");

  const { data, error } = await supabase.from("listings").insert(listingData).select().single();

  return assertSupabaseSuccess(data, error);
}

export async function updateListingStatus(id: string, status: ListingStatus) {
  const { data, error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  return assertSupabaseSuccess(data, error);
}

export async function getBusinesses() {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("verified", true)
    .order("rating", { ascending: false })
    .order("name", { ascending: true });

  return assertSupabaseSuccess(data, error);
}

export async function getBusinessById(id: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*, listings(*)")
    .eq("id", id)
    .single();

  return assertSupabaseSuccess(data, error);
}

export async function getWantedPosts() {
  const { data, error } = await supabase
    .from("wanted_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return assertSupabaseSuccess(data, error);
}

export async function createWantedPost(postData: CreateWantedPostInput) {
  await requireActiveSession("create a wanted post");

  const { data, error } = await supabase.from("wanted_posts").insert(postData).select().single();

  return assertSupabaseSuccess(data, error);
}
