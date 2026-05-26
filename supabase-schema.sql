-- ─── CoLAB Database Schema ────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor: supabase.com → your project → SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROJECTS ────────────────────────────────────────────────────────────────
create table projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,          -- from password session (email or token)
  name        text not null,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── CLIENTS ─────────────────────────────────────────────────────────────────
create table clients (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid references projects(id) on delete cascade,
  name        text not null,          -- client/company name
  contact     text,                   -- contact person
  email       text,
  created_at  timestamptz default now()
);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
create table products (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid references projects(id) on delete cascade,
  client_id       uuid references clients(id) on delete set null,
  name            text not null,       -- product name
  inn             text,                -- international non-proprietary name
  dosage_form     text,                -- tablet, capsule, injection etc
  strength        text,
  category        text,                -- FDF, API, Biological etc
  created_at      timestamptz default now()
);

-- ─── DOSSIERS ────────────────────────────────────────────────────────────────
create table dossiers (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid references products(id) on delete cascade,
  country         text not null,
  authority       text not null,       -- FDA, EMA, CDSCO, FDA-PH etc
  submission_type text not null,       -- NDA, ANDA, MAA, NDS etc
  dossier_format  text default 'CTD',  -- CTD or ACTD
  m4q_version     text default 'R1',   -- R1 or R2
  status          text default 'draft',-- draft, in_progress, submitted, approved
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── DOSSIER NODES ───────────────────────────────────────────────────────────
create table dossier_nodes (
  id              uuid primary key default uuid_generate_v4(),
  dossier_id      uuid references dossiers(id) on delete cascade,
  module          text not null,       -- Module 1, Module 2, Module 3 etc
  section         text not null,       -- 3.2.S.4.1, 3.2.P.8.3 etc
  title           text not null,       -- Specification, Stability Data etc
  required        boolean default true,
  status          text default 'missing', -- missing, uploaded, reviewed, approved
  created_at      timestamptz default now()
);

-- ─── DOCUMENTS ───────────────────────────────────────────────────────────────
create table documents (
  id              uuid primary key default uuid_generate_v4(),
  node_id         uuid references dossier_nodes(id) on delete cascade,
  dossier_id      uuid references dossiers(id) on delete cascade,
  filename        text not null,
  file_path       text not null,       -- path in Supabase storage
  file_size       integer,
  file_type       text,                -- pdf, docx etc
  review_score    integer,             -- 0-100
  review_status   text default 'pending', -- pending, reviewing, done, failed
  review_json     jsonb,               -- full AI review result
  review_summary  text,                -- short summary
  critical_issues integer default 0,
  major_issues    integer default 0,
  minor_issues    integer default 0,
  uploaded_at     timestamptz default now(),
  reviewed_at     timestamptz
);

-- ─── STORAGE BUCKET ──────────────────────────────────────────────────────────
-- Create this manually in Supabase Storage UI:
-- Bucket name: colab-documents
-- Public: false (private)

-- ─── ROW LEVEL SECURITY (basic) ──────────────────────────────────────────────
alter table projects      enable row level security;
alter table clients       enable row level security;
alter table products      enable row level security;
alter table dossiers      enable row level security;
alter table dossier_nodes enable row level security;
alter table documents     enable row level security;

-- Allow all operations for now (tighten later with proper auth)
create policy "Allow all" on projects      for all using (true) with check (true);
create policy "Allow all" on clients       for all using (true) with check (true);
create policy "Allow all" on products      for all using (true) with check (true);
create policy "Allow all" on dossiers      for all using (true) with check (true);
create policy "Allow all" on dossier_nodes for all using (true) with check (true);
create policy "Allow all" on documents     for all using (true) with check (true);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index on projects(user_id);
create index on clients(project_id);
create index on products(project_id);
create index on dossiers(product_id);
create index on dossier_nodes(dossier_id);
create index on documents(node_id);
create index on documents(dossier_id);
create index on documents(review_status);
