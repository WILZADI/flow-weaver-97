-- Fix: Restrict avatar storage access to users' own avatars only
-- Drop the overly permissive policy that allows any authenticated user to view any avatar
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;

-- Create a restrictive policy that only allows users to view their own avatars
-- The file path format is: {user_id}/avatar.{ext}
CREATE POLICY "Users can view their own avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);