import { createClient as createServerClient } from '../server';
import type { LeagueMember, LeagueMemberWithUser, LeagueMemberWithLeague } from '../types';

export class LeagueMemberQueries {
  private supabase: ReturnType<typeof createServerClient>;

  constructor() {
    this.supabase = createServerClient();
  }

  async getUserLeagues(userId: string): Promise<LeagueMemberWithLeague[]> {
    const { data, error } = await (await this.supabase)
      .from('league_members')
      .select(`
        *,
        leagues (
          id,
          name,
          join_code,
          description
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user leagues:', error);
      return [];
    }

    return (data as LeagueMemberWithLeague[]) || [];
  }

  async getUserFirstLeague(userId: string): Promise<LeagueMemberWithLeague | null> {
    const { data, error } = await (await this.supabase)
      .from('league_members')
      .select(`
        *,
        leagues (
          id,
          join_code
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return data as LeagueMemberWithLeague | null;
  }

  async getLeagueMembers(leagueId: string): Promise<LeagueMemberWithUser[]> {
    const { data, error } = await (await this.supabase)
      .from('league_members')
      .select(`
        *,
        users (
          email,
          first_name,
          last_name
        )
      `)
      .eq('league_id', leagueId)
      .order('rank', { ascending: true });

    if (error) {
      console.error('Error fetching league members:', error);
      return [];
    }

    return (data as LeagueMemberWithUser[]) || [];
  }

  async isUserInLeague(userId: string, leagueId: string): Promise<boolean> {
    const { data, error } = await (await this.supabase)
      .from('league_members')
      .select('id')
      .eq('user_id', userId)
      .eq('league_id', leagueId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  async getNextRankInLeague(leagueId: string): Promise<number> {
    const { data, error } = await (await this.supabase)
      .from('league_members')
      .select('rank')
      .eq('league_id', leagueId)
      .order('rank', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return 1; // First member gets rank 1
    }

    return data.rank + 1;
  }

  async joinLeague(
    userId: string,
    leagueId: string,
    skillTier: 'top' | 'middle' | 'bottom' = 'bottom'
  ): Promise<LeagueMember | null> {
    const nextRank = await this.getNextRankInLeague(leagueId);

    const { data, error } = await (await this.supabase)
      .from('league_members')
      .insert({
        user_id: userId,
        league_id: leagueId,
        rank: nextRank,
        skill_tier: skillTier,
        status: 'active' as const,
        joined_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error joining league:', error);
      return null;
    }

    return data;
  }

  async leaveLeague(userId: string, leagueId: string): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('league_members')
      .delete()
      .eq('user_id', userId)
      .eq('league_id', leagueId);

    if (error) {
      console.error('Error leaving league:', error);
      return false;
    }

    return true;
  }

  async updateMemberRank(userId: string, leagueId: string, newRank: number): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('league_members')
      .update({
        rank: newRank,
      })
      .eq('user_id', userId)
      .eq('league_id', leagueId);

    if (error) {
      console.error('Error updating member rank:', error);
      return false;
    }

    return true;
  }

  async updateMemberSkillTier(
    userId: string,
    leagueId: string,
    skillTier: 'top' | 'middle' | 'bottom'
  ): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('league_members')
      .update({
        skill_tier: skillTier,
      })
      .eq('user_id', userId)
      .eq('league_id', leagueId);

    if (error) {
      console.error('Error updating member skill tier:', error);
      return false;
    }

    return true;
  }

  async updateMemberStatus(
    userId: string,
    leagueId: string,
    status: 'active' | 'out_of_town' | 'inactive'
  ): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('league_members')
      .update({
        status: status,
      })
      .eq('user_id', userId)
      .eq('league_id', leagueId);

    if (error) {
      console.error('Error updating member status:', error);
      return false;
    }

    return true;
  }

  async getMembershipByUserAndLeague(userId: string, leagueId: string): Promise<LeagueMember | null> {
    const { data, error } = await (await this.supabase)
      .from('league_members')
      .select('*')
      .eq('user_id', userId)
      .eq('league_id', leagueId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }
} 