
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch TikTok data
  const fetchTikTokData = async (username: string) => {
    try {
      const response = await supabase.functions.invoke('fetch-tiktok-data', {
        body: { tiktokUsername: username }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch TikTok data');
      }
      
      console.log('TikTok data fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching TikTok data:', error);
      return null;
    }
  };

  // Function to refresh TikTok data
  const refreshTikTokData = async () => {
    if (!user || !profile?.tiktok_username) return;
    
    try {
      setProfileLoading(true);
      const tiktokData = await fetchTikTokData(profile.tiktok_username);
      
      if (tiktokData) {
        // Update profile in Supabase with new TikTok data
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
        
        // Update local profile state
        setProfile(prev => prev ? { ...prev, ...updateData } : null);
      }
    } catch (error) {
      console.error('Error refreshing TikTok data:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch profile data when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        
        // Try to get the profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else if (data) {
          // Profile exists
          setProfile(data);
          
          // If profile has a TikTok username, refresh the TikTok data
          if (data.tiktok_username) {
            const tiktokData = await fetchTikTokData(data.tiktok_username);
            
            if (tiktokData) {
              // Update profile in Supabase with refreshed TikTok data
              const updateData = {
                avatar_url: tiktokData.avatar,
                following: tiktokData.following,
                fans: tiktokData.fans,
                heart: tiktokData.heart,
                video: tiktokData.video
              };
              
              const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', user.id);
                
              if (!updateError) {
                // Update local profile state with the refreshed data
                setProfile({ ...data, ...updateData });
              }
            }
          }
        } else {
          // Profile doesn't exist, create it
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
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
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

  const hasTikTokUsername = !!profile?.tiktok_username;

  const value = {
    session,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    profileLoading,
    hasTikTokUsername,
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
