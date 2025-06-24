-- Remove unused profilePictureUrl column
ALTER TABLE "public"."user" DROP COLUMN IF EXISTS "profilePictureUrl"; 