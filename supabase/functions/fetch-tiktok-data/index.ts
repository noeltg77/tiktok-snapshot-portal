
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
    let tiktokUsername;
    try {
      const body = await req.json();
      tiktokUsername = body.tiktokUsername;
      
      console.log('Received request with body:', JSON.stringify(body));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body. Expected JSON with a tiktokUsername field.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parameter validation
    if (!tiktokUsername) {
      return new Response(
        JSON.stringify({ error: 'TikTok username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching TikTok data for username: ${tiktokUsername}`);
    
    // Format username to ensure it has @ prefix
    const formattedUsername = tiktokUsername.startsWith('@') 
      ? tiktokUsername 
      : `@${tiktokUsername}`;
    
    // Create a more specific timestamp-based cache key
    // Format: tiktok-data-@username-YYYY-MM-DD-HH-MM
    const now = new Date();
    // Round the minutes down to nearest 5-minute interval to create a 5-minute cache window
    const minutes = Math.floor(now.getMinutes() / 5) * 5;
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(minutes).padStart(2, '0')}`;
    const cacheKey = `tiktok-data-${formattedUsername}-${timeString}`;
    
    console.log(`Making Apify API request for username: ${formattedUsername} with cache key: ${cacheKey}`);
    const response = await fetch('https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=apify_api_BSZn12KdnyAsoqgb8y7Cga7epcjZop0KVMOW', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        excludePinnedPosts: false,
        profiles: [formattedUsername],
        resultsPerPage: 20,
        scrapeLastNDays: 365,
        shouldDownloadCovers: false,
        shouldDownloadSlideshowImages: false,
        shouldDownloadSubtitles: false,
        shouldDownloadVideos: false, // Set to false to minimize API usage
        cacheKey: cacheKey, // This is critical for preventing duplicate API calls to Apify
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
    console.log(`Received Apify API response for ${formattedUsername}`);
    
    // Extract relevant user data from the response
    if (data && data.length > 0 && data[0].authorMeta) {
      const userData = {
        avatar: data[0].authorMeta.avatar,
        following: data[0].authorMeta.following,
        fans: data[0].authorMeta.fans,
        heart: data[0].authorMeta.heart,
        video: data[0].authorMeta.video,
        // Include video data to avoid making additional API calls
        videos: data.map(item => ({
          id: item.id,
          text: item.text || '',
          createTime: item.createTime,
          diggCount: item.diggCount,
          shareCount: item.shareCount,
          playCount: item.playCount,
          commentCount: item.commentCount,
          collectCount: item.collectCount || 0,
          coverUrl: item.covers && item.covers.length > 0 ? item.covers[0] : null,
          downloadLink: item.videoUrl || null,
          hashtags: item.hashtags || []
        }))
      };
      
      console.log('Successfully extracted user data and returning response');
      return new Response(
        JSON.stringify(userData),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=300' // Cache for 5 minutes
          } 
        }
      );
    } else {
      console.error('No author metadata found in the response');
      return new Response(
        JSON.stringify({ error: 'No TikTok user data found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in fetch-tiktok-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
