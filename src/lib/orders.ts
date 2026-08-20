/**
 * Order lifecycle — the transaction spine of the platform.
 *
 * Replaces the older TX_FLOW handoff model in data.ts, which had no payment state:
 * buyers now pay through the platform and the seller is paid out only after the
 * buyer accepts the material. Orders are stored in Supabase (see the "orders"
 * table and OrderProvider) — this module holds the types and pure helpers only.
 */

import { calculateOrderTotals, type OrderTotals } from "./fees";
import type { CategoryId } from "./data";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "DISPUTED"
  | "REFUNDED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";

export type PayoutStatus = "NOT_ELIGIBLE" | "PENDING" | "PAID";

/** Happy path, in order — drives timeline UI. Exception states are not listed. */
export const ORDER_FLOW: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  PREPARING: "Preparing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  DISPUTED: "Problem reported",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

/** Buyer inspection window after delivery, before the sale is final. */
export const INSPECTION_WINDOW_HOURS = 48;

export interface Order {
  id: string;
  /** Short display number ("ORD-1042"). Use this to show an order, not the id. */
  orderNumber: number;
  listingId: string;
  listingTitle: string;
  category: CategoryId;
  buyerId: string;
  buyerName: string;
  sellerBusinessId: string;
  sellerName: string;
  quantity: number;
  unit: string;
  /** Agreed price per unit at the moment the quote was accepted. */
  unitPrice: number;
  /** Locked when the order is created. Never recalculated afterwards. */
  totals: OrderTotals;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  paidAt?: string;
  deliveredAt?: string;
  inspectionDeadline?: string;
  acceptedAt?: string;
  /** True when acceptedAt was set by the inspection-window timeout rather than a buyer click. */
  autoAccepted?: boolean;
  payoutStatus: PayoutStatus;
  payoutRef?: string;
  payoutAt?: string;
  disputeReason?: string;
  /** How an admin resolved a dispute, for the record. Absent while still open. */
  disputeResolution?: string;
  disputeResolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NewOrder = Omit<
  Order,
  "id" | "orderNumber" | "status" | "paymentStatus" | "payoutStatus" | "createdAt" | "updatedAt"
>;

/** Display label for an order, everywhere one is shown to a user. */
export const orderLabel = (order: Pick<Order, "orderNumber">) => `ORD-${order.orderNumber}`;

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PREPARING", "CANCELLED", "REFUNDED"],
  PREPARING: ["SHIPPED", "DISPUTED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "DISPUTED"],
  DELIVERED: ["COMPLETED", "DISPUTED"],
  COMPLETED: [],
  DISPUTED: ["COMPLETED", "REFUNDED", "CANCELLED"],
  REFUNDED: [],
  CANCELLED: [],
};

/** Guard every status change with this — never assign order.status directly. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Next step on the happy path, or null at the end of it. */
export function nextStatus(current: OrderStatus): OrderStatus | null {
  const index = ORDER_FLOW.indexOf(current);
  if (index === -1 || index === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[index + 1] ?? null;
}

export function inspectionDeadlineFrom(deliveredAt: string): string {
  return new Date(
    new Date(deliveredAt).getTime() + INSPECTION_WINDOW_HOURS * 60 * 60 * 1000,
  ).toISOString();
}

export const orderById = (orders: Order[], id: string) => orders.find((order) => order.id === id);

export const ordersForBuyer = (orders: Order[], buyerId: string) =>
  orders.filter((order) => order.buyerId === buyerId);

export const ordersForSeller = (orders: Order[], sellerBusinessId: string) =>
  orders.filter((order) => order.sellerBusinessId === sellerBusinessId);

export const payoutQueue = (orders: Order[]) =>
  orders.filter((order) => order.status === "COMPLETED" && order.payoutStatus === "PENDING");

export const disputedOrders = (orders: Order[]) =>
  orders.filter((order) => order.status === "DISPUTED");

/** An order past its inspection deadline with no buyer action — eligible to auto-complete. */
export const isDueForAutoAccept = (order: Order, now: number = Date.now()) =>
  order.status === "DELIVERED" &&
  Boolean(order.inspectionDeadline) &&
  new Date(order.inspectionDeadline as string).getTime() <= now;
