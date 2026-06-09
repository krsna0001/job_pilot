-- ============================================================
-- Add company_dossier column to saved_jobs table
-- ============================================================
ALTER TABLE saved_jobs ADD COLUMN IF NOT EXISTS company_dossier JSONB;
