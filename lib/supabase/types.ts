import type { Tables, TablesInsert, TablesUpdate } from './database.types';

// Use generated types as base types
export type User = Tables<'users'>;
export type League = Tables<'leagues'>;
export type LeagueMember = Tables<'league_members'>;
export type Challenge = Tables<'challenges'>;
export type OutOfTownPeriod = Tables<'out_of_town_periods'>;
export type ActivityLog = Tables<'activity_logs'>;

// Insert and Update types for form handling
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;
export type LeagueInsert = TablesInsert<'leagues'>;
export type LeagueUpdate = TablesUpdate<'leagues'>;
export type LeagueMemberInsert = TablesInsert<'league_members'>;
export type LeagueMemberUpdate = TablesUpdate<'league_members'>;
export type ChallengeInsert = TablesInsert<'challenges'>;
export type ChallengeUpdate = TablesUpdate<'challenges'>;
export type OutOfTownPeriodInsert = TablesInsert<'out_of_town_periods'>;
export type OutOfTownPeriodUpdate = TablesUpdate<'out_of_town_periods'>;
export type ActivityLogInsert = TablesInsert<'activity_logs'>;

// Custom joined types for queries with relationships
export interface LeagueMemberWithUser extends LeagueMember {
  users: Pick<User, 'email' | 'first_name' | 'last_name'>;
}

export interface LeagueMemberWithLeague extends LeagueMember {
  leagues: Pick<League, 'id' | 'name' | 'join_code'>;
}

export interface ChallengeWithUsers extends Challenge {
  challenger: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'> | null;
  challenged: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'> | null;
  winner?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'> | null;
}

// User availability schedule type for the availability JSONB column
export interface UserAvailability {
  monday?: {
    lunch?: boolean;
    after_work?: boolean;
  };
  tuesday?: {
    lunch?: boolean;
    after_work?: boolean;
  };
  wednesday?: {
    lunch?: boolean;
    after_work?: boolean;
  };
  thursday?: {
    lunch?: boolean;
    after_work?: boolean;
  };
  friday?: {
    lunch?: boolean;
    after_work?: boolean;
  };
} 