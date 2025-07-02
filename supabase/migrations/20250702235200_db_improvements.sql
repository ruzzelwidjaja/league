-- Database Improvements Migration
-- This migration includes multiple improvements and schema changes

-- 1. Add fairRejectionThreshold column to leagues table
ALTER TABLE "public"."leagues"
ADD COLUMN "fairRejectionThreshold" INTEGER DEFAULT 6;

-- 2. Add ootDaysUsed column to league_members table  
ALTER TABLE "public"."league_members"
ADD COLUMN "ootDaysUsed" INTEGER DEFAULT 0;

-- 3. Drop acceptedAt column from challenges table
ALTER TABLE "public"."challenges"
DROP COLUMN IF EXISTS "acceptedAt";

-- 4. Rename previous_rank to previousRank in league_members table
ALTER TABLE "public"."league_members"
RENAME COLUMN "previous_rank" TO "previousRank";

-- 5. Add challengeId column to activity_logs table
ALTER TABLE "public"."activity_logs"
ADD COLUMN "challengeId" UUID REFERENCES "public"."challenges"("id");

-- 6. Update CHECK constraints to reflect camelCase values
-- Drop existing constraints
ALTER TABLE "public"."challenges" DROP CONSTRAINT IF EXISTS "challenges_status_check";
ALTER TABLE "public"."challenges" DROP CONSTRAINT IF EXISTS "challenges_rejectionReason_check";
ALTER TABLE "public"."activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_action_check";

-- Add updated constraints with camelCase values
ALTER TABLE "public"."challenges" 
ADD CONSTRAINT "challenges_status_check" 
CHECK ("status" IN ('pending', 'accepted', 'completed', 'rejected', 'expired', 'withdrawn'));

ALTER TABLE "public"."challenges"
ADD CONSTRAINT "challenges_rejectionReason_check"
CHECK ("rejectionReason" IN ('declined', 'rankDifference'));

ALTER TABLE "public"."activity_logs"
ADD CONSTRAINT "activity_logs_action_check"
CHECK ("action" IN ('challengeSent', 'challengeAccepted', 'challengeRejected', 'challengeExpired', 'challengeWithdrawn', 'matchCompleted', 'rankSwap', 'rankPenalty', 'wentOot', 'returnedFromOot', 'joinedLeague'));

-- 9. Add relevant missing indexes for better performance
-- Index for activity_logs challengeId (new column)
CREATE INDEX "idx_activity_logs_challenge_id" ON "public"."activity_logs" ("challengeId");

-- Index for challenges by challenger and status (common query pattern)
CREATE INDEX "idx_challenges_challenger_status" ON "public"."challenges" ("challengerId", "status");

-- Index for challenges by challenged user and status  
CREATE INDEX "idx_challenges_challenged_status" ON "public"."challenges" ("challengedId", "status");

-- Index for league_members by league and status (common for leaderboard queries)
CREATE INDEX "idx_league_members_league_status" ON "public"."league_members" ("leagueId", "status");

-- Index for league_members by league and rank (for ranking queries)
CREATE INDEX "idx_league_members_league_rank" ON "public"."league_members" ("leagueId", "rank");

-- Index for challenges by league and created date (for recent challenges)
CREATE INDEX "idx_challenges_league_created" ON "public"."challenges" ("leagueId", "createdAt");

-- Index for challenges completion date (for completed challenges queries)
CREATE INDEX "idx_challenges_completed_at" ON "public"."challenges" ("completedAt") WHERE "completedAt" IS NOT NULL;

-- Index for league_members previousRank (for rank change tracking)
CREATE INDEX "idx_league_members_previous_rank" ON "public"."league_members" ("previousRank") WHERE "previousRank" IS NOT NULL;

-- Composite index for out_of_town_periods active periods
CREATE INDEX "idx_oot_periods_active" ON "public"."out_of_town_periods" ("userId", "leagueId", "startDate", "endDate");

-- Comment on new columns
COMMENT ON COLUMN "public"."leagues"."fairRejectionThreshold" IS 'Number of rejections before penalties apply to league members';
COMMENT ON COLUMN "public"."league_members"."ootDaysUsed" IS 'Number of out-of-town days used in current period';
COMMENT ON COLUMN "public"."activity_logs"."challengeId" IS 'Reference to the challenge that triggered this activity log entry'; 