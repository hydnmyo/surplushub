import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { CURRENT_USER } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const MOCK_REGISTRATION_KEY = "surplushub.mock-business-registration.v1";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Business Sign In & Registration | SurplusHub" },
      {
        name: "description",
        content:
          "Sign in or register your business to list surplus materials, request purchases and manage transactions on SurplusHub.",
      },
      { property: "og:title", content: "Sign in to SurplusHub" },
      {
        property: "og:description",
        content: "Business accounts for buyers and sellers of surplus industrial materials.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const createMockUser = () => ({
    ...CURRENT_USER,
    name: contactPerson || signInEmail || email || CURRENT_USER.name,
    businessName: companyName || CURRENT_USER.businessName,
  });

  const persistMockRegistration = () => {
    const mockBusiness = {
      companyName: companyName || CURRENT_USER.businessName,
      industry,
      location,
      contactPerson: contactPerson || CURRENT_USER.name,
      email: email || signInEmail,
      phone,
      createdAt: new Date().toISOString(),
      mode: "local-dev-fallback",
    };

    window.localStorage.setItem(MOCK_REGISTRATION_KEY, JSON.stringify(mockBusiness));
  };

  const finishWithMockSession = (message: string) => {
    persistMockRegistration();
    signIn(createMockUser());
    toast.success(message);
    void navigate({ to: "/dashboard", replace: true });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) throw error;

      signIn(CURRENT_USER);
      toast.success("Signed in successfully");
      void navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      if (isNetworkOrCorsError(error)) {
        console.error("Supabase sign-in failed; using local mock session fallback.", error);
        finishWithMockSession("Signed in locally. Supabase is unreachable in this environment.");
      } else {
        toast.error(error instanceof Error ? error.message : "Unable to sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
            industry,
            location,
            contact_person: contactPerson,
            phone,
            is_verified: false,
          },
        },
      });

      if (error) throw error;

      signIn({
        ...CURRENT_USER,
        name: contactPerson || CURRENT_USER.name,
        businessName: companyName || CURRENT_USER.businessName,
      });
      toast.success("Business registered. Verification is pending.");
      void navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      if (isNetworkOrCorsError(error)) {
        console.error("Supabase registration failed; storing mock business locally.", error);
        finishWithMockSession("Business registered locally. Supabase is unreachable right now.");
      } else {
        toast.error(error instanceof Error ? error.message : "Unable to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="flex justify-center">
        <Logo />
      </div>
      <Tabs defaultValue="signin" className="mt-8">
        <TabsList className="w-full">
          <TabsTrigger value="signin" className="flex-1">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="register" className="flex-1">
            Register Business
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="surface-card mt-5 space-y-3 p-6">
            <F
              label="Business email"
              placeholder="you@company.com"
              type="email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
            />
            <F
              label="Password"
              placeholder="••••••••"
              type="password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister} className="surface-card mt-5 space-y-3 p-6">
            <F
              label="Business name"
              placeholder="Yangon Circular Plastics"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <F
              label="Industry"
              placeholder="Plastic recycling"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <F
              label="Location"
              placeholder="Hlaing Tharyar, Yangon"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <F
              label="Contact person"
              placeholder="U Aung Myint"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
            <F
              label="Business email"
              placeholder="ops@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <F
              label="Phone"
              placeholder="+95 9 xxx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <F
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <F label="Business registration document" type="file" required={false} />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Business Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function isNetworkOrCorsError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /network|cors|failed to fetch|load failed|fetch/i.test(message);
}

function F({
  label,
  placeholder,
  type,
  value,
  onChange,
  required = true,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <Label>{label}</Label>
      <div className={isPassword ? "relative mt-1.5" : "mt-1.5"}>
        <Input
          className={isPassword ? "pr-10" : undefined}
          placeholder={placeholder ?? ""}
          type={isPassword && showPassword ? "text" : (type ?? "text")}
          value={value}
          onChange={onChange}
          required={required}
        />
        {isPassword ? (
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}
