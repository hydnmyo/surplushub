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

const SESSION_KEY = "surplushub.auth-session.v1";

type AuthContextValue = {
  currentUser: AuthUser | null;
  isReady: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SESSION_KEY);
      if (stored) setCurrentUser(JSON.parse(stored) as AuthUser);
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const signIn = useCallback((user: AuthUser) => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setCurrentUser(user);
    setIsReady(true);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({ currentUser, isReady, signIn, signOut }),
    [currentUser, isReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
