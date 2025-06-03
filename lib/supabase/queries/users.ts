import { createClient as createServerClient } from '../server';
import type { User } from '../types';

export class UserQueries {
  private supabase: ReturnType<typeof createServerClient>;

  constructor() {
    this.supabase = createServerClient();
  }

  async getUserByWorkosId(workosUserId: string): Promise<User | null> {
    const { data, error } = await (await this.supabase)
      .from('users')
      .select('*')
      .eq('workos_user_id', workosUserId)
      .single();

    if (error) {
      console.error('Error fetching user by workos_user_id:', error);
      return null;
    }

    return data;
  }

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await (await this.supabase)
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user by id:', error);
      return null;
    }

    return data;
  }

  async upsertUser(userData: {
    workos_user_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    profile_completed?: boolean;
  }): Promise<User | null> {
    const { data, error } = await (await this.supabase)
      .from('users')
      .upsert(
        userData,
        {
          onConflict: 'workos_user_id',
        }
      )
      .select('*')
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      return null;
    }

    return data;
  }

  async updateUser(workosUserId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await (await this.supabase)
      .from('users')
      .update(updates)
      .eq('workos_user_id', workosUserId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  }

  async deleteUserByWorkosId(workosUserId: string): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('users')
      .delete()
      .eq('workos_user_id', workosUserId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  }

  async completeProfile(
    workosUserId: string,
    profileData: {
      first_name: string;
      last_name: string;
      phone_number: string;
      organization_name?: string | null;
    }
  ): Promise<boolean> {
    const { error } = await (await this.supabase)
      .from('users')
      .update({
        ...profileData,
        profile_completed: true,
      })
      .eq('workos_user_id', workosUserId);

    if (error) {
      console.error('Error completing profile:', error);
      return false;
    }

    return true;
  }
} 