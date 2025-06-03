-- Add profile picture URL column to users table
-- This will store the profile picture URL from WorkOS

alter table users add column profile_picture_url TEXT;

-- Add a comment to document the column
comment on column users.profile_picture_url is 'URL to the user profile picture from WorkOS authentication provider'; 