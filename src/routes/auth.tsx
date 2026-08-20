import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { accountForEmail, CURRENT_USER } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: search["redirect"] === "/messenger" ? "/messenger" : undefined,
    tab: search["tab"] === "register" ? "register" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In & Registration | SurplusHub" },
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
  const { redirect, tab } = Route.useSearch();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");

  const signInWithEmail = () => {
    const user = accountForEmail(email);
    signIn(user);
    toast.success(`Signed in as ${user.name} (demo)`);

    if (redirect === "/messenger") {
      void navigate({ to: "/messenger", replace: true });
    } else if (user.role === "admin") {
      void navigate({ to: "/admin", replace: true });
    } else if (user.role === "business") {
      void navigate({ to: "/dashboard", replace: true });
    } else {
      void navigate({ to: "/marketplace", replace: true });
    }
  };

  const registerBusiness = () => {
    signIn(CURRENT_USER);
    toast.success("Business registered — verification pending");
    void navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="flex justify-center">
        <Logo />
      </div>
      <Tabs defaultValue={tab ?? "signin"} className="mt-8">
        <TabsList className="w-full">
          <TabsTrigger value="signin" className="flex-1">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="register" className="flex-1">
            Register Business
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="surface-card mt-5 space-y-3 p-6">
          <div>
            <Label>Email</Label>
            <Input
              className="mt-1.5"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <F label="Password" placeholder="••••••••" type="password" />
          <Button className="w-full" onClick={signInWithEmail}>
            Sign In
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo prototype — any password works. Sign in with an email containing "admin" for the
            admin console, or "buyer" for a buyer account — anything else signs in as a demo
            business.
          </p>
        </TabsContent>

        <TabsContent value="register" className="surface-card mt-5 space-y-3 p-6">
          <F label="Business name" placeholder="Yangon Circular Plastics" />
          <F label="Industry" placeholder="Plastic recycling" />
          <F label="Location" placeholder="Hlaing Tharyar, Yangon" />
          <F label="Contact person" placeholder="U Aung Myint" />
          <F label="Business email" placeholder="ops@company.com" type="email" />
          <F label="Phone" placeholder="+95 9 xxx xxx xxx" />
          <F label="Password" placeholder="••••••••" type="password" />
          <F label="Business registration document" type="file" />
          <Button className="w-full" onClick={registerBusiness}>
            Create Business Account
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function F({ label, placeholder, type }: { label: string; placeholder?: string; type?: string }) {
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
