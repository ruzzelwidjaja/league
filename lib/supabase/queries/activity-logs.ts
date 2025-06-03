import { createClient as createServerClient } from '../server';
import type { ActivityLog, ActivityLogInsert } from '../types';
import { Json } from "../database.types";

export class ActivityLogQueries {
  private supabase: ReturnType<typeof createServerClient>;

  constructor() {
    this.supabase = createServerClient();
  }

  async getLeagueActivity(leagueId: string, limit = 50): Promise<ActivityLog[]> {
    const { data, error } = await (await this.supabase)
      .from('activity_logs')
      .select(`
        *,
        user:users!activity_logs_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        related_user:users!activity_logs_related_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('league_id', leagueId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching league activity:', error);
      return [];
    }

    return data || [];
  }

  async getUserActivity(userId: string, leagueId?: string, limit = 50): Promise<ActivityLog[]> {
    let query = (await this.supabase)
      .from('activity_logs')
      .select(`
        *,
        user:users!activity_logs_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        related_user:users!activity_logs_related_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .or(`user_id.eq.${userId},related_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (leagueId) {
      query = query.eq('league_id', leagueId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }

    return data || [];
  }

  async getActivityByAction(
    leagueId: string,
    action: string,
    limit = 50
  ): Promise<ActivityLog[]> {
    const { data, error } = await (await this.supabase)
      .from('activity_logs')
      .select(`
        *,
        user:users!activity_logs_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        related_user:users!activity_logs_related_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('league_id', leagueId)
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activity by action:', error);
      return [];
    }

    return data || [];
  }

  async logActivity(activityData: ActivityLogInsert): Promise<ActivityLog | null> {
    const { data, error } = await (await this.supabase)
      .from('activity_logs')
      .insert({
        ...activityData,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error logging activity:', error);
      return null;
    }

    return data;
  }

  async logChallengeSent(
    leagueId: string,
    challengerId: string,
    challengedId: string,
    metadata?: Json
  ): Promise<boolean> {
    const result = await this.logActivity({
      league_id: leagueId,
      user_id: challengerId,
      related_user_id: challengedId,
      action: 'challenge_sent',
      metadata,
    });

    return !!result;
  }

  async logChallengeAccepted(
    leagueId: string,
    challengedId: string,
    challengerId: string,
    metadata?: Json
  ): Promise<boolean> {
    const result = await this.logActivity({
      league_id: leagueId,
      user_id: challengedId,
      related_user_id: challengerId,
      action: 'challenge_accepted',
      metadata,
    });

    return !!result;
  }

  async logChallengeRejected(
    leagueId: string,
    challengedId: string,
    challengerId: string,
    metadata?: Json
  ): Promise<boolean> {
    const result = await this.logActivity({
      league_id: leagueId,
      user_id: challengedId,
      related_user_id: challengerId,
      action: 'challenge_rejected',
      metadata,
    });

    return !!result;
  }

  async logMatchCompleted(
    leagueId: string,
    winnerId: string,
    loserId: string,
    metadata?: Json
  ): Promise<boolean> {
    const result = await this.logActivity({
      league_id: leagueId,
      user_id: winnerId,
      related_user_id: loserId,
      action: 'match_completed',
      metadata,
    });

    return !!result;
  }

  async logRankSwap(
    leagueId: string,
    userId: string,
    relatedUserId: string,
    metadata?: Json
  ): Promise<boolean> {
    const result = await this.logActivity({
      league_id: leagueId,
      user_id: userId,
      related_user_id: relatedUserId,
      action: 'rank_swap',
      metadata,
    });

    return !!result;
  }

  async logUserJoinedLeague(
    leagueId: string,
    userId: string,
    metadata?: Json
  ): Promise<boolean> {
    const result = await this.logActivity({
      league_id: leagueId,
      user_id: userId,
      related_user_id: null,
      action: 'joined_league',
      metadata,
    });

    return !!result;
  }

  async logUserWentOutOfTown(
    leagueId: string,
    userId: string,
    metadata?: Json
  ): Promise<boolean> {
    const result = await this.logActivity({
      league_id: leagueId,
      user_id: userId,
      related_user_id: null,
      action: 'went_oot',
      metadata,
    });

    return !!result;
  }

  async logUserReturnedFromOutOfTown(
    leagueId: string,
    userId: string,
    metadata?: Json
  ): Promise<boolean> {
    const result = await this.logActivity({
      league_id: leagueId,
      user_id: userId,
      related_user_id: null,
      action: 'returned_from_oot',
      metadata,
    });

    return !!result;
  }
} 