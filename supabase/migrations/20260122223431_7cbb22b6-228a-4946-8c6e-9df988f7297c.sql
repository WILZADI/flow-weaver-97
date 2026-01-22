-- Remove public SELECT policy for avatars bucket
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- Update bucket to private
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Add authenticated read policy so logged-in users can view avatars
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');