import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES, CATEGORY_SALES, LISTINGS, TRANSACTIONS, priceLabel } from "@/lib/data";

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

const MY = LISTINGS.slice(0, 6);

function Dashboard() {
  const maxTons = Math.max(...CATEGORY_SALES.map((c) => c.tons));
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Green Stitch Textile Co.</h1>
          <p className="mt-1 text-sm text-muted-foreground">Business dashboard · Verified supplier · Yangon</p>
        </div>
        <PostListing />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Active listings", "6"], ["Pending requests", "3"], ["Completed deals", "18"], ["Revenue recovered", "MMK 12.4M"]].map(([k, v]) => (
          <div key={k} className="surface-card p-5">
            <p className="font-display text-2xl font-semibold text-primary">{v}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="listings" className="mt-8">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6 space-y-3">
          {MY.map((l) => (
            <div key={l.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <img src={l.image} alt={l.title} width={96} height={72} loading="lazy" className="h-16 w-24 rounded-lg object-cover" />
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
          {TRANSACTIONS.slice(0, 3).map((t) => (
            <div key={t.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.material}</p>
                <p className="text-xs text-muted-foreground">{t.buyer} · {t.quantity} · offered {t.amount}</p>
              </div>
              <Badge variant="warning">{t.status}</Badge>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => toast.success("Request accepted")}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => toast("Counter offer sent")}>Counter</Button>
                <Button size="sm" variant="ghost" onClick={() => toast("Request declined")}>Decline</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="transactions" className="mt-6 space-y-3">
          {TRANSACTIONS.map((t) => (
            <div key={t.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.material}</p>
                <p className="text-xs text-muted-foreground">{t.id} · {t.buyer} ↔ {t.seller} · {t.date}</p>
              </div>
              <span className="text-sm font-semibold">{t.amount}</span>
              <Badge variant={t.status === "Completed" ? "verified" : "soft"}>{t.status}</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="surface-card p-6">
            <h2 className="font-display text-lg font-semibold">Materials sold by category</h2>
            <div className="mt-5 space-y-4">
              {CATEGORY_SALES.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-sm"><span>{c.category}</span><span className="font-medium">{c.tons} tons</span></div>
                  <Progress className="mt-1.5" value={(c.tons / maxTons) * 100} />
                </div>
              ))}
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
      <DialogTrigger asChild><Button size="lg">Post Surplus Material</Button></DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post surplus material</DialogTitle>
          <DialogDescription>EcoMatch AI will suggest a fair price range once your details are added.</DialogDescription>
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
          <Button onClick={() => toast.success("Listing published", { description: "EcoMatch AI notified 4 matching buyers." })}>Publish Listing</Button>
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
