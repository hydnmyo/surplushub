export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          initials: string;
          industry: string;
          location: string;
          verified: boolean;
          rating: number;
          transactions: number;
          since: number;
          categories: Database["public"]["Enums"]["category_id"][];
          description: string;
          contact: Json;
          hours: string;
          website: string | null;
          social_links: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          initials: string;
          industry: string;
          location: string;
          verified?: boolean;
          rating?: number;
          transactions?: number;
          since: number;
          categories?: Database["public"]["Enums"]["category_id"][];
          description: string;
          contact?: Json;
          hours: string;
          website?: string | null;
          social_links?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          initials?: string;
          industry?: string;
          location?: string;
          verified?: boolean;
          rating?: number;
          transactions?: number;
          since?: number;
          categories?: Database["public"]["Enums"]["category_id"][];
          description?: string;
          contact?: Json;
          hours?: string;
          website?: string | null;
          social_links?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "businesses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      listings: {
        Row: {
          id: string;
          title: string;
          category: Database["public"]["Enums"]["category_id"];
          material_type: Database["public"]["Enums"]["material_type"];
          condition: Database["public"]["Enums"]["condition_type"];
          composition: string;
          quantity: number;
          unit: string;
          price: number | null;
          price_unit: string;
          min_order: string;
          location: string;
          available_from: string;
          seller_id: string;
          requires_processing: boolean;
          pickup_available: boolean;
          featured: boolean;
          views: number;
          inquiries: number;
          popularity: number;
          status: Database["public"]["Enums"]["listing_status"];
          description: string;
          uses: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: Database["public"]["Enums"]["category_id"];
          material_type: Database["public"]["Enums"]["material_type"];
          condition: Database["public"]["Enums"]["condition_type"];
          composition: string;
          quantity: number;
          unit: string;
          price?: number | null;
          price_unit: string;
          min_order: string;
          location: string;
          available_from: string;
          seller_id: string;
          requires_processing?: boolean;
          pickup_available?: boolean;
          featured?: boolean;
          views?: number;
          inquiries?: number;
          popularity?: number;
          status?: Database["public"]["Enums"]["listing_status"];
          description: string;
          uses?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: Database["public"]["Enums"]["category_id"];
          material_type?: Database["public"]["Enums"]["material_type"];
          condition?: Database["public"]["Enums"]["condition_type"];
          composition?: string;
          quantity?: number;
          unit?: string;
          price?: number | null;
          price_unit?: string;
          min_order?: string;
          location?: string;
          available_from?: string;
          seller_id?: string;
          requires_processing?: boolean;
          pickup_available?: boolean;
          featured?: boolean;
          views?: number;
          inquiries?: number;
          popularity?: number;
          status?: Database["public"]["Enums"]["listing_status"];
          description?: string;
          uses?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      wanted_posts: {
        Row: {
          id: string;
          title: string;
          category: Database["public"]["Enums"]["category_id"];
          quantity: string;
          budget: string;
          budget_value: number;
          location: string;
          use: string;
          condition: string;
          required_by: string;
          buyer_name: string;
          offers_count: number;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: Database["public"]["Enums"]["category_id"];
          quantity: string;
          budget: string;
          budget_value: number;
          location: string;
          use: string;
          condition: string;
          required_by: string;
          buyer_name: string;
          offers_count?: number;
          notes: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: Database["public"]["Enums"]["category_id"];
          quantity?: string;
          budget?: string;
          budget_value?: number;
          location?: string;
          use?: string;
          condition?: string;
          required_by?: string;
          buyer_name?: string;
          offers_count?: number;
          notes?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_listing_views: {
        Args: { listing_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      category_id:
        | "textile"
        | "plastic"
        | "paper"
        | "metal"
        | "wood"
        | "glass"
        | "rubber"
        | "construction"
        | "industrial"
        | "other";
      material_type:
        | "Reusable Surplus"
        | "Production Surplus"
        | "Offcut"
        | "Excess Inventory"
        | "Recyclable Material"
        | "Scrap Material"
        | "Packaging Surplus"
        | "Unused Stock";
      condition_type:
        | "New / Unused"
        | "Like New"
        | "Good"
        | "Minor Defect"
        | "Used"
        | "Scrap / Requires Processing";
      listing_status: "Active" | "Reserved" | "Sold Out" | "Hidden";
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type CategoryId = Database["public"]["Enums"]["category_id"];
export type MaterialType = Database["public"]["Enums"]["material_type"];
export type ConditionType = Database["public"]["Enums"]["condition_type"];
export type ListingStatus = Database["public"]["Enums"]["listing_status"];
