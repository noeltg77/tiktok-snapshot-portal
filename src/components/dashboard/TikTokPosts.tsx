
import React, { useState, useEffect } from "react";
import { SocialCard } from "@/components/ui/social-card";
import { Link as LinkIcon, CloudOff, CloudDownload, Hash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TikTokPosts = () => {
  const { profile, isDataFetchingEnabled } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Fetch posts on component mount
  useEffect(() => {
    if (profile?.id) {
      fetchPosts();
    }
  }, [profile?.id]);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts from the database
      const { data, error } = await supabase
        .from('tiktok_posts')
        .select('*')
        .eq('user_id', profile.id)
        .order('tiktok_created_at', { ascending: false });
      
      if (error) throw error;
      
      // If we have data, set it in state
      if (data && data.length > 0) {
        setPosts(data);
        setLoading(false);
      } else {
        // If no posts in the database, fetch from TikTok API
        if (isDataFetchingEnabled) {
          await refreshTikTokPosts();
        } else {
          setPosts([]);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
      setLoading(false);
    }
  };
  
  const refreshTikTokPosts = async () => {
    if (!profile?.tiktok_username || !isDataFetchingEnabled) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch TikTok data from API
      const response = await supabase.functions.invoke('fetch-tiktok-data', {
        body: { tiktokUsername: profile.tiktok_username }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch TikTok data');
      }
      
      const tikTokData = response.data;
      
      if (!tikTokData || !tikTokData.videos || tikTokData.videos.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }
      
      // Process and save videos to the database
      const savedPosts = await processTikTokVideos(tikTokData.videos);
      setPosts(savedPosts);
      
    } catch (error) {
      console.error('Error refreshing TikTok posts:', error);
      toast.error('Failed to refresh TikTok posts');
    } finally {
      setLoading(false);
    }
  };
  
  const processTikTokVideos = async (videos) => {
    try {
      // Get existing post IDs to check for duplicates
      const { data: existingPosts } = await supabase
        .from('tiktok_posts')
        .select('id')
        .eq('user_id', profile.id);
      
      const existingIds = existingPosts ? existingPosts.map(post => post.id) : [];
      
      // Filter out videos that are already in the database
      const newVideos = videos.filter(video => !existingIds.includes(video.id));
      
      if (newVideos.length === 0) {
        console.log('No new videos to insert');
        
        // Return all posts from the database
        const { data } = await supabase
          .from('tiktok_posts')
          .select('*')
          .eq('user_id', profile.id)
          .order('tiktok_created_at', { ascending: false });
        
        return data || [];
      }
      
      console.log(`Found ${newVideos.length} new videos to insert`);
      
      // Prepare video data for database insertion
      const postsToInsert = newVideos.map(video => ({
        id: video.id,
        user_id: profile.id,
        profile_id: profile.id,
        text: video.text,
        digg_count: video.diggCount,
        share_count: video.shareCount,
        play_count: video.playCount,
        collect_count: video.collectCount || 0,
        comment_count: video.commentCount,
        cover_url: video.coverUrl,
        video_url: video.downloadLink,
        hashtags: Array.isArray(video.hashtags) ? JSON.stringify(video.hashtags) : '[]',
        tiktok_created_at: new Date(video.createTime).toISOString()
      }));
      
      // Insert new videos into the database
      const { error } = await supabase
        .from('tiktok_posts')
        .insert(postsToInsert);
      
      if (error) throw error;
      
      // Fetch all posts again to get the newly inserted ones
      const { data } = await supabase
        .from('tiktok_posts')
        .select('*')
        .eq('user_id', profile.id)
        .order('tiktok_created_at', { ascending: false });
      
      return data || [];
      
    } catch (error) {
      console.error('Error processing TikTok videos:', error);
      throw error;
    }
  };
  
  const handleAction = (id, action) => {
    console.log(`Post ${id}: ${action}`);
    // Future functionality can be added here
  };

  if (loading) {
    return (
      <div className="space-y-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
        <div className="flex justify-center items-center h-40">
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recent Posts</h2>
        <button
          onClick={refreshTikTokPosts}
          disabled={!isDataFetchingEnabled || loading}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isDataFetchingEnabled 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          <CloudDownload size={16} />
          Refresh Posts
        </button>
      </div>
      
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200 p-8">
          <CloudOff className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 mb-2">No posts found</p>
          <p className="text-sm text-gray-500 text-center">
            {isDataFetchingEnabled 
              ? "Try refreshing your posts or check your TikTok username." 
              : "Enable data fetching to get your TikTok posts."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => {
            // Safely parse hashtags from JSON string
            let hashtags = [];
            try {
              if (typeof post.hashtags === 'string') {
                hashtags = JSON.parse(post.hashtags);
              } else if (Array.isArray(post.hashtags)) {
                hashtags = post.hashtags;
              }
            } catch (e) {
              console.error('Error parsing hashtags:', e);
            }
            
            return (
              <SocialCard
                key={post.id}
                author={{
                  name: profile?.tiktok_username || "User",
                  username: profile?.tiktok_username?.replace('@', '') || "user",
                  avatar: profile?.avatar_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=600&crop=1",
                  timeAgo: new Date(post.tiktok_created_at).toLocaleDateString(),
                }}
                content={{
                  text: post.text,
                  image: post.cover_url,
                  hashtags: hashtags,
                }}
                engagement={{
                  likes: post.digg_count,
                  comments: post.comment_count,
                  shares: post.share_count,
                  views: post.play_count,
                  bookmarks: post.collect_count,
                  isLiked: false,
                  isBookmarked: false,
                }}
                onComment={() => handleAction(post.id, 'commented')}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TikTokPosts;
