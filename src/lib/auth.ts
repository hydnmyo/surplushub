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
