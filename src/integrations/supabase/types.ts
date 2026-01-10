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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string | null
          id: string
          invite_id: string
          organizer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invite_id: string
          organizer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invite_id?: string
          organizer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: true
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          budget: number | null
          catering: boolean | null
          created_at: string | null
          event_date: string
          event_name: string
          event_type: string
          fireworks: boolean | null
          guest_count: number
          hotel_decoration: boolean | null
          id: string
          location: string
          photography: boolean | null
          requirements: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget?: number | null
          catering?: boolean | null
          created_at?: string | null
          event_date: string
          event_name: string
          event_type: string
          fireworks?: boolean | null
          guest_count: number
          hotel_decoration?: boolean | null
          id?: string
          location: string
          photography?: boolean | null
          requirements?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget?: number | null
          catering?: boolean | null
          created_at?: string | null
          event_date?: string
          event_name?: string
          event_type?: string
          fireworks?: boolean | null
          guest_count?: number
          hotel_decoration?: boolean | null
          id?: string
          location?: string
          photography?: boolean | null
          requirements?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          organizer_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          organizer_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          organizer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_halls: {
        Row: {
          capacity: number
          created_at: string | null
          description: string | null
          hotel_id: string
          id: string
          images: string[] | null
          name: string
          price_per_event: number | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          description?: string | null
          hotel_id: string
          id?: string
          images?: string[] | null
          name: string
          price_per_event?: number | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          description?: string | null
          hotel_id?: string
          id?: string
          images?: string[] | null
          name?: string
          price_per_event?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_halls_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          hotel_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          hotel_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          hotel_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_reviews_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address: string
          city: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          video_urls: string[] | null
          map_location: string | null
          name: string
          organizer_id: string
          parking_capacity: number | null
          parking_details: string | null
          parking_images: string[] | null
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          video_urls?: string[] | null
          map_location?: string | null
          name: string
          organizer_id: string
          parking_capacity?: number | null
          parking_details?: string | null
          parking_images?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          video_urls?: string[] | null
          map_location?: string | null
          name?: string
          organizer_id?: string
          parking_capacity?: number | null
          parking_details?: string | null
          parking_images?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_bundles: {
        Row: {
          id: string
          hotel_id: string
          name: string
          chicken_dish: string
          rice_dish: string
          additional_main_dishes: string[] | null
          include_drinks: boolean | null
          include_raita: boolean | null
          include_salad: boolean | null
          include_cream_salad: boolean | null
          include_sweet_dish: boolean | null
          sweet_dish_type: string | null
          include_tea: boolean | null
          include_table_service: boolean | null
          custom_optional_items: string[] | null
          final_price: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          hotel_id: string
          name: string
          chicken_dish: string
          rice_dish: string
          additional_main_dishes?: string[] | null
          include_drinks?: boolean | null
          include_raita?: boolean | null
          include_salad?: boolean | null
          include_cream_salad?: boolean | null
          include_sweet_dish?: boolean | null
          sweet_dish_type?: string | null
          include_tea?: boolean | null
          include_table_service?: boolean | null
          custom_optional_items?: string[] | null
          final_price: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          hotel_id?: string
          name?: string
          chicken_dish?: string
          rice_dish?: string
          additional_main_dishes?: string[] | null
          include_drinks?: boolean | null
          include_raita?: boolean | null
          include_salad?: boolean | null
          include_cream_salad?: boolean | null
          include_sweet_dish?: boolean | null
          sweet_dish_type?: string | null
          include_tea?: boolean | null
          include_table_service?: boolean | null
          custom_optional_items?: string[] | null
          final_price?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_bundles_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      }
      invites: {
        Row: {
          created_at: string | null
          event_id: string
          hotel_id: string
          id: string
          message: string | null
          organizer_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          hotel_id: string
          id?: string
          message?: string | null
          organizer_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          hotel_id?: string
          id?: string
          message?: string | null
          organizer_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "user" | "organizer"
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
      app_role: ["user", "organizer"],
    },
  },
} as const
