-- Add match_reasoning column to jobs table
ALTER TABLE jobs ADD COLUMN match_reasoning TEXT;

-- Add match_reasoning column to saved_jobs table
ALTER TABLE saved_jobs ADD COLUMN match_reasoning TEXT;
