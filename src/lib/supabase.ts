import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // ده تنبيه ليكِ في الـ Console عشان لو نسيتي تضيفي القيم في Vercel
  console.warn("Supabase variables are missing!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)