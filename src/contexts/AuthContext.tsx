
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Profile = {
  id: string;
  username: string | null;
  tiktok_username: string | null;
  avatar_url: string | null;
  following: number | null;
  fans: number | null;
  heart: number | null;
  video: number | null;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
  hasTikTokUsername: boolean;
  refreshTikTokData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a key in localStorage to track the last fetch time
const LAST_FETCH_KEY = 'tiktok_last_fetch_time';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [initialDataFetchDone, setInitialDataFetchDone] = useState(false);
  const navigate = useNavigate();
  
  // Get last fetch time from localStorage instead of state to persist across refreshes
  const getLastFetchTime = (): number | null => {
    const stored = localStorage.getItem(LAST_FETCH_KEY);
    return stored ? parseInt(stored, 10) : null;
  };
  
  // Store last fetch time in localStorage
  const setLastFetchTime = (time: number) => {
    localStorage.setItem(LAST_FETCH_KEY, time.toString());
  };

  const fetchTikTokData = async (username: string) => {
    try {
      const now = Date.now();
      const lastFetchTime = getLastFetchTime();
      
      // Check if we're in the cooldown period (1 hour = 3600000 ms)
      if (lastFetchTime && now - lastFetchTime < 3600000) {
        console.log('Skipping API call - cooldown period active');
        console.log(`Last fetch: ${new Date(lastFetchTime).toLocaleString()}`);
        console.log(`Next fetch available after: ${new Date(lastFetchTime + 3600000).toLocaleString()}`);
        return null;
      }
      
      console.log(`Calling edge function for username: ${username}`);
      
      const response = await supabase.functions.invoke('fetch-tiktok-data', {
        body: { tiktokUsername: username }
      });
      
      // Set the last fetch time in localStorage
      setLastFetchTime(now);
      
      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to fetch TikTok data');
      }
      
      console.log('TikTok data fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching TikTok data:', error);
      return null;
    }
  };

  const refreshTikTokData = async () => {
    if (!user || !profile?.tiktok_username) return;
    
    try {
      setProfileLoading(true);
      
      const now = Date.now();
      const lastFetchTime = getLastFetchTime();
      
      // Check if we're in the cooldown period (1 hour = 3600000 ms)
      if (lastFetchTime && now - lastFetchTime < 3600000) {
        console.log('Skipping refresh - cooldown period active');
        console.log(`Last fetch: ${new Date(lastFetchTime).toLocaleString()}`);
        console.log(`Next fetch available after: ${new Date(lastFetchTime + 3600000).toLocaleString()}`);
        setProfileLoading(false);
        return;
      }
      
      const tiktokData = await fetchTikTokData(profile.tiktok_username);
      
      if (tiktokData) {
        const updateData = {
          avatar_url: tiktokData.avatar,
          following: tiktokData.following,
          fans: tiktokData.fans,
          heart: tiktokData.heart,
          video: tiktokData.video
        };
        
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
          
        if (error) throw error;
        
        setProfile(prev => prev ? { ...prev, ...updateData } : null);
      }
    } catch (error) {
      console.error('Error refreshing TikTok data:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        setInitialDataFetchDone(true);
        return;
      }

      try {
        setProfileLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else if (data) {
          setProfile(data);
          
          // Only fetch TikTok data if we haven't already done the initial fetch
          // and the user has a TikTok username
          if (data.tiktok_username && !initialDataFetchDone) {
            console.log('Initial profile load - checking if TikTok data refresh is needed');
            await refreshTikTokData(); // This now respects the cooldown period
            setInitialDataFetchDone(true);
          }
        } else {
          console.log('Profile not found, creating a new one...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id,
              username: user.email 
            })
            .select('*')
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            setProfile(null);
          } else {
            setProfile(newProfile);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } finally {
        setProfileLoading(false);
        setInitialDataFetchDone(true);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Reset initialDataFetchDone when auth state changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setInitialDataFetchDone(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const value = {
    session,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    profileLoading,
    hasTikTokUsername: !!profile?.tiktok_username,
    refreshTikTokData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
