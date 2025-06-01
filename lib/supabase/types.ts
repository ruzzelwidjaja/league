export interface User {
  id: string;
  workos_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface League {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  season_start: string; // DATE type
  season_end: string; // DATE type
  created_by: string | null; // UUID reference to users(id)
  created_at: string;
}

export interface LeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  rank: number;
  skill_tier: 'top' | 'middle' | 'bottom';
  status: 'active' | 'out_of_town' | 'inactive';
  joined_at: string;
}

export interface Challenge {
  id: string;
  league_id: string;
  challenger_id: string;
  challenged_id: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected' | 'expired';
  winner_id: string | null;
  created_at: string;
  completed_at: string | null;
}

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