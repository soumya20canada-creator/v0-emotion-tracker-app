import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://slfjidqhsbbxfzkusdnd.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZmppZHFoc2JieGZ6a3VzZG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NjU5NTAsImV4cCI6MjA4NzE0MTk1MH0.JyHvaPsYPl6sZcBFuLTL9yK7JntezdvFI-MArNiUGYY"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
