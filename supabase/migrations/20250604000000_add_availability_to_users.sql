-- Add availability column to users table
-- This will store user availability for different days and time slots
-- Format: {"monday": {"lunch": true, "after_work": false}, "tuesday": {...}, ...}

alter table users add column availability JSONB default '{}'::jsonb;

-- Add a comment to document the column structure
comment on column users.availability is 'User availability schedule stored as JSON with days of week and time slots (lunch, after_work, etc.)'; 