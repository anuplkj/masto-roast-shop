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
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          type: Database["public"]["Enums"]["coupon_type"]
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          type: Database["public"]["Enums"]["coupon_type"]
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          type?: Database["public"]["Enums"]["coupon_type"]
          value?: number
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          qty: number
          unit_price: number
          weight: Database["public"]["Enums"]["weight_option"]
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          qty: number
          unit_price: number
          weight: Database["public"]["Enums"]["weight_option"]
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          qty?: number
          unit_price?: number
          weight?: Database["public"]["Enums"]["weight_option"]
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          customer_address: string | null
          customer_name: string
          customer_phone: string
          delivery: Database["public"]["Enums"]["delivery_method"]
          discount: number
          id: string
          notes: string | null
          payment: Database["public"]["Enums"]["payment_method"]
          shipping: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          customer_address?: string | null
          customer_name: string
          customer_phone: string
          delivery?: Database["public"]["Enums"]["delivery_method"]
          discount?: number
          id?: string
          notes?: string | null
          payment?: Database["public"]["Enums"]["payment_method"]
          shipping?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          customer_address?: string | null
          customer_name?: string
          customer_phone?: string
          delivery?: Database["public"]["Enums"]["delivery_method"]
          discount?: number
          id?: string
          notes?: string | null
          payment?: Database["public"]["Enums"]["payment_method"]
          shipping?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          price_npr: number
          product_id: string
          stock: number
          weight: Database["public"]["Enums"]["weight_option"]
        }
        Insert: {
          created_at?: string
          id?: string
          price_npr: number
          product_id: string
          stock?: number
          weight: Database["public"]["Enums"]["weight_option"]
        }
        Update: {
          created_at?: string
          id?: string
          price_npr?: number
          product_id?: string
          stock?: number
          weight?: Database["public"]["Enums"]["weight_option"]
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          brew_recommendations: string[]
          created_at: string
          description: string | null
          elevation_m: number | null
          featured: boolean
          flavor_notes: string[]
          harvest_year: number | null
          id: string
          image_url: string | null
          name: string
          origin: string | null
          process: string | null
          roast: string | null
          seo_description: string | null
          short_note: string | null
          slug: string
          sort_order: number
          updated_at: string
          variety: string | null
        }
        Insert: {
          active?: boolean
          brew_recommendations?: string[]
          created_at?: string
          description?: string | null
          elevation_m?: number | null
          featured?: boolean
          flavor_notes?: string[]
          harvest_year?: number | null
          id?: string
          image_url?: string | null
          name: string
          origin?: string | null
          process?: string | null
          roast?: string | null
          seo_description?: string | null
          short_note?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
          variety?: string | null
        }
        Update: {
          active?: boolean
          brew_recommendations?: string[]
          created_at?: string
          description?: string | null
          elevation_m?: number | null
          featured?: boolean
          flavor_notes?: string[]
          harvest_year?: number | null
          id?: string
          image_url?: string | null
          name?: string
          origin?: string | null
          process?: string | null
          roast?: string | null
          seo_description?: string | null
          short_note?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          variety?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          bank_details: string
          brand_name: string
          contact_email: string
          contact_phone: string | null
          facebook_url: string | null
          free_shipping_threshold: number
          id: number
          instagram_url: string | null
          logo_url: string | null
          notification_email: string
          pickup_address: string | null
          shipping_flat_rate: number
          updated_at: string
          whatsapp_number: string
          wholesale_whatsapp: string | null
        }
        Insert: {
          bank_details?: string
          brand_name?: string
          contact_email?: string
          contact_phone?: string | null
          facebook_url?: string | null
          free_shipping_threshold?: number
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          notification_email?: string
          pickup_address?: string | null
          shipping_flat_rate?: number
          updated_at?: string
          whatsapp_number?: string
          wholesale_whatsapp?: string | null
        }
        Update: {
          bank_details?: string
          brand_name?: string
          contact_email?: string
          contact_phone?: string | null
          facebook_url?: string | null
          free_shipping_threshold?: number
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          notification_email?: string
          pickup_address?: string | null
          shipping_flat_rate?: number
          updated_at?: string
          whatsapp_number?: string
          wholesale_whatsapp?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean
          author: string | null
          created_at: string
          id: string
          kind: string
          logo_url: string | null
          quote: string | null
          role: string | null
          sort_order: number
        }
        Insert: {
          active?: boolean
          author?: string | null
          created_at?: string
          id?: string
          kind?: string
          logo_url?: string | null
          quote?: string | null
          role?: string | null
          sort_order?: number
        }
        Update: {
          active?: boolean
          author?: string | null
          created_at?: string
          id?: string
          kind?: string
          logo_url?: string | null
          quote?: string | null
          role?: string | null
          sort_order?: number
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
      wholesale_inquiries: {
        Row: {
          business: string
          created_at: string
          id: string
          monthly_demand: string
          name: string
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["inquiry_status"]
        }
        Insert: {
          business: string
          created_at?: string
          id?: string
          monthly_demand: string
          name: string
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["inquiry_status"]
        }
        Update: {
          business?: string
          created_at?: string
          id?: string
          monthly_demand?: string
          name?: string
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
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
      app_role: "admin" | "user"
      coupon_type: "percent" | "flat"
      delivery_method: "delivery" | "pickup"
      inquiry_status: "new" | "contacted" | "closed"
      order_status: "new" | "confirmed" | "fulfilled" | "cancelled"
      payment_method: "cod" | "bank"
      weight_option: "250g" | "500g" | "1kg"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "user"],
      coupon_type: ["percent", "flat"],
      delivery_method: ["delivery", "pickup"],
      inquiry_status: ["new", "contacted", "closed"],
      order_status: ["new", "confirmed", "fulfilled", "cancelled"],
      payment_method: ["cod", "bank"],
      weight_option: ["250g", "500g", "1kg"],
    },
  },
} as const
