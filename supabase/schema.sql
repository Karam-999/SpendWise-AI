CREATE TABLE IF NOT EXISTS audits (
  id            TEXT PRIMARY KEY,              
  tools_json    JSONB NOT NULL,                
  results_json  JSONB NOT NULL,                
  total_savings NUMERIC NOT NULL DEFAULT 0,    
  spend_score   INTEGER NOT NULL DEFAULT 100,  
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS leads (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id    TEXT REFERENCES audits(id) ON DELETE SET NULL,
  email       TEXT NOT NULL,
  company     TEXT,
  role        TEXT,
  team_size   INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_audit_id ON leads(audit_id);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);

CREATE TABLE IF NOT EXISTS marketplace_leads (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mode        TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  company     TEXT NOT NULL,
  phone       TEXT,
  platform    TEXT,
  message     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
