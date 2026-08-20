import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
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
import {
  isQuoteLocked,
  quotedDeliveryFee,
  quotedTotal,
  quotedUnitPrice,
  usePurchaseRequests,
  type PurchaseRequest,
} from "@/components/requests/PurchaseRequestProvider";
import { FeeBreakdown } from "@/components/orders/FeeBreakdown";
import { useOrders } from "@/components/orders/OrderProvider";
import { ORDER_FLOW, ORDER_STATUS_LABELS, orderLabel } from "@/lib/orders";
import { calculateOrderTotals } from "@/lib/fees";
import { supabase } from "@/integrations/supabase/client";
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
import { MaterialCard } from "@/components/site/MaterialCard";
import {
  LISTINGS,
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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addRequest, requestForListing } = usePurchaseRequests();
  const buyerId = currentUser?.id ?? "";
  const myRequest = requestForListing(listing.id, buyerId);
  const seller = businessById(listing.sellerId)!;
  const isOwnListing =
    currentUser?.role === "business" && currentUser.businessId === listing.sellerId;
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [qty, setQty] = useState(String(Math.min(listing.quantity, 100)));
  const [offeredPrice, setOfferedPrice] = useState(String(listing.price ?? 0));
  const [fulfillment, setFulfillment] = useState("Self pickup");
  const [preferredDate, setPreferredDate] = useState("2026-08-20");
  const [requestMessage, setRequestMessage] = useState("");
  const related = LISTINGS.filter(
    (l) => l.category === listing.category && l.id !== listing.id,
  ).slice(0, 3);
  const img = categoryImage(listing.category);

  const [sendingRequest, setSendingRequest] = useState(false);

  const submitRequest = async () => {
    if (!currentUser) {
      toast.error("Sign in to send a request.");
      void navigate({ to: "/auth", search: { redirect: undefined, tab: "buyer" } });
      return;
    }

    setSendingRequest(true);
    try {
      // The local listing catalog and the real Supabase listings table share
      // the same ids, but only the Supabase row's seller_id is the real
      // business uuid that purchase_requests needs — local data.ts's
      // sellerId is a demo slug and would fail the foreign key.
      const { data: realListing } = await supabase
        .from("listings")
        .select("seller_id")
        .eq("id", listing.id)
        .maybeSingle();

      if (!realListing) {
        toast.error("This listing isn't available for requests right now.");
        return;
      }

      await addRequest({
        listingId: listing.id,
        listingTitle: listing.title,
        sellerBusinessId: realListing.seller_id,
        buyerId,
        buyerName: currentUser.businessName ?? currentUser.name,
        quantity: Number(qty) || 0,
        unit: listing.unit,
        offeredPrice: Number(offeredPrice) || 0,
        message: requestMessage.trim(),
        fulfillment,
        preferredDate,
      });
      setContactUnlocked(true);
      toast.success("Request to Buy sent", {
        description: `${seller.name} has been notified. Contact details are now unlocked.`,
      });
    } catch {
      toast.error("Could not send the request. Try again.");
    } finally {
      setSendingRequest(false);
    }
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

          {!isOwnListing && myRequest ? <OrderProgressSection request={myRequest} /> : null}
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
                {myRequest ? <QuotePanel request={myRequest} /> : null}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      size="lg"
                      variant={myRequest ? "outline" : "default"}
                    >
                      {myRequest ? "Send another request" : "Request to Buy"}
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
                        <Label>Offered price per {listing.unit} (MMK)</Label>
                        <Input
                          className="mt-1.5"
                          inputMode="numeric"
                          value={offeredPrice}
                          onChange={(e) => setOfferedPrice(e.target.value)}
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {(Number(qty) || 0).toLocaleString("en-US")} {listing.unit} ×{" "}
                          {priceOf(Number(offeredPrice) || 0)} ={" "}
                          <span className="font-medium text-foreground">
                            {priceOf((Number(qty) || 0) * (Number(offeredPrice) || 0))}
                          </span>
                        </p>
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
                      <Button onClick={submitRequest} disabled={sendingRequest}>
                        {sendingRequest ? "Sending…" : "Send Request"}
                      </Button>
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

/**
 * The buyer's side of the negotiation: what has been offered, what the seller
 * countered, and the one button that turns a quote into a priced order.
 *
 * Accepting locks the price. Everything downstream — checkout, payout, the
 * platform's own revenue — is computed from the totals captured at this moment.
 */
function QuotePanel({ request }: { request: PurchaseRequest }) {
  const navigate = useNavigate();
  const { acceptQuote } = usePurchaseRequests();
  const [accepting, setAccepting] = useState(false);
  const locked = isQuoteLocked(request);
  const unitPrice = quotedUnitPrice(request);
  const totals = calculateOrderTotals({
    materialPrice: quotedTotal(request),
    deliveryFee: quotedDeliveryFee(request),
  });

  if (request.status === "Rejected") {
    return (
      <div className="rounded-xl border border-border bg-secondary/50 p-4">
        <p className="text-sm font-semibold">Request declined</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {request.buyerName} asked for {request.quantity.toLocaleString("en-US")} {request.unit},
          but the seller declined. You can send a new request with different terms.
        </p>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="rounded-xl border border-primary/25 bg-mint p-4">
        <div className="flex items-center gap-2">
          <Handshake className="size-4 text-primary" aria-hidden="true" />
          <p className="text-sm font-semibold text-accent-foreground">Price agreed</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {request.quantity.toLocaleString("en-US")} {request.unit} at {priceOf(unitPrice)} per{" "}
          {request.unit}. This price is locked and can no longer be renegotiated.
        </p>
        <Button className="mt-4 w-full" asChild>
          <Link to="/checkout/$orderId" params={{ orderId: request.orderId ?? "" }}>
            Go to checkout
          </Link>
        </Button>
      </div>
    );
  }

  const awaitingSeller = request.status === "Pending";

  return (
    <div className="rounded-xl border border-border bg-secondary/50 p-4">
      <p className="text-sm font-semibold">
        {awaitingSeller ? "Request sent" : "Seller responded"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        You asked for {request.quantity.toLocaleString("en-US")} {request.unit} at{" "}
        {priceOf(request.offeredPrice)} per {request.unit}.
      </p>

      {request.counterUnitPrice !== undefined ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Seller countered at{" "}
          <span className="font-medium text-foreground">{priceOf(request.counterUnitPrice)}</span>{" "}
          per {request.unit}.{request.counterNote ? ` "${request.counterNote}"` : ""}
        </p>
      ) : null}

      {awaitingSeller ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Waiting for the seller to accept or counter your price.
        </p>
      ) : (
        <>
          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <FeeBreakdown totals={totals} variant="buyer" />
          </div>
          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={accepting}
            onClick={async () => {
              setAccepting(true);
              try {
                const order = await acceptQuote(request.id);
                if (!order) {
                  toast.error("This quote can no longer be accepted.");
                  return;
                }
                toast.success("Price agreed", {
                  description: `Order ${orderLabel(order)} created. Complete payment to confirm.`,
                });
                void navigate({ to: "/checkout/$orderId", params: { orderId: order.id } });
              } catch {
                toast.error("Could not accept this quote. Try again.");
              } finally {
                setAccepting(false);
              }
            }}
          >
            {accepting ? "Accepting…" : `Accept ${priceOf(totals.buyerTotal)} and check out`}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Accepting locks this price. It cannot be renegotiated afterwards.
          </p>
        </>
      )}
    </div>
  );
}

const priceOf = (amount: number) => `${amount.toLocaleString("en-US")} MMK`;

/**
 * Where this deal actually stands, driven by the real order lifecycle rather
 * than a demo counter. Replaces the old TX_FLOW pickup-and-scan simulation,
 * which described a handoff model the platform no longer uses.
 */
function OrderProgressSection({ request }: { request: PurchaseRequest }) {
  const { getOrder } = useOrders();
  const order = request.orderId ? getOrder(request.orderId) : undefined;

  return (
    <section className="surface-card mt-6 p-6">
      <h2 className="font-display text-lg font-semibold">Transaction status</h2>

      {order ? (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Order {orderLabel(order)} · {ORDER_STATUS_LABELS[order.status]}
          </p>
          <ol className="mt-4 space-y-2.5">
            {ORDER_FLOW.map((status) => {
              const position = ORDER_FLOW.indexOf(order.status);
              const index = ORDER_FLOW.indexOf(status);
              const reached = position >= 0 && index <= position;
              return (
                <li key={status} className="flex items-center gap-3 text-sm">
                  <span
                    className={
                      reached
                        ? "flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                        : "flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground"
                    }
                  >
                    {index + 1}
                  </span>
                  <span className={reached ? "font-medium" : "text-muted-foreground"}>
                    {ORDER_STATUS_LABELS[status]}
                  </span>
                </li>
              );
            })}
          </ol>
          <Button className="mt-5" variant="outline" asChild>
            <Link to="/orders/$id" params={{ id: order.id }}>
              View order
            </Link>
          </Button>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Your request is with the seller. Once you agree on a price, the deal becomes a tracked
            order you pay for through the platform.
          </p>
          <ol className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {[
              "Agree a price with the seller",
              "Pay securely by MMQR",
              "Seller prepares and ships",
              "Inspect on delivery, then accept",
              "Seller is paid out",
            ].map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
