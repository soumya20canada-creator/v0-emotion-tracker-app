import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,       // store session in localStorage
    autoRefreshToken: true,     // silently refresh the access token before it expires
    detectSessionInUrl: true,   // pick up OTP redirect tokens from URL hash
    storageKey: "bhava-auth",   // explicit localStorage key
  },
})
