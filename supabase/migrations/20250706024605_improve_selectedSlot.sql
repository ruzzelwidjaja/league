-- Change selectedSlot to JSONB
ALTER TABLE challenges 
ALTER COLUMN "selectedSlot" TYPE JSONB USING "selectedSlot"::JSONB;

ALTER TABLE out_of_town_periods
DROP COLUMN "startDate";

-- Update constraints
ALTER TABLE league_members DROP CONSTRAINT IF EXISTS league_members_status_check;
ALTER TABLE league_members ADD CONSTRAINT league_members_status_check 
CHECK (status IN ('active', 'oot', 'inactive'));