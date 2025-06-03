// Import classes for factory functions
import { UserQueries } from './users';
import { LeagueQueries } from './leagues';
import { LeagueMemberQueries } from './league-members';
import { ChallengeQueries } from './challenges';
import { OutOfTownPeriodQueries } from './out-of-town-periods';
import { ActivityLogQueries } from './activity-logs';

// Export types
export * from '../types';

// Export classes
export { UserQueries } from './users';
export { LeagueQueries } from './leagues';
export { LeagueMemberQueries } from './league-members';
export { ChallengeQueries } from './challenges';
export { OutOfTownPeriodQueries } from './out-of-town-periods';
export { ActivityLogQueries } from './activity-logs';

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

export function createOutOfTownPeriodQueries() {
  return new OutOfTownPeriodQueries();
}

export function createActivityLogQueries() {
  return new ActivityLogQueries();
} 