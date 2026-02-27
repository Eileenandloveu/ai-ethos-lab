
-- A) Case arguments (pre-seeded per case)
CREATE TABLE public.case_arguments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id),
  argument_key text NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(case_id, argument_key)
);
ALTER TABLE public.case_arguments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read case_arguments" ON public.case_arguments FOR SELECT USING (true);

-- Argument votes
CREATE TABLE public.case_argument_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id),
  argument_key text NOT NULL,
  visitor_id text NOT NULL,
  vote text NOT NULL CHECK (vote IN ('up','down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(case_id, argument_key, visitor_id)
);
ALTER TABLE public.case_argument_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read case_argument_votes" ON public.case_argument_votes FOR SELECT USING (true);
CREATE POLICY "Public insert case_argument_votes" ON public.case_argument_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update case_argument_votes" ON public.case_argument_votes FOR UPDATE USING (true);

-- B) Testimonies
CREATE TABLE public.testimonies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id),
  visitor_id text NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read testimonies" ON public.testimonies FOR SELECT USING (true);
CREATE POLICY "Public insert testimonies" ON public.testimonies FOR INSERT WITH CHECK (true);

-- Testimony votes
CREATE TABLE public.testimony_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  testimony_id uuid NOT NULL REFERENCES public.testimonies(id),
  visitor_id text NOT NULL,
  vote text NOT NULL CHECK (vote IN ('up','down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(testimony_id, visitor_id)
);
ALTER TABLE public.testimony_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read testimony_votes" ON public.testimony_votes FOR SELECT USING (true);
CREATE POLICY "Public insert testimony_votes" ON public.testimony_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update testimony_votes" ON public.testimony_votes FOR UPDATE USING (true);

-- C) Case completions (unique trials tracking)
CREATE TABLE public.case_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  case_id uuid NOT NULL REFERENCES public.cases(id),
  first_completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(visitor_id, case_id)
);
ALTER TABLE public.case_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read case_completions" ON public.case_completions FOR SELECT USING (true);
CREATE POLICY "Public insert case_completions" ON public.case_completions FOR INSERT WITH CHECK (true);

-- Daily visits (streak tracking)
CREATE TABLE public.daily_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  visit_date date NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(visitor_id, visit_date)
);
ALTER TABLE public.daily_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read daily_visits" ON public.daily_visits FOR SELECT USING (true);
CREATE POLICY "Public insert daily_visits" ON public.daily_visits FOR INSERT WITH CHECK (true);
