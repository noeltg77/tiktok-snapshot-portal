
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SocialCard } from "@/components/ui/social-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CloudOff } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";

// Define TikTok post type
interface TikTokPost {
  id: string;
  cover_url?: string;
  text?: string;
  tiktok_created_at?: string;
  video_url?: string;
  share_count?: number;
  play_count?: number;
  collect_count?: number;
  comment_count?: number;
  digg_count?: number;
  hashtags?: string[];
}

const HashtagsPage = () => {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TikTokPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 6;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Search for videos with the given hashtag
      const { data, error } = await supabase
        .from('tiktok_posts')
        .select('*')
        .textSearch('hashtags', searchQuery, { 
          type: 'plain',
          config: 'english' 
        })
        .order('tiktok_created_at', { ascending: false })
        .range((currentPage - 1) * postsPerPage, currentPage * postsPerPage - 1);
      
      if (error) {
        console.error("Error searching hashtags:", error);
        return;
      }
      
      // Count total results for pagination
      const { count, error: countError } = await supabase
        .from('tiktok_posts')
        .select('*', { count: 'exact', head: true })
        .textSearch('hashtags', searchQuery, { 
          type: 'plain',
          config: 'english' 
        });
      
      if (countError) {
        console.error("Error counting hashtags:", countError);
      } else if (count !== null) {
        setTotalPages(Math.ceil(count / postsPerPage));
      }
      
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error during hashtag search:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Extract hashtags from post text or use the stored hashtags array
  const extractHashtags = (post: TikTokPost) => {
    if (Array.isArray(post.hashtags) && post.hashtags.length > 0) {
      return post.hashtags;
    }
    
    // Fallback: extract hashtags from text
    if (post.text) {
      const regex = /#(\w+)/g;
      const matches = post.text.match(regex);
      if (matches) {
        return matches.map(tag => tag.substring(1)); // Remove the # symbol
      }
    }
    
    return [];
  };

  const formatTimestamp = (timestamp: string | undefined) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Hashtag Search</h1>
          </div>
          
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search for hashtag (without #)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
                <Search className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>

          {searchResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {searchResults.map((post) => (
                  <SocialCard
                    key={post.id}
                    author={{
                      name: "TikTok Creator",
                      username: "tiktok_creator",
                      timeAgo: formatTimestamp(post.tiktok_created_at),
                    }}
                    content={{
                      text: post.text,
                      image: post.cover_url,
                      hashtags: extractHashtags(post),
                      videoUrl: post.video_url,
                    }}
                    engagement={{
                      likes: post.digg_count,
                      comments: post.comment_count,
                      shares: post.share_count,
                      views: post.play_count,
                      bookmarks: post.collect_count,
                    }}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => {
                              setCurrentPage(page);
                              handleSearch(new Event('submit') as any);
                            }}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              {isSearching ? (
                <div className="flex flex-col items-center text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mb-4"></div>
                  <p>Searching for posts with hashtag: #{searchQuery}</p>
                </div>
              ) : searchQuery ? (
                <div className="flex flex-col items-center text-gray-500">
                  <CloudOff className="h-12 w-12 mb-2 text-gray-400" />
                  <p>No results found for hashtag: #{searchQuery}</p>
                  <p className="text-sm mt-2">Try a different hashtag</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Search className="h-12 w-12 mb-2 text-gray-400" />
                  <p>Enter a hashtag to search for TikTok posts</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HashtagsPage;
