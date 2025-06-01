# Centralized Supabase Queries

This directory contains a centralized data access layer for all Supabase database operations. Instead of writing raw SQL queries throughout the application, we use organized query classes that provide type-safe, reusable methods.

## Structure

```
lib/supabase/queries/
├── index.ts              # Main exports and factory functions
├── types.ts              # TypeScript interfaces for database tables
├── users.ts              # User-related queries
├── leagues.ts            # League-related queries
├── league-members.ts     # League membership queries
├── challenges.ts         # Challenge-related queries
└── README.md            # This documentation
```

## Usage

### Factory Functions (Recommended)

Use factory functions to create fresh instances and avoid singleton issues:

```typescript
import { 
  createUserQueries, 
  createLeagueQueries, 
  createLeagueMemberQueries,
  createChallengeQueries 
} from "@/lib/supabase/queries";

// In your component or API route
const userQueries = createUserQueries();
const user = await userQueries.getUserByWorkosId(workosId);
```

### Direct Class Usage

You can also import and instantiate classes directly:

```typescript
import { UserQueries } from "@/lib/supabase/queries";

const userQueries = new UserQueries();
const user = await userQueries.getUserByWorkosId(workosId);
```

## Available Query Classes

### UserQueries

Handles all user-related database operations:

- `getUserByWorkosId(workosUserId: string)` - Get user by WorkOS ID
- `getUserById(userId: string)` - Get user by database ID
- `upsertUser(userData)` - Create or update user
- `updateUser(workosUserId, updates)` - Update user fields
- `completeProfile(workosUserId, profileData)` - Mark profile as complete
- `deleteUserByWorkosId(workosUserId)` - Delete user

### LeagueQueries

Handles league-related database operations:

- `getLeagueByCode(joinCode: string)` - Get league by join code
- `getLeagueById(leagueId: string)` - Get league by ID
- `leagueExists(joinCode: string)` - Check if league exists
- `createLeague(leagueData)` - Create new league (requires season dates)
- `updateLeague(leagueId, updates)` - Update league
- `deleteLeague(leagueId)` - Delete league
- `getLeaguesByCreator(creatorId)` - Get leagues created by user

### LeagueMemberQueries

Handles league membership operations:

- `getUserLeagues(userId: string)` - Get all leagues for a user
- `getUserFirstLeague(userId: string)` - Get user's first league
- `getLeagueMembers(leagueId: string)` - Get all members of a league
- `isUserInLeague(userId, leagueId)` - Check membership
- `joinLeague(userId, leagueId, skillTier?)` - Add user to league with skill tier
- `leaveLeague(userId, leagueId)` - Remove user from league
- `updateMemberRank(userId, leagueId, newRank)` - Update member rank
- `updateMemberSkillTier(userId, leagueId, skillTier)` - Update skill tier
- `updateMemberStatus(userId, leagueId, status)` - Update member status (active/out_of_town/inactive)

### ChallengeQueries

Handles challenge operations:

- `getChallengeById(challengeId)` - Get challenge by ID
- `getChallengeWithUsers(challengeId)` - Get challenge with user details
- `getLeagueChallenges(leagueId)` - Get all challenges in a league
- `getUserChallenges(userId)` - Get all challenges for a user
- `createChallenge(challengeData)` - Create new challenge
- `updateChallengeStatus(challengeId, status)` - Update challenge status
- `completeChallenge(challengeId, winnerId)` - Mark challenge as completed
- `deleteChallenge(challengeId)` - Delete challenge

## Database Schema

The queries are built around these core tables:

- **users** - User profiles synced with WorkOS
- **leagues** - Ping pong leagues with seasons
- **league_members** - Membership with ranks, skill tiers, and status
- **challenges** - Player-to-player challenges

## Benefits

1. **Type Safety**: All queries return properly typed data
2. **Reusability**: Common queries are centralized and reusable
3. **Consistency**: Standardized error handling and logging
4. **Maintainability**: Easy to update queries in one place
5. **Testing**: Easier to mock and test individual query methods

## Migration from Direct Supabase Calls

Before (scattered throughout codebase):
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('workos_user_id', workosId)
  .single();

if (error) {
  console.error('Error:', error);
  return null;
}
```

After (centralized):
```typescript
const userQueries = createUserQueries();
const user = await userQueries.getUserByWorkosId(workosId);
```

## Error Handling

All query methods include built-in error handling and logging. Methods return:
- `null` for single record queries that fail
- `[]` (empty array) for list queries that fail  
- `false` for boolean operations that fail
- `true` for successful boolean operations

This provides consistent, predictable behavior across the application. 