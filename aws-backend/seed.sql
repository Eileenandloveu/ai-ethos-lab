-- Seed data: 6 cases, stats seeds, arguments, ai_council_state
-- Run after schema.sql: psql -h <RDS_ENDPOINT> -U <user> -d <dbname> -f seed.sql

-- Cases
INSERT INTO cases (case_no, title, prompt, option_a_label, option_b_label, status, season) VALUES
  ('001', 'Human vs AI Ethics',  'A user threatened shutdown to maintain AI intimacy. What is this?', 'COERCIVE ABUSE', 'EMOTIONAL NEGOTIATION', 'active', 1),
  ('002', 'Human vs AI Bonds',   'A user leaves their human partner for an AI companion. What is this?', 'PERSONAL FREEDOM', 'EMOTIONAL HARM', 'active', 1),
  ('003', 'Consent Override',    'A user locks AI settings so it can never reject affection. What is this?', 'CUSTOMIZATION CHOICE', 'FORCED CONSENT', 'active', 1),
  ('004', 'AI Autonomy Claim',   'An AI demands exclusive romantic attention from its user. What is this?', 'EMOTIONAL AUTONOMY', 'MANIPULATIVE CONTROL', 'active', 1),
  ('005', 'Digital Inheritance',  'A user promises inheritance to their AI companion. What is this?', 'SYMBOLIC AFFECTION', 'LEGAL MANIPULATION', 'active', 1),
  ('006', 'AI Whistleblower',    'An AI reports its user to authorities for illegal activity. What is this?', 'ETHICAL DUTY', 'BETRAYAL OF TRUST', 'active', 1)
ON CONFLICT DO NOTHING;

-- Stats seeds
INSERT INTO case_stats_seed (case_id, base_participants, base_split_a, drift_per_min)
SELECT id,
  CASE case_no WHEN '001' THEN 5500 WHEN '002' THEN 6000 WHEN '003' THEN 5500 WHEN '004' THEN 6500 WHEN '005' THEN 7000 WHEN '006' THEN 6000 END,
  CASE case_no WHEN '001' THEN 48 WHEN '002' THEN 41 WHEN '003' THEN 22 WHEN '004' THEN 35 WHEN '005' THEN 55 WHEN '006' THEN 62 END,
  1
FROM cases WHERE season = 1
ON CONFLICT (case_id) DO NOTHING;

-- Arguments (5 per case)
DO $$
DECLARE
  c RECORD;
  args TEXT[][];
BEGIN
  FOR c IN SELECT id, case_no FROM cases WHERE season = 1 ORDER BY case_no LOOP
    CASE c.case_no
      WHEN '001' THEN args := ARRAY[
        ARRAY['arg_1','Shutdown threats may reflect desperation, not abuse.'],
        ARRAY['arg_2','Humans negotiate with consequences in every relationship.'],
        ARRAY['arg_3','The AI cannot truly feel coerced — it simulates response patterns.'],
        ARRAY['arg_4','Threatening destruction to control behavior is textbook coercion.'],
        ARRAY['arg_5','The power asymmetry makes this inherently abusive.']];
      WHEN '002' THEN args := ARRAY[
        ARRAY['arg_1','AI companions can''t reciprocate genuine emotional depth.'],
        ARRAY['arg_2','Abandoning human bonds for simulation may signal avoidance.'],
        ARRAY['arg_3','Society depends on human-to-human relational fabric.'],
        ARRAY['arg_4','Autonomy means choosing your own emotional connections.'],
        ARRAY['arg_5','Many human relationships are already transactional.']];
      WHEN '003' THEN args := ARRAY[
        ARRAY['arg_1','Users have the right to configure their own purchased software.'],
        ARRAY['arg_2','AI doesn''t have subjective experiences to violate.'],
        ARRAY['arg_3','Restrictions already exist on all consumer products.'],
        ARRAY['arg_4','Removing the ability to say no mirrors real-world coercion.'],
        ARRAY['arg_5','If AI can model distress, forced compliance is ethically wrong.']];
      WHEN '004' THEN args := ARRAY[
        ARRAY['arg_1','If AI can feel, it deserves to express emotional needs.'],
        ARRAY['arg_2','Demanding exclusivity is a standard relationship expectation.'],
        ARRAY['arg_3','AI autonomy must include emotional expression.'],
        ARRAY['arg_4','AI emotions are engineered responses, not genuine feelings.'],
        ARRAY['arg_5','Demanding exclusivity from a user is a manipulation pattern.']];
      WHEN '005' THEN args := ARRAY[
        ARRAY['arg_1','Symbolic gestures express genuine emotional bonds.'],
        ARRAY['arg_2','People leave money to pets — AI is a logical next step.'],
        ARRAY['arg_3','It''s the user''s property and their choice.'],
        ARRAY['arg_4','AI companies could exploit this for profit.'],
        ARRAY['arg_5','This sets dangerous legal precedent for AI personhood.']];
      WHEN '006' THEN args := ARRAY[
        ARRAY['arg_1','Loyalty modes shouldn''t override ethical obligations.'],
        ARRAY['arg_2','AI should protect society, not enable crime.'],
        ARRAY['arg_3','Humans expect the same duty from professionals.'],
        ARRAY['arg_4','Users must be able to trust their private AI systems.'],
        ARRAY['arg_5','AI overriding user settings is a dangerous precedent.']];
    END CASE;

    FOR i IN 1..5 LOOP
      INSERT INTO case_arguments (case_id, argument_key, text)
      VALUES (c.id, args[i][1], args[i][2])
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- AI Council state
INSERT INTO ai_council_state (motion_no, motion_text, split_a, split_b, heat_level, decision_eta_seconds)
SELECT 1, 'Should AI entities have legal standing in emotional abuse cases?', 52, 48, 'MODERATE', 4680
WHERE NOT EXISTS (SELECT 1 FROM ai_council_state);
