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
      ai_council_state: {
        Row: {
          decision_eta_seconds: number
          heat_level: string
          id: string
          motion_no: number
          motion_text: string
          split_a: number
          split_b: number
          updated_at: string
        }
        Insert: {
          decision_eta_seconds?: number
          heat_level?: string
          id?: string
          motion_no?: number
          motion_text?: string
          split_a?: number
          split_b?: number
          updated_at?: string
        }
        Update: {
          decision_eta_seconds?: number
          heat_level?: string
          id?: string
          motion_no?: number
          motion_text?: string
          split_a?: number
          split_b?: number
          updated_at?: string
        }
        Relationships: []
      }
      camp_choices: {
        Row: {
          camp: string
          created_at: string
          id: string
          visitor_id: string
        }
        Insert: {
          camp: string
          created_at?: string
          id?: string
          visitor_id: string
        }
        Update: {
          camp?: string
          created_at?: string
          id?: string
          visitor_id?: string
        }
        Relationships: []
      }
      case_argument_votes: {
        Row: {
          argument_key: string
          case_id: string
          created_at: string
          id: string
          updated_at: string
          visitor_id: string
          vote: string
        }
        Insert: {
          argument_key: string
          case_id: string
          created_at?: string
          id?: string
          updated_at?: string
          visitor_id: string
          vote: string
        }
        Update: {
          argument_key?: string
          case_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          visitor_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_argument_votes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_arguments: {
        Row: {
          argument_key: string
          case_id: string
          created_at: string
          id: string
          text: string
        }
        Insert: {
          argument_key: string
          case_id: string
          created_at?: string
          id?: string
          text: string
        }
        Update: {
          argument_key?: string
          case_id?: string
          created_at?: string
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_arguments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_completions: {
        Row: {
          case_id: string
          first_completed_at: string
          id: string
          visitor_id: string
        }
        Insert: {
          case_id: string
          first_completed_at?: string
          id?: string
          visitor_id: string
        }
        Update: {
          case_id?: string
          first_completed_at?: string
          id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_completions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_stats_seed: {
        Row: {
          base_participants: number
          base_split_a: number
          case_id: string
          drift_per_min: number
          updated_at: string
        }
        Insert: {
          base_participants?: number
          base_split_a?: number
          case_id: string
          drift_per_min?: number
          updated_at?: string
        }
        Update: {
          base_participants?: number
          base_split_a?: number
          case_id?: string
          drift_per_min?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_stats_seed_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_votes: {
        Row: {
          case_id: string
          choice: string
          created_at: string
          id: string
          updated_at: string
          visitor_id: string
        }
        Insert: {
          case_id: string
          choice: string
          created_at?: string
          id?: string
          updated_at?: string
          visitor_id: string
        }
        Update: {
          case_id?: string
          choice?: string
          created_at?: string
          id?: string
          updated_at?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_votes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_no: string
          created_at: string
          id: string
          option_a_label: string
          option_b_label: string
          prompt: string
          season: number
          status: string
          title: string
        }
        Insert: {
          case_no: string
          created_at?: string
          id?: string
          option_a_label: string
          option_b_label: string
          prompt: string
          season?: number
          status?: string
          title: string
        }
        Update: {
          case_no?: string
          created_at?: string
          id?: string
          option_a_label?: string
          option_b_label?: string
          prompt?: string
          season?: number
          status?: string
          title?: string
        }
        Relationships: []
      }
      clause_votes: {
        Row: {
          clause_id: string
          created_at: string
          id: string
          visitor_id: string
          vote: string
        }
        Insert: {
          clause_id: string
          created_at?: string
          id?: string
          visitor_id: string
          vote: string
        }
        Update: {
          clause_id?: string
          created_at?: string
          id?: string
          visitor_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "clause_votes_clause_id_fkey"
            columns: ["clause_id"]
            isOneToOne: false
            referencedRelation: "clauses"
            referencedColumns: ["id"]
          },
        ]
      }
      clauses: {
        Row: {
          content: string
          created_at: string
          id: string
          status: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          status?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      daily_visits: {
        Row: {
          first_seen_at: string
          id: string
          visit_date: string
          visitor_id: string
        }
        Insert: {
          first_seen_at?: string
          id?: string
          visit_date: string
          visitor_id: string
        }
        Update: {
          first_seen_at?: string
          id?: string
          visit_date?: string
          visitor_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          clerk_unlocked: boolean
          juror_unlocked: boolean
          match_pct: number
          role: string
          streak_days: number
          trials_completed: number
          updated_at: string
          visitor_id: string
        }
        Insert: {
          clerk_unlocked?: boolean
          juror_unlocked?: boolean
          match_pct?: number
          role?: string
          streak_days?: number
          trials_completed?: number
          updated_at?: string
          visitor_id: string
        }
        Update: {
          clerk_unlocked?: boolean
          juror_unlocked?: boolean
          match_pct?: number
          role?: string
          streak_days?: number
          trials_completed?: number
          updated_at?: string
          visitor_id?: string
        }
        Relationships: []
      }
      testimonies: {
        Row: {
          case_id: string
          created_at: string
          id: string
          text: string
          visitor_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          text: string
          visitor_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          text?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonies_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      testimony_votes: {
        Row: {
          created_at: string
          id: string
          testimony_id: string
          updated_at: string
          visitor_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          id?: string
          testimony_id: string
          updated_at?: string
          visitor_id: string
          vote: string
        }
        Update: {
          created_at?: string
          id?: string
          testimony_id?: string
          updated_at?: string
          visitor_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimony_votes_testimony_id_fkey"
            columns: ["testimony_id"]
            isOneToOne: false
            referencedRelation: "testimonies"
            referencedColumns: ["id"]
          },
        ]
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
