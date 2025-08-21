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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          farmer_id: string
          id: string
          last_message: string | null
          messages: Json | null
          session_start: string | null
        }
        Insert: {
          farmer_id: string
          id?: string
          last_message?: string | null
          messages?: Json | null
          session_start?: string | null
        }
        Update: {
          farmer_id?: string
          id?: string
          last_message?: string | null
          messages?: Json | null
          session_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_gamification: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_scan_date: string | null
          scan_streak: number
          total_points: number
          total_scans: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_scan_date?: string | null
          scan_streak?: number
          total_points?: number
          total_scans?: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_scan_date?: string | null
          scan_streak?: number
          total_points?: number
          total_scans?: number
          updated_at?: string
        }
        Relationships: []
      }
      buyer_scans: {
        Row: {
          aflatoxin_detected: boolean
          buyer_id: string
          confidence_score: number
          created_at: string
          environment_condition: string | null
          id: string
          image_data: string | null
          risk_level: string
          risk_score: number
          storage_condition: string | null
          transport_condition: string | null
          updated_at: string
        }
        Insert: {
          aflatoxin_detected: boolean
          buyer_id: string
          confidence_score: number
          created_at?: string
          environment_condition?: string | null
          id?: string
          image_data?: string | null
          risk_level: string
          risk_score: number
          storage_condition?: string | null
          transport_condition?: string | null
          updated_at?: string
        }
        Update: {
          aflatoxin_detected?: boolean
          buyer_id?: string
          confidence_score?: number
          created_at?: string
          environment_condition?: string | null
          id?: string
          image_data?: string | null
          risk_level?: string
          risk_score?: number
          storage_condition?: string | null
          transport_condition?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          replies_count: number | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          replies_count?: number | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          replies_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "farmer_users"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_insights: {
        Row: {
          created_at: string | null
          farmer_id: string
          fertilization_status:
            | Database["public"]["Enums"]["health_rating"]
            | null
          id: string
          measurement_date: string | null
          notes: string | null
          pest_status: Database["public"]["Enums"]["health_rating"] | null
          recommendations: string[] | null
          soil_health: Database["public"]["Enums"]["health_rating"] | null
          water_availability:
            | Database["public"]["Enums"]["health_rating"]
            | null
        }
        Insert: {
          created_at?: string | null
          farmer_id: string
          fertilization_status?:
            | Database["public"]["Enums"]["health_rating"]
            | null
          id?: string
          measurement_date?: string | null
          notes?: string | null
          pest_status?: Database["public"]["Enums"]["health_rating"] | null
          recommendations?: string[] | null
          soil_health?: Database["public"]["Enums"]["health_rating"] | null
          water_availability?:
            | Database["public"]["Enums"]["health_rating"]
            | null
        }
        Update: {
          created_at?: string | null
          farmer_id?: string
          fertilization_status?:
            | Database["public"]["Enums"]["health_rating"]
            | null
          id?: string
          measurement_date?: string | null
          notes?: string | null
          pest_status?: Database["public"]["Enums"]["health_rating"] | null
          recommendations?: string[] | null
          soil_health?: Database["public"]["Enums"]["health_rating"] | null
          water_availability?:
            | Database["public"]["Enums"]["health_rating"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_insights_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_profiles: {
        Row: {
          created_at: string | null
          farm_size_hectares: number | null
          genotype: Database["public"]["Enums"]["genotype_category"] | null
          id: string
          location_coordinates: unknown | null
          main_crops: string[] | null
          soil_type: string | null
          updated_at: string | null
          user_id: string
          water_source: string | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          farm_size_hectares?: number | null
          genotype?: Database["public"]["Enums"]["genotype_category"] | null
          id?: string
          location_coordinates?: unknown | null
          main_crops?: string[] | null
          soil_type?: string | null
          updated_at?: string | null
          user_id: string
          water_source?: string | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          farm_size_hectares?: number | null
          genotype?: Database["public"]["Enums"]["genotype_category"] | null
          id?: string
          location_coordinates?: unknown | null
          main_crops?: string[] | null
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string
          water_source?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "farmer_users"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_users: {
        Row: {
          created_at: string
          full_name: string
          id: string
          last_login: string | null
          password_hash: string
          phone_number: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          last_login?: string | null
          password_hash: string
          phone_number: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          last_login?: string | null
          password_hash?: string
          phone_number?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "farmer_users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "farmer_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "farmer_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      government_analytics: {
        Row: {
          average_risk_score: number | null
          high_risk_scans: number | null
          month_year: string | null
          total_buyers: number | null
          total_scans: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      update_buyer_gamification: {
        Args: { buyer_id: string; points_to_add: number }
        Returns: undefined
      }
    }
    Enums: {
      genotype_category:
        | "drought_resistant"
        | "high_yield"
        | "pest_resistant"
        | "early_maturing"
        | "traditional"
      health_rating: "excellent" | "average" | "poor"
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
      genotype_category: [
        "drought_resistant",
        "high_yield",
        "pest_resistant",
        "early_maturing",
        "traditional",
      ],
      health_rating: ["excellent", "average", "poor"],
    },
  },
} as const
