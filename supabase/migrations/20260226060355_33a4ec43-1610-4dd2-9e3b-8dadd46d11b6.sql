
-- 1. Add season column to cases if missing
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS season integer NOT NULL DEFAULT 1;

-- 2. Unique partial index: only one active case at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_cases_single_active
  ON public.cases (status)
  WHERE status = 'active';

-- 3. Unique constraint on case_votes for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'case_votes_case_visitor_unique'
  ) THEN
    ALTER TABLE public.case_votes
      ADD CONSTRAINT case_votes_case_visitor_unique UNIQUE (case_id, visitor_id);
  END IF;
END$$;

-- 4. Create ai_council_state table
CREATE TABLE IF NOT EXISTS public.ai_council_state (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  motion_no integer NOT NULL DEFAULT 1,
  motion_text text NOT NULL DEFAULT '',
  split_a integer NOT NULL DEFAULT 50,
  split_b integer NOT NULL DEFAULT 50,
  heat_level text NOT NULL DEFAULT 'MODERATE',
  decision_eta_seconds integer NOT NULL DEFAULT 4680,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_council_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ai_council_state" ON public.ai_council_state FOR SELECT USING (true);

-- 5. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  visitor_id text NOT NULL PRIMARY KEY,
  trials_completed integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  match_pct integer NOT NULL DEFAULT 50,
  role text NOT NULL DEFAULT 'witness',
  juror_unlocked boolean NOT NULL DEFAULT false,
  clerk_unlocked boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);
