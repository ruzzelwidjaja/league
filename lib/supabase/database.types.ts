export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          variables?: Json
          extensions?: Json
          operationName?: string
          query?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          accountId: string
          createdAt: string
          id: string
          idToken: string | null
          password: string | null
          providerId: string
          refreshToken: string | null
          refreshTokenExpiresAt: string | null
          scope: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId: string
          createdAt?: string
          id: string
          idToken?: string | null
          password?: string | null
          providerId: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId: string
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId?: string
          createdAt?: string
          id?: string
          idToken?: string | null
          password?: string | null
          providerId?: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          challengeId: string | null
          createdAt: string | null
          id: string
          leagueId: string | null
          metadata: Json | null
          relatedUserId: string | null
          userId: string | null
        }
        Insert: {
          action: string
          challengeId?: string | null
          createdAt?: string | null
          id?: string
          leagueId?: string | null
          metadata?: Json | null
          relatedUserId?: string | null
          userId?: string | null
        }
        Update: {
          action?: string
          challengeId?: string | null
          createdAt?: string | null
          id?: string
          leagueId?: string | null
          metadata?: Json | null
          relatedUserId?: string | null
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_challengeId_fkey"
            columns: ["challengeId"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_leagueId_fkey"
            columns: ["leagueId"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_relatedUserId_fkey"
            columns: ["relatedUserId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          cancelledBy: string | null
          challengedId: string | null
          challengerId: string | null
          completedAt: string | null
          createdAt: string | null
          id: string
          leagueId: string | null
          matchScores: Json | null
          proposedSlots: Json | null
          rejectionReason: string | null
          respondedAt: string | null
          scoreSubmittedAt: string | null
          scoreSubmittedBy: string | null
          selectedSlot: Json | null
          status: string | null
          winnerId: string | null
        }
        Insert: {
          cancelledBy?: string | null
          challengedId?: string | null
          challengerId?: string | null
          completedAt?: string | null
          createdAt?: string | null
          id?: string
          leagueId?: string | null
          matchScores?: Json | null
          proposedSlots?: Json | null
          rejectionReason?: string | null
          respondedAt?: string | null
          scoreSubmittedAt?: string | null
          scoreSubmittedBy?: string | null
          selectedSlot?: Json | null
          status?: string | null
          winnerId?: string | null
        }
        Update: {
          cancelledBy?: string | null
          challengedId?: string | null
          challengerId?: string | null
          completedAt?: string | null
          createdAt?: string | null
          id?: string
          leagueId?: string | null
          matchScores?: Json | null
          proposedSlots?: Json | null
          rejectionReason?: string | null
          respondedAt?: string | null
          scoreSubmittedAt?: string | null
          scoreSubmittedBy?: string | null
          selectedSlot?: Json | null
          status?: string | null
          winnerId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_cancelledBy_fkey"
            columns: ["cancelledBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_challengedId_fkey"
            columns: ["challengedId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_challengerId_fkey"
            columns: ["challengerId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_leagueId_fkey"
            columns: ["leagueId"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_scoreSubmittedBy_fkey"
            columns: ["scoreSubmittedBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_winnerId_fkey"
            columns: ["winnerId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      league_members: {
        Row: {
          activityWindowStart: string | null
          availability: Json | null
          id: string
          joinedAt: string | null
          leagueId: string | null
          ootDaysUsed: number | null
          previousRank: number | null
          rank: number
          recentAcceptances: number | null
          recentCancellations: number | null
          recentRejections: number | null
          skillTier: string
          status: string | null
          userId: string | null
        }
        Insert: {
          activityWindowStart?: string | null
          availability?: Json | null
          id?: string
          joinedAt?: string | null
          leagueId?: string | null
          ootDaysUsed?: number | null
          previousRank?: number | null
          rank: number
          recentAcceptances?: number | null
          recentCancellations?: number | null
          recentRejections?: number | null
          skillTier: string
          status?: string | null
          userId?: string | null
        }
        Update: {
          activityWindowStart?: string | null
          availability?: Json | null
          id?: string
          joinedAt?: string | null
          leagueId?: string | null
          ootDaysUsed?: number | null
          previousRank?: number | null
          rank?: number
          recentAcceptances?: number | null
          recentCancellations?: number | null
          recentRejections?: number | null
          skillTier?: string
          status?: string | null
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "league_members_leagueId_fkey"
            columns: ["leagueId"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_members_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          createdAt: string | null
          createdBy: string | null
          description: string | null
          fairRejectionThreshold: number | null
          id: string
          joinCode: string
          name: string
          seasonEnd: string
          seasonStart: string
        }
        Insert: {
          createdAt?: string | null
          createdBy?: string | null
          description?: string | null
          fairRejectionThreshold?: number | null
          id?: string
          joinCode: string
          name: string
          seasonEnd: string
          seasonStart: string
        }
        Update: {
          createdAt?: string | null
          createdBy?: string | null
          description?: string | null
          fairRejectionThreshold?: number | null
          id?: string
          joinCode?: string
          name?: string
          seasonEnd?: string
          seasonStart?: string
        }
        Relationships: [
          {
            foreignKeyName: "leagues_createdBy_fkey"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      out_of_town_periods: {
        Row: {
          createdAt: string | null
          endDate: string
          id: string
          leagueId: string | null
          userId: string | null
        }
        Insert: {
          createdAt?: string | null
          endDate: string
          id?: string
          leagueId?: string | null
          userId?: string | null
        }
        Update: {
          createdAt?: string | null
          endDate?: string
          id?: string
          leagueId?: string | null
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "out_of_town_periods_leagueId_fkey"
            columns: ["leagueId"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "out_of_town_periods_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          ipAddress: string | null
          token: string
          updatedAt: string
          userAgent: string | null
          userId: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          ipAddress?: string | null
          token: string
          updatedAt?: string
          userAgent?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          ipAddress?: string | null
          token?: string
          updatedAt?: string
          userAgent?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          createdAt: string
          email: string
          emailVerified: boolean
          firstName: string | null
          id: string
          image: string | null
          lastName: string | null
          name: string
          organizationName: string | null
          phoneNumber: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          emailVerified?: boolean
          firstName?: string | null
          id: string
          image?: string | null
          lastName?: string | null
          name: string
          organizationName?: string | null
          phoneNumber?: string | null
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          email?: string
          emailVerified?: boolean
          firstName?: string | null
          id?: string
          image?: string | null
          lastName?: string | null
          name?: string
          organizationName?: string | null
          phoneNumber?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      verification: {
        Row: {
          createdAt: string | null
          expiresAt: string
          id: string
          identifier: string
          updatedAt: string | null
          value: string
        }
        Insert: {
          createdAt?: string | null
          expiresAt: string
          id: string
          identifier: string
          updatedAt?: string | null
          value: string
        }
        Update: {
          createdAt?: string | null
          expiresAt?: string
          id?: string
          identifier?: string
          updatedAt?: string | null
          value?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

