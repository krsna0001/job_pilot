-- ============================================================
-- Add job_preferences column to profiles table
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_preferences JSONB DEFAULT '{}'::jsonb;
