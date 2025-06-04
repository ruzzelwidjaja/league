-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to profile-pictures bucket
CREATE POLICY "Anyone can upload profile pictures" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-pictures');

-- Allow public read access to profile pictures
CREATE POLICY "Anyone can view profile pictures" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-pictures');

-- Allow anyone to update files in profile-pictures bucket
CREATE POLICY "Anyone can update profile pictures" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'profile-pictures');

-- Allow anyone to delete files in profile-pictures bucket
CREATE POLICY "Anyone can delete profile pictures" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'profile-pictures'); 