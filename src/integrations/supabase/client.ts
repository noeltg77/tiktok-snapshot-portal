// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://laqprgjsfnrsyahpwsjs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcXByZ2pzZm5yc3lhaHB3c2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzkzMTYsImV4cCI6MjA1ODA1NTMxNn0.vgZ_2lZEg_emMizGjOqsferajWTsN-fvv21WyMCdU6Y";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);