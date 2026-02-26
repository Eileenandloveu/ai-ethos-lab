
-- Enable RLS on all pre-existing tables that were missing it
ALTER TABLE public.camp_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_stats_seed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clause_votes ENABLE ROW LEVEL SECURITY;

-- Public read policies for tables accessed via edge functions
CREATE POLICY "Public read cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Public read case_stats_seed" ON public.case_stats_seed FOR SELECT USING (true);
CREATE POLICY "Public read clauses" ON public.clauses FOR SELECT USING (true);
CREATE POLICY "Public read case_votes" ON public.case_votes FOR SELECT USING (true);
CREATE POLICY "Public insert case_votes" ON public.case_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update case_votes" ON public.case_votes FOR UPDATE USING (true);
CREATE POLICY "Public read camp_choices" ON public.camp_choices FOR SELECT USING (true);
CREATE POLICY "Public insert camp_choices" ON public.camp_choices FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read clause_votes" ON public.clause_votes FOR SELECT USING (true);
CREATE POLICY "Public insert clause_votes" ON public.clause_votes FOR INSERT WITH CHECK (true);
