import type { AuthUser } from "./auth";
import { formatMMK } from "./data";
import { disputedOrders, payoutQueue, type Order } from "./orders";

/**
 * Notification bell content derived from real order state, replacing the
 * static SELLER_NOTIFICATIONS / BUYER_NOTIFICATIONS seed lists once a user has
 * orders of their own to report on.
 *
 * Each order contributes at most one notification, for its current status —
 * this is a status feed, not a full event log.
 */
export type OrderNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: string;
};

const relativeTime = (iso: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

function buyerOrderNotification(order: Order): OrderNotification | null {
  switch (order.status) {
    case "PAID":
      return {
        id: order.id,
        title: "Payment confirmed",
        body: `${order.listingTitle} — ${order.sellerName} is preparing your order.`,
        time: order.paidAt ?? order.updatedAt,
        type: "payment",
      };
    case "SHIPPED":
      return {
        id: order.id,
        title: "Order shipped",
        body: `${order.listingTitle} is on the way from ${order.sellerName}.`,
        time: order.updatedAt,
        type: "shipping",
      };
    case "DELIVERED":
      return {
        id: order.id,
        title: "Delivered — inspect within 48 hours",
        body: `Check ${order.listingTitle} and accept, or report a problem.`,
        time: order.deliveredAt ?? order.updatedAt,
        type: "inspection",
      };
    case "COMPLETED":
      return {
        id: order.id,
        title: order.autoAccepted ? "Order auto-accepted" : "Order completed",
        body: order.autoAccepted
          ? `Inspection window expired for ${order.listingTitle} — it was accepted automatically.`
          : `${order.listingTitle} is complete. Thanks for trading on SurplusHub.`,
        time: order.acceptedAt ?? order.updatedAt,
        type: "completed",
      };
    case "DISPUTED":
      return {
        id: order.id,
        title: "Dispute submitted",
        body: `We're reviewing your report for ${order.listingTitle}.`,
        time: order.updatedAt,
        type: "dispute",
      };
    case "REFUNDED":
      return {
        id: order.id,
        title: "Refund issued",
        body: order.disputeResolution
          ? `${order.listingTitle}: ${order.disputeResolution}`
          : `Your payment for ${order.listingTitle} was refunded.`,
        time: order.disputeResolvedAt ?? order.updatedAt,
        type: "refund",
      };
    default:
      return null;
  }
}

function sellerOrderNotification(order: Order): OrderNotification | null {
  switch (order.status) {
    case "PAID":
      return {
        id: order.id,
        title: "Payment received — prepare shipment",
        body: `${order.buyerName} paid ${formatMMK(order.totals.buyerTotal)} for ${order.listingTitle}.`,
        time: order.paidAt ?? order.updatedAt,
        type: "payment",
      };
    case "DISPUTED":
      return {
        id: order.id,
        title: "Buyer reported a problem",
        body: order.disputeReason
          ? `${order.buyerName}: ${order.disputeReason}`
          : `${order.buyerName} reported a problem with ${order.listingTitle}.`,
        time: order.updatedAt,
        type: "dispute",
      };
    case "COMPLETED":
      if (order.payoutStatus === "PAID") {
        return {
          id: order.id,
          title: "Payout received",
          body: `${formatMMK(order.totals.sellerNet)} for ${order.listingTitle}${order.payoutRef ? ` — ref ${order.payoutRef}` : ""}.`,
          time: order.payoutAt ?? order.updatedAt,
          type: "payout",
        };
      }
      return {
        id: order.id,
        title: order.autoAccepted
          ? "Order auto-accepted — payout queued"
          : "Buyer accepted your order",
        body: `${formatMMK(order.totals.sellerNet)} for ${order.listingTitle} is queued for payout.`,
        time: order.acceptedAt ?? order.updatedAt,
        type: "completed",
      };
    default:
      return null;
  }
}

const sortByTimeDesc = (a: OrderNotification, b: OrderNotification) =>
  new Date(b.time).getTime() - new Date(a.time).getTime();

export function buyerOrderNotifications(orders: Order[], buyerId: string): OrderNotification[] {
  return orders
    .filter((order) => order.buyerId === buyerId)
    .map(buyerOrderNotification)
    .filter((item): item is OrderNotification => item !== null)
    .sort(sortByTimeDesc)
    .slice(0, 6)
    .map((item) => ({ ...item, time: relativeTime(item.time) }));
}

export function sellerOrderNotifications(
  orders: Order[],
  sellerBusinessId: string,
): OrderNotification[] {
  return orders
    .filter((order) => order.sellerBusinessId === sellerBusinessId)
    .map(sellerOrderNotification)
    .filter((item): item is OrderNotification => item !== null)
    .sort(sortByTimeDesc)
    .slice(0, 6)
    .map((item) => ({ ...item, time: relativeTime(item.time) }));
}

/** Open work items for the admin console: disputes to resolve, payouts to send. */
export function adminOrderNotifications(orders: Order[]): OrderNotification[] {
  const items: OrderNotification[] = [];
  const disputes = disputedOrders(orders);
  const payouts = payoutQueue(orders);

  if (disputes.length > 0) {
    items.push({
      id: "admin-disputes",
      title: `${disputes.length} dispute${disputes.length > 1 ? "s" : ""} awaiting review`,
      body: disputes
        .slice(0, 3)
        .map((order) => order.listingTitle)
        .join(", "),
      time: "now",
      type: "dispute",
    });
  }

  if (payouts.length > 0) {
    const owed = payouts.reduce((total, order) => total + order.totals.sellerNet, 0);
    items.push({
      id: "admin-payouts",
      title: `${payouts.length} payout${payouts.length > 1 ? "s" : ""} pending`,
      body: `${formatMMK(owed)} owed to sellers.`,
      time: "now",
      type: "payout",
    });
  }

  return items;
}

export function orderNotificationsFor(user: AuthUser | null, orders: Order[]): OrderNotification[] {
  if (!user) return [];
  if (user.role === "admin") return adminOrderNotifications(orders);
  if (user.role === "business" && user.businessId)
    return sellerOrderNotifications(orders, user.businessId);
  return buyerOrderNotifications(orders, user.id);
}
