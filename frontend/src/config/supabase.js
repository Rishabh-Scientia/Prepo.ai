import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cahlcjvndiytjluzhpop.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaGxjanZuZGl5dGpsdXpocG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2ODM1NTUsImV4cCI6MjEwMTI1OTU1NX0.Srvqu56S7mJ557w_pNnwelEAVPLD88jD8MgIf2eRVxY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
