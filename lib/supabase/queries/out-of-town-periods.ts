import { createClient as createServerClient } from '../server';
import type { OutOfTownPeriod, OutOfTownPeriodInsert } from '../types';

export class OutOfTownPeriodQueries {
  private supabase: ReturnType<typeof createServerClient>;

  constructor() {
    this.supabase = createServerClient();
  }

  async getUserOutOfTownPeriods(userId: string, leagueId?: string): Promise<OutOfTownPeriod[]> {
    let query = (await this.supabase)
      .from('out_of_town_periods')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (leagueId) {
      query = query.eq('league_id', leagueId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user out of town periods:', error);
      return [];
    }

    return data || [];
  }

  async getLeagueOutOfTownPeriods(leagueId: string): Promise<OutOfTownPeriod[]> {
    const { data, error } = await (await this.supabase)
      .from('out_of_town_periods')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('league_id', leagueId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching league out of town periods:', error);
      return [];
    }

    return data || [];
  }

  async getCurrentOutOfTownUsers(leagueId: string): Promise<OutOfTownPeriod[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const { data, error } = await (await this.supabase)
      .from('out_of_town_periods')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('league_id', leagueId)
      .lte('start_date', today)
      .gte('end_date', today);

    if (error) {
      console.error('Error fetching current out of town users:', error);
      return [];
    }

    return data || [];
  }

  async isUserOutOfTown(userId: string, leagueId: string, date?: string): Promise<boolean> {
    const checkDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await (await this.supabase)
      .from('out_of_town_periods')
      .select('id')
      .eq('user_id', userId)
      .eq('league_id', leagueId)
      .lte('start_date', checkDate)
      .gte('end_date', checkDate)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  async createOutOfTownPeriod(periodData: OutOfTownPeriodInsert): Promise<OutOfTownPeriod | null> {
    const { data, error } = await (await this.supabase)
      .from('out_of_town_periods')
      .insert({
        ...periodData,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating out of town period:', error);
      return null;
    }

    return data;
  }

  async updateOutOfTownPeriod(
    periodId: string,
    updates: { start_date?: string; end_date?: string }
  ): Promise<OutOfTownPeriod | null> {
    const { data, error } = await (await this.supabase)
      .from('out_of_town_periods')
      .update(updates)
      .eq('id', periodId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating out of town period:', error);
      return null;
    }

    return data;
  }

  async deleteOutOfTownPeriod(periodId: string): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('out_of_town_periods')
      .delete()
      .eq('id', periodId);

    if (error) {
      console.error('Error deleting out of town period:', error);
      return false;
    }

    return true;
  }
} 