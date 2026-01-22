import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;  // Stores file path, not signed URL
  created_at: string;
  updated_at: string;
}

// Profile with resolved avatar URL for display
interface ProfileWithResolvedAvatar extends Profile {
  resolvedAvatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileWithResolvedAvatar | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<{ error: Error | null }>;
  updateAvatarUrl: (avatarPath: string | null) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate signed URL for avatar when profile changes
  useEffect(() => {
    if (!profile?.avatar_url) {
      setResolvedAvatarUrl(null);
      return;
    }

    // Check if this is already a full URL (legacy signed URL - backwards compatibility)
    if (profile.avatar_url.startsWith('http://') || profile.avatar_url.startsWith('https://')) {
      setResolvedAvatarUrl(profile.avatar_url);
      return;
    }

    // Generate a fresh signed URL for the file path
    const generateSignedUrl = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .createSignedUrl(profile.avatar_url!, 3600); // 1 hour expiration

        if (error) {
          console.error('Error generating avatar signed URL:', error);
          setResolvedAvatarUrl(null);
          return;
        }

        setResolvedAvatarUrl(data.signedUrl);
      } catch (err) {
        console.error('Error generating avatar signed URL:', err);
        setResolvedAvatarUrl(null);
      }
    };

    generateSignedUrl();

    // Refresh the signed URL before it expires (every 45 minutes for 1-hour expiration)
    const refreshInterval = setInterval(generateSignedUrl, 45 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [profile?.avatar_url]);

  // Combine profile with resolved avatar URL
  const profileWithResolvedAvatar = useMemo((): ProfileWithResolvedAvatar | null => {
    if (!profile) return null;
    return {
      ...profile,
      resolvedAvatarUrl,
    };
  }, [profile, resolvedAvatarUrl]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
  };

  const login = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  const signup = async (email: string, password: string, displayName: string): Promise<{ error: Error | null }> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateDisplayName = async (displayName: string): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id);

    if (error) {
      return { error };
    }

    // Refresh profile data
    await fetchProfile(user.id);
    return { error: null };
  };

  const updateAvatarUrl = async (avatarPath: string | null): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarPath })
      .eq('id', user.id);

    if (error) {
      return { error };
    }

    // Refresh profile data
    await fetchProfile(user.id);
    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    const redirectUrl = `${window.location.origin}/auth/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        profile: profileWithResolvedAvatar,
        isAuthenticated: !!session, 
        isLoading,
        login, 
        signup,
        logout, 
        updateDisplayName,
        updateAvatarUrl,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
