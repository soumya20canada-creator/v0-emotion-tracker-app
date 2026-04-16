-- =============================================
-- Bhava Onboarding Schema Migration
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Add new columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS identity_selections text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gender_identity text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pronouns text,
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- 2. Backfill first_name from display_name for existing users
UPDATE profiles SET first_name = display_name WHERE first_name IS NULL AND display_name IS NOT NULL;

-- 3. Create onboarding_sessions table
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  current_situation text[] DEFAULT '{}',
  whats_been_going_on text[] DEFAULT '{}',
  body_feelings text[] DEFAULT '{}',
  duration text,
  support_preferences text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id
  ON onboarding_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_created_at
  ON onboarding_sessions(created_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policy — users can only see and write their own sessions
CREATE POLICY IF NOT EXISTS "Users can manage their own onboarding sessions"
  ON onboarding_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Optional: function to delete user account data (called via RPC from client)
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM onboarding_sessions WHERE user_id = auth.uid();
  DELETE FROM profiles WHERE id = auth.uid();
END;
$$;

-- =============================================
-- IMPORTANT: To enable Google OAuth:
-- 1. Go to Supabase Dashboard > Authentication > Providers
-- 2. Enable Google provider
-- 3. Add your Google OAuth Client ID and Secret
-- 4. Add your site URL to the authorized redirect URIs in Google Console
-- =============================================
