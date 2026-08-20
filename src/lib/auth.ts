export type UserRole = "business" | "buyer" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  role: UserRole;
  businessId?: string;
  businessName?: string;
};

export const CURRENT_USER = {
  id: "user-green-stitch",
  businessId: "green-stitch",
  businessName: "Green Stitch Textile Co.",
  name: "Daw Khin Myat",
  role: "business",
} as const satisfies AuthUser;

/** Demo buyer account. Id matches DEMO_BUYER_ID in @/lib/messenger so seeded
 * orders and requests for that buyer show up after signing in with this account. */
export const BUYER_USER = {
  id: "buyer-yangon-craft",
  name: "Yangon Craft Collective",
  role: "buyer",
} as const satisfies AuthUser;

export const ADMIN_USER = {
  id: "user-admin",
  name: "Platform Admin",
  role: "admin",
} as const satisfies AuthUser;

/**
 * Demo sign-in only: picks an account from the email typed, since this
 * prototype has no real authentication. An email containing "admin" signs in
 * as the platform admin; "buyer" signs in as the demo buyer; anything else
 * signs in as the demo business.
 */
export function accountForEmail(email: string): AuthUser {
  const normalized = email.trim().toLowerCase();
  if (normalized.includes("admin")) return ADMIN_USER;
  if (normalized.includes("buyer")) return BUYER_USER;
  return CURRENT_USER;
}
