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
      admin_profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          config: Json | null
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          label: string | null
        }
        Insert: {
          config?: Json | null
          content: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          label?: string | null
        }
        Update: {
          config?: Json | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          label?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          lead_id: string | null
          recipient: string
          status: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          lead_id?: string | null
          recipient: string
          status: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          lead_id?: string | null
          recipient?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_settings: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          birth_date: string | null
          cpf: string | null
          created_at: string
          credit: string | null
          form_type: string | null
          has_lance: string | null
          id: string
          income: string | null
          installment: string | null
          knows_consortium: string | null
          months: string | null
          name: string
          notification_log: Json | null
          objective: string | null
          phone: string
          source: string | null
          status: string | null
          traffic_source: string | null
          updated_at: string
          urgency: string | null
        }
        Insert: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          credit?: string | null
          form_type?: string | null
          has_lance?: string | null
          id?: string
          income?: string | null
          installment?: string | null
          knows_consortium?: string | null
          months?: string | null
          name: string
          notification_log?: Json | null
          objective?: string | null
          phone: string
          source?: string | null
          status?: string | null
          traffic_source?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          credit?: string | null
          form_type?: string | null
          has_lance?: string | null
          id?: string
          income?: string | null
          installment?: string | null
          knows_consortium?: string | null
          months?: string | null
          name?: string
          notification_log?: Json | null
          objective?: string | null
          phone?: string
          source?: string | null
          status?: string | null
          traffic_source?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          brand: Json
          contact: Json
          created_at: string | null
          form_fields: Json | null
          id: string
          page: Json
          scripts: Json
          section_order: Json
          sections: Json
          seo: Json
          singleton_key: string
          social: Json
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          brand?: Json
          contact?: Json
          created_at?: string | null
          form_fields?: Json | null
          id?: string
          page?: Json
          scripts?: Json
          section_order?: Json
          sections?: Json
          seo?: Json
          singleton_key?: string
          social?: Json
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: Json
          contact?: Json
          created_at?: string | null
          form_fields?: Json | null
          id?: string
          page?: Json
          scripts?: Json
          section_order?: Json
          sections?: Json
          seo?: Json
          singleton_key?: string
          social?: Json
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          published_at: string | null
          status: string
          updated_at: string | null
          version: number
        }
        Insert: {
          content?: Json
          created_at?: string | null
          id?: string
          published_at?: string | null
          status: string
          updated_at?: string | null
          version?: number
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          published_at?: string | null
          status?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
