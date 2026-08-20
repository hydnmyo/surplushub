import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, Eye, MessageSquareText, Pencil, PlusCircle, TrendingUp, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePurchaseRequests } from "@/components/requests/PurchaseRequestProvider";
import { EditBusinessProfileModal } from "@/components/business/EditBusinessProfileModal";
import { useBusinessProfile } from "@/components/business/BusinessProfileProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  CATEGORIES,
  LISTINGS,
  TRANSACTIONS,
  categoryImage,
  categoryName,
  formatMMK,
  priceLabel,
} from "@/lib/data";
import { CURRENT_USER } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Business Dashboard — Listings, Deals & Analytics | SurplusHub" },
      { name: "description", content: "Manage surplus listings, incoming purchase requests, transactions and marketplace analytics for your business." },
      { property: "og:title", content: "SurplusHub Business Dashboard" },
      { property: "og:description", content: "Track inventory, deals and circular performance in one place." },
    ],
  }),
  component: Dashboard,
});

type DashboardTab = "listings" | "requests" | "transactions" | "analytics";

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, isReady } = useAuth();
  const { requests, updateRequestStatus } = usePurchaseRequests();
  const businessId = currentUser?.role === "business" && currentUser.businessId
    ? currentUser.businessId
    : CURRENT_USER.businessId;
  const business = useBusinessProfile(businessId);
  const myListings = LISTINGS.filter((listing) => listing.sellerId === businessId);
  const businessTransactions = TRANSACTIONS.filter((transaction) => transaction.sellerId === businessId);
  const businessRequests = requests.filter((request) => request.sellerBusinessId === businessId);
  const pendingRequests = businessRequests.filter((request) => request.status === "Pending" || request.status === "Countered");
  const completedDeals = businessTransactions.filter((transaction) => transaction.status === "Completed");
  const recoveredRevenue = completedDeals.reduce((total, transaction) => total + transaction.value, 0);
  const [activeTab, setActiveTab] = useState<DashboardTab>("listings");
  const totalViews = myListings.reduce((total, listing) => total + listing.views, 0);
  const totalInquiries = myListings.reduce((total, listing) => total + listing.inquiries, 0);
  const inquiryRate = totalViews ? ((totalInquiries / totalViews) * 100).toFixed(1) : "0.0";
  const maxListingViews = Math.max(1, ...myListings.map((listing) => listing.views));
  const revenueByCategory = completedDeals.reduce<Record<string, number>>((totals, transaction) => {
    totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.value;
    return totals;
  }, {});
  const categoryPerformance = Object.entries(revenueByCategory)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
  const maxCategoryRevenue = Math.max(1, ...categoryPerformance.map((item) => item.value));

  useEffect(() => {
    if (window.location.hash === "#analytics") setActiveTab("analytics");
  }, []);

  useEffect(() => {
    if (!isReady || currentUser?.role === "business") return;
    void navigate({ to: currentUser ? "/marketplace" : "/auth", replace: true });
  }, [currentUser, isReady, navigate]);

  const selectTab = (value: string) => {
    const tab = value as DashboardTab;
    setActiveTab(tab);
    const hash = tab === "analytics" ? "#analytics" : "";
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
  };

  if (!isReady || currentUser?.role !== "business" || !business) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{business.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Business dashboard · Verified supplier · {business.location}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="lg" variant="outline" asChild>
            <Link to="/businesses/$id" params={{ id: business.id }}>
              <UserRound className="size-4" /> View Profile
            </Link>
          </Button>
          <Button size="lg" variant="outline" onClick={() => selectTab("analytics")}>
            <BarChart3 className="size-4" /> View Analytics
          </Button>
          <EditBusinessProfileModal
            businessId={business.id}
            trigger={
              <Button size="lg" variant="outline">
                <Pencil className="size-4" /> Edit Profile
              </Button>
            }
          />
          <PostListing />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Active listings", String(myListings.filter((listing) => listing.status === "Active").length)],
          ["Pending requests", String(pendingRequests.length)],
          ["Completed deals", String(completedDeals.length)],
          ["Revenue recovered", formatMMK(recoveredRevenue)],
        ].map(([k, v]) => (
          <div key={k} className="surface-card p-5">
            <p className="font-display text-2xl font-semibold text-primary">{v}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={selectTab} className="mt-8">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6 space-y-3">
          {myListings.map((l) => (
            <div key={l.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <img src={categoryImage(l.category)} alt={l.title} width={96} height={72} loading="lazy" className="h-16 w-24 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{l.title}</p>
                <p className="text-xs text-muted-foreground">{l.quantity.toLocaleString("en-US")} {l.unit} · {priceLabel(l)} · {l.views} views</p>
              </div>
              <Badge variant="soft">{l.status}</Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild><Link to="/marketplace/$id" params={{ id: l.id }}>View</Link></Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Listing marked as sold")}>Mark Sold</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="requests" className="mt-6 space-y-3">
          {businessRequests.length === 0 && (
            <div className="surface-card p-6 text-sm text-muted-foreground">
              No purchase requests for {business.name} yet. New buyer requests will appear here.
            </div>
          )}
          {businessRequests.map((request) => (
            <div key={request.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{request.listingTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {request.buyerName} · {request.quantity.toLocaleString("en-US")} {request.unit} · offered {formatMMK(request.offeredPrice)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {request.fulfillment} · preferred {request.preferredDate || "Not specified"}
                  {request.message ? ` · ${request.message}` : ""}
                </p>
              </div>
              <Badge variant={request.status === "Accepted" ? "verified" : request.status === "Pending" ? "warning" : "soft"}>{request.status}</Badge>
              {(request.status === "Pending" || request.status === "Countered") && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => {
                    updateRequestStatus(request.id, "Accepted");
                    toast.success("Request accepted");
                  }}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    updateRequestStatus(request.id, "Countered");
                    toast("Counter offer sent");
                  }}>Counter</Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    updateRequestStatus(request.id, "Declined");
                    toast("Request declined");
                  }}>Decline</Button>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="transactions" className="mt-6 space-y-3">
          {businessTransactions.length === 0 && (
            <div className="surface-card p-6 text-sm text-muted-foreground">No transactions for {business.name} yet.</div>
          )}
          {businessTransactions.map((t) => (
            <div key={t.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.material}</p>
                <p className="text-xs text-muted-foreground">{t.id} · {t.buyer} ↔ {t.seller} · {t.date}</p>
              </div>
              <span className="text-sm font-semibold">{formatMMK(t.value)}</span>
              <Badge variant={t.status === "Completed" ? "verified" : "soft"}>{t.status}</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-5">
          <div>
            <h2 className="font-display text-2xl font-semibold">Business analytics</h2>
            <p className="mt-1 text-sm text-muted-foreground">Performance across your current marketplace listings.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Listing views", value: totalViews.toLocaleString("en-US"), icon: Eye },
              { label: "Buyer inquiries", value: totalInquiries.toLocaleString("en-US"), icon: MessageSquareText },
              { label: "Inquiry rate", value: `${inquiryRate}%`, icon: TrendingUp },
              { label: "Revenue recovered", value: formatMMK(recoveredRevenue), icon: BarChart3 },
            ].map((metric) => (
              <div key={metric.label} className="surface-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-2xl font-semibold text-primary">{metric.value}</p>
                  <span className="rounded-xl bg-mint p-2.5 text-primary"><metric.icon className="size-5" /></span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="surface-card p-6">
              <h3 className="font-display text-lg font-semibold">Recovered revenue by category</h3>
              <div className="mt-5 space-y-4">
                {categoryPerformance.length === 0 && (
                  <p className="text-sm text-muted-foreground">Revenue analytics will appear after the first completed deal.</p>
                )}
                {categoryPerformance.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm"><span>{categoryName(item.category as Parameters<typeof categoryName>[0])}</span><span className="font-medium">{formatMMK(item.value)}</span></div>
                    <Progress className="mt-1.5" value={(item.value / maxCategoryRevenue) * 100} />
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card p-6">
              <h3 className="font-display text-lg font-semibold">Listing engagement</h3>
              <p className="mt-1 text-sm text-muted-foreground">Your most-viewed active materials.</p>
              <div className="mt-5 space-y-5">
                {[...myListings]
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((listing) => (
                    <div key={listing.id}>
                      <div className="flex items-start justify-between gap-4 text-sm">
                        <span className="font-medium">{listing.title}</span>
                        <span className="shrink-0 text-muted-foreground">{listing.views.toLocaleString("en-US")} views</span>
                      </div>
                      <Progress className="mt-2" value={(listing.views / maxListingViews) * 100} />
                      <p className="mt-1 text-xs text-muted-foreground">{listing.inquiries} buyer inquiries</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PostListing() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg"><PlusCircle className="size-4" /> Post Surplus Material</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post surplus material</DialogTitle>
          <DialogDescription>Loopi will suggest a fair price range once your details are added.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <FF label="Material title" placeholder="Cotton fabric offcuts — 200kg" />
          <div>
            <Label>Category</Label>
            <select className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              {CATEGORIES.map((c) => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FF label="Quantity" placeholder="200 kg" />
            <FF label="Price (MMK)" placeholder="180,000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FF label="Condition" placeholder="Reusable" />
            <FF label="Location" placeholder="Hlaing Tharyar, Yangon" />
          </div>
          <div><Label>Description</Label><Textarea className="mt-1.5" placeholder="Mixed cotton offcuts from garment production…" /></div>
          <FF label="Photos" type="file" />
        </div>
        <DialogFooter>
          <Button onClick={() => toast.success("Listing published", { description: "Loopi notified 4 matching buyers." })}>Publish Listing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FF({ label, placeholder, type }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1.5" placeholder={placeholder ?? ""} type={type ?? "text"} />
    </div>
  );
}
