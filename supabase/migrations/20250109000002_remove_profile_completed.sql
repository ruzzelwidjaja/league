-- Remove profileCompleted column as it's no longer needed
-- With Better Auth email verification and integrated profile completion during signup,
-- this field is redundant

ALTER TABLE "public"."user" DROP COLUMN IF EXISTS "profileCompleted"; 