// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pskunorvmqxdzujcpaql.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza3Vub3J2bXF4ZHp1amNwYXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzg4MTAsImV4cCI6MjA2NjE1NDgxMH0.gpgXvl7gVS82Ss2Dmc47jjbZ56xUjtxbY4QFdgpdPqs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);