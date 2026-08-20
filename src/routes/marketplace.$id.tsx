import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  Flag,
  Heart,
  Handshake,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Recycle,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePurchaseRequests } from "@/components/requests/PurchaseRequestProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode } from "@/components/site/QrCode";
import { MaterialCard } from "@/components/site/MaterialCard";
import {
  LISTINGS,
  TX_FLOW,
  businessById,
  categoryImage,
  categoryName,
  listingById,
  priceLabel,
} from "@/lib/data";

export const Route = createFileRoute("/marketplace/$id")({
  loader: ({ params }) => {
    const listing = listingById(params.id);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Listing unavailable — SurplusHub" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const l = loaderData.listing;
    const title = `${l.title} — ${l.location} | SurplusHub`;
    const description = `${l.quantity.toLocaleString("en-US")} ${l.unit} of ${l.title.toLowerCase()} (${l.condition}) available in ${l.location} at ${priceLabel(l)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ListingDetail,
});

function ListingDetail() {
  const { listing } = Route.useLoaderData();
  const { currentUser } = useAuth();
  const { addRequest } = usePurchaseRequests();
  const seller = businessById(listing.sellerId)!;
  const isOwnListing =
    currentUser?.role === "business" && currentUser.businessId === listing.sellerId;
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [stage, setStage] = useState(0);
  const [qty, setQty] = useState(String(Math.min(listing.quantity, 100)));
  const [offeredPrice, setOfferedPrice] = useState(String(listing.price ?? 0));
  const [fulfillment, setFulfillment] = useState("Self pickup");
  const [preferredDate, setPreferredDate] = useState("2026-08-20");
  const [requestMessage, setRequestMessage] = useState("");
  const related = LISTINGS.filter(
    (l) => l.category === listing.category && l.id !== listing.id,
  ).slice(0, 3);
  const img = categoryImage(listing.category);

  const submitRequest = () => {
    addRequest({
      listingId: listing.id,
      listingTitle: listing.title,
      sellerBusinessId: listing.sellerId,
      buyerName: currentUser?.businessName ?? currentUser?.name ?? "Marketplace Buyer",
      quantity: Number(qty) || 0,
      unit: listing.unit,
      offeredPrice: Number(offeredPrice) || 0,
      message: requestMessage.trim(),
      fulfillment,
      preferredDate,
    });
    setContactUnlocked(true);
    setStage(1);
    toast.success("Request to Buy sent", {
      description: `${seller.name} has been notified. Contact details are now unlocked.`,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link to="/marketplace" className="hover:text-foreground">
          Marketplace
        </Link>
        <span className="mx-2">/</span>
        <span>{categoryName(listing.category)}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <div className="surface-card overflow-hidden">
            <img
              src={img}
              alt={`${listing.title} listed by ${seller.name}`}
              width={800}
              height={600}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2].map((i) => (
              <img
                key={i}
                src={img}
                alt={`Seller-uploaded photo ${i + 1} of ${listing.title}`}
                loading="lazy"
                width={800}
                height={600}
                className="aspect-square w-full rounded-xl border border-border object-cover"
              />
            ))}
            <div className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
              <Camera className="mb-1 size-4" />
              Seller-uploaded photos
            </div>
          </div>

          <section className="surface-card mt-6 p-6">
            <h2 className="font-display text-lg font-semibold">Material information</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {[
                ["Category", categoryName(listing.category)],
                ["Material type", listing.materialType],
                ["Composition", listing.composition],
                ["Condition", listing.condition],
                ["Quantity", `${listing.quantity.toLocaleString("en-US")} ${listing.unit}`],
                ["Unit price", priceLabel(listing)],
                ["Minimum order", listing.minOrder],
                ["Location", listing.location],
                ["Available", listing.availableFrom],
                ["Processing", listing.requiresProcessing ? "Requires processing" : "Ready to use"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 border-b border-border/70 pb-2 text-sm"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
          </section>

          <section className="surface-card mt-6 p-6">
            <h2 className="font-display text-lg font-semibold">Potential Uses</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Suggestions only — suitability is not guaranteed and should be confirmed with the
              seller.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {listing.uses.map((u) => (
                <Badge key={u} variant="soft">
                  {u}
                </Badge>
              ))}
            </div>
          </section>

          {!isOwnListing && (
            <section className="surface-card mt-6 p-6">
              <h2 className="font-display text-lg font-semibold">Transaction status</h2>
              <ol className="mt-4 space-y-2.5">
                {TX_FLOW.map((s, i) => (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span
                      className={
                        i <= stage
                          ? "flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                          : "flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {i + 1}
                    </span>
                    <span className={i <= stage ? "font-medium" : "text-muted-foreground"}>
                      {s}
                    </span>
                  </li>
                ))}
              </ol>
              {stage >= 1 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setStage(Math.min(stage + 1, TX_FLOW.length - 1));
                      toast.success("Transaction advanced", {
                        description: TX_FLOW[Math.min(stage + 1, 7)],
                      });
                    }}
                  >
                    Advance demo step
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setStage(0)}>
                    Reset
                  </Button>
                </div>
              )}
              {stage >= 4 && (
                <div className="mt-6 grid gap-5 rounded-2xl border border-border bg-secondary/50 p-5 sm:grid-cols-[auto_1fr]">
                  <div className="rounded-xl bg-card p-3">
                    <QrCode value="TXN-20481" />
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-display text-lg font-semibold">TXN-20481</p>
                    <p>
                      <span className="text-muted-foreground">Buyer:</span> ABC Products
                    </p>
                    <p>
                      <span className="text-muted-foreground">Seller:</span> {seller.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Material:</span> {listing.title}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Quantity:</span> {qty} {listing.unit}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Total:</span>{" "}
                      {(Number(qty || 0) * (listing.price ?? 0)).toLocaleString("en-US")} MMK
                    </p>
                    <Badge variant={stage >= 7 ? "verified" : "warning"} className="mt-2">
                      {stage >= 7 ? "✓ Transaction Completed" : "Ready for Completion"}
                    </Badge>
                    <p className="pt-2 text-xs text-muted-foreground">
                      At pickup, the seller scans this QR code or both parties confirm the
                      transaction ID. Buyer and seller settle payment directly — integrated payment
                      and escrow can be introduced in a future phase.
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="surface-card p-6">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="forest">{categoryName(listing.category)}</Badge>
              <Badge variant="soft">{listing.materialType}</Badge>
              {listing.requiresProcessing && (
                <Badge variant="warning" className="gap-1">
                  <Recycle className="size-3" /> Requires Processing
                </Badge>
              )}
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold">{listing.title}</h1>
            <p className="mt-3 font-display text-3xl font-semibold text-primary">
              {priceLabel(listing)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {listing.quantity.toLocaleString("en-US")} {listing.unit} available · Min order{" "}
              {listing.minOrder}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {listing.location}
              <span className="mx-1">·</span>
              <CalendarDays className="size-4" /> {listing.availableFrom}
            </p>

            {isOwnListing ? (
              <div className="mt-5 rounded-xl border border-primary/20 bg-mint p-4">
                <p className="text-sm font-semibold text-accent-foreground">
                  This is your business listing
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Buyer actions are hidden when you view your own material.
                </p>
                <Button className="mt-4 w-full" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="size-4" /> Manage in Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Request to Buy
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request to Buy</DialogTitle>
                      <DialogDescription>
                        Your request creates a tracked transaction lead with {seller.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                      <div>
                        <Label>Quantity ({listing.unit})</Label>
                        <Input
                          className="mt-1.5"
                          value={qty}
                          onChange={(e) => setQty(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Offered price (MMK)</Label>
                        <Input
                          className="mt-1.5"
                          value={offeredPrice}
                          onChange={(e) => setOfferedPrice(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Pickup / delivery</Label>
                          <Input
                            className="mt-1.5"
                            value={fulfillment}
                            onChange={(e) => setFulfillment(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Preferred date</Label>
                          <Input
                            className="mt-1.5"
                            type="date"
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          className="mt-1.5"
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          placeholder="Tell the seller how you plan to use the material…"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={submitRequest}>Send Request</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    contactUnlocked
                      ? toast.info("Contact details unlocked below")
                      : toast.warning("Submit a Request to Buy or Request Inspection first", {
                          description: "Contact details are shared once a genuine inquiry exists.",
                        })
                  }
                >
                  <MessageSquare className="size-4" /> Contact Seller
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.success("Offer sent to seller")}
                >
                  <Handshake className="size-4" /> Make an Offer
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => toast.success("Listing saved")}
                  >
                    <Heart className="size-4" /> Save
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => toast.info("Listing reported to moderation")}
                  >
                    <Flag className="size-4" /> Report
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-mint font-display font-semibold text-accent-foreground">
                {seller.initials}
              </span>
              <div>
                <Link
                  to="/businesses/$id"
                  params={{ id: seller.id }}
                  className="font-display font-semibold hover:underline"
                >
                  {seller.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {seller.industry} · {seller.location}
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {seller.verified && (
                <li className="flex items-center gap-2 text-primary">
                  <BadgeCheck className="size-4" /> Verified Business
                </li>
              )}
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Material Information Provided
              </li>
              <li className="flex items-center gap-2">
                <Star className="size-4 fill-warning text-warning" /> {seller.rating} Seller Rating
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                {seller.transactions} Verified Transactions
              </li>
            </ul>
            <div className="mt-4 rounded-xl border border-border bg-secondary/60 p-3 text-sm">
              {isOwnListing || contactUnlocked ? (
                <>
                  <p className="font-medium">{seller.contact.person}</p>
                  <p className="text-muted-foreground">{seller.contact.phone}</p>
                  <p className="text-muted-foreground">{seller.contact.email}</p>
                  <p className="text-muted-foreground">{seller.contact.address}</p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Contact details are shared after you submit a Request to Buy or Request
                  Inspection.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-semibold">Similar materials</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((l) => (
              <MaterialCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
