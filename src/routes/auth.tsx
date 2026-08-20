import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { CURRENT_USER, type AuthUser } from "@/lib/auth";

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
  const { signIn } = useAuth();
  const go = (user: AuthUser, msg: string) => () => {
    signIn(user);
    toast.success(msg);
    if (user.role === "business") {
      void navigate({ to: "/dashboard", replace: true });
      return;
    }
    void navigate({ to: "/marketplace", replace: true });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="flex justify-center"><Logo /></div>
      <Tabs defaultValue="signin" className="mt-8">
        <TabsList className="w-full">
          <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
          <TabsTrigger value="register" className="flex-1">Register Business</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="surface-card mt-5 space-y-3 p-6">
          <F label="Business email" placeholder="you@company.com" type="email" />
          <F label="Password" placeholder="••••••••" type="password" />
          <Button className="w-full" onClick={go(CURRENT_USER, "Signed in as Green Stitch Textile (demo)")}>Sign In</Button>
          <p className="text-center text-xs text-muted-foreground">Demo prototype — any credentials work.</p>
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
          <Button className="w-full" onClick={go(CURRENT_USER, "Business registered — verification pending")}>Create Business Account</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function F({ label, placeholder, type }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1.5" placeholder={placeholder ?? ""} type={type ?? "text"} />
    </div>
  );
}
