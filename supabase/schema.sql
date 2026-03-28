-- ═══════════════════════════════════════════════════════════════
-- CoLAB Regulatory Intelligence — Supabase Database Schema
-- Run this entire file in Supabase → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROJECTS ────────────────────────────────────────────────────
-- Top level: one per client/company
create table if not exists projects (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,               -- e.g. "Cipla Ltd"
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── DOSSIERS ────────────────────────────────────────────────────
-- One dossier = one product + one market
create table if not exists dossiers (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid references projects(id) on delete cascade,
  product_name    text not null,           -- e.g. "Metformin 500mg"
  product_type    text,                    -- e.g. "Finished Dose Form"
  market          text not null,           -- e.g. "Philippines"
  authority       text,                    -- e.g. "FDA-PH"
  format          text default 'CTD',      -- CTD | ACTD
  submission_type text,                    -- e.g. "New Drug Application"
  status          text default 'In Progress', -- In Progress | Submitted | Approved
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── NODES ───────────────────────────────────────────────────────
-- Each checklist item in the dossier outline
create table if not exists nodes (
  id           uuid primary key default uuid_generate_v4(),
  dossier_id   uuid references dossiers(id) on delete cascade,
  section_code text not null,              -- e.g. "3.2.S.4.1"
  section_name text not null,              -- e.g. "Specification"
  module       text,                       -- e.g. "Module 3"
  required     boolean default true,
  status       text default 'pending',     -- pending | uploaded | reviewed | approved | missing
  created_at   timestamptz default now()
);

-- ── DOCUMENTS ───────────────────────────────────────────────────
-- Uploaded files attached to nodes
create table if not exists documents (
  id              uuid primary key default uuid_generate_v4(),
  node_id         uuid references nodes(id) on delete cascade,
  dossier_id      uuid references dossiers(id) on delete cascade,
  filename        text not null,
  file_path       text not null,           -- Supabase storage path
  file_size       bigint,
  file_type       text,                    -- pdf | docx | xlsx
  uploaded_at     timestamptz default now(),
  review_status   text default 'pending',  -- pending | reviewing | done | failed
  review_score    integer,                 -- 0-100
  review_verdict  text,                    -- PASS | FAIL | REVIEW
  review_summary  text,                    -- AI summary
  review_issues   jsonb,                   -- array of {type, description, severity}
  review_raw      text                     -- full AI response
);

-- ── AI REVIEW LOGS ──────────────────────────────────────────────
-- Detailed review results per document
create table if not exists review_logs (
  id              uuid primary key default uuid_generate_v4(),
  document_id     uuid references documents(id) on delete cascade,
  reviewed_at     timestamptz default now(),
  model           text default 'claude-sonnet-4-20250514',
  prompt_tokens   integer,
  output_tokens   integer,
  score           integer,
  verdict         text,
  critical_issues jsonb,
  major_issues    jsonb,
  minor_issues    jsonb,
  gap_analysis    text,
  compliance      jsonb,
  improvements    text
);

-- ── INDEXES ─────────────────────────────────────────────────────
create index if not exists idx_dossiers_project on dossiers(project_id);
create index if not exists idx_nodes_dossier    on nodes(dossier_id);
create index if not exists idx_documents_node   on documents(node_id);
create index if not exists idx_documents_dossier on documents(dossier_id);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────────
-- For now, open access (add user auth later)
alter table projects  enable row level security;
alter table dossiers  enable row level security;
alter table nodes     enable row level security;
alter table documents enable row level security;
alter table review_logs enable row level security;

-- Allow all operations (replace with user-specific policies when auth is added)
create policy "Allow all" on projects  for all using (true) with check (true);
create policy "Allow all" on dossiers  for all using (true) with check (true);
create policy "Allow all" on nodes     for all using (true) with check (true);
create policy "Allow all" on documents for all using (true) with check (true);
create policy "Allow all" on review_logs for all using (true) with check (true);

-- ── STORAGE BUCKET ──────────────────────────────────────────────
-- Run this separately in Supabase Storage section
-- Or uncomment and run here:
-- insert into storage.buckets (id, name, public)
-- values ('dossier-documents', 'dossier-documents', false);
