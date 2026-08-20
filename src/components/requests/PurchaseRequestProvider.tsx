import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_BUYER_ID,
  addPurchaseRequestMessage,
  syncPurchaseRequestMessageStatus,
  type PurchaseMessageStatus,
} from "@/lib/messenger";
import { useOrders } from "@/components/orders/OrderProvider";
import { calculateOrderTotals } from "@/lib/fees";
import { businessById, listingById } from "@/lib/data";
import type { Order } from "@/lib/orders";

const STORAGE_KEY = "surplushub.purchase-requests.v1";

export type PurchaseRequestStatus = "Pending" | "Accepted" | "Countered" | "Rejected" | "Completed";

export type PurchaseRequest = {
  id: string;
  buyerId: string;
  listingId: string;
  listingTitle: string;
  sellerBusinessId: string;
  buyerName: string;
  quantity: number;
  unit: string;
  /** Buyer's opening price, per unit. */
  offeredPrice: number;
  message: string;
  fulfillment: string;
  preferredDate: string;
  status: PurchaseRequestStatus;
  createdAt: string;
  /** Seller's counter price, per unit. Absent until the seller counters. */
  counterUnitPrice?: number;
  /** Delivery quoted by the seller. Never part of the fee base. */
  counterDeliveryFee?: number;
  counterNote?: string;
  /**
   * Locked the moment the buyer accepts. From here the deal is priced and can no
   * longer be negotiated — the checkout and the order are built on these.
   */
  agreedUnitPrice?: number;
  agreedTotal?: number;
  orderId?: string;
};

type NewPurchaseRequest = Omit<PurchaseRequest, "buyerId" | "id" | "status" | "createdAt"> & {
  buyerId?: string;
};

export type CounterOffer = {
  unitPrice: number;
  deliveryFee: number;
  note: string;
};

type PurchaseRequestContextValue = {
  requests: PurchaseRequest[];
  addRequest: (request: NewPurchaseRequest) => PurchaseRequest;
  updateRequestStatus: (id: string, status: PurchaseRequestStatus) => void;
  counterRequest: (id: string, offer: CounterOffer) => void;
  /** Locks the agreed price and creates the order the buyer will pay for. */
  acceptQuote: (id: string) => Order | null;
  requestForListing: (listingId: string, buyerId: string) => PurchaseRequest | undefined;
};

const PurchaseRequestContext = createContext<PurchaseRequestContextValue | null>(null);

/**
 * The price a deal would settle at right now: the agreed price if locked, the
 * seller's counter if there is one, otherwise the buyer's opening offer.
 */
export const quotedUnitPrice = (request: PurchaseRequest) =>
  request.agreedUnitPrice ?? request.counterUnitPrice ?? request.offeredPrice;

export const quotedTotal = (request: PurchaseRequest) =>
  request.agreedTotal ?? quotedUnitPrice(request) * request.quantity;

export const quotedDeliveryFee = (request: PurchaseRequest) => request.counterDeliveryFee ?? 0;

/** A locked deal is done being negotiated. */
export const isQuoteLocked = (request: PurchaseRequest) => Boolean(request.orderId);

export function PurchaseRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const { createOrder } = useOrders();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setRequests(JSON.parse(stored) as PurchaseRequest[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = useCallback((next: PurchaseRequest[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Negotiation must keep working even when browser storage is unavailable.
    }
    return next;
  }, []);

  const addRequest = useCallback(
    (request: NewPurchaseRequest) => {
      const created: PurchaseRequest = {
        ...request,
        buyerId: request.buyerId || DEMO_BUYER_ID,
        id: `REQ-${Date.now()}`,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };
      setRequests((current) => persist([created, ...current]));
      addPurchaseRequestMessage({ ...created, requestId: created.id });
      return created;
    },
    [persist],
  );

  const updateRequestStatus = useCallback(
    (id: string, status: PurchaseRequestStatus) => {
      setRequests((current) =>
        persist(current.map((request) => (request.id === id ? { ...request, status } : request))),
      );
      syncPurchaseRequestMessageStatus(id, normalizeMessengerStatus(status));
    },
    [persist],
  );

  const counterRequest = useCallback(
    (id: string, offer: CounterOffer) => {
      setRequests((current) =>
        persist(
          current.map((request) =>
            request.id === id && !isQuoteLocked(request)
              ? {
                  ...request,
                  status: "Countered" as const,
                  counterUnitPrice: offer.unitPrice,
                  counterDeliveryFee: offer.deliveryFee,
                  counterNote: offer.note,
                }
              : request,
          ),
        ),
      );
      syncPurchaseRequestMessageStatus(id, "Pending");
    },
    [persist],
  );

  const acceptQuote = useCallback(
    (id: string) => {
      const request = requests.find((item) => item.id === id);
      if (!request || isQuoteLocked(request)) return null;

      const unitPrice = quotedUnitPrice(request);
      const materialPrice = unitPrice * request.quantity;
      const listing = listingById(request.listingId);
      const seller = businessById(request.sellerBusinessId);

      const order = createOrder({
        listingId: request.listingId,
        listingTitle: request.listingTitle,
        category: listing?.category ?? "other",
        buyerId: request.buyerId,
        buyerName: request.buyerName,
        sellerBusinessId: request.sellerBusinessId,
        sellerName: seller?.name ?? "SurplusHub seller",
        quantity: request.quantity,
        unit: request.unit,
        unitPrice,
        totals: calculateOrderTotals({
          materialPrice,
          deliveryFee: quotedDeliveryFee(request),
        }),
      });

      setRequests((current) =>
        persist(
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "Accepted" as const,
                  agreedUnitPrice: unitPrice,
                  agreedTotal: materialPrice,
                  orderId: order.id,
                }
              : item,
          ),
        ),
      );
      syncPurchaseRequestMessageStatus(id, "Accepted");

      return order;
    },
    [requests, createOrder, persist],
  );

  const value = useMemo<PurchaseRequestContextValue>(
    () => ({
      requests,
      addRequest,
      updateRequestStatus,
      counterRequest,
      acceptQuote,
      requestForListing: (listingId, buyerId) =>
        requests.find((request) => request.listingId === listingId && request.buyerId === buyerId),
    }),
    [requests, addRequest, updateRequestStatus, counterRequest, acceptQuote],
  );

  return (
    <PurchaseRequestContext.Provider value={value}>{children}</PurchaseRequestContext.Provider>
  );
}

function normalizeMessengerStatus(status: PurchaseRequestStatus): PurchaseMessageStatus {
  return status === "Countered" ? "Pending" : status;
}

export function usePurchaseRequests() {
  const context = useContext(PurchaseRequestContext);
  if (!context) throw new Error("usePurchaseRequests must be used inside PurchaseRequestProvider");
  return context;
}
