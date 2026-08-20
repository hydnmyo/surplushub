import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SEED_ORDERS, type NewOrder, type Order } from "@/lib/orders";

const STORAGE_KEY = "surplushub.orders.v1";

type OrderContextValue = {
  orders: Order[];
  getOrder: (id: string) => Order | undefined;
  createOrder: (input: NewOrder) => Order;
  updateOrder: (id: string, changes: Partial<Order>) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setOrders(JSON.parse(stored) as Order[]);
    } catch {
      // Keep the seeded demo orders when browser storage is unavailable or corrupt.
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = useCallback((next: Order[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // A full or blocked storage quota must not break the transaction flow.
    }
    return next;
  }, []);

  const createOrder = useCallback(
    (input: NewOrder) => {
      const now = new Date().toISOString();
      const created: Order = {
        ...input,
        id: `ORD-${Date.now()}`,
        status: "PENDING_PAYMENT",
        paymentStatus: "UNPAID",
        payoutStatus: "NOT_ELIGIBLE",
        createdAt: now,
        updatedAt: now,
      };
      setOrders((current) => persist([created, ...current]));
      return created;
    },
    [persist],
  );

  const updateOrder = useCallback(
    (id: string, changes: Partial<Order>) => {
      setOrders((current) =>
        persist(
          current.map((order) =>
            order.id === id ? { ...order, ...changes, updatedAt: new Date().toISOString() } : order,
          ),
        ),
      );
    },
    [persist],
  );

  const value = useMemo<OrderContextValue>(
    () => ({
      orders,
      getOrder: (id) => orders.find((order) => order.id === id),
      createOrder,
      updateOrder,
    }),
    [orders, createOrder, updateOrder],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used inside OrderProvider");
  return context;
}
