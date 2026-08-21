import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BUSINESSES, type Business } from "@/lib/data";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "surplushub.business-profile-overrides.v1";

type BusinessProfileContextValue = {
  businesses: Business[];
  getBusiness: (id: string) => Business | undefined;
  updateBusiness: (id: string, changes: Partial<Business>) => Promise<Business>;
};

const BusinessProfileContext = createContext<BusinessProfileContextValue | null>(null);

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const DEFAULT_CONTACT: Business["contact"] = { person: "", phone: "", email: "", address: "" };

function businessFromRow(row: {
  id: string;
  user_id: string;
  name: string;
  initials: string;
  industry: string;
  location: string;
  verified: boolean;
  rating: number;
  transactions: number;
  since: number;
  categories: Business["categories"];
  description: string;
  contact: unknown;
  hours: string;
  website: string | null;
}): Business {
  const contact =
    row.contact && typeof row.contact === "object" && !Array.isArray(row.contact)
      ? { ...DEFAULT_CONTACT, ...(row.contact as Partial<Business["contact"]>) }
      : DEFAULT_CONTACT;

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    initials: row.initials,
    industry: row.industry,
    location: row.location,
    verified: row.verified,
    rating: row.rating,
    transactions: row.transactions,
    since: row.since,
    categories: row.categories,
    description: row.description,
    contact,
    hours: row.hours,
    website: row.website ?? "",
  };
}

export function BusinessProfileProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>(BUSINESSES);
  const { currentUser } = useAuth();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const overrides = JSON.parse(stored) as Record<string, Partial<Business>>;
      setBusinesses((current) =>
        current.map((business) => ({ ...business, ...overrides[business.id] })),
      );
    } catch {
      // Ignore malformed or unavailable browser storage and keep the seed profile.
    }
  }, []);

  // Real businesses created via Supabase sign-up aren't in the local seed list.
  // Fetch and merge the current user's own business the first time it's needed
  // (dashboard, edit profile, the public business page) rather than eagerly
  // loading every real business up front.
  useEffect(() => {
    if (currentUser?.role !== "business" || !currentUser.businessId) return;
    const businessId = currentUser.businessId;
    if (businesses.some((business) => business.id === businessId)) return;

    let cancelled = false;
    supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setBusinesses((current) =>
          current.some((business) => business.id === businessId)
            ? current
            : [...current, businessFromRow(data)],
        );
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser, businesses]);

  const updateBusiness = useCallback(
    async (id: string, changes: Partial<Business>) => {
      const current = businesses.find((business) => business.id === id);
      if (!current) throw new Error("Business profile not found");

      const updated: Business = {
        ...current,
        ...changes,
        initials: changes.name ? getInitials(changes.name) : current.initials,
        contact: { ...current.contact, ...changes.contact },
        socialLinks: {
          facebook: "",
          linkedin: "",
          instagram: "",
          ...current.socialLinks,
          ...changes.socialLinks,
        },
      };

      // Real businesses (created via Supabase sign-up, identified by a uuid
      // userId) persist to the businesses table; seed/demo profiles keep
      // using the localStorage override, same as before.
      if (current.userId && current.userId.includes("-")) {
        const { error } = await supabase
          .from("businesses")
          .update({
            name: updated.name,
            initials: updated.initials,
            industry: updated.industry,
            location: updated.location,
            description: updated.description,
            contact: updated.contact,
            hours: updated.hours,
            website: updated.website || null,
          })
          .eq("id", id);
        if (error) throw error;
      }

      const next = businesses.map((business) => (business.id === id ? updated : business));
      const overrides = Object.fromEntries(
        next
          .filter((business) => business.userId && !business.userId.includes("-"))
          .map((business) => [business.id, business]),
      );

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
      setBusinesses(next);
      return updated;
    },
    [businesses],
  );

  const value = useMemo<BusinessProfileContextValue>(
    () => ({
      businesses,
      getBusiness: (id) => businesses.find((business) => business.id === id),
      updateBusiness,
    }),
    [businesses, updateBusiness],
  );

  return (
    <BusinessProfileContext.Provider value={value}>{children}</BusinessProfileContext.Provider>
  );
}

export function useBusinessProfiles() {
  const context = useContext(BusinessProfileContext);
  if (!context) throw new Error("useBusinessProfiles must be used inside BusinessProfileProvider");
  return context;
}

export function useBusinessProfile(id: string) {
  return useBusinessProfiles().getBusiness(id);
}
