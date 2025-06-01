import { createClient as createServerClient } from '../server';
import type { League } from '../types';

export class LeagueQueries {
  private supabase: ReturnType<typeof createServerClient>;

  constructor() {
    this.supabase = createServerClient();
  }

  async getLeagueByCode(joinCode: string): Promise<League | null> {
    const { data, error } = await (await this.supabase)
      .from('leagues')
      .select('*')
      .eq('join_code', joinCode)
      .single();

    if (error) {
      console.error('Error fetching league by join code:', error);
      return null;
    }

    return data;
  }

  async getLeagueById(leagueId: string): Promise<League | null> {
    const { data, error } = await (await this.supabase)
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (error) {
      console.error('Error fetching league by id:', error);
      return null;
    }

    return data;
  }

  async leagueExists(joinCode: string): Promise<boolean> {
    const { data, error } = await (await this.supabase)
      .from('leagues')
      .select('id')
      .eq('join_code', joinCode)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  async createLeague(leagueData: {
    name: string;
    description?: string;
    join_code: string;
    season_start: string;
    season_end: string;
    created_by?: string;
  }): Promise<League | null> {
    const { data, error } = await (await this.supabase)
      .from('leagues')
      .insert({
        ...leagueData,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating league:', error);
      return null;
    }

    return data;
  }

  async updateLeague(leagueId: string, updates: Partial<League>): Promise<League | null> {
    const { data, error } = await (await this.supabase)
      .from('leagues')
      .update(updates)
      .eq('id', leagueId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating league:', error);
      return null;
    }

    return data;
  }

  async deleteLeague(leagueId: string): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('leagues')
      .delete()
      .eq('id', leagueId);

    if (error) {
      console.error('Error deleting league:', error);
      return false;
    }

    return true;
  }

  async getLeaguesByCreator(creatorId: string): Promise<League[]> {
    const { data, error } = await (await this.supabase)
      .from('leagues')
      .select('*')
      .eq('created_by', creatorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leagues by creator:', error);
      return [];
    }

    return data || [];
  }
} 