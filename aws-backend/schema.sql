-- AWS RDS PostgreSQL Schema for AI Ethics Lab
-- Run: psql -h <RDS_ENDPOINT> -U <user> -d <dbname> -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_no TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  option_a_label TEXT NOT NULL,
  option_b_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  season INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_stats_seed (
  case_id UUID PRIMARY KEY REFERENCES cases(id),
  base_participants INTEGER NOT NULL DEFAULT 5000,
  base_split_a INTEGER NOT NULL DEFAULT 53,
  drift_per_min INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  visitor_id TEXT NOT NULL,
  choice TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS case_arguments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  argument_key TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_argument_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  argument_key TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  vote TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, argument_key, visitor_id)
);

CREATE TABLE IF NOT EXISTS testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  visitor_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimony_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testimony_id UUID NOT NULL REFERENCES testimonies(id),
  visitor_id TEXT NOT NULL,
  vote TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (testimony_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS case_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  case_id UUID NOT NULL REFERENCES cases(id),
  first_completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (visitor_id, case_id)
);

CREATE TABLE IF NOT EXISTS daily_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  visit_date DATE NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (visitor_id, visit_date)
);

CREATE TABLE IF NOT EXISTS profiles (
  visitor_id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'witness',
  trials_completed INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  match_pct INTEGER NOT NULL DEFAULT 50,
  juror_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  clerk_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_council_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motion_no INTEGER NOT NULL DEFAULT 1,
  motion_text TEXT NOT NULL DEFAULT '',
  split_a INTEGER NOT NULL DEFAULT 50,
  split_b INTEGER NOT NULL DEFAULT 50,
  heat_level TEXT NOT NULL DEFAULT 'MODERATE',
  decision_eta_seconds INTEGER NOT NULL DEFAULT 4680,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS camp_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  camp TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clause_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clause_id UUID NOT NULL REFERENCES clauses(id),
  visitor_id TEXT NOT NULL,
  vote TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_votes_case_id ON case_votes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_argument_votes_case_arg ON case_argument_votes(case_id, argument_key);
CREATE INDEX IF NOT EXISTS idx_testimonies_case_id ON testimonies(case_id);
CREATE INDEX IF NOT EXISTS idx_testimony_votes_tid ON testimony_votes(testimony_id);
CREATE INDEX IF NOT EXISTS idx_daily_visits_visitor ON daily_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_case_completions_visitor ON case_completions(visitor_id);
