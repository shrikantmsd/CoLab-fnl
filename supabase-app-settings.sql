-- Single shared settings row: profile info + an optional password override.
-- Theme choice is NOT here on purpose — that's a per-browser preference
-- (localStorage), while this table holds the organization-wide data that's
-- meant to migrate cleanly into real per-user accounts later.
--
-- The `access_password` column is additive to the existing env-var password,
-- never a replacement: the login check accepts EITHER the original
-- NEXT_PUBLIC_ACCESS_PASSWORD env var OR whatever is stored here (if set).
-- This means setting a new password here can never lock anyone out — the
-- original one keeps working no matter what.

CREATE TABLE IF NOT EXISTS app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  profile_name text,
  profile_email text,
  profile_role text,
  access_password text,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT app_settings_singleton CHECK (id = 1)
);

INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Allow all') THEN
    CREATE POLICY "Allow all" ON app_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
