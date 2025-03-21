import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Profile = {
  id: string;
  username: string | null;
  tiktok_username: string | null;
  avatar_url: string | null;
  following: number | null;
  fans: number | null;
  heart: number | null;
  video: number | null;
  topics_and_themes: string | null;
  tone_and_language: string | null;
  content_structure: string | null;
  audience_connection: string | null;
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
  getNextRefreshTime: () => Date | null;
  getCooldownRemaining: () => number | null;
  isDataFetchingEnabled: boolean;
  setDataFetchingEnabled: (enabled: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LAST_FETCH_KEY = 'tiktok_last_fetch_time';
const COOLDOWN_PERIOD = 5 * 60 * 1000;
const DATA_FETCHING_ENABLED_KEY = 'tiktok_data_fetching_enabled';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [initialDataFetchDone, setInitialDataFetchDone] = useState(false);
  const [isDataFetchingEnabled, setIsDataFetchingEnabled] = useState(() => {
    const savedPreference = localStorage.getItem(DATA_FETCHING_ENABLED_KEY);
    return savedPreference === null ? true : savedPreference === 'true';
  });
  const navigate = useNavigate();
  
  const setDataFetchingEnabled = (enabled: boolean) => {
    setIsDataFetchingEnabled(enabled);
    localStorage.setItem(DATA_FETCHING_ENABLED_KEY, enabled.toString());
  };
  
  const getLastFetchTime = (): number | null => {
    const stored = localStorage.getItem(LAST_FETCH_KEY);
    return stored ? parseInt(stored, 10) : null;
  };
  
  const setLastFetchTime = (time: number) => {
    localStorage.setItem(LAST_FETCH_KEY, time.toString());
  };

  const getNextRefreshTime = (): Date | null => {
    const lastFetchTime = getLastFetchTime();
    if (!lastFetchTime) return null;
    
    return new Date(lastFetchTime + COOLDOWN_PERIOD);
  };
  
  const getCooldownRemaining = (): number | null => {
    const lastFetchTime = getLastFetchTime();
    if (!lastFetchTime) return null;
    
    const now = Date.now();
    const nextRefreshTime = lastFetchTime + COOLDOWN_PERIOD;
    
    if (now >= nextRefreshTime) return 0;
    return nextRefreshTime - now;
  };

  const fetchTikTokData = async (username: string) => {
    if (!isDataFetchingEnabled) {
      console.log('Data fetching is disabled, skipping API call');
      return null;
    }
    
    try {
      const now = Date.now();
      const lastFetchTime = getLastFetchTime();
      
      if (lastFetchTime && now - lastFetchTime < COOLDOWN_PERIOD) {
        console.log('Skipping API call - cooldown period active');
        console.log(`Last fetch: ${new Date(lastFetchTime).toLocaleString()}`);
        console.log(`Next fetch available after: ${new Date(lastFetchTime + COOLDOWN_PERIOD).toLocaleString()}`);
        return null;
      }
      
      console.log(`Calling edge function for username: ${username}`);
      
      const response = await supabase.functions.invoke('fetch-tiktok-data', {
        body: { tiktokUsername: username }
      });
      
      setLastFetchTime(now);
      
      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to fetch TikTok data');
      }
      
      console.log('TikTok data fetched successfully:', response.data);
      
      if (response.data && response.data.videos && response.data.videos.length > 0 && user) {
        await processTikTokVideos(response.data.videos, user.id);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching TikTok data:', error);
      return null;
    }
  };

  const processTikTokVideos = async (videos: any[], userId: string) => {
    try {
      const { data: existingPosts } = await supabase
        .from('tiktok_posts')
        .select('id')
        .eq('user_id', userId);
      
      const existingIds = existingPosts ? existingPosts.map(post => post.id) : [];
      
      const newVideos = videos.filter(video => !existingIds.includes(video.id));
      
      if (newVideos.length === 0) {
        console.log('No new videos to insert');
        return;
      }
      
      console.log(`Found ${newVideos.length} new videos to insert`);
      
      const postsToInsert = newVideos.map(video => {
        let hashtagsJson = '[]';
        if (Array.isArray(video.hashtags)) {
          try {
            hashtagsJson = JSON.stringify(video.hashtags);
          } catch (e) {
            console.error('Error stringifying hashtags:', e);
          }
        }
        
        return {
          id: video.id,
          user_id: userId,
          profile_id: userId,
          text: video.text,
          digg_count: video.diggCount,
          share_count: video.shareCount,
          play_count: video.playCount,
          collect_count: video.collectCount || 0,
          comment_count: video.commentCount,
          cover_url: video.coverUrl,
          video_url: video.downloadLink,
          download_url: video.downloadUrl, // Store the download URL
          hashtags: hashtagsJson,
          tiktok_created_at: new Date(video.createTime).toISOString()
        };
      });
      
      const { error } = await supabase
        .from('tiktok_posts')
        .insert(postsToInsert);
      
      if (error) {
        console.error('Error inserting TikTok posts:', error);
        throw error;
      }
      
      console.log(`Successfully inserted ${postsToInsert.length} TikTok posts`);
      toast.success(`Added ${postsToInsert.length} new TikTok posts`);
      
    } catch (error) {
      console.error('Error processing TikTok videos:', error);
    }
  };

  const refreshTikTokData = async () => {
    if (!user || !profile?.tiktok_username || !isDataFetchingEnabled) return;
    
    try {
      setProfileLoading(true);
      
      const now = Date.now();
      const lastFetchTime = getLastFetchTime();
      
      if (lastFetchTime && now - lastFetchTime < COOLDOWN_PERIOD) {
        console.log('Skipping refresh - cooldown period active');
        console.log(`Last fetch: ${new Date(lastFetchTime).toLocaleString()}`);
        console.log(`Next fetch available after: ${new Date(lastFetchTime + COOLDOWN_PERIOD).toLocaleString()}`);
        toast.info("Please wait before refreshing again", {
          description: `Next refresh available in ${formatTime(lastFetchTime + COOLDOWN_PERIOD - now)}`
        });
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
        toast.success("TikTok data refreshed");
      }
    } catch (error) {
      console.error('Error refreshing TikTok data:', error);
      toast.error("Failed to refresh TikTok data");
    } finally {
      setProfileLoading(false);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
          
          if (data.tiktok_username && !initialDataFetchDone) {
            console.log('Initial profile load - checking if TikTok data refresh is needed');
            await refreshTikTokData();
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
    getNextRefreshTime,
    getCooldownRemaining,
    isDataFetchingEnabled,
    setDataFetchingEnabled,
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
