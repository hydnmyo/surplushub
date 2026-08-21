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
import { supabase } from "@/integrations/supabase/client";

export type SignUpBusinessInput = {
  email: string;
  password: string;
  businessName: string;
  industry: string;
  location: string;
  contactPerson: string;
  phone: string;
  description: string;
};

export type SignUpBuyerInput = {
  email: string;
  password: string;
  fullName: string;
};

type AuthResult = { error: string | null };

type AuthContextValue = {
  currentUser: AuthUser | null;
  isReady: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signUpBusiness: (input: SignUpBusinessInput) => Promise<AuthResult>;
  signUpBuyer: (input: SignUpBuyerInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const businessInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/**
 * Resolves a signed-in user's role from real data rather than a stored flag:
 * admin comes from the user_roles table (via the existing has_role() RPC, so
 * a user can never self-elevate), business comes from owning a businesses
 * row, and everyone else is a buyer. Role can never be forged client-side.
 */
async function loadAuthUser(userId: string): Promise<AuthUser> {
  const [profileResult, businessResult, adminResult] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    supabase.from("businesses").select("id, name").eq("user_id", userId).maybeSingle(),
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
  ]);

  const name = profileResult.data?.full_name ?? "SurplusHub user";

  if (adminResult.data === true) {
    return { id: userId, name, role: "admin" };
  }

  if (businessResult.data) {
    return {
      id: userId,
      name,
      role: "business",
      businessId: businessResult.data.id,
      businessName: businessResult.data.name,
    };
  }

  return { id: userId, name, role: "buyer" };
}

const describeAuthError = (message: string) => {
  if (message.includes("Invalid login credentials")) return "Incorrect email or password.";
  if (message.includes("User already registered"))
    return "An account with this email already exists.";
  if (message.includes("Password should be at least"))
    return "Password must be at least 6 characters.";
  return message;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applySession = async (userId: string | null) => {
      if (!userId) {
        if (!cancelled) setCurrentUser(null);
        return;
      }
      const user = await loadAuthUser(userId);
      if (!cancelled) setCurrentUser(user);
    };

    supabase.auth.getSession().then(({ data }) => {
      void applySession(data.session?.user.id ?? null).finally(() => {
        if (!cancelled) setIsReady(true);
      });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? describeAuthError(error.message) : null };
  }, []);

  const signUpBusiness = useCallback(async (input: SignUpBusinessInput) => {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { full_name: input.contactPerson } },
    });
    if (error || !data.user) {
      return { error: describeAuthError(error?.message ?? "Sign up failed.") };
    }

    const { error: businessError } = await supabase.from("businesses").insert({
      user_id: data.user.id,
      name: input.businessName,
      initials: businessInitials(input.businessName) || "SH",
      industry: input.industry,
      location: input.location,
      description: input.description,
      hours: "Mon–Sat, 9:00 – 18:00",
      since: new Date().getFullYear(),
      contact: { person: input.contactPerson, phone: input.phone, email: input.email, address: "" },
    });
    if (businessError) {
      return { error: businessError.message };
    }

    const user = await loadAuthUser(data.user.id);
    setCurrentUser(user);
    return { error: null };
  }, []);

  const signUpBuyer = useCallback(async (input: SignUpBuyerInput) => {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { full_name: input.fullName } },
    });
    if (error || !data.user) {
      return { error: describeAuthError(error?.message ?? "Sign up failed.") };
    }

    const user = await loadAuthUser(data.user.id);
    setCurrentUser(user);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({ currentUser, isReady, signInWithPassword, signUpBusiness, signUpBuyer, signOut }),
    [currentUser, isReady, signInWithPassword, signUpBusiness, signUpBuyer, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
