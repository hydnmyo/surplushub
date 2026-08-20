export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      businesses: {
        Row: {
          categories: Database["public"]["Enums"]["category_id"][];
          contact: Json;
          created_at: string;
          description: string;
          hours: string;
          id: string;
          industry: string;
          initials: string;
          location: string;
          name: string;
          rating: number;
          since: number;
          social_links: Json;
          transactions: number;
          user_id: string;
          verified: boolean;
          website: string | null;
        };
        Insert: {
          categories?: Database["public"]["Enums"]["category_id"][];
          contact?: Json;
          created_at?: string;
          description: string;
          hours: string;
          id?: string;
          industry: string;
          initials: string;
          location: string;
          name: string;
          rating?: number;
          since: number;
          social_links?: Json;
          transactions?: number;
          user_id: string;
          verified?: boolean;
          website?: string | null;
        };
        Update: {
          categories?: Database["public"]["Enums"]["category_id"][];
          contact?: Json;
          created_at?: string;
          description?: string;
          hours?: string;
          id?: string;
          industry?: string;
          initials?: string;
          location?: string;
          name?: string;
          rating?: number;
          since?: number;
          social_links?: Json;
          transactions?: number;
          user_id?: string;
          verified?: boolean;
          website?: string | null;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          available_from: string;
          category: Database["public"]["Enums"]["category_id"];
          composition: string;
          condition: Database["public"]["Enums"]["condition_type"];
          created_at: string;
          description: string;
          featured: boolean;
          id: string;
          inquiries: number;
          location: string;
          material_type: Database["public"]["Enums"]["material_type"];
          min_order: string;
          pickup_available: boolean;
          popularity: number;
          price: number | null;
          price_unit: string;
          quantity: number;
          requires_processing: boolean;
          seller_id: string;
          status: Database["public"]["Enums"]["listing_status"];
          title: string;
          unit: string;
          uses: string[];
          views: number;
        };
        Insert: {
          available_from: string;
          category: Database["public"]["Enums"]["category_id"];
          composition: string;
          condition: Database["public"]["Enums"]["condition_type"];
          created_at?: string;
          description: string;
          featured?: boolean;
          id?: string;
          inquiries?: number;
          location: string;
          material_type: Database["public"]["Enums"]["material_type"];
          min_order: string;
          pickup_available?: boolean;
          popularity?: number;
          price?: number | null;
          price_unit: string;
          quantity: number;
          requires_processing?: boolean;
          seller_id: string;
          status?: Database["public"]["Enums"]["listing_status"];
          title: string;
          unit: string;
          uses?: string[];
          views?: number;
        };
        Update: {
          available_from?: string;
          category?: Database["public"]["Enums"]["category_id"];
          composition?: string;
          condition?: Database["public"]["Enums"]["condition_type"];
          created_at?: string;
          description?: string;
          featured?: boolean;
          id?: string;
          inquiries?: number;
          location?: string;
          material_type?: Database["public"]["Enums"]["material_type"];
          min_order?: string;
          pickup_available?: boolean;
          popularity?: number;
          price?: number | null;
          price_unit?: string;
          quantity?: number;
          requires_processing?: boolean;
          seller_id?: string;
          status?: Database["public"]["Enums"]["listing_status"];
          title?: string;
          unit?: string;
          uses?: string[];
          views?: number;
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
          budget: string;
          budget_value: number;
          buyer_name: string;
          category: Database["public"]["Enums"]["category_id"];
          condition: string;
          created_at: string;
          id: string;
          location: string;
          notes: string;
          offers_count: number;
          quantity: string;
          required_by: string;
          title: string;
          use: string;
        };
        Insert: {
          budget: string;
          budget_value: number;
          buyer_name: string;
          category: Database["public"]["Enums"]["category_id"];
          condition: string;
          created_at?: string;
          id?: string;
          location: string;
          notes: string;
          offers_count?: number;
          quantity: string;
          required_by: string;
          title: string;
          use: string;
        };
        Update: {
          budget?: string;
          budget_value?: number;
          buyer_name?: string;
          category?: Database["public"]["Enums"]["category_id"];
          condition?: string;
          created_at?: string;
          id?: string;
          location?: string;
          notes?: string;
          offers_count?: number;
          quantity?: string;
          required_by?: string;
          title?: string;
          use?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
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
      condition_type:
        | "New / Unused"
        | "Like New"
        | "Good"
        | "Minor Defect"
        | "Used"
        | "Scrap / Requires Processing";
      listing_status: "Active" | "Reserved" | "Sold Out" | "Hidden";
      material_type:
        | "Reusable Surplus"
        | "Production Surplus"
        | "Offcut"
        | "Excess Inventory"
        | "Recyclable Material"
        | "Scrap Material"
        | "Packaging Surplus"
        | "Unused Stock";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      category_id: [
        "textile",
        "plastic",
        "paper",
        "metal",
        "wood",
        "glass",
        "rubber",
        "construction",
        "industrial",
        "other",
      ],
      condition_type: [
        "New / Unused",
        "Like New",
        "Good",
        "Minor Defect",
        "Used",
        "Scrap / Requires Processing",
      ],
      listing_status: ["Active", "Reserved", "Sold Out", "Hidden"],
      material_type: [
        "Reusable Surplus",
        "Production Surplus",
        "Offcut",
        "Excess Inventory",
        "Recyclable Material",
        "Scrap Material",
        "Packaging Surplus",
        "Unused Stock",
      ],
    },
  },
} as const;
