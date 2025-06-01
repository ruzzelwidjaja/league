import { createClient as createServerClient } from '../server';
import type { Challenge, ChallengeWithUsers } from '../types';

export class ChallengeQueries {
  private supabase: ReturnType<typeof createServerClient>;

  constructor() {
    this.supabase = createServerClient();
  }

  async getChallengeById(challengeId: string): Promise<Challenge | null> {
    const { data, error } = await (await this.supabase)
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error) {
      console.error('Error fetching challenge by id:', error);
      return null;
    }

    return data;
  }

  async getChallengeWithUsers(challengeId: string): Promise<ChallengeWithUsers | null> {
    const { data, error } = await (await this.supabase)
      .from('challenges')
      .select(`
        *,
        challenger:challenger_id (
          id,
          first_name,
          last_name,
          email
        ),
        challenged:challenged_id (
          id,
          first_name,
          last_name,
          email
        ),
        winner:winner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', challengeId)
      .single();

    if (error) {
      console.error('Error fetching challenge with users:', error);
      return null;
    }

    return data;
  }

  async getLeagueChallenges(leagueId: string): Promise<ChallengeWithUsers[]> {
    const { data, error } = await (await this.supabase)
      .from('challenges')
      .select(`
        *,
        challenger:challenger_id (
          id,
          first_name,
          last_name,
          email
        ),
        challenged:challenged_id (
          id,
          first_name,
          last_name,
          email
        ),
        winner:winner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('league_id', leagueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching league challenges:', error);
      return [];
    }

    return data || [];
  }

  async getUserChallenges(userId: string): Promise<ChallengeWithUsers[]> {
    const { data, error } = await (await this.supabase)
      .from('challenges')
      .select(`
        *,
        challenger:challenger_id (
          id,
          first_name,
          last_name,
          email
        ),
        challenged:challenged_id (
          id,
          first_name,
          last_name,
          email
        ),
        winner:winner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user challenges:', error);
      return [];
    }

    return data || [];
  }

  async createChallenge(challengeData: {
    league_id: string;
    challenger_id: string;
    challenged_id: string;
  }): Promise<Challenge | null> {
    const { data, error } = await (await this.supabase)
      .from('challenges')
      .insert({
        ...challengeData,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      return null;
    }

    return data;
  }

  async updateChallengeStatus(
    challengeId: string,
    status: 'pending' | 'accepted' | 'completed' | 'rejected' | 'expired'
  ): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('challenges')
      .update({ status })
      .eq('id', challengeId);

    if (error) {
      console.error('Error updating challenge status:', error);
      return false;
    }

    return true;
  }

  async completeChallenge(challengeId: string, winnerId: string): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('challenges')
      .update({
        status: 'completed' as const,
        winner_id: winnerId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', challengeId);

    if (error) {
      console.error('Error completing challenge:', error);
      return false;
    }

    return true;
  }

  async deleteChallenge(challengeId: string): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('challenges')
      .delete()
      .eq('id', challengeId);

    if (error) {
      console.error('Error deleting challenge:', error);
      return false;
    }

    return true;
  }
} 