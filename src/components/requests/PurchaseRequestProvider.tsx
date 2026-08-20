import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "surplushub.purchase-requests.v1";

export type PurchaseRequestStatus = "Pending" | "Accepted" | "Countered" | "Declined";

export type PurchaseRequest = {
  id: string;
  listingId: string;
  listingTitle: string;
  sellerBusinessId: string;
  buyerName: string;
  quantity: number;
  unit: string;
  offeredPrice: number;
  message: string;
  fulfillment: string;
  preferredDate: string;
  status: PurchaseRequestStatus;
  createdAt: string;
};

type NewPurchaseRequest = Omit<PurchaseRequest, "id" | "status" | "createdAt">;

type PurchaseRequestContextValue = {
  requests: PurchaseRequest[];
  addRequest: (request: NewPurchaseRequest) => PurchaseRequest;
  updateRequestStatus: (id: string, status: PurchaseRequestStatus) => void;
};

const PurchaseRequestContext = createContext<PurchaseRequestContextValue | null>(null);

export function PurchaseRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setRequests(JSON.parse(stored) as PurchaseRequest[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const addRequest = useCallback((request: NewPurchaseRequest) => {
    const created: PurchaseRequest = {
      ...request,
      id: `REQ-${Date.now()}`,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    setRequests((current) => {
      const next = [created, ...current];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return created;
  }, []);

  const updateRequestStatus = useCallback((id: string, status: PurchaseRequestStatus) => {
    setRequests((current) => {
      const next = current.map((request) => (request.id === id ? { ...request, status } : request));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ requests, addRequest, updateRequestStatus }),
    [requests, addRequest, updateRequestStatus],
  );

  return <PurchaseRequestContext.Provider value={value}>{children}</PurchaseRequestContext.Provider>;
}

export function usePurchaseRequests() {
  const context = useContext(PurchaseRequestContext);
  if (!context) throw new Error("usePurchaseRequests must be used inside PurchaseRequestProvider");
  return context;
}
