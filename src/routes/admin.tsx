import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BUSINESSES, LISTINGS, PLATFORM_STATS, TRANSACTIONS } from "@/lib/data";
import { PayoutQueue } from "@/components/admin/PayoutQueue";
import { DisputeConsole } from "@/components/admin/DisputeConsole";
import { RevenueSummary } from "@/components/admin/RevenueSummary";
import { useAuth } from "@/components/auth/AuthProvider";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Verification & Moderation | SurplusHub" },
      {
        name: "description",
        content:
          "Platform console for business verification, listing moderation, transaction oversight and category management.",
      },
      { property: "og:title", content: "SurplusHub Admin Console" },
      {
        property: "og:description",
        content: "Verification, moderation and marketplace oversight tools.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  const { currentUser, isReady } = useAuth();

  useEffect(() => {
    if (!isReady || currentUser?.role === "admin") return;
    void navigate({ to: currentUser ? "/marketplace" : "/auth", replace: true });
  }, [currentUser, isReady, navigate]);

  if (!isReady || currentUser?.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Admin Console</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Platform oversight for verification, moderation and marketplace health.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Businesses", `${PLATFORM_STATS.businesses}`],
          ["Active listings", `${PLATFORM_STATS.activeListings}`],
          ["Transactions", `${PLATFORM_STATS.completedTransactions}`],
          ["Pending verifications", "4"],
        ].map(([k, v]) => (
          <div key={k} className="surface-card p-5">
            <p className="font-display text-2xl font-semibold text-primary">{v}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="verification" className="mt-8">
        <TabsList>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="mt-6 space-y-3">
          {BUSINESSES.slice(0, 4).map((b) => (
            <div key={b.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{b.name}</p>
                <p className="text-xs text-muted-foreground">
                  {b.industry} · {b.location} · registration doc submitted
                </p>
              </div>
              <Badge variant={b.verified ? "verified" : "warning"}>
                {b.verified ? "Verified" : "Pending"}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => toast.success(`${b.name} approved`)}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast("Verification rejected")}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="listings" className="mt-6 space-y-3">
          {LISTINGS.slice(0, 6).map((l) => (
            <div key={l.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{l.title}</p>
                <p className="text-xs text-muted-foreground">
                  {BUSINESSES.find((b) => b.id === l.sellerId)?.name ?? l.sellerId} · {l.location}
                </p>
              </div>
              <Badge variant="soft">{l.status}</Badge>
              <Button size="sm" variant="outline" onClick={() => toast("Listing removed")}>
                Remove
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="transactions" className="mt-6 space-y-3">
          {TRANSACTIONS.map((t) => (
            <div key={t.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.material}</p>
                <p className="text-xs text-muted-foreground">
                  {t.id} · {t.buyer} ↔ {t.seller}
                </p>
              </div>
              <span className="text-sm font-semibold">{t.value.toLocaleString()} MMK</span>
              <Badge variant={t.status === "Completed" ? "verified" : "soft"}>{t.status}</Badge>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="disputes" className="mt-6">
          <DisputeConsole />
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <PayoutQueue />
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <RevenueSummary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
