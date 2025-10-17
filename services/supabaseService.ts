import { createClient } from '@supabase/supabase-js';

// The Supabase URL and public anonymous key
const SUPABASE_URL = 'https://afhpdjqcjadphiqdgzur.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaHBkanFjamFkcGhpcWRnenVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDU5NzAsImV4cCI6MjA3NjI4MTk3MH0.tVuQOov6TKy-CopfHxbXzLt2K5BClgebariNuBoFRPk';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL or Anon Key is missing.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fix: Add and export Roast interface to define the shape of roast data.
export interface Roast {
  id: number;
  created_at: string;
  code_snippet: string;
  roast_markdown: string;
  context: string | null;
  detected_language: string | null;
}

/**
 * Saves a roast to the database.
 */
export async function saveRoast(roastData: {
  code: string;
  roast: string;
  context: string;
  language: string;
}): Promise<void> {
  const payload = { 
    code_snippet: roastData.code, 
    roast_markdown: roastData.roast,
    context: roastData.context,
    detected_language: roastData.language, // FIX: Use the correct column name 'detected_language'
  };

  const { data, error } = await supabase
    .from('roasts')
    .insert([payload]);

  if (error) {
    console.error('Supabase insert error:', error.message);
    throw new Error(`Supabase error: ${error.message}`);
  }

  console.log('Successfully saved to Data Moat:', data);
}

// Fix: Add and export fetchRecentRoasts function to retrieve data for the Hall of Yàb.
/**
 * Fetches the 10 most recent roasts from the database.
 */
export async function fetchRecentRoasts(): Promise<Roast[]> {
  const { data, error } = await supabase
    .from('roasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Supabase fetch error:', error.message);
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data || [];
}
