import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/components/auth/AuthProvider";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: search["redirect"] === "/messenger" ? "/messenger" : undefined,
    tab:
      search["tab"] === "register" ? "register" : search["tab"] === "buyer" ? "buyer" : undefined,
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
  const { signInWithPassword, signUpBusiness, signUpBuyer } = useAuth();
  const [busy, setBusy] = useState(false);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [bizEmail, setBizEmail] = useState("");
  const [bizPassword, setBizPassword] = useState("");
  const [bizName, setBizName] = useState("");
  const [bizIndustry, setBizIndustry] = useState("");
  const [bizLocation, setBizLocation] = useState("");
  const [bizContactPerson, setBizContactPerson] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizDescription, setBizDescription] = useState("");

  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPassword, setBuyerPassword] = useState("");
  const [buyerName, setBuyerName] = useState("");

  const routeAfterAuth = (role: "business" | "buyer" | "admin") => {
    if (redirect === "/messenger") {
      void navigate({ to: "/messenger", replace: true });
    } else if (role === "admin") {
      void navigate({ to: "/admin", replace: true });
    } else if (role === "business") {
      void navigate({ to: "/dashboard", replace: true });
    } else {
      void navigate({ to: "/marketplace", replace: true });
    }
  };

  const handleSignIn = async () => {
    if (!signInEmail || !signInPassword) {
      toast.error("Enter your email and password.");
      return;
    }
    setBusy(true);
    const { error } = await signInWithPassword(signInEmail, signInPassword);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Signed in");
    if (redirect === "/messenger") {
      void navigate({ to: "/messenger", replace: true });
    } else {
      void navigate({ to: "/marketplace", replace: true });
    }
  };

  const handleBusinessSignUp = async () => {
    if (
      !bizEmail ||
      !bizPassword ||
      !bizName ||
      !bizIndustry ||
      !bizLocation ||
      !bizContactPerson
    ) {
      toast.error("Fill in the required business details first.");
      return;
    }
    setBusy(true);
    const { error } = await signUpBusiness({
      email: bizEmail,
      password: bizPassword,
      businessName: bizName,
      industry: bizIndustry,
      location: bizLocation,
      contactPerson: bizContactPerson,
      phone: bizPhone,
      description: bizDescription || `${bizName} lists surplus materials on SurplusHub.`,
    });
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Business account created");
    routeAfterAuth("business");
  };

  const handleBuyerSignUp = async () => {
    if (!buyerEmail || !buyerPassword || !buyerName) {
      toast.error("Fill in your name, email and password first.");
      return;
    }
    setBusy(true);
    const { error } = await signUpBuyer({
      email: buyerEmail,
      password: buyerPassword,
      fullName: buyerName,
    });
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Account created");
    routeAfterAuth("buyer");
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
          <TabsTrigger value="buyer" className="flex-1">
            Buyer Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="surface-card mt-5 space-y-3 p-6">
          <PasswordField
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={signInEmail}
            onChange={setSignInEmail}
          />
          <PasswordField
            label="Password"
            type="password"
            value={signInPassword}
            onChange={setSignInPassword}
          />
          <Button className="w-full" onClick={handleSignIn} disabled={busy}>
            Sign In
          </Button>
        </TabsContent>

        <TabsContent value="register" className="surface-card mt-5 space-y-3 p-6">
          <PasswordField
            label="Business name"
            placeholder="Yangon Circular Plastics"
            value={bizName}
            onChange={setBizName}
          />
          <PasswordField
            label="Industry"
            placeholder="Plastic recycling"
            value={bizIndustry}
            onChange={setBizIndustry}
          />
          <PasswordField
            label="Location"
            placeholder="Hlaing Tharyar, Yangon"
            value={bizLocation}
            onChange={setBizLocation}
          />
          <PasswordField
            label="Contact person"
            placeholder="U Aung Myint"
            value={bizContactPerson}
            onChange={setBizContactPerson}
          />
          <PasswordField
            label="Business email"
            type="email"
            placeholder="ops@company.com"
            value={bizEmail}
            onChange={setBizEmail}
          />
          <PasswordField
            label="Phone"
            placeholder="+95 9 xxx xxx xxx"
            value={bizPhone}
            onChange={setBizPhone}
          />
          <div>
            <Label>Business description</Label>
            <Textarea
              className="mt-1.5"
              value={bizDescription}
              onChange={(event) => setBizDescription(event.target.value)}
              placeholder="What you produce and the surplus materials you typically list."
              rows={3}
            />
          </div>
          <PasswordField
            label="Password"
            type="password"
            value={bizPassword}
            onChange={setBizPassword}
          />
          <Button className="w-full" onClick={handleBusinessSignUp} disabled={busy}>
            Create Business Account
          </Button>
        </TabsContent>

        <TabsContent value="buyer" className="surface-card mt-5 space-y-3 p-6">
          <PasswordField
            label="Your name"
            placeholder="U Zaw Min Htet"
            value={buyerName}
            onChange={setBuyerName}
          />
          <PasswordField
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={buyerEmail}
            onChange={setBuyerEmail}
          />
          <PasswordField
            label="Password"
            type="password"
            value={buyerPassword}
            onChange={setBuyerPassword}
          />
          <Button className="w-full" onClick={handleBuyerSignUp} disabled={busy}>
            Create Buyer Account
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            For businesses buying materials without selling their own — register as a business
            instead if you also want to list surplus.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PasswordField({
  label,
  placeholder,
  type,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
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
          onChange={(event) => onChange(event.target.value)}
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
