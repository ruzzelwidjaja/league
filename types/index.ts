// Re-export all types from individual modules
export * from './auth';
export * from './league';
export * from './challenge';
export * from './activity';

// Common utility types
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export type ApiError = {
  error: string;
  message: string;
  statusCode: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

// Common constants
export const SKILL_TIERS = [
  "Beginner",
  "Intermediate", 
  "Advanced",
  "Expert"
] as const;

export const CHALLENGE_STATUSES = [
  "pending",
  "accepted", 
  "rejected",
  "scheduled",
  "completed",
  "cancelled"
] as const;

export const ACTIVITY_ACTIONS = [
  "user_joined_league",
  "user_left_league", 
  "challenge_created",
  "challenge_accepted",
  "challenge_rejected",
  "challenge_completed",
  "challenge_cancelled",
  "match_score_submitted",
  "rank_updated",
  "profile_updated",
  "league_created",
  "out_of_town_added",
  "out_of_town_removed",
] as const; 