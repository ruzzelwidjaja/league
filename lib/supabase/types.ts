import type { Tables, TablesInsert, TablesUpdate } from './database.types';

// Use generated types as base types
export type User = Tables<'users'>;
export type League = Tables<'leagues'>;
export type LeagueMember = Tables<'league_members'>;
export type Challenge = Tables<'challenges'>;

// Insert and Update types for form handling
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;
export type LeagueInsert = TablesInsert<'leagues'>;
export type LeagueUpdate = TablesUpdate<'leagues'>;
export type LeagueMemberInsert = TablesInsert<'league_members'>;
export type LeagueMemberUpdate = TablesUpdate<'league_members'>;
export type ChallengeInsert = TablesInsert<'challenges'>;
export type ChallengeUpdate = TablesUpdate<'challenges'>;

// Custom joined types for queries with relationships
export interface LeagueMemberWithUser extends LeagueMember {
  users: Pick<User, 'email' | 'first_name' | 'last_name'>;
}

export interface LeagueMemberWithLeague extends LeagueMember {
  leagues: Pick<League, 'id' | 'name' | 'join_code'>;
}

export interface ChallengeWithUsers extends Challenge {
  challenger: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
  challenged: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
  winner?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
} 