/**
 * AirPak Express - Authentication Context
 * Real Supabase authentication with profile management
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, getProfile, updateProfile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  avatar?: string;
  role: 'user' | 'admin';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  region?: string;
  country_code?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateUserProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile data
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const profileData = await getProfile(userId);
      setProfile(profileData as Profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Create profile if it doesn't exist
      if (user?.email) {
        try {
          const { supabase: sb } = await import('../lib/supabase');
          const { data, error } = await sb.from('profiles').insert({
            id: userId,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: 'user',
            tier: 'bronze',
          }).select().single();

          if (!error && data) {
            setProfile(data as Profile);
          }
        } catch (e) {
          console.error('Error creating profile:', e);
        }
      }
    }
  }, [user]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign up with email and password - uses custom branded email verification via Edge Function
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Use Edge Function to create user (bypasses Supabase email confirmation issues)
      const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          name,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        return { error: new Error(result.error || 'Failed to create account') };
      }

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  // Reset password - uses custom branded email via Edge Function
  const resetPassword = async (email: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Use custom Edge Function to send branded password reset email
      const response = await fetch(`${supabaseUrl}/functions/v1/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name: '',
        }),
      });

      const result = await response.json();

      if (!response.ok && result.error) {
        return { error: new Error(result.error) };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const updated = await updateProfile(user.id, updates);
      setProfile(updated as Profile);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
