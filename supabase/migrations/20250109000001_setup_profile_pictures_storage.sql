-- Setup Profile Pictures Storage Bucket
-- This migration creates the storage bucket for profile pictures and configures appropriate policies

-- Create the profile-pictures bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures', 
  true, -- Public bucket for profile images
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Since we're using Better Auth instead of Supabase Auth, and profile pictures
-- are meant to be public anyway, we'll create simple policies

-- Drop existing policies if they exist (to make migration idempotent)
DROP POLICY IF EXISTS "Public read access for profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletion of profile pictures" ON storage.objects;

-- Allow public read access to all profile pictures
CREATE POLICY "Public read access for profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

-- Allow anyone to upload profile pictures (we handle auth in our API layer)
CREATE POLICY "Allow uploads to profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-pictures');

-- Allow updates to profile pictures (for overwriting)
CREATE POLICY "Allow updates to profile pictures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-pictures');

-- Allow deletion of profile pictures (for cleanup)
CREATE POLICY "Allow deletion of profile pictures"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-pictures'); 