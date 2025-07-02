alter table "public"."league_members" add column "availability" jsonb default '{}'::jsonb;

alter table "public"."user" drop column "availability";

alter table "public"."user" drop column "profileCompleted";


