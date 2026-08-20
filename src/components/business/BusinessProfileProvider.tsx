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

export function BusinessProfileProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>(BUSINESSES);

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

      const next = businesses.map((business) => (business.id === id ? updated : business));
      const overrides = Object.fromEntries(
        next.filter((business) => business.userId).map((business) => [business.id, business]),
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
