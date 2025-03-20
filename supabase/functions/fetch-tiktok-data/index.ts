
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
    const { tiktokUsername } = await req.json();
    
    // Parameter validation
    if (!tiktokUsername) {
      return new Response(
        JSON.stringify({ error: 'TikTok username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching TikTok data for username: ${tiktokUsername}`);
    
    // Call the Apify API to get TikTok data
    const response = await fetch('https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=apify_api_BSZn12KdnyAsoqgb8y7Cga7epcjZop0KVMOW', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        excludePinnedPosts: false,
        profiles: [tiktokUsername.startsWith('@') ? tiktokUsername : `@${tiktokUsername}`],
        resultsPerPage: 20,
        scrapeLastNDays: 365,
        shouldDownloadCovers: false,
        shouldDownloadSlideshowImages: false,
        shouldDownloadSubtitles: false,
        shouldDownloadVideos: true
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

    const data = await response.json();
    console.log('Received TikTok data:', data);

    // Extract relevant user data from the first item (if available)
    if (data && data.length > 0 && data[0].authorMeta) {
      const userData = {
        avatar: data[0].authorMeta.avatar,
        following: data[0].authorMeta.following,
        fans: data[0].authorMeta.fans,
        heart: data[0].authorMeta.heart,
        video: data[0].authorMeta.video
      };
      
      return new Response(
        JSON.stringify(userData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
