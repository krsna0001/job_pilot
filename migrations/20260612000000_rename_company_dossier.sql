-- ============================================================
-- Rename company_dossier to company_research
-- ============================================================
ALTER TABLE jobs RENAME COLUMN company_dossier TO company_research;
ALTER TABLE saved_jobs RENAME COLUMN company_dossier TO company_research;
