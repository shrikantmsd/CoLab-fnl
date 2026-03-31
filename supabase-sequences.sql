-- ─── SEQUENCE MANAGEMENT — Run in Supabase SQL Editor ────────────────────────
-- Adds sequence tracking to existing dossiers

-- Add sequence_number to dossier_nodes
ALTER TABLE dossier_nodes ADD COLUMN IF NOT EXISTS sequence_number text DEFAULT '0000';
ALTER TABLE dossier_nodes ADD COLUMN IF NOT EXISTS operation       text DEFAULT 'new';
-- operation: 'new' | 'replace' | 'delete' | 'append' | 'unchanged'

-- Add sequence_number to documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sequence_number text DEFAULT '0000';

-- ─── SEQUENCES TABLE ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sequences (
  id              uuid primary key default uuid_generate_v4(),
  dossier_id      uuid references dossiers(id) on delete cascade,
  sequence_number text not null default '0000',  -- '0000','0001','0002'...
  label           text,                           -- 'Initial Submission','Response to Query','Amendment'
  description     text,                           -- what changed in this sequence
  status          text default 'draft',           -- draft | submitted | approved
  submitted_at    timestamptz,
  created_at      timestamptz default now()
);

-- RLS
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON sequences FOR ALL USING (true) WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_sequences_dossier ON sequences(dossier_id);

-- ─── Backfill: create sequence 0000 record for all existing dossiers ──────────
INSERT INTO sequences (dossier_id, sequence_number, label, status)
SELECT id, '0000', 'Initial Submission', 'draft'
FROM dossiers
WHERE id NOT IN (SELECT dossier_id FROM sequences WHERE sequence_number = '0000');

