import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addPurchaseRequestMessage, syncPurchaseRequestMessageStatus } from "@/lib/messenger";
import { useOrders } from "@/components/orders/OrderProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { calculateOrderTotals } from "@/lib/fees";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Order } from "@/lib/orders";

const REQUESTS_QUERY_KEY = ["purchase_requests"] as const;

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

type NewPurchaseRequest = Omit<PurchaseRequest, "id" | "status" | "createdAt">;

export type CounterOffer = {
  unitPrice: number;
  deliveryFee: number;
  note: string;
};

type PurchaseRequestContextValue = {
  requests: PurchaseRequest[];
  isLoading: boolean;
  addRequest: (request: NewPurchaseRequest) => Promise<PurchaseRequest>;
  updateRequestStatus: (id: string, status: PurchaseRequestStatus) => Promise<void>;
  counterRequest: (id: string, offer: CounterOffer) => Promise<void>;
  /** Locks the agreed price and creates the order the buyer will pay for. */
  acceptQuote: (id: string) => Promise<Order | null>;
  requestForListing: (listingId: string, buyerId: string) => PurchaseRequest | undefined;
};

const PurchaseRequestContext = createContext<PurchaseRequestContextValue | null>(null);

type RequestRow = Database["public"]["Tables"]["purchase_requests"]["Row"];
type RequestInsert = Database["public"]["Tables"]["purchase_requests"]["Insert"];

function rowToRequest(row: RequestRow): PurchaseRequest {
  const request: PurchaseRequest = {
    id: row.id,
    buyerId: row.buyer_id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    sellerBusinessId: row.seller_business_id,
    buyerName: row.buyer_name,
    quantity: Number(row.quantity),
    unit: row.unit,
    offeredPrice: Number(row.offered_price),
    message: row.message,
    fulfillment: row.fulfillment,
    preferredDate: row.preferred_date,
    status: row.status,
    createdAt: row.created_at,
  };
  if (row.counter_unit_price !== null) request.counterUnitPrice = Number(row.counter_unit_price);
  if (row.counter_delivery_fee !== null)
    request.counterDeliveryFee = Number(row.counter_delivery_fee);
  if (row.counter_note !== null) request.counterNote = row.counter_note;
  if (row.agreed_unit_price !== null) request.agreedUnitPrice = Number(row.agreed_unit_price);
  if (row.agreed_total !== null) request.agreedTotal = Number(row.agreed_total);
  if (row.order_id !== null) request.orderId = row.order_id;
  return request;
}

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

const safeMessengerCall = (fn: () => void) => {
  try {
    fn();
  } catch {
    // Messenger sync is a courtesy log of the negotiation, not the source of
    // truth — never let it block accepting a real price or creating an order.
  }
};

export function PurchaseRequestProvider({ children }: { children: ReactNode }) {
  const { currentUser, isReady } = useAuth();
  const { createOrder } = useOrders();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: REQUESTS_QUERY_KEY,
    enabled: isReady && Boolean(currentUser),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(rowToRequest);
    },
  });

  const addRequest = useCallback(
    async (request: NewPurchaseRequest) => {
      const insertRow: RequestInsert = {
        buyer_id: request.buyerId,
        buyer_name: request.buyerName,
        listing_id: request.listingId,
        listing_title: request.listingTitle,
        seller_business_id: request.sellerBusinessId,
        quantity: request.quantity,
        unit: request.unit,
        offered_price: request.offeredPrice,
        message: request.message,
        fulfillment: request.fulfillment,
        preferred_date: request.preferredDate,
      };
      const { data, error } = await supabase
        .from("purchase_requests")
        .insert(insertRow)
        .select("*")
        .single();
      if (error) throw error;
      const created = rowToRequest(data);
      queryClient.setQueryData<PurchaseRequest[]>(REQUESTS_QUERY_KEY, (current) => [
        created,
        ...(current ?? []),
      ]);
      safeMessengerCall(() => addPurchaseRequestMessage({ ...created, requestId: created.id }));
      return created;
    },
    [queryClient],
  );

  const updateRequestStatus = useCallback(
    async (id: string, status: PurchaseRequestStatus) => {
      const { data, error } = await supabase
        .from("purchase_requests")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      const updated = rowToRequest(data);
      queryClient.setQueryData<PurchaseRequest[]>(REQUESTS_QUERY_KEY, (current) =>
        (current ?? []).map((request) => (request.id === id ? updated : request)),
      );
      safeMessengerCall(() =>
        syncPurchaseRequestMessageStatus(id, status === "Countered" ? "Pending" : status),
      );
    },
    [queryClient],
  );

  const counterRequest = useCallback(
    async (id: string, offer: CounterOffer) => {
      const { data, error } = await supabase
        .from("purchase_requests")
        .update({
          status: "Countered",
          counter_unit_price: offer.unitPrice,
          counter_delivery_fee: offer.deliveryFee,
          counter_note: offer.note,
        })
        .eq("id", id)
        .is("order_id", null)
        .select("*")
        .single();
      if (error) throw error;
      const updated = rowToRequest(data);
      queryClient.setQueryData<PurchaseRequest[]>(REQUESTS_QUERY_KEY, (current) =>
        (current ?? []).map((request) => (request.id === id ? updated : request)),
      );
      safeMessengerCall(() => syncPurchaseRequestMessageStatus(id, "Pending"));
    },
    [queryClient],
  );

  const acceptQuote = useCallback(
    async (id: string) => {
      const request = requests.find((item) => item.id === id);
      if (!request || isQuoteLocked(request)) return null;

      const unitPrice = quotedUnitPrice(request);
      const materialPrice = unitPrice * request.quantity;

      const [{ data: listing }, { data: seller }] = await Promise.all([
        supabase.from("listings").select("category").eq("id", request.listingId).maybeSingle(),
        supabase.from("businesses").select("name").eq("id", request.sellerBusinessId).maybeSingle(),
      ]);

      const order = await createOrder({
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

      const { data, error } = await supabase
        .from("purchase_requests")
        .update({
          status: "Accepted",
          agreed_unit_price: unitPrice,
          agreed_total: materialPrice,
          order_id: order.id,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;

      const updated = rowToRequest(data);
      queryClient.setQueryData<PurchaseRequest[]>(REQUESTS_QUERY_KEY, (current) =>
        (current ?? []).map((item) => (item.id === id ? updated : item)),
      );
      safeMessengerCall(() => syncPurchaseRequestMessageStatus(id, "Accepted"));

      return order;
    },
    [requests, createOrder, queryClient],
  );

  const value = useMemo<PurchaseRequestContextValue>(
    () => ({
      requests,
      isLoading,
      addRequest,
      updateRequestStatus,
      counterRequest,
      acceptQuote,
      requestForListing: (listingId, buyerId) =>
        requests.find((request) => request.listingId === listingId && request.buyerId === buyerId),
    }),
    [requests, isLoading, addRequest, updateRequestStatus, counterRequest, acceptQuote],
  );

  return (
    <PurchaseRequestContext.Provider value={value}>{children}</PurchaseRequestContext.Provider>
  );
}

export function usePurchaseRequests() {
  const context = useContext(PurchaseRequestContext);
  if (!context) throw new Error("usePurchaseRequests must be used inside PurchaseRequestProvider");
  return context;
}
