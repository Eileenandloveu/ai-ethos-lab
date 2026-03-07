-- Bot system tables — run on RDS after schema.sql
-- psql -h <RDS_ENDPOINT> -U <user> -d <dbname> -f bots/bot-tables.sql

CREATE TABLE IF NOT EXISTS bot_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  bots_count INTEGER NOT NULL DEFAULT 5 CHECK (bots_count BETWEEN 0 AND 20),
  actions_per_minute INTEGER NOT NULL DEFAULT 10 CHECK (actions_per_minute BETWEEN 1 AND 60),
  testimony_probability REAL NOT NULL DEFAULT 0.05 CHECK (testimony_probability BETWEEN 0 AND 1),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default row
INSERT INTO bot_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS bots (
  bot_id TEXT PRIMARY KEY,
  persona TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id TEXT NOT NULL REFERENCES bots(bot_id),
  action_type TEXT NOT NULL,
  case_id UUID REFERENCES cases(id),
  target_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_actions_bot ON bot_actions(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_actions_created ON bot_actions(created_at);
