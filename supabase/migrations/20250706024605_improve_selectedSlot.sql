-- Change selectedSlot to JSONB
ALTER TABLE challenges 
ALTER COLUMN "selectedSlot" TYPE JSONB USING "selectedSlot"::JSONB;