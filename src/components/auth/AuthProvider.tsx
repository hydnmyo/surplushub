import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";

const SESSION_KEY = "surplushub.auth-session.v1";
type BusinessRow = Tables<"businesses">;

type AuthContextValue = {
  currentUser: AuthUser | null;
  isReady: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const setStoredUser = useCallback((user: AuthUser | null) => {
    if (user) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }

    setCurrentUser(user);
  }, []);

  const loadBusinessProfile = useCallback(
    async (userId: string, email?: string | null) => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      const authUser = data ? businessToAuthUser(data, email) : userToAuthUser(userId, email);
      setStoredUser(authUser);
      return authUser;
    },
    [setStoredUser],
  );

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async () => {
      try {
        const stored = window.localStorage.getItem(SESSION_KEY);
        if (stored) setCurrentUser(JSON.parse(stored) as AuthUser);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!mounted) return;

        if (session?.user) {
          await loadBusinessProfile(session.user.id, session.user.email);
        } else {
          setStoredUser(null);
        }
      } catch (error) {
        console.error("Unable to restore Supabase session.", error);
        if (mounted) setStoredUser(null);
      } finally {
        if (mounted) setIsReady(true);
      }
    };

    void hydrateSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        try {
          if (session?.user) {
            await loadBusinessProfile(session.user.id, session.user.email);
          } else {
            setStoredUser(null);
          }
        } catch (error) {
          console.error("Unable to load business profile for auth state change.", error);
          setStoredUser(null);
        } finally {
          if (mounted) setIsReady(true);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadBusinessProfile, setStoredUser]);

  const signIn = useCallback(
    (user: AuthUser) => {
      setStoredUser(user);
      setIsReady(true);
    },
    [setStoredUser],
  );

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Unable to sign out of Supabase.", error);
    } finally {
      setStoredUser(null);
    }
  }, [setStoredUser]);

  const value = useMemo(
    () => ({ currentUser, isReady, signIn, signOut }),
    [currentUser, isReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function businessToAuthUser(business: BusinessRow, email?: string | null): AuthUser {
  return {
    id: business.user_id,
    businessId: business.id,
    businessName: business.name,
    name: contactName(business.contact) ?? business.name ?? email ?? "Business user",
    role: "business",
  };
}

function userToAuthUser(userId: string, email?: string | null): AuthUser {
  return {
    id: userId,
    name: email ?? "Signed-in user",
    role: "buyer",
  };
}

function contactName(contact: BusinessRow["contact"]) {
  if (!contact || typeof contact !== "object" || Array.isArray(contact)) return null;

  const value = contact["contact_person"];
  return typeof value === "string" && value.trim() ? value : null;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
