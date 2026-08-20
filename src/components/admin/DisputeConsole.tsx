import { useState } from "react";
import { AlertTriangle, Gavel, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useOrders } from "@/components/orders/OrderProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatMMK } from "@/lib/data";
import { disputedOrders, type Order } from "@/lib/orders";

/**
 * Where an admin settles a "Report a problem" case.
 *
 * A buyer's dispute freezes payout — it stays frozen until an admin decides who
 * was right. Releasing the payout completes the order as if the buyer had
 * accepted it; refunding cancels it with no seller payout. Either way, the
 * resolution note stays on the order so the decision is on record.
 */
export function DisputeConsole() {
  const { orders } = useOrders();
  const disputed = disputedOrders(orders);

  return (
    <div className="space-y-4">
      {disputed.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-2 p-8 text-center">
          <Gavel className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">No open disputes</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            When a buyer reports a problem with a delivered order, it appears here and the seller
            payout is held until you resolve it.
          </p>
        </div>
      ) : null}

      {disputed.map((order) => (
        <div key={order.id} className="surface-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{order.listingTitle}</p>
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="size-3" aria-hidden="true" />
                  Disputed
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {order.id} · {order.buyerName} ↔ {order.sellerName} ·{" "}
                {order.quantity.toLocaleString("en-US")} {order.unit}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Buyer paid {formatMMK(order.totals.buyerTotal)}</p>
              <p>Seller would receive {formatMMK(order.totals.sellerNet)}</p>
            </div>
          </div>

          {order.disputeReason ? (
            <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
                Buyer's report
              </p>
              <p className="mt-1 text-muted-foreground">{order.disputeReason}</p>
            </div>
          ) : null}

          <ResolveDisputeDialog order={order} />
        </div>
      ))}
    </div>
  );
}

function ResolveDisputeDialog({ order }: { order: Order }) {
  const { updateOrder } = useOrders();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const resolve = (outcome: "release" | "refund") => {
    const trimmedNote = note.trim();
    if (!trimmedNote) {
      toast.error("Add a short note explaining the decision before resolving.");
      return;
    }

    const now = new Date().toISOString();

    if (outcome === "release") {
      updateOrder(order.id, {
        status: "COMPLETED",
        acceptedAt: order.acceptedAt ?? now,
        payoutStatus: "PENDING",
        disputeResolution: trimmedNote,
        disputeResolvedAt: now,
      });
      toast.success("Payout released to seller", {
        description: `${order.id} moved to the payout queue.`,
      });
    } else {
      updateOrder(order.id, {
        status: "REFUNDED",
        payoutStatus: "NOT_ELIGIBLE",
        disputeResolution: trimmedNote,
        disputeResolvedAt: now,
      });
      toast.success("Buyer refunded", {
        description: `${order.id} closed with no seller payout.`,
      });
    }

    setOpen(false);
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="mt-3">
          <Gavel className="size-4" /> Resolve dispute
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve dispute — {order.id}</DialogTitle>
          <DialogDescription>
            {order.buyerName} reported a problem with {order.listingTitle}. Decide whether the
            seller was in the right or the buyer should be refunded, and record why.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-secondary/40 p-3 text-sm">
            <div>
              <p className="text-muted-foreground">Release to seller</p>
              <p className="mt-0.5 font-medium">{formatMMK(order.totals.sellerNet)}</p>
              <p className="text-xs text-muted-foreground">completes the order as accepted</p>
            </div>
            <div>
              <p className="text-muted-foreground">Refund buyer</p>
              <p className="mt-0.5 font-medium">{formatMMK(order.totals.buyerTotal)}</p>
              <p className="text-xs text-muted-foreground">no seller payout</p>
            </div>
          </div>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Seller provided photos matching the listing spec — releasing payout."
            rows={4}
          />
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="destructive" onClick={() => resolve("refund")}>
            <Undo2 className="size-4" /> Refund buyer
          </Button>
          <Button onClick={() => resolve("release")}>
            <Gavel className="size-4" /> Release to seller
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
