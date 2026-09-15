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
      ai_runs: {
        Row: {
          confidence: string | null
          created_at: string
          created_by: string | null
          id: string
          input: Json | null
          model: string
          output: string | null
          prompt: string | null
          provider: string
          task: string
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          input?: Json | null
          model: string
          output?: string | null
          prompt?: string | null
          provider: string
          task: string
        }
        Update: {
          confidence?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          input?: Json | null
          model?: string
          output?: string | null
          prompt?: string | null
          provider?: string
          task?: string
        }
        Relationships: []
      }
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
      creatives: {
        Row: {
          ai_generated: boolean
          audience: string | null
          brand_id: string | null
          code: string | null
          concept: string | null
          created_at: string
          format: string | null
          hook: string | null
          id: string
          notes: string | null
          platform: string | null
          product_id: string | null
          script: string | null
          status: Database["public"]["Enums"]["creative_status"]
          thumbnail_url: string | null
          updated_at: string
          url: string | null
          video_url: string | null
        }
        Insert: {
          ai_generated?: boolean
          audience?: string | null
          brand_id?: string | null
          code?: string | null
          concept?: string | null
          created_at?: string
          format?: string | null
          hook?: string | null
          id?: string
          notes?: string | null
          platform?: string | null
          product_id?: string | null
          script?: string | null
          status?: Database["public"]["Enums"]["creative_status"]
          thumbnail_url?: string | null
          updated_at?: string
          url?: string | null
          video_url?: string | null
        }
        Update: {
          ai_generated?: boolean
          audience?: string | null
          brand_id?: string | null
          code?: string | null
          concept?: string | null
          created_at?: string
          format?: string | null
          hook?: string | null
          id?: string
          notes?: string | null
          platform?: string | null
          product_id?: string | null
          script?: string | null
          status?: Database["public"]["Enums"]["creative_status"]
          thumbnail_url?: string | null
          updated_at?: string
          url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creatives_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_items: {
        Row: {
          claim: string
          created_at: string
          created_by: string | null
          experiment_id: string | null
          id: string
          knowledge_entry_id: string | null
          notes: string | null
          observed_at: string | null
          product_id: string | null
          source: string
          source_url: string | null
          status: Database["public"]["Enums"]["evidence_status"]
          supplier_id: string | null
        }
        Insert: {
          claim: string
          created_at?: string
          created_by?: string | null
          experiment_id?: string | null
          id?: string
          knowledge_entry_id?: string | null
          notes?: string | null
          observed_at?: string | null
          product_id?: string | null
          source: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["evidence_status"]
          supplier_id?: string | null
        }
        Update: {
          claim?: string
          created_at?: string
          created_by?: string | null
          experiment_id?: string | null
          id?: string
          knowledge_entry_id?: string | null
          notes?: string | null
          observed_at?: string | null
          product_id?: string | null
          source?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["evidence_status"]
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_items_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_knowledge_entry_id_fkey"
            columns: ["knowledge_entry_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_metrics: {
        Row: {
          add_to_cart: number | null
          begin_checkout: number | null
          clicks: number | null
          created_at: string
          experiment_id: string
          id: string
          impressions: number | null
          metric_date: string
          page_views: number | null
          purchases: number | null
          refunds: number | null
          revenue: number | null
          source: string | null
          spend: number | null
          view_content: number | null
        }
        Insert: {
          add_to_cart?: number | null
          begin_checkout?: number | null
          clicks?: number | null
          created_at?: string
          experiment_id: string
          id?: string
          impressions?: number | null
          metric_date: string
          page_views?: number | null
          purchases?: number | null
          refunds?: number | null
          revenue?: number | null
          source?: string | null
          spend?: number | null
          view_content?: number | null
        }
        Update: {
          add_to_cart?: number | null
          begin_checkout?: number | null
          clicks?: number | null
          created_at?: string
          experiment_id?: string
          id?: string
          impressions?: number | null
          metric_date?: string
          page_views?: number | null
          purchases?: number | null
          refunds?: number | null
          revenue?: number | null
          source?: string | null
          spend?: number | null
          view_content?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_metrics_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          audience: string | null
          brand_id: string | null
          budget: number | null
          code: string | null
          created_at: string
          creative_id: string | null
          decision: string | null
          end_date: string | null
          hypothesis: string | null
          id: string
          landing_page_id: string | null
          notes: string | null
          offer: string | null
          product_id: string | null
          result: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["experiment_status"]
          traffic_source: string | null
          updated_at: string
        }
        Insert: {
          audience?: string | null
          brand_id?: string | null
          budget?: number | null
          code?: string | null
          created_at?: string
          creative_id?: string | null
          decision?: string | null
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          landing_page_id?: string | null
          notes?: string | null
          offer?: string | null
          product_id?: string | null
          result?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["experiment_status"]
          traffic_source?: string | null
          updated_at?: string
        }
        Update: {
          audience?: string | null
          brand_id?: string | null
          budget?: number | null
          code?: string | null
          created_at?: string
          creative_id?: string | null
          decision?: string | null
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          landing_page_id?: string | null
          notes?: string | null
          offer?: string | null
          product_id?: string | null
          result?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["experiment_status"]
          traffic_source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_events: {
        Row: {
          brand_id: string | null
          currency: string | null
          event_type: Database["public"]["Enums"]["funnel_event_type"]
          experiment_id: string | null
          external_id: string | null
          id: string
          landing_page_id: string | null
          occurred_at: string
          payload: Json | null
          product_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          value: number | null
        }
        Insert: {
          brand_id?: string | null
          currency?: string | null
          event_type: Database["public"]["Enums"]["funnel_event_type"]
          experiment_id?: string | null
          external_id?: string | null
          id?: string
          landing_page_id?: string | null
          occurred_at?: string
          payload?: Json | null
          product_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          value?: number | null
        }
        Update: {
          brand_id?: string | null
          currency?: string | null
          event_type?: Database["public"]["Enums"]["funnel_event_type"]
          experiment_id?: string | null
          external_id?: string | null
          id?: string
          landing_page_id?: string | null
          occurred_at?: string
          payload?: Json | null
          product_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_events_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_events_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_events_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      hooks: {
        Row: {
          ai_generated: boolean
          angle: string | null
          brand_id: string | null
          created_at: string
          id: string
          is_hypothesis: boolean
          notes: string | null
          product_id: string | null
          text: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          angle?: string | null
          brand_id?: string | null
          created_at?: string
          id?: string
          is_hypothesis?: boolean
          notes?: string | null
          product_id?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          angle?: string | null
          brand_id?: string | null
          created_at?: string
          id?: string
          is_hypothesis?: boolean
          notes?: string | null
          product_id?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hooks_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hooks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      intelligence_decisions: {
        Row: {
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string
          created_by: string | null
          decision: Database["public"]["Enums"]["intelligence_decision"]
          evidence_snapshot: Json
          experiment_id: string | null
          id: string
          next_action: string
          product_id: string | null
          risk: string | null
          unknowns: string[]
          why: string[]
        }
        Insert: {
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          created_by?: string | null
          decision: Database["public"]["Enums"]["intelligence_decision"]
          evidence_snapshot?: Json
          experiment_id?: string | null
          id?: string
          next_action: string
          product_id?: string | null
          risk?: string | null
          unknowns?: string[]
          why?: string[]
        }
        Update: {
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          created_by?: string | null
          decision?: Database["public"]["Enums"]["intelligence_decision"]
          evidence_snapshot?: Json
          experiment_id?: string | null
          id?: string
          next_action?: string
          product_id?: string | null
          risk?: string | null
          unknowns?: string[]
          why?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_decisions_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_decisions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_entries: {
        Row: {
          ai_generated: boolean
          brand_id: string | null
          category: string | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string
          evidence: string | null
          id: string
          insight: string
          next_action: string | null
          observation: string | null
          observations_count: number
          product_id: string | null
          signal: string | null
          status: Database["public"]["Enums"]["knowledge_status"]
          test_result: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          brand_id?: string | null
          category?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          evidence?: string | null
          id?: string
          insight: string
          next_action?: string | null
          observation?: string | null
          observations_count?: number
          product_id?: string | null
          signal?: string | null
          status?: Database["public"]["Enums"]["knowledge_status"]
          test_result?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          brand_id?: string | null
          category?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          evidence?: string | null
          id?: string
          insight?: string
          next_action?: string | null
          observation?: string | null
          observations_count?: number
          product_id?: string | null
          signal?: string | null
          status?: Database["public"]["Enums"]["knowledge_status"]
          test_result?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_entries_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_entries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["knowledge_status"] | null
          id: string
          knowledge_entry_id: string
          observations_count: number
          to_status: Database["public"]["Enums"]["knowledge_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["knowledge_status"] | null
          id?: string
          knowledge_entry_id: string
          observations_count?: number
          to_status: Database["public"]["Enums"]["knowledge_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["knowledge_status"] | null
          id?: string
          knowledge_entry_id?: string
          observations_count?: number
          to_status?: Database["public"]["Enums"]["knowledge_status"]
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_history_knowledge_entry_id_fkey"
            columns: ["knowledge_entry_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          blocks: Json
          brand_id: string | null
          created_at: string
          id: string
          notes: string | null
          offer: string | null
          product_id: string | null
          slug: string
          status: Database["public"]["Enums"]["landing_status"]
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          brand_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          offer?: string | null
          product_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["landing_status"]
          title: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          brand_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          offer?: string | null
          product_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["landing_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_pages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      webhook_endpoints: {
        Row: {
          created_at: string
          event_key: string
          id: string
          is_active: boolean
          last_delivery_at: string | null
          last_status: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          event_key: string
          id?: string
          is_active?: boolean
          last_delivery_at?: string | null
          last_status?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          event_key?: string
          id?: string
          is_active?: boolean
          last_delivery_at?: string | null
          last_status?: string | null
          updated_at?: string
          url?: string | null
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
      confidence_level: "VERIFIED" | "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED"
      creative_status:
        | "IDEA"
        | "SCRIPTED"
        | "PRODUCTION"
        | "LIVE"
        | "PAUSED"
        | "ARCHIVED"
      evidence_status:
        | "VERIFIED"
        | "OBSERVED"
        | "DECLARED_BY_SUPPLIER"
        | "HYPOTHESIS"
        | "ESTIMATE"
        | "AI_GENERATED"
        | "UNKNOWN"
        | "INSUFFICIENT_DATA"
      experiment_status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED"
      funnel_event_type:
        | "PAGE_VIEW"
        | "VIEW_CONTENT"
        | "ADD_TO_CART"
        | "BEGIN_CHECKOUT"
        | "PURCHASE"
        | "REFUND"
        | "LEAD"
        | "EMAIL_SIGNUP"
        | "COUPON"
        | "UPSELL"
      integration_status: "CONNECTED" | "NOT_CONFIGURED" | "ERROR"
      intelligence_decision:
        | "CONTINUE_TESTING"
        | "SCALE"
        | "REWORK_OFFER"
        | "CHANGE_CREATIVE"
        | "CHANGE_AUDIENCE"
        | "CHANGE_LANDING"
        | "CHANGE_SUPPLIER"
        | "VERIFY_DATA"
        | "WAIT_FOR_MORE_DATA"
        | "KILL"
      knowledge_status: "HYPOTHESIS" | "SUPPORTED" | "CONSOLIDATED" | "REJECTED"
      landing_status: "DRAFT" | "LIVE" | "ARCHIVED"
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
      confidence_level: ["VERIFIED", "HIGH", "MEDIUM", "LOW", "UNVERIFIED"],
      creative_status: [
        "IDEA",
        "SCRIPTED",
        "PRODUCTION",
        "LIVE",
        "PAUSED",
        "ARCHIVED",
      ],
      evidence_status: [
        "VERIFIED",
        "OBSERVED",
        "DECLARED_BY_SUPPLIER",
        "HYPOTHESIS",
        "ESTIMATE",
        "AI_GENERATED",
        "UNKNOWN",
        "INSUFFICIENT_DATA",
      ],
      experiment_status: ["DRAFT", "RUNNING", "PAUSED", "COMPLETED"],
      funnel_event_type: [
        "PAGE_VIEW",
        "VIEW_CONTENT",
        "ADD_TO_CART",
        "BEGIN_CHECKOUT",
        "PURCHASE",
        "REFUND",
        "LEAD",
        "EMAIL_SIGNUP",
        "COUPON",
        "UPSELL",
      ],
      integration_status: ["CONNECTED", "NOT_CONFIGURED", "ERROR"],
      intelligence_decision: [
        "CONTINUE_TESTING",
        "SCALE",
        "REWORK_OFFER",
        "CHANGE_CREATIVE",
        "CHANGE_AUDIENCE",
        "CHANGE_LANDING",
        "CHANGE_SUPPLIER",
        "VERIFY_DATA",
        "WAIT_FOR_MORE_DATA",
        "KILL",
      ],
      knowledge_status: ["HYPOTHESIS", "SUPPORTED", "CONSOLIDATED", "REJECTED"],
      landing_status: ["DRAFT", "LIVE", "ARCHIVED"],
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
