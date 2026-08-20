import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { CATEGORIES, type CategoryId } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { AuthUser } from "@/lib/auth";
import type { Tables } from "@/types/database.types";

type BusinessRow = Tables<"businesses">;

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
  const [category, setCategory] = useState<CategoryId>("plastic");
  const [location, setLocation] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (signInError) throw signInError;
      if (!authData.user) throw new Error("Supabase did not return an authenticated user.");

      const business = await fetchBusinessProfile(authData.user.id);
      signIn(businessToAuthUser(business, authData.user.email));
      toast.success("Signed in successfully");
      void navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      console.error("Supabase sign-in failed.", error);
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Supabase did not return a user after sign-up.");

      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({
          user_id: authData.user.id,
          name: companyName,
          initials: initialsFor(companyName),
          industry,
          location,
          categories: [category],
          description: "",
          contact: {
            contact_person: contactPerson,
            email,
            phone,
          },
          hours: "",
          website: null,
          social_links: {},
          since: new Date().getFullYear(),
          verified: false,
        })
        .select("*")
        .single();

      if (businessError) throw businessError;

      signIn(businessToAuthUser(business, authData.user.email));
      toast.success("Business registered. Verification is pending.");
      void navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      console.error("Supabase registration failed.", error);
      toast.error(error instanceof Error ? error.message : "Unable to create account");
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
            <div>
              <Label>Primary material category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as CategoryId)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

async function fetchBusinessProfile(userId: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No business profile is linked to this account.");

  return data;
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

function contactName(contact: BusinessRow["contact"]) {
  if (!contact || typeof contact !== "object" || Array.isArray(contact)) return null;

  const value = contact["contact_person"];
  return typeof value === "string" && value.trim() ? value : null;
}

function initialsFor(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "SH";
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
