import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { CATEGORIES, LISTINGS, WANTED, categoryName, priceLabel } from "@/lib/data";

export const Route = createFileRoute("/wanted")({
  head: () => ({
    meta: [
      { title: "Material Wanted — Post What Your Business Needs | SurplusHub" },
      { name: "description", content: "Browse live buyer demand for surplus materials in Myanmar, or post your own requirement and receive supplier offers." },
      { property: "og:title", content: "Material Wanted — SurplusHub" },
      { property: "og:description", content: "Tell businesses what you're looking for and let Loopi find matching suppliers." },
    ],
  }),
  component: WantedPage,
});

function WantedPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Material Wanted</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Can't find what you need? Tell businesses what you're looking for.
          </p>
        </div>
        <PostRequirementDialog />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {WANTED.map((w) => {
          const matches = LISTINGS.filter((l) => l.category === w.category).slice(0, 2);
          return (
            <article key={w.id} className="surface-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-base font-semibold">{w.title}</h2>
                <Badge variant="soft">{categoryName(w.category)}</Badge>
              </div>
              <dl className="mt-4 space-y-1.5 text-sm">
                <Row k="Quantity" v={w.quantity} />
                <Row k="Budget" v={w.budget} />
                <Row k="Location" v={w.location} />
                <Row k="Use" v={w.use} />
                <Row k="Condition" v={w.condition} />
                <Row k="Required by" v={w.requiredBy} />
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">{w.notes}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Posted by {w.buyer} · {w.postedDaysAgo}d ago · {w.offers} offers
              </p>

              {openId === w.id && (
                <div className="mt-4 rounded-xl border border-border bg-secondary/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Sparkles className="size-3.5" /> Loopi found potential suppliers.
                  </p>
                  {matches.map((m, i) => (
                    <div key={m.id} className="mt-2.5 rounded-lg border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{m.title}</p>
                        <Badge variant="verified">{92 - i * 7}% Match</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {m.quantity.toLocaleString("en-US")} {m.unit} · {priceLabel(m)} · {m.location}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" asChild>
                          <Link to="/marketplace/$id" params={{ id: m.id }}>View Material</Link>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toast.success("Offer requested from supplier")}>
                          Request Offer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto flex gap-2 pt-4">
                <MakeOfferDialog title={w.title} />
                <Button variant="outline" size="sm" onClick={() => setOpenId(openId === w.id ? null : w.id)}>
                  {openId === w.id ? "Hide AI matches" : "View AI matches"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 pb-1.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function PostRequirementDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">Post a Requirement</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a Material Wanted requirement</DialogTitle>
          <DialogDescription>Verified suppliers with matching stock can send you offers.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Material" placeholder="PET plastic scrap" />
          <div>
            <Label>Category</Label>
            <select className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              {CATEGORIES.map((c) => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity needed" placeholder="500 kg" />
            <Field label="Budget (MMK)" placeholder="350,000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" placeholder="Yangon" />
            <Field label="Preferred condition" placeholder="Any / Requires processing" />
          </div>
          <Field label="Intended use" placeholder="Plastic manufacturing" />
          <Field label="Required by date" type="date" />
          <div>
            <Label>Additional requirements</Label>
            <Textarea className="mt-1.5" placeholder="Baled material preferred, sample required…" />
          </div>
          <Field label="Reference image" type="file" />
        </div>
        <DialogFooter>
          <Button onClick={() => toast.success("Requirement posted", { description: "Loopi is searching for matching suppliers." })}>
            Post Requirement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MakeOfferDialog({ title }: { title: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Make an Offer</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Available quantity" placeholder="500 kg" />
            <Field label="Price (MMK)" placeholder="300,000" />
          </div>
          <Field label="Material details" placeholder="Baled PET, washed, 55kg bales" />
          <Field label="Condition" placeholder="Scrap / Requires Processing" />
          <Field label="Pickup / delivery" placeholder="Delivery within Yangon" />
          <Field label="Photos" type="file" />
          <div>
            <Label>Message</Label>
            <Textarea className="mt-1.5" placeholder="We can supply weekly if the quality matches." />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => toast.success("Offer sent to buyer", { description: "Accepted offers create a transaction request." })}>
            Send Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, placeholder, type }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1.5" placeholder={placeholder ?? ""} type={type ?? "text"} />
    </div>
  );
}
