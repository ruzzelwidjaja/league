-- Better Auth + App Schema Migration
-- This migration combines Better Auth authentication tables with the existing app schema

-- First, drop the existing users table and related constraints
DROP TABLE IF EXISTS "public"."users" CASCADE;

-- Create Better Auth core tables
CREATE TABLE "public"."user" (
    "id" text NOT NULL PRIMARY KEY,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "emailVerified" boolean NOT NULL DEFAULT false,
    "image" text,
    "createdAt" timestamp NOT NULL DEFAULT NOW(),
    "updatedAt" timestamp NOT NULL DEFAULT NOW(),
    -- Extended fields from the original users table
    "firstName" text,
    "lastName" text,
    "phoneNumber" text,
    "profileCompleted" boolean DEFAULT false,
    "organizationName" text,
    "availability" jsonb DEFAULT '{}',
    "profilePictureUrl" text
);

COMMENT ON COLUMN "public"."user"."organizationName" IS 'Optional organization name (company, school, team) that the user represents';
COMMENT ON COLUMN "public"."user"."availability" IS 'User availability schedule stored as JSON with days of week and time slots (lunch, after_work, etc.)';
COMMENT ON COLUMN "public"."user"."profilePictureUrl" IS 'URL to the user profile picture';

CREATE TABLE "public"."session" (
    "id" text NOT NULL PRIMARY KEY,
    "expiresAt" timestamp NOT NULL,
    "token" text NOT NULL UNIQUE,
    "createdAt" timestamp NOT NULL DEFAULT NOW(),
    "updatedAt" timestamp NOT NULL DEFAULT NOW(),
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL REFERENCES "public"."user" ("id") ON DELETE CASCADE
);

CREATE TABLE "public"."account" (
    "id" text NOT NULL PRIMARY KEY,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL REFERENCES "public"."user" ("id") ON DELETE CASCADE,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp,
    "refreshTokenExpiresAt" timestamp,
    "scope" text,
    "password" text,
    "createdAt" timestamp NOT NULL DEFAULT NOW(),
    "updatedAt" timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE "public"."verification" (
    "id" text NOT NULL PRIMARY KEY,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW()
);

-- Recreate app-specific tables with updated foreign key references
CREATE TABLE "public"."leagues" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "name" character varying(255) NOT NULL,
    "description" text,
    "joinCode" character varying(10) NOT NULL UNIQUE,
    "seasonStart" date NOT NULL,
    "seasonEnd" date NOT NULL,
    "createdBy" text REFERENCES "public"."user" ("id"),
    "createdAt" timestamp with time zone DEFAULT timezone('utc', now())
);

CREATE TABLE "public"."league_members" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "leagueId" uuid REFERENCES "public"."leagues" ("id") ON DELETE CASCADE,
    "userId" text REFERENCES "public"."user" ("id") ON DELETE CASCADE,
    "rank" integer NOT NULL,
         "skillTier" character varying(20) NOT NULL CHECK ("skillTier" IN ('top', 'middle', 'bottom')),
    "status" character varying(20) DEFAULT 'active' CHECK (status IN ('active', 'out_of_town', 'inactive')),
    "joinedAt" timestamp with time zone DEFAULT timezone('utc', now()),
    "recentRejections" integer DEFAULT 0,
    "recentAcceptances" integer DEFAULT 0,
    "activityWindowStart" date,
    "previous_rank" integer,
    UNIQUE ("leagueId", "rank"),
    UNIQUE ("leagueId", "userId")
);

CREATE TABLE "public"."challenges" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "leagueId" uuid REFERENCES "public"."leagues" ("id") ON DELETE CASCADE,
    "challengerId" text REFERENCES "public"."user" ("id"),
    "challengedId" text REFERENCES "public"."user" ("id"),
    "status" character varying(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected', 'expired', 'withdrawn')),
    "winnerId" text REFERENCES "public"."user" ("id"),
    "createdAt" timestamp with time zone DEFAULT timezone('utc', now()),
    "completedAt" timestamp with time zone,
    "acceptedAt" timestamp with time zone,
    "respondedAt" timestamp with time zone,
         "rejectionReason" character varying(50) CHECK ("rejectionReason" IN ('declined', 'rankDifference')),
    "proposedSlots" jsonb,
    "selectedSlot" character varying(50),
    "matchScores" jsonb,
    "scoreSubmittedBy" text REFERENCES "public"."user" ("id"),
    "scoreSubmittedAt" timestamp with time zone
);

CREATE TABLE "public"."activity_logs" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "leagueId" uuid REFERENCES "public"."leagues" ("id") ON DELETE CASCADE,
    "userId" text REFERENCES "public"."user" ("id"),
    "relatedUserId" text REFERENCES "public"."user" ("id"),
    "action" character varying(50) NOT NULL CHECK (action IN ('challengeSent', 'challengeAccepted', 'challengeRejected', 'challengeExpired', 'challengeWithdrawn', 'matchCompleted', 'rankSwap', 'rankPenalty', 'wentOot', 'returnedFromOot', 'joinedLeague')),
    "metadata" jsonb,
    "createdAt" timestamp with time zone DEFAULT timezone('utc', now())
);

CREATE TABLE "public"."out_of_town_periods" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "userId" text REFERENCES "public"."user" ("id") ON DELETE CASCADE,
    "leagueId" uuid REFERENCES "public"."leagues" ("id") ON DELETE CASCADE,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    "createdAt" timestamp with time zone DEFAULT timezone('utc', now()),
         CHECK ("endDate" >= "startDate")
);

-- Create indexes for Better Auth tables
CREATE INDEX "idx_session_userId" ON "public"."session" ("userId");
CREATE INDEX "idx_session_token" ON "public"."session" ("token");
CREATE INDEX "idx_account_userId" ON "public"."account" ("userId");
CREATE INDEX "idx_verification_identifier" ON "public"."verification" ("identifier");

-- Recreate indexes for app tables
CREATE INDEX "idx_activity_logs_created_at" ON "public"."activity_logs" ("createdAt");
CREATE INDEX "idx_activity_logs_league_action" ON "public"."activity_logs" ("leagueId", "action");
CREATE INDEX "idx_activity_logs_user" ON "public"."activity_logs" ("userId");
CREATE INDEX "idx_challenges_accepted_at" ON "public"."challenges" ("acceptedAt") WHERE "acceptedAt" IS NOT NULL;
CREATE INDEX "idx_challenges_status_league" ON "public"."challenges" ("status", "leagueId");
CREATE INDEX "idx_out_of_town_periods_dates" ON "public"."out_of_town_periods" ("startDate", "endDate");
CREATE INDEX "idx_out_of_town_periods_user_league" ON "public"."out_of_town_periods" ("userId", "leagueId");

-- Create a trigger to automatically update the updatedAt column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "public"."user" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_updated_at BEFORE UPDATE ON "public"."session" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_account_updated_at BEFORE UPDATE ON "public"."account" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_updated_at BEFORE UPDATE ON "public"."verification" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 