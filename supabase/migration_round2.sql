
ALTER TABLE audits ADD COLUMN IF NOT EXISTS pricing_snapshot JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_audits_email ON audits(email) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS reaudit_notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT NOT NULL,
  audit_ids   TEXT[] NOT NULL,
  changes     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
