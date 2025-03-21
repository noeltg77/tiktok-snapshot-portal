
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    let hashtag;
    let userId;
    let resultsPerPage = 21; // Default value
    try {
      const body = await req.json();
      hashtag = body.hashtag;
      userId = body.userId; // Get the userId from the request
      resultsPerPage = body.resultsPerPage || 21; // Get the resultsPerPage from the request (default to 21)
      
      console.log('Received hashtag search request with body:', JSON.stringify(body));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body. Expected JSON with a hashtag field.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parameter validation
    if (!hashtag) {
      return new Response(
        JSON.stringify({ error: 'Hashtag is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate resultsPerPage
    if (isNaN(resultsPerPage) || resultsPerPage < 1 || resultsPerPage > 21) {
      resultsPerPage = 21; // Fallback to default if invalid
    }

    console.log(`Searching TikTok for hashtag: ${hashtag} with resultsPerPage: ${resultsPerPage}`);
    
    // Format hashtag to ensure it doesn't have # prefix
    const formattedHashtag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
    
    // Create a cache key based on hashtag and time
    const now = new Date();
    // Round the minutes down to nearest 5-minute interval to create a 5-minute cache window
    const minutes = Math.floor(now.getMinutes() / 5) * 5;
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(minutes).padStart(2, '0')}`;
    const cacheKey = `tiktok-hashtag-${formattedHashtag}-${timeString}`;
    
    console.log(`Making Apify API request for hashtag: ${formattedHashtag} with cache key: ${cacheKey}`);
    const response = await fetch('https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=apify_api_BSZn12KdnyAsoqgb8y7Cga7epcjZop0KVMOW', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        excludePinnedPosts: false,
        hashtags: [formattedHashtag],
        resultsPerPage: resultsPerPage, // Use the dynamic resultsPerPage value
        shouldDownloadCovers: false,
        shouldDownloadSlideshowImages: false,
        shouldDownloadSubtitles: false,
        shouldDownloadVideos: true,
        cacheKey: cacheKey,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Apify API error: ${response.status} ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch TikTok data: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the API response data
    const data = await response.json();
    console.log(`Received Apify API response for hashtag: ${formattedHashtag}, found ${data.length} results`);
    
    // Process the videos
    const processedVideos = data.map(item => {
      // Ensure hashtags is always an array
      let hashtags = [];
      if (item.hashtags && Array.isArray(item.hashtags)) {
        // Convert each hashtag object to a string if needed
        hashtags = item.hashtags.map(tag => 
          typeof tag === 'string' ? tag : (tag.name || '')
        );
      }

      // Check if videoMeta.coverUrl exists, otherwise try item.covers
      let coverUrl = null;
      if (item.videoMeta && item.videoMeta.coverUrl) {
        coverUrl = item.videoMeta.coverUrl;
      } else if (item.covers && item.covers.length > 0) {
        coverUrl = item.covers[0];
      }

      // Use webVideoUrl as the primary video URL
      let videoUrl = item.webVideoUrl || null;
      if (!videoUrl && item.videoUrl) {
        videoUrl = item.videoUrl;
      }
      
      // Get the direct download URL from videoMeta.downloadAddr
      let downloadUrl = null;
      if (item.videoMeta && item.videoMeta.downloadAddr) {
        downloadUrl = item.videoMeta.downloadAddr;
      } else if (item.mediaUrls && item.mediaUrls.length > 0) {
        downloadUrl = item.mediaUrls[0];
      }

      // Extract author information
      const authorName = item.authorMeta?.name || '';
      const authorAvatarUrl = item.authorMeta?.originalAvatarUrl || item.authorMeta?.avatar || '';
      const createTimeISO = item.createTimeISO || (item.createTime ? new Date(item.createTime * 1000).toISOString() : null);

      return {
        id: item.id,
        text: item.text || '',
        createTime: item.createTime,
        createTimeISO: createTimeISO,
        diggCount: item.diggCount,
        shareCount: item.shareCount,
        playCount: item.playCount,
        commentCount: item.commentCount,
        collectCount: item.collectCount || 0,
        coverUrl: coverUrl,
        downloadLink: videoUrl,
        downloadUrl: downloadUrl,
        hashtags: hashtags,
        authorName: authorName,
        authorAvatarUrl: authorAvatarUrl
      };
    });
    
    // Sort videos by playCount in descending order (highest views first)
    processedVideos.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    
    // Create a Supabase client to store the results
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Store search results in the searches table
    if (processedVideos.length > 0) {
      // We'll use a transaction to ensure data consistency
      try {
        console.log(`Storing ${processedVideos.length} videos for hashtag: ${formattedHashtag}`);
        
        // Store each video
        for (const video of processedVideos) {
          const { error } = await supabase
            .from('searches')
            .upsert({
              search_term: formattedHashtag,
              video_id: video.id,
              cover_url: video.coverUrl,
              text: video.text,
              tiktok_created_at: new Date(video.createTime * 1000).toISOString(),
              video_url: video.downloadLink,
              download_url: video.downloadUrl, // Store the download URL
              share_count: video.shareCount,
              play_count: video.playCount,
              collect_count: video.collectCount,
              comment_count: video.commentCount,
              digg_count: video.diggCount,
              hashtags: JSON.stringify(video.hashtags),
              author_name: video.authorName,
              author_avatar_url: video.authorAvatarUrl,
              original_post_date: video.createTimeISO,
              user_id: userId, // Store the user ID with each search result
              searched_at: new Date().toISOString()
            }, {
              onConflict: 'search_term,video_id'
            });
            
          if (error) {
            console.error('Error storing video:', error);
          }
        }
        
        console.log(`Successfully stored search results for hashtag: ${formattedHashtag}`);
      } catch (error) {
        console.error('Error storing search results:', error);
      }
    }
    
    return new Response(
      JSON.stringify({
        hashtag: formattedHashtag,
        videos: processedVideos,
        count: processedVideos.length,
        resultsPerPage: resultsPerPage
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=300' // Cache for 5 minutes
        } 
      }
    );
  } catch (error) {
    console.error('Error in search-tiktok-hashtags function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
