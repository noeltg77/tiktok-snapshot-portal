export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          fans: number | null
          following: number | null
          heart: number | null
          id: string
          tiktok_username: string | null
          transcript: string | null
          transcription_status: string | null
          updated_at: string
          username: string | null
          video: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          fans?: number | null
          following?: number | null
          heart?: number | null
          id: string
          tiktok_username?: string | null
          transcript?: string | null
          transcription_status?: string | null
          updated_at?: string
          username?: string | null
          video?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          fans?: number | null
          following?: number | null
          heart?: number | null
          id?: string
          tiktok_username?: string | null
          transcript?: string | null
          transcription_status?: string | null
          updated_at?: string
          username?: string | null
          video?: number | null
        }
        Relationships: []
      }
      searches: {
        Row: {
          author_avatar_url: string | null
          author_name: string | null
          collect_count: number | null
          comment_count: number | null
          cover_url: string | null
          created_at: string | null
          digg_count: number | null
          hashtags: Json | null
          id: string
          original_post_date: string | null
          play_count: number | null
          search_term: string
          searched_at: string | null
          share_count: number | null
          text: string | null
          tiktok_created_at: string | null
          transcript: string | null
          transcription_status: string
          video_id: string
          video_url: string | null
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string | null
          collect_count?: number | null
          comment_count?: number | null
          cover_url?: string | null
          created_at?: string | null
          digg_count?: number | null
          hashtags?: Json | null
          id?: string
          original_post_date?: string | null
          play_count?: number | null
          search_term: string
          searched_at?: string | null
          share_count?: number | null
          text?: string | null
          tiktok_created_at?: string | null
          transcript?: string | null
          transcription_status?: string
          video_id: string
          video_url?: string | null
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string | null
          collect_count?: number | null
          comment_count?: number | null
          cover_url?: string | null
          created_at?: string | null
          digg_count?: number | null
          hashtags?: Json | null
          id?: string
          original_post_date?: string | null
          play_count?: number | null
          search_term?: string
          searched_at?: string | null
          share_count?: number | null
          text?: string | null
          tiktok_created_at?: string | null
          transcript?: string | null
          transcription_status?: string
          video_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      tiktok_posts: {
        Row: {
          collect_count: number | null
          comment_count: number | null
          cover_url: string | null
          created_at: string | null
          digg_count: number | null
          hashtags: Json | null
          id: string
          play_count: number | null
          profile_id: string
          share_count: number | null
          text: string | null
          tiktok_created_at: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          collect_count?: number | null
          comment_count?: number | null
          cover_url?: string | null
          created_at?: string | null
          digg_count?: number | null
          hashtags?: Json | null
          id: string
          play_count?: number | null
          profile_id: string
          share_count?: number | null
          text?: string | null
          tiktok_created_at?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          collect_count?: number | null
          comment_count?: number | null
          cover_url?: string | null
          created_at?: string | null
          digg_count?: number | null
          hashtags?: Json | null
          id?: string
          play_count?: number | null
          profile_id?: string
          share_count?: number | null
          text?: string | null
          tiktok_created_at?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
