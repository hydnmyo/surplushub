import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Business Sign In & Registration | SurplusHub" },
      { name: "description", content: "Sign in or register your business to list surplus materials, request purchases and manage transactions on SurplusHub." },
      { property: "og:title", content: "Sign in to SurplusHub" },
      { property: "og:description", content: "Business accounts for buyers and sellers of surplus industrial materials." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Registration State
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in successfully!");
      void navigate({ to: "/dashboard" });
    }

    setLoading(false);
  };

  // Handle Business Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          location,
          phone,
          is_verified: false,
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Business account registered! Please check your email for verification.");
      void navigate({ to: "/dashboard" });
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="flex justify-center"><Logo /></div>
      <Tabs defaultValue="signin" className="mt-8">
        <TabsList className="w-full">
          <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
          <TabsTrigger value="register" className="flex-1">Register Business</TabsTrigger>
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
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
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
              label="Location" 
              placeholder="Hlaing Tharyar, Yangon" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
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
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Business Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function F({ 
  label, 
  placeholder, 
  type, 
  value, 
  onChange 
}: { 
  label: string; 
  placeholder?: string; 
  type?: string; 
  value?: string; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input 
        className="mt-1.5" 
        placeholder={placeholder ?? ""} 
        type={type ?? "text"} 
        value={value} 
        onChange={onChange} 
        required 
      />
    </div>
  );
}