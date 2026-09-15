export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          audience: string | null
          colors: Json
          country: string | null
          created_at: string
          currency: string | null
          domain: string | null
          id: string
          is_active: boolean
          language: string | null
          logo_url: string | null
          market: string | null
          name: string
          positioning: string | null
          slug: string
          social: Json
          territory: string | null
          typography: Json
          updated_at: string
          voice: string | null
        }
        Insert: {
          audience?: string | null
          colors?: Json
          country?: string | null
          created_at?: string
          currency?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean
          language?: string | null
          logo_url?: string | null
          market?: string | null
          name: string
          positioning?: string | null
          slug: string
          social?: Json
          territory?: string | null
          typography?: Json
          updated_at?: string
          voice?: string | null
        }
        Update: {
          audience?: string | null
          colors?: Json
          country?: string | null
          created_at?: string
          currency?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean
          language?: string | null
          logo_url?: string | null
          market?: string | null
          name?: string
          positioning?: string | null
          slug?: string
          social?: Json
          territory?: string | null
          typography?: Json
          updated_at?: string
          voice?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          category: string
          created_at: string
          details: string | null
          id: string
          key: string
          label: string
          last_checked_at: string | null
          status: Database["public"]["Enums"]["integration_status"]
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: string | null
          id?: string
          key: string
          label: string
          last_checked_at?: string | null
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: string | null
          id?: string
          key?: string
          label?: string
          last_checked_at?: string | null
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Relationships: []
      }
      product_sources: {
        Row: {
          created_at: string
          custom_packaging: boolean | null
          data_confirmed: boolean
          delivery_estimate_days_max: number | null
          delivery_estimate_days_min: number | null
          fees: number | null
          id: string
          moq: number | null
          notes: string | null
          private_label: boolean | null
          product_cost: number | null
          product_id: string
          returns_policy: string | null
          shipping_cost: number | null
          shipping_method: string | null
          stock: number | null
          stock_location: string | null
          supplier_id: string
          supplier_sku: string | null
          supplier_url: string | null
          tracking_available: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_packaging?: boolean | null
          data_confirmed?: boolean
          delivery_estimate_days_max?: number | null
          delivery_estimate_days_min?: number | null
          fees?: number | null
          id?: string
          moq?: number | null
          notes?: string | null
          private_label?: boolean | null
          product_cost?: number | null
          product_id: string
          returns_policy?: string | null
          shipping_cost?: number | null
          shipping_method?: string | null
          stock?: number | null
          stock_location?: string | null
          supplier_id: string
          supplier_sku?: string | null
          supplier_url?: string | null
          tracking_available?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_packaging?: boolean | null
          data_confirmed?: boolean
          delivery_estimate_days_max?: number | null
          delivery_estimate_days_min?: number | null
          fees?: number | null
          id?: string
          moq?: number | null
          notes?: string | null
          private_label?: boolean | null
          product_cost?: number | null
          product_id?: string
          returns_policy?: string | null
          shipping_cost?: number | null
          shipping_method?: string | null
          stock?: number | null
          stock_location?: string | null
          supplier_id?: string
          supplier_sku?: string | null
          supplier_url?: string | null
          tracking_available?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sources_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sources_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stage_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_stage: Database["public"]["Enums"]["product_stage"] | null
          id: string
          product_id: string
          reason: string | null
          to_stage: Database["public"]["Enums"]["product_stage"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_stage?: Database["public"]["Enums"]["product_stage"] | null
          id?: string
          product_id: string
          reason?: string | null
          to_stage: Database["public"]["Enums"]["product_stage"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_stage?: Database["public"]["Enums"]["product_stage"] | null
          id?: string
          product_id?: string
          reason?: string | null
          to_stage?: Database["public"]["Enums"]["product_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "product_stage_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category: string | null
          concept: string | null
          country: string | null
          created_at: string
          currency: string
          estimated_cac: number | null
          fulfillment_cost: number | null
          id: string
          images: Json
          internal_name: string | null
          market: string | null
          name: string
          notes: string | null
          payment_fee_pct: number | null
          platform_fee_pct: number | null
          product_cost: number | null
          refund_allowance_pct: number | null
          score: number | null
          score_breakdown: Json
          shipping_cost: number | null
          slug: string
          stage: Database["public"]["Enums"]["product_stage"]
          subcategory: string | null
          suggested_price: number | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          category?: string | null
          concept?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          estimated_cac?: number | null
          fulfillment_cost?: number | null
          id?: string
          images?: Json
          internal_name?: string | null
          market?: string | null
          name: string
          notes?: string | null
          payment_fee_pct?: number | null
          platform_fee_pct?: number | null
          product_cost?: number | null
          refund_allowance_pct?: number | null
          score?: number | null
          score_breakdown?: Json
          shipping_cost?: number | null
          slug: string
          stage?: Database["public"]["Enums"]["product_stage"]
          subcategory?: string | null
          suggested_price?: number | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          category?: string | null
          concept?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          estimated_cac?: number | null
          fulfillment_cost?: number | null
          id?: string
          images?: Json
          internal_name?: string | null
          market?: string | null
          name?: string
          notes?: string | null
          payment_fee_pct?: number | null
          platform_fee_pct?: number | null
          product_cost?: number | null
          refund_allowance_pct?: number | null
          score?: number | null
          score_breakdown?: Json
          shipping_cost?: number | null
          slug?: string
          stage?: Database["public"]["Enums"]["product_stage"]
          subcategory?: string | null
          suggested_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          contact: string | null
          country: string | null
          created_at: string
          customization: boolean | null
          delivery_estimate_days_max: number | null
          delivery_estimate_days_min: number | null
          id: string
          marketplace: string | null
          name: string
          notes: string | null
          packaging: string | null
          private_label: boolean | null
          reliability_notes: string | null
          response_time_hours: number | null
          returns_policy: string | null
          shipping_method: string | null
          source: string | null
          supplier_score: number | null
          tracking_available: boolean | null
          updated_at: string
          url: string | null
          warehouse_location: string | null
        }
        Insert: {
          contact?: string | null
          country?: string | null
          created_at?: string
          customization?: boolean | null
          delivery_estimate_days_max?: number | null
          delivery_estimate_days_min?: number | null
          id?: string
          marketplace?: string | null
          name: string
          notes?: string | null
          packaging?: string | null
          private_label?: boolean | null
          reliability_notes?: string | null
          response_time_hours?: number | null
          returns_policy?: string | null
          shipping_method?: string | null
          source?: string | null
          supplier_score?: number | null
          tracking_available?: boolean | null
          updated_at?: string
          url?: string | null
          warehouse_location?: string | null
        }
        Update: {
          contact?: string | null
          country?: string | null
          created_at?: string
          customization?: boolean | null
          delivery_estimate_days_max?: number | null
          delivery_estimate_days_min?: number | null
          id?: string
          marketplace?: string | null
          name?: string
          notes?: string | null
          packaging?: string | null
          private_label?: boolean | null
          reliability_notes?: string | null
          response_time_hours?: number | null
          returns_policy?: string | null
          shipping_method?: string | null
          source?: string | null
          supplier_score?: number | null
          tracking_available?: boolean | null
          updated_at?: string
          url?: string | null
          warehouse_location?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "viewer"
      integration_status: "CONNECTED" | "NOT_CONFIGURED" | "ERROR"
      product_stage:
        | "IDEA"
        | "SOURCING"
        | "SAMPLE"
        | "CREATIVE_TEST"
        | "LANDING_TEST"
        | "PAID_TEST"
        | "VALIDATED"
        | "SCALE"
        | "KILLED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "operator", "viewer"],
      integration_status: ["CONNECTED", "NOT_CONFIGURED", "ERROR"],
      product_stage: [
        "IDEA",
        "SOURCING",
        "SAMPLE",
        "CREATIVE_TEST",
        "LANDING_TEST",
        "PAID_TEST",
        "VALIDATED",
        "SCALE",
        "KILLED",
      ],
    },
  },
} as const
