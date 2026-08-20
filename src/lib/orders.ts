/**
 * Order lifecycle — the transaction spine of the platform.
 *
 * Replaces the older TX_FLOW handoff model in data.ts, which had no payment state:
 * buyers now pay through the platform and the seller is paid out only after the
 * buyer accepts the material.
 *
 * This module is a frozen contract. Types, statuses and SEED_ORDERS are shared by
 * every feature track — extend behaviour through OrderProvider, not by editing here.
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
  payoutStatus: PayoutStatus;
  payoutRef?: string;
  payoutAt?: string;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type NewOrder = Omit<
  Order,
  "id" | "status" | "paymentStatus" | "payoutStatus" | "createdAt" | "updatedAt"
>;

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

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const hoursAhead = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

/**
 * One demo order in each lifecycle state, so every feature can be built and
 * demonstrated without first walking an order through the whole flow.
 *
 * ORD-1001 carries the canonical worked example: 1,000,000 MMK material →
 * buyer pays 1,010,000 · seller receives 980,000 · platform gross 30,000.
 */
export const SEED_ORDERS: Order[] = [
  {
    id: "ORD-1001",
    listingId: "ceramic-tiles",
    listingTitle: "Excess Ceramic Tiles",
    category: "construction",
    buyerId: "buyer-yangon-craft",
    buyerName: "Yangon Craft Collective",
    sellerBusinessId: "circularbuild-myanmar",
    sellerName: "CircularBuild Myanmar",
    quantity: 40,
    unit: "boxes",
    unitPrice: 25000,
    totals: calculateOrderTotals({ materialPrice: 1000000 }),
    status: "PENDING_PAYMENT",
    paymentStatus: "UNPAID",
    payoutStatus: "NOT_ELIGIBLE",
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
  {
    id: "ORD-1002",
    listingId: "pet-plastic-scrap",
    listingTitle: "PET Plastic Scrap",
    category: "plastic",
    buyerId: "buyer-ecobag",
    buyerName: "EcoBag Myanmar",
    sellerBusinessId: "yangon-circular-plastics",
    sellerName: "Yangon Circular Plastics",
    quantity: 500,
    unit: "kg",
    unitPrice: 600,
    totals: calculateOrderTotals({ materialPrice: 300000, deliveryFee: 50000 }),
    status: "PAID",
    paymentStatus: "PAID",
    paymentRef: "MMQR-1755600000000",
    paidAt: hoursAgo(20),
    payoutStatus: "NOT_ELIGIBLE",
    createdAt: hoursAgo(26),
    updatedAt: hoursAgo(20),
  },
  {
    id: "ORD-1003",
    listingId: "corrugated-cardboard-boxes",
    listingTitle: "Corrugated Cardboard Boxes",
    category: "paper",
    buyerId: "buyer-shwe-online",
    buyerName: "Shwe Online Retail",
    sellerBusinessId: "ecobox-myanmar",
    sellerName: "EcoBox Myanmar",
    quantity: 800,
    unit: "boxes",
    unitPrice: 300,
    totals: calculateOrderTotals({ materialPrice: 240000, deliveryFee: 30000 }),
    status: "SHIPPED",
    paymentStatus: "PAID",
    paymentRef: "MMQR-1755500000000",
    paidAt: hoursAgo(50),
    payoutStatus: "NOT_ELIGIBLE",
    createdAt: hoursAgo(56),
    updatedAt: hoursAgo(6),
  },
  {
    id: "ORD-1004",
    listingId: "aluminum-offcuts",
    listingTitle: "Aluminum Offcuts",
    category: "metal",
    buyerId: "buyer-ayeyar-foundry",
    buyerName: "Ayeyar Foundry",
    sellerBusinessId: "myanmar-metal-recovery",
    sellerName: "Myanmar Metal Recovery",
    quantity: 250,
    unit: "kg",
    unitPrice: 3800,
    totals: calculateOrderTotals({ materialPrice: 950000, deliveryFee: 50000 }),
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentRef: "MMQR-1755400000000",
    paidAt: hoursAgo(72),
    deliveredAt: hoursAgo(6),
    inspectionDeadline: hoursAhead(INSPECTION_WINDOW_HOURS - 6),
    payoutStatus: "NOT_ELIGIBLE",
    createdAt: hoursAgo(80),
    updatedAt: hoursAgo(6),
  },
  {
    id: "ORD-1005",
    listingId: "wood-offcuts",
    listingTitle: "Wood Offcuts",
    category: "wood",
    buyerId: "buyer-teak-twine",
    buyerName: "Teak and Twine Studio",
    sellerBusinessId: "greenwood-manufacturing",
    sellerName: "GreenWood Manufacturing",
    quantity: 120,
    unit: "kg",
    unitPrice: 1300,
    totals: calculateOrderTotals({ materialPrice: 156000 }),
    status: "COMPLETED",
    paymentStatus: "PAID",
    paymentRef: "MMQR-1755300000000",
    paidAt: hoursAgo(120),
    deliveredAt: hoursAgo(60),
    inspectionDeadline: hoursAgo(12),
    acceptedAt: hoursAgo(48),
    payoutStatus: "PENDING",
    createdAt: hoursAgo(130),
    updatedAt: hoursAgo(48),
  },
];
