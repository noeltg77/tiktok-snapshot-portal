import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { HashtagSocialCard } from "@/components/ui/hashtag-social-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CloudOff } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { HashtagSearchHistory } from "@/components/HashtagSearchHistory";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TikTokPost {
  id: string;
  cover_url?: string;
  text?: string;
  tiktok_created_at?: string;
  video_url?: string;
  download_url?: string;
  share_count?: number;
  play_count?: number;
  collect_count?: number;
  comment_count?: number;
  digg_count?: number;
  hashtags?: string[];
  transcript?: string;
  author_name?: string;
  author_avatar_url?: string;
  original_post_date?: string;
}

const HashtagsPage = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TikTokPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(6);
  const [maxResults, setMaxResults] = useState(21);

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
      const formattedHashtag = searchQuery.startsWith('#') 
        ? searchQuery.substring(1) 
        : searchQuery;
      
      const { data: cachedData, error: cachedError } = await supabase
        .from('searches')
        .select('*')
        .eq('search_term', formattedHashtag)
        .eq('user_id', user.id)
        .order('play_count', { ascending: false })
        .range((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage - 1);
      
      if (!cachedError && cachedData && cachedData.length > 0) {
        console.log("Using cached hashtag search data");
        
        const { count, error: countError } = await supabase
          .from('searches')
          .select('*', { count: 'exact', head: true })
          .eq('search_term', formattedHashtag)
          .eq('user_id', user.id);
        
        if (!countError && count !== null) {
          setTotalPages(Math.ceil(count / resultsPerPage));
        }
        
        const transformedData = cachedData.map(post => {
          let hashtagsArray: string[] = [];
          
          if (post.hashtags) {
            if (Array.isArray(post.hashtags)) {
              hashtagsArray = post.hashtags as string[];
            } else if (typeof post.hashtags === 'string') {
              try {
                const parsed = JSON.parse(post.hashtags);
                hashtagsArray = Array.isArray(parsed) ? parsed : [String(post.hashtags)];
              } catch {
                hashtagsArray = [String(post.hashtags)];
              }
            } else {
              hashtagsArray = [String(post.hashtags)];
            }
          }
          
          return {
            id: post.video_id,
            cover_url: post.cover_url,
            text: post.text,
            tiktok_created_at: post.tiktok_created_at,
            video_url: post.video_url,
            download_url: post.download_url,
            share_count: post.share_count,
            play_count: post.play_count,
            collect_count: post.collect_count,
            comment_count: post.comment_count,
            digg_count: post.digg_count,
            hashtags: hashtagsArray,
            transcript: post.transcript,
            author_name: post.author_name,
            author_avatar_url: post.author_avatar_url,
            original_post_date: post.original_post_date
          } as TikTokPost;
        });
        
        setSearchResults(transformedData);
      } else {
        console.log("Fetching fresh hashtag search data");
        
        const response = await supabase.functions.invoke('search-tiktok-hashtags', {
          body: { 
            hashtag: formattedHashtag,
            userId: user.id,
            resultsPerPage: maxResults
          }
        });
        
        if (response.error) {
          throw new Error(response.error.message || 'Failed to fetch hashtag data');
        }
        
        const data = response.data;
        console.log("Received API response:", data);
        
        if (data.videos && data.videos.length > 0) {
          const videos = data.videos.map((video: any) => ({
            id: video.id,
            cover_url: video.coverUrl,
            text: video.text,
            tiktok_created_at: video.createTime ? new Date(video.createTime * 1000).toISOString() : null,
            video_url: video.downloadLink,
            download_url: video.downloadUrl,
            share_count: video.shareCount,
            play_count: video.playCount,
            collect_count: video.collectCount,
            comment_count: video.commentCount,
            digg_count: video.diggCount,
            hashtags: Array.isArray(video.hashtags) ? video.hashtags : [],
            author_name: video.authorName,
            author_avatar_url: video.authorAvatarUrl,
            original_post_date: video.createTimeISO
          })) as TikTokPost[];
          
          setSearchResults(videos.slice(0, resultsPerPage));
          setTotalPages(Math.ceil(videos.length / resultsPerPage));
        } else {
          setSearchResults([]);
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error during hashtag search:", error);
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to search for hashtag",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchHistorySelect = async (term: string) => {
    setSearchQuery(term);
    
    setIsSearching(true);
    setCurrentPage(1);
    
    try {
      const { data: cachedData, error: cachedError } = await supabase
        .from('searches')
        .select('*')
        .eq('search_term', term)
        .eq('user_id', user.id)
        .order('play_count', { ascending: false })
        .range(0, resultsPerPage - 1);
      
      if (cachedError) {
        throw cachedError;
      }
      
      const { count, error: countError } = await supabase
        .from('searches')
        .select('*', { count: 'exact', head: true })
        .eq('search_term', term)
        .eq('user_id', user.id);
      
      if (!countError && count !== null) {
        setTotalPages(Math.ceil(count / resultsPerPage));
      }
      
      const transformedData = cachedData.map(post => {
        let hashtagsArray: string[] = [];
        
        if (post.hashtags) {
          if (Array.isArray(post.hashtags)) {
            hashtagsArray = post.hashtags as string[];
          } else if (typeof post.hashtags === 'string') {
            try {
              const parsed = JSON.parse(post.hashtags);
              hashtagsArray = Array.isArray(parsed) ? parsed : [String(post.hashtags)];
            } catch {
              hashtagsArray = [String(post.hashtags)];
            }
          } else {
            hashtagsArray = [String(post.hashtags)];
          }
        }
        
        return {
          id: post.video_id,
          cover_url: post.cover_url,
          text: post.text,
          tiktok_created_at: post.tiktok_created_at,
          video_url: post.video_url,
          download_url: post.download_url,
          share_count: post.share_count,
          play_count: post.play_count,
          collect_count: post.collect_count,
          comment_count: post.comment_count,
          digg_count: post.digg_count,
          hashtags: hashtagsArray,
          transcript: post.transcript,
          author_name: post.author_name,
          author_avatar_url: post.author_avatar_url,
          original_post_date: post.original_post_date
        } as TikTokPost;
      });
      
      setSearchResults(transformedData);
    } catch (error) {
      console.error("Error loading search history results:", error);
      toast({
        title: "Search Error",
        description: "Failed to load results from search history",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadVideo = (downloadUrl: string | undefined, videoId: string) => {
    if (!downloadUrl) {
      toast({
        title: "Download Error",
        description: "No download URL available for this video",
        variant: "destructive"
      });
      return;
    }
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `tiktok-${videoId}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Download Started",
      description: "Your video download has started",
    });
  };

  const extractHashtags = (post: TikTokPost) => {
    if (Array.isArray(post.hashtags) && post.hashtags.length > 0) {
      return post.hashtags;
    }
    
    if (post.text) {
      const regex = /#(\w+)/g;
      const matches = post.text.match(regex);
      if (matches) {
        return matches.map(tag => tag.substring(1));
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
            <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:gap-2">
              <Input
                placeholder="Search for hashtag (without #)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Select
                  value={maxResults.toString()}
                  onValueChange={(value) => setMaxResults(parseInt(value))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Max results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 results</SelectItem>
                    <SelectItem value="10">10 results</SelectItem>
                    <SelectItem value="15">15 results</SelectItem>
                    <SelectItem value="21">21 results</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? "Searching..." : "Search"}
                  <Search className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <HashtagSearchHistory onSelectSearchTerm={handleSearchHistorySelect} />
              <div className="ml-2 text-xs text-gray-500 hidden sm:flex items-center">
                <span className="hidden sm:inline">← Search History</span>
              </div>
            </form>
          </div>

          {searchResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {searchResults.map((post) => (
                  <div key={post.id} className="relative">
                    <HashtagSocialCard
                      key={post.id}
                      author={{
                        name: post.author_name || "TikTok Creator",
                        username: post.author_name?.toLowerCase().replace(/\s+/g, '.') || "tiktok_creator",
                        avatar: post.author_avatar_url,
                        timeAgo: formatTimestamp(post.original_post_date || post.tiktok_created_at),
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
                  </div>
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
