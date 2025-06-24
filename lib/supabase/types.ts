// Types for our Better Auth + App Schema

// Better Auth User
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  organizationName?: string | null;
  availability?: UserAvailability;
}

// League
export interface League {
  id: string;
  name: string;
  description?: string | null;
  joinCode: string;
  seasonStart: string;
  seasonEnd: string;
  createdBy?: string | null;
  createdAt?: string | null;
}

// League Member
export interface LeagueMember {
  id: string;
  leagueId?: string | null;
  userId?: string | null;
  rank: number;
  skillTier: string;
  status?: string;
  joinedAt?: string | null;
  recentRejections?: number;
  recentAcceptances?: number;
  activityWindowStart?: string | null;
  previous_rank?: number | null;
}

// Challenge
export interface Challenge {
  id: string;
  leagueId?: string | null;
  challengerId?: string | null;
  challengedId?: string | null;
  status?: string;
  winnerId?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
  acceptedAt?: string | null;
  respondedAt?: string | null;
  rejectionReason?: string | null;
  proposedSlots?: Record<string, unknown>;
  selectedSlot?: string | null;
  matchScores?: Record<string, unknown>;
  scoreSubmittedBy?: string | null;
  scoreSubmittedAt?: string | null;
}

// Activity Log
export interface ActivityLog {
  id: string;
  leagueId?: string | null;
  userId?: string | null;
  relatedUserId?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt?: string | null;
}

// Out of Town Period
export interface OutOfTownPeriod {
  id: string;
  userId?: string | null;
  leagueId?: string | null;
  startDate: string;
  endDate: string;
  createdAt?: string | null;
}

// Insert and Update types
export type UserInsert = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UserUpdate = Partial<UserInsert>;
export type LeagueInsert = Omit<League, 'id' | 'createdAt'>;
export type LeagueUpdate = Partial<LeagueInsert>;
export type LeagueMemberInsert = Omit<LeagueMember, 'id'>;
export type LeagueMemberUpdate = Partial<LeagueMemberInsert>;
export type ChallengeInsert = Omit<Challenge, 'id' | 'createdAt'>;
export type ChallengeUpdate = Partial<ChallengeInsert>;
export type OutOfTownPeriodInsert = Omit<OutOfTownPeriod, 'id' | 'createdAt'>;
export type OutOfTownPeriodUpdate = Partial<OutOfTownPeriodInsert>;
export type ActivityLogInsert = Omit<ActivityLog, 'id' | 'createdAt'>;

// Custom joined types for queries with relationships
export interface LeagueMemberWithUser extends LeagueMember {
  users: Pick<User, 'email' | 'firstName' | 'lastName'>;
}

export interface LeagueMemberWithLeague extends LeagueMember {
  leagues: Pick<League, 'id' | 'name' | 'joinCode'>;
}

export interface ChallengeWithUsers extends Challenge {
  challenger: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | null;
  challenged: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | null;
  winner?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | null;
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