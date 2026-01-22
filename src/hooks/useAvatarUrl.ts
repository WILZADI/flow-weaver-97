import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to generate a signed URL for an avatar file path.
 * This solves the issue of storing temporary signed URLs in the database.
 * Instead, we store the file path and generate fresh signed URLs on demand.
 * 
 * @param avatarPath - The stored file path (e.g., "user-id/avatar.png") or null
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns The signed URL or null if no path provided
 */
export function useAvatarUrl(avatarPath: string | null, expiresIn: number = 3600): string | null {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarPath) {
      setSignedUrl(null);
      return;
    }

    // Check if this is already a full URL (legacy signed URL)
    // This provides backwards compatibility during transition
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      setSignedUrl(avatarPath);
      return;
    }

    // Generate a fresh signed URL for the file path
    const generateSignedUrl = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .createSignedUrl(avatarPath, expiresIn);

        if (error) {
          console.error('Error generating avatar signed URL:', error);
          setSignedUrl(null);
          return;
        }

        setSignedUrl(data.signedUrl);
      } catch (err) {
        console.error('Error generating avatar signed URL:', err);
        setSignedUrl(null);
      }
    };

    generateSignedUrl();

    // Refresh the signed URL before it expires (at 80% of expiration time)
    const refreshInterval = setInterval(generateSignedUrl, expiresIn * 0.8 * 1000);

    return () => clearInterval(refreshInterval);
  }, [avatarPath, expiresIn]);

  return signedUrl;
}
