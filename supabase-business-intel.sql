-- ═══════════════════════════════════════════════════════════════════════════
-- Business Intelligence — shared data store for Tenders, Patent Cliff,
-- Para IV, and Industry News.
--
-- One row per item. AI-refresh (manual button or weekly cron) replaces all
-- source='ai' rows for a category on each run. source='manual' rows are
-- entered by the admin directly and are never touched by AI refresh — only
-- an explicit delete removes them.
--
-- Run this once in the Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists business_intel (
  id          uuid primary key default uuid_generate_v4(),
  category    text not null,              -- 'tenders' | 'patent-cliff' | 'para-iv' | 'news'
  data        jsonb not null,             -- the item's fields (varies by category)
  source      text not null default 'manual', -- 'ai' | 'manual'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table business_intel enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'business_intel' and policyname = 'Allow all') then
    create policy "Allow all" on business_intel for all using (true) with check (true);
  end if;
end $$;

create index if not exists idx_business_intel_category on business_intel(category);
create index if not exists idx_business_intel_source on business_intel(source);
