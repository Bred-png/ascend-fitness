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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          description: string
          sort_order: number
          title: string
          xp_reward: number
        }
        Insert: {
          code: string
          description: string
          sort_order?: number
          title: string
          xp_reward?: number
        }
        Update: {
          code?: string
          description?: string
          sort_order?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      app_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      body_metrics: {
        Row: {
          arm_cm: number | null
          chest_cm: number | null
          created_at: string
          id: string
          measured_on: string
          notes: string | null
          thigh_cm: number | null
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          id?: string
          measured_on?: string
          notes?: string | null
          thigh_cm?: number | null
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          id?: string
          measured_on?: string
          notes?: string | null
          thigh_cm?: number | null
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      coach_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      mental_goals: {
        Row: {
          archived: boolean
          category: string
          created_at: string
          id: string
          milestone_target: number | null
          name: string
          per_week: number
          target_date: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean
          category?: string
          created_at?: string
          id?: string
          milestone_target?: number | null
          name: string
          per_week?: number
          target_date?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean
          category?: string
          created_at?: string
          id?: string
          milestone_target?: number | null
          name?: string
          per_week?: number
          target_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mental_logs: {
        Row: {
          created_at: string
          for_date: string
          goal_id: string
          id: string
          minutes: number | null
          note: string | null
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          for_date?: string
          goal_id: string
          id?: string
          minutes?: number | null
          note?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          for_date?: string
          goal_id?: string
          id?: string
          minutes?: number | null
          note?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "mental_logs_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "mental_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          calories: number
          carbs_g: number
          fat_g: number
          for_date: string
          id: string
          protein_g: number
          updated_at: string
          user_id: string
          water_ml: number
        }
        Insert: {
          calories?: number
          carbs_g?: number
          fat_g?: number
          for_date?: string
          id?: string
          protein_g?: number
          updated_at?: string
          user_id: string
          water_ml?: number
        }
        Update: {
          calories?: number
          carbs_g?: number
          fat_g?: number
          for_date?: string
          id?: string
          protein_g?: number
          updated_at?: string
          user_id?: string
          water_ml?: number
        }
        Relationships: []
      }
      nutrition_targets: {
        Row: {
          calories: number
          carbs_g: number
          fat_g: number
          manual: boolean
          protein_g: number
          updated_at: string
          user_id: string
          water_ml: number
        }
        Insert: {
          calories?: number
          carbs_g?: number
          fat_g?: number
          manual?: boolean
          protein_g?: number
          updated_at?: string
          user_id: string
          water_ml?: number
        }
        Update: {
          calories?: number
          carbs_g?: number
          fat_g?: number
          manual?: boolean
          protein_g?: number
          updated_at?: string
          user_id?: string
          water_ml?: number
        }
        Relationships: []
      }
      physique_analyses: {
        Row: {
          bodyfat_range: string | null
          created_at: string
          current_photo_id: string | null
          development: Json
          id: string
          priorities: string[]
          summary: string | null
          target_photo_id: string | null
          user_id: string
        }
        Insert: {
          bodyfat_range?: string | null
          created_at?: string
          current_photo_id?: string | null
          development?: Json
          id?: string
          priorities?: string[]
          summary?: string | null
          target_photo_id?: string | null
          user_id: string
        }
        Update: {
          bodyfat_range?: string | null
          created_at?: string
          current_photo_id?: string | null
          development?: Json
          id?: string
          priorities?: string[]
          summary?: string | null
          target_photo_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "physique_analyses_current_photo_id_fkey"
            columns: ["current_photo_id"]
            isOneToOne: false
            referencedRelation: "physique_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physique_analyses_target_photo_id_fkey"
            columns: ["target_photo_id"]
            isOneToOne: false
            referencedRelation: "physique_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      physique_photos: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["photo_kind"]
          storage_path: string
          taken_on: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["photo_kind"]
          storage_path: string
          taken_on?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["photo_kind"]
          storage_path?: string
          taken_on?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_days: {
        Row: {
          cardio: string | null
          day_index: number
          est_minutes: number
          focus: string | null
          id: string
          is_rest: boolean
          plan_id: string
          title: string
          user_id: string
        }
        Insert: {
          cardio?: string | null
          day_index: number
          est_minutes?: number
          focus?: string | null
          id?: string
          is_rest?: boolean
          plan_id: string
          title: string
          user_id: string
        }
        Update: {
          cardio?: string | null
          day_index?: number
          est_minutes?: number
          focus?: string | null
          id?: string
          is_rest?: boolean
          plan_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_exercises: {
        Row: {
          alternatives: string[]
          day_id: string
          difficulty: string | null
          id: string
          name: string
          position: number
          progression_target: string | null
          reps: string
          rest_sec: number
          sets: number
          tempo: string | null
          user_id: string
          why: string | null
        }
        Insert: {
          alternatives?: string[]
          day_id: string
          difficulty?: string | null
          id?: string
          name: string
          position?: number
          progression_target?: string | null
          reps?: string
          rest_sec?: number
          sets?: number
          tempo?: string | null
          user_id: string
          why?: string | null
        }
        Update: {
          alternatives?: string[]
          day_id?: string
          difficulty?: string | null
          id?: string
          name?: string
          position?: number
          progression_target?: string | null
          reps?: string
          rest_sec?: number
          sets?: number
          tempo?: string | null
          user_id?: string
          why?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_year: number | null
          created_at: string
          days_per_week: number
          equipment: string[]
          experience: Database["public"]["Enums"]["experience_level"]
          gender: string | null
          goal: string | null
          height_cm: number | null
          id: string
          onboarded: boolean
          onboarding_step: string
          path: Database["public"]["Enums"]["path_type"]
          session_minutes: number
          timezone: string
          updated_at: string
          username: string | null
          weight_kg: number | null
        }
        Insert: {
          birth_year?: number | null
          created_at?: string
          days_per_week?: number
          equipment?: string[]
          experience?: Database["public"]["Enums"]["experience_level"]
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id: string
          onboarded?: boolean
          onboarding_step?: string
          path?: Database["public"]["Enums"]["path_type"]
          session_minutes?: number
          timezone?: string
          updated_at?: string
          username?: string | null
          weight_kg?: number | null
        }
        Update: {
          birth_year?: number | null
          created_at?: string
          days_per_week?: number
          equipment?: string[]
          experience?: Database["public"]["Enums"]["experience_level"]
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          onboarded?: boolean
          onboarding_step?: string
          path?: Database["public"]["Enums"]["path_type"]
          session_minutes?: number
          timezone?: string
          updated_at?: string
          username?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      progression: {
        Row: {
          body_xp: number
          current_streak: number
          discipline: number
          endurance: number
          last_active_date: string | null
          longest_streak: number
          mind_xp: number
          mobility: number
          physique: number
          power: number
          rank_level: number
          rank_tier: number
          speed: number
          strength: number
          total_workouts: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          body_xp?: number
          current_streak?: number
          discipline?: number
          endurance?: number
          last_active_date?: string | null
          longest_streak?: number
          mind_xp?: number
          mobility?: number
          physique?: number
          power?: number
          rank_level?: number
          rank_tier?: number
          speed?: number
          strength?: number
          total_workouts?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          body_xp?: number
          current_streak?: number
          discipline?: number
          endurance?: number
          last_active_date?: string | null
          longest_streak?: number
          mind_xp?: number
          mobility?: number
          physique?: number
          power?: number
          rank_level?: number
          rank_tier?: number
          speed?: number
          strength?: number
          total_workouts?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quests: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          expires_on: string | null
          for_date: string
          id: string
          kind: Database["public"]["Enums"]["quest_kind"]
          stat_reward: string | null
          target_label: string | null
          title: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_on?: string | null
          for_date?: string
          id?: string
          kind?: Database["public"]["Enums"]["quest_kind"]
          stat_reward?: string | null
          target_label?: string | null
          title: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_on?: string | null
          for_date?: string
          id?: string
          kind?: Database["public"]["Enums"]["quest_kind"]
          stat_reward?: string | null
          target_label?: string | null
          title?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      research_sources: {
        Row: {
          citation: string
          claim: string
          id: string
          organisation: string | null
          sort_order: number
          topic: string
          url: string | null
          year: number | null
        }
        Insert: {
          citation: string
          claim: string
          id?: string
          organisation?: string | null
          sort_order?: number
          topic: string
          url?: string | null
          year?: number | null
        }
        Update: {
          citation?: string
          claim?: string
          id?: string
          organisation?: string | null
          sort_order?: number
          topic?: string
          url?: string | null
          year?: number | null
        }
        Relationships: []
      }
      set_logs: {
        Row: {
          created_at: string
          exercise_name: string
          id: string
          reps: number | null
          rpe: number | null
          session_id: string
          set_index: number
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          exercise_name: string
          id?: string
          reps?: number | null
          rpe?: number | null
          session_id: string
          set_index?: number
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          exercise_name?: string
          id?: string
          reps?: number | null
          rpe?: number | null
          session_id?: string
          set_index?: number
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          active: boolean
          created_at: string
          id: string
          rationale: string | null
          title: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          rationale?: string | null
          title?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          rationale?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          code: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          code: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["code"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      workout_sessions: {
        Row: {
          completed: boolean
          created_at: string
          day_id: string | null
          difficulty: number | null
          duration_min: number | null
          id: string
          notes: string | null
          performed_on: string
          title: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          day_id?: string | null
          difficulty?: number | null
          duration_min?: number | null
          id?: string
          notes?: string | null
          performed_on?: string
          title: string
          user_id: string
          xp_awarded?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          day_id?: string | null
          difficulty?: number | null
          duration_min?: number | null
          id?: string
          notes?: string | null
          performed_on?: string
          title?: string
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          amount: number
          channel: string
          created_at: string
          for_date: string
          id: string
          source: string
          source_key: string | null
          user_id: string
        }
        Insert: {
          amount: number
          channel?: string
          created_at?: string
          for_date?: string
          id?: string
          source: string
          source_key?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          channel?: string
          created_at?: string
          for_date?: string
          id?: string
          source?: string
          source_key?: string | null
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
      app_role: "admin" | "user"
      experience_level: "beginner" | "intermediate" | "advanced"
      path_type: "hero" | "villain"
      photo_kind: "current" | "target" | "progress"
      quest_kind: "daily" | "main" | "boss"
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
      experience_level: ["beginner", "intermediate", "advanced"],
      path_type: ["hero", "villain"],
      photo_kind: ["current", "target", "progress"],
      quest_kind: ["daily", "main", "boss"],
    },
  },
} as const
