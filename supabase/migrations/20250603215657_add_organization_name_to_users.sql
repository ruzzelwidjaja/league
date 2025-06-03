-- Add organization_name column to users table
ALTER TABLE "public"."users" 
ADD COLUMN "organization_name" character varying(255);

-- Add comment to describe the column
COMMENT ON COLUMN "public"."users"."organization_name" IS 'Optional organization name (company, school, team) that the user represents'; 