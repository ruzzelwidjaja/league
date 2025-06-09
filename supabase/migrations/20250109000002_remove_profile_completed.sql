-- Remove profileCompleted column as it's no longer needed
-- With Better Auth email verification and integrated profile completion during signup,
-- this field is redundant

-- Only drop the column if the table exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'profileCompleted' AND table_schema = 'public') THEN
            ALTER TABLE "public"."user" DROP COLUMN "profileCompleted";
        END IF;
    END IF;
END $$; 