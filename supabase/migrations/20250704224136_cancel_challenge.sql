-- Add recentCancellations to league_members
ALTER TABLE league_members 
ADD COLUMN "recentCancellations" INTEGER DEFAULT 0;

-- Add cancelledBy to challenges
ALTER TABLE challenges
ADD COLUMN "cancelledBy" TEXT REFERENCES "user"(id);

-- Update constraints
ALTER TABLE challenges DROP CONSTRAINT challenges_status_check;
ALTER TABLE challenges ADD CONSTRAINT challenges_status_check 
CHECK (status IN ('pending', 'accepted', 'completed', 'rejected', 'expired', 'withdrawn', 'cancelled'));

ALTER TABLE activity_logs DROP CONSTRAINT activity_logs_action_check;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_action_check
CHECK (action IN ('challengeSent', 'challengeAccepted', 'challengeRejected', 'challengeExpired', 'challengeWithdrawn', 'challengeCancelled', 'matchCompleted', 'rankPenalty', 'wentOot', 'returnedFromOot', 'joinedLeague'));