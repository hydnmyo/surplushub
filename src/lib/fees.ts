/**
 * Platform fee model — the single source of truth for every price calculation.
 *
 * Seller pays a success fee, buyer pays a service fee, and the fee base is the
 * negotiated material price ONLY. Delivery and tax are passed through untouched:
 * charging a percentage on delivery would inflate the fee on heavy, low-value
 * materials, which is most of this marketplace.
 *
 * Never hardcode a percentage anywhere else — call calculateOrderTotals().
 */

export const SELLER_FEE_RATE = 0.02;
export const BUYER_FEE_RATE = 0.01;

/** MMK has no minor unit, so fees are rounded to a value people can transfer. */
export const FEE_ROUNDING_MMK = 100;

/** Below this, a percentage fee no longer covers payment processing cost. */
export const MIN_FEE_MMK = 500;

export const roundMMK = (amount: number) =>
  Math.round(amount / FEE_ROUNDING_MMK) * FEE_ROUNDING_MMK;

export interface OrderTotals {
  /** Negotiated price for the material itself. The only input fees apply to. */
  materialPrice: number;
  /** Buyer service fee (BUYER_FEE_RATE of materialPrice). */
  buyerFee: number;
  deliveryFee: number;
  tax: number;
  /** materialPrice + buyerFee + deliveryFee + tax */
  buyerTotal: number;
  /** Seller success fee (SELLER_FEE_RATE of materialPrice). */
  sellerFee: number;
  /** materialPrice - sellerFee */
  sellerNet: number;
  /** buyerFee + sellerFee */
  platformRevenue: number;
}

export interface OrderTotalsInput {
  materialPrice: number;
  deliveryFee?: number;
  tax?: number;
}

const applyFee = (materialPrice: number, rate: number) => {
  if (materialPrice <= 0) return 0;
  return Math.max(MIN_FEE_MMK, roundMMK(materialPrice * rate));
};

export function calculateOrderTotals({
  materialPrice,
  deliveryFee = 0,
  tax = 0,
}: OrderTotalsInput): OrderTotals {
  const price = Math.max(0, Math.round(materialPrice));
  const delivery = Math.max(0, Math.round(deliveryFee));
  const taxAmount = Math.max(0, Math.round(tax));

  const buyerFee = applyFee(price, BUYER_FEE_RATE);
  const sellerFee = applyFee(price, SELLER_FEE_RATE);

  return {
    materialPrice: price,
    buyerFee,
    deliveryFee: delivery,
    tax: taxAmount,
    buyerTotal: price + buyerFee + delivery + taxAmount,
    sellerFee,
    sellerNet: price - sellerFee,
    platformRevenue: buyerFee + sellerFee,
  };
}

/** Percentage labels for UI copy, e.g. "2%" — derived so they can never drift. */
export const sellerFeeLabel = `${(SELLER_FEE_RATE * 100).toFixed(0)}%`;
export const buyerFeeLabel = `${(BUYER_FEE_RATE * 100).toFixed(0)}%`;
