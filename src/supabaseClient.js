import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// The application remains in demo mode until authentication is integrated.
export const supabase = url && publishableKey ? createClient(url, publishableKey) : null;
