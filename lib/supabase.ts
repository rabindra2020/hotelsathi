import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValid = supabaseUrl.startsWith('http');

export const supabase = createClient(
  isValid ? supabaseUrl : 'https://placeholder.supabase.co',
  isValid ? supabaseAnonKey : 'placeholder'
);
