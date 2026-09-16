-- Compliance date tracking for dossiers: annual filing and registration
-- renewal due dates. Both auto-calculate on dossier creation (submission
-- date + 1 year / + 5 years) and can be edited or advanced manually
-- thereafter — whatever value is stored becomes the anchor for the next
-- cycle, so a manual correction sticks rather than reverting.

ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS annual_filing_due date;
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS registration_renewal_due date;

-- Backfill existing dossiers that predate this feature
UPDATE dossiers
SET annual_filing_due = (created_at + interval '1 year')::date
WHERE annual_filing_due IS NULL;

UPDATE dossiers
SET registration_renewal_due = (created_at + interval '5 years')::date
WHERE registration_renewal_due IS NULL;
