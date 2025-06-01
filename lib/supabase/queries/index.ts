// Import classes for factory functions
import { UserQueries } from './users';
import { LeagueQueries } from './leagues';
import { LeagueMemberQueries } from './league-members';
import { ChallengeQueries } from './challenges';

// Export types
export * from '../types';

// Export classes
export { UserQueries } from './users';
export { LeagueQueries } from './leagues';
export { LeagueMemberQueries } from './league-members';
export { ChallengeQueries } from './challenges';

// Factory functions to create fresh instances (avoids singleton issues)
export function createUserQueries() {
  return new UserQueries();
}

export function createLeagueQueries() {
  return new LeagueQueries();
}

export function createLeagueMemberQueries() {
  return new LeagueMemberQueries();
}

export function createChallengeQueries() {
  return new ChallengeQueries();
} 