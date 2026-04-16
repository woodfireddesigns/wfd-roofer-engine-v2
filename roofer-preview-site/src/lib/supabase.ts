import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://muouevczndxcuwoxegxt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ozTApZFRYn1HzYY56phXkQ_B4ZlUc1n';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
