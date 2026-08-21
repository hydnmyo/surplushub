export type UserRole = "business" | "buyer" | "admin";

export type AuthUser = {
  /** Supabase auth.users.id (uuid). */
  id: string;
  name: string;
  role: UserRole;
  /** businesses.id (uuid), present only when role === "business". */
  businessId?: string;
  businessName?: string;
};
