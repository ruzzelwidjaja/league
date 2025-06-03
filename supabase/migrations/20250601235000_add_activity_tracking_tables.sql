-- Add new tables for activity tracking and out-of-town periods
-- Migration: add_activity_tracking_tables

-- Out of town periods table
CREATE TABLE out_of_town_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CHECK (end_date >= start_date)
);

-- Activity logs for tracking all league activities
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  related_user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'challenge_sent',
    'challenge_accepted', 
    'challenge_rejected',
    'challenge_expired',
    'challenge_withdrawn',
    'match_completed',
    'rank_swap',
    'rank_penalty',
    'went_oot',
    'returned_from_oot',
    'joined_league'
  )),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add rejection penalty tracking columns to league_members
ALTER TABLE league_members 
ADD COLUMN recent_rejections INTEGER DEFAULT 0,
ADD COLUMN recent_acceptances INTEGER DEFAULT 0,
ADD COLUMN activity_window_start DATE,
ADD COLUMN previous_rank INTEGER;

-- Add challenge workflow fields to challenges table
ALTER TABLE challenges
ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejection_reason VARCHAR(50) 
  CHECK (rejection_reason IN ('declined', 'rank_difference')),
ADD COLUMN proposed_slots JSONB,
ADD COLUMN selected_slot VARCHAR(50),
ADD COLUMN match_scores JSONB,
ADD COLUMN score_submitted_by UUID REFERENCES users(id),
ADD COLUMN score_submitted_at TIMESTAMP WITH TIME ZONE;

-- Update status enum to include withdrawn
ALTER TABLE challenges 
DROP CONSTRAINT IF EXISTS challenges_status_check;

ALTER TABLE challenges
ADD CONSTRAINT challenges_status_check 
  CHECK (status IN ('pending', 'accepted', 'completed', 'rejected', 'expired', 'withdrawn'));

-- Create indexes for performance
CREATE INDEX idx_out_of_town_periods_user_league ON out_of_town_periods(user_id, league_id);
CREATE INDEX idx_out_of_town_periods_dates ON out_of_town_periods(start_date, end_date);
CREATE INDEX idx_activity_logs_league_action ON activity_logs(league_id, action);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_challenges_status_league ON challenges(status, league_id);
CREATE INDEX idx_challenges_accepted_at ON challenges(accepted_at) WHERE accepted_at IS NOT NULL; 