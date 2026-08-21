import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { isDueForAutoAccept, type NewOrder, type Order } from "@/lib/orders";
import type { Database } from "@/integrations/supabase/types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];

const ORDERS_QUERY_KEY = ["orders"] as const;

function rowToOrder(row: OrderRow): Order {
  const order: Order = {
    id: row.id,
    orderNumber: row.order_number,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    category: row.category,
    buyerId: row.buyer_id,
    buyerName: row.buyer_name,
    sellerBusinessId: row.seller_business_id,
    sellerName: row.seller_name,
    quantity: Number(row.quantity),
    unit: row.unit,
    unitPrice: Number(row.unit_price),
    totals: {
      materialPrice: Number(row.material_price),
      buyerFee: Number(row.buyer_fee),
      deliveryFee: Number(row.delivery_fee),
      tax: Number(row.tax),
      buyerTotal: Number(row.buyer_total),
      sellerFee: Number(row.seller_fee),
      sellerNet: Number(row.seller_net),
      platformRevenue: Number(row.platform_revenue),
    },
    status: row.status,
    paymentStatus: row.payment_status,
    autoAccepted: row.auto_accepted,
    payoutStatus: row.payout_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (row.payment_ref) order.paymentRef = row.payment_ref;
  if (row.paid_at) order.paidAt = row.paid_at;
  if (row.delivered_at) order.deliveredAt = row.delivered_at;
  if (row.inspection_deadline) order.inspectionDeadline = row.inspection_deadline;
  if (row.accepted_at) order.acceptedAt = row.accepted_at;
  if (row.payout_ref) order.payoutRef = row.payout_ref;
  if (row.payout_at) order.payoutAt = row.payout_at;
  if (row.dispute_reason) order.disputeReason = row.dispute_reason;
  if (row.dispute_resolution) order.disputeResolution = row.dispute_resolution;
  if (row.dispute_resolved_at) order.disputeResolvedAt = row.dispute_resolved_at;
  return order;
}

function orderToInsertRow(input: NewOrder): OrderInsert {
  return {
    listing_id: input.listingId,
    listing_title: input.listingTitle,
    category: input.category,
    buyer_id: input.buyerId,
    buyer_name: input.buyerName,
    seller_business_id: input.sellerBusinessId,
    seller_name: input.sellerName,
    quantity: input.quantity,
    unit: input.unit,
    unit_price: input.unitPrice,
    material_price: input.totals.materialPrice,
    buyer_fee: input.totals.buyerFee,
    delivery_fee: input.totals.deliveryFee,
    tax: input.totals.tax,
    buyer_total: input.totals.buyerTotal,
    seller_fee: input.totals.sellerFee,
    seller_net: input.totals.sellerNet,
    platform_revenue: input.totals.platformRevenue,
  };
}

/** Partial<Order>, in the DB's column names, for updateOrder(). */
function orderChangesToUpdateRow(
  changes: Partial<Order>,
): Database["public"]["Tables"]["orders"]["Update"] {
  const row: Database["public"]["Tables"]["orders"]["Update"] = {};
  if (changes.status !== undefined) row.status = changes.status;
  if (changes.paymentStatus !== undefined) row.payment_status = changes.paymentStatus;
  if (changes.paymentRef !== undefined) row.payment_ref = changes.paymentRef;
  if (changes.paidAt !== undefined) row.paid_at = changes.paidAt;
  if (changes.deliveredAt !== undefined) row.delivered_at = changes.deliveredAt;
  if (changes.inspectionDeadline !== undefined)
    row.inspection_deadline = changes.inspectionDeadline;
  if (changes.acceptedAt !== undefined) row.accepted_at = changes.acceptedAt;
  if (changes.autoAccepted !== undefined) row.auto_accepted = changes.autoAccepted;
  if (changes.payoutStatus !== undefined) row.payout_status = changes.payoutStatus;
  if (changes.payoutRef !== undefined) row.payout_ref = changes.payoutRef;
  if (changes.payoutAt !== undefined) row.payout_at = changes.payoutAt;
  if (changes.disputeReason !== undefined) row.dispute_reason = changes.disputeReason;
  if (changes.disputeResolution !== undefined) row.dispute_resolution = changes.disputeResolution;
  if (changes.disputeResolvedAt !== undefined) row.dispute_resolved_at = changes.disputeResolvedAt;
  return row;
}

type OrderContextValue = {
  orders: Order[];
  isLoading: boolean;
  getOrder: (id: string) => Order | undefined;
  createOrder: (input: NewOrder) => Promise<Order>;
  updateOrder: (id: string, changes: Partial<Order>) => Promise<void>;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { currentUser, isReady } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    enabled: isReady && Boolean(currentUser),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(rowToOrder);
    },
  });

  // Orders are a shared, live backend now — reflect changes made by the
  // other side of a deal (seller ships, buyer accepts) without a manual
  // refresh, the same way MessengerProvider already does for chat.
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUser, queryClient]);

  // Simulates the server-side job that would auto-complete an order whose
  // inspection window passed with no buyer response. Runs client-side against
  // the shared table, same rule as before (src/lib/orders.ts isDueForAutoAccept).
  useEffect(() => {
    if (!currentUser) return;
    const sweep = async () => {
      const due = orders.filter((order) => isDueForAutoAccept(order));
      await Promise.all(
        due.map((order) =>
          supabase
            .from("orders")
            .update({
              status: "COMPLETED",
              accepted_at: order.inspectionDeadline ?? null,
              auto_accepted: true,
              payout_status: "PENDING",
            })
            .eq("id", order.id)
            .eq("status", "DELIVERED"),
        ),
      );
      if (due.length > 0) void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    };
    void sweep();
    const interval = window.setInterval(sweep, 30_000);
    return () => window.clearInterval(interval);
  }, [currentUser, orders, queryClient]);

  const createOrder = useCallback(
    async (input: NewOrder) => {
      const { data, error } = await supabase
        .from("orders")
        .insert(orderToInsertRow(input))
        .select("*")
        .single();
      if (error) throw error;
      const order = rowToOrder(data);
      queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, (current) => [order, ...(current ?? [])]);
      return order;
    },
    [queryClient],
  );

  const updateOrder = useCallback(
    async (id: string, changes: Partial<Order>) => {
      const { data, error } = await supabase
        .from("orders")
        .update(orderChangesToUpdateRow(changes))
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      const updated = rowToOrder(data);
      queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, (current) =>
        (current ?? []).map((order) => (order.id === id ? updated : order)),
      );
    },
    [queryClient],
  );

  const value = useMemo<OrderContextValue>(
    () => ({
      orders,
      isLoading,
      getOrder: (id) => orders.find((order) => order.id === id),
      createOrder,
      updateOrder,
    }),
    [orders, isLoading, createOrder, updateOrder],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used inside OrderProvider");
  return context;
}
