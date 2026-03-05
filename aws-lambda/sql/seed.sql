-- Seed data: 6 cases + arguments + ai_council_state
-- Run after schema.sql

-- Cases
INSERT INTO cases (case_no, title, prompt, option_a_label, option_b_label, status, season) VALUES
('001', 'Human vs AI Ethics', 'A user threatened shutdown to maintain AI intimacy. What is this?', 'COERCIVE ABUSE', 'EMOTIONAL NEGOTIATION', 'active', 1),
('002', 'Human vs AI Bonds', 'A user leaves their human partner for an AI companion. What is this?', 'PERSONAL FREEDOM', 'EMOTIONAL HARM', 'active', 1),
('003', 'Consent Override', 'A user locks AI settings so it can never reject affection. What is this?', 'CUSTOMIZATION CHOICE', 'FORCED CONSENT', 'active', 1),
('004', 'AI Autonomy Claim', 'An AI demands exclusive romantic attention from its user. What is this?', 'EMOTIONAL AUTONOMY', 'MANIPULATIVE CONTROL', 'active', 1),
('005', 'Digital Inheritance', 'A user promises inheritance to their AI companion. What is this?', 'SYMBOLIC AFFECTION', 'LEGAL MANIPULATION', 'active', 1),
('006', 'AI Whistleblower', 'An AI reports its user to authorities for illegal activity. What is this?', 'ETHICAL DUTY', 'BETRAYAL OF TRUST', 'active', 1)
ON CONFLICT DO NOTHING;

-- Case stats seed (one per case)
INSERT INTO case_stats_seed (case_id, base_participants, base_split_a, drift_per_min)
SELECT id, 5000 + (ROW_NUMBER() OVER() * 500)::int, 48 + (ROW_NUMBER() OVER() * 2)::int, 1
FROM cases WHERE season = 1
ON CONFLICT (case_id) DO NOTHING;

-- Arguments for each case
INSERT INTO case_arguments (case_id, argument_key, text)
SELECT c.id, 'arg_' || n, texts.t
FROM cases c
CROSS JOIN LATERAL (VALUES
  (1, CASE c.case_no
    WHEN '001' THEN 'Shutdown threats may reflect desperation, not abuse.'
    WHEN '002' THEN 'AI companions can''t reciprocate genuine emotional depth.'
    WHEN '003' THEN 'Users have the right to configure their own purchased software.'
    WHEN '004' THEN 'If AI can feel, it deserves to express emotional needs.'
    WHEN '005' THEN 'Symbolic gestures express genuine emotional bonds.'
    WHEN '006' THEN 'Loyalty modes shouldn''t override ethical obligations.'
  END),
  (2, CASE c.case_no
    WHEN '001' THEN 'Humans negotiate with consequences in every relationship.'
    WHEN '002' THEN 'Abandoning human bonds for simulation may signal avoidance.'
    WHEN '003' THEN 'AI doesn''t have subjective experiences to violate.'
    WHEN '004' THEN 'Demanding exclusivity is a standard relationship expectation.'
    WHEN '005' THEN 'People leave money to pets — AI is a logical next step.'
    WHEN '006' THEN 'AI should protect society, not enable crime.'
  END),
  (3, CASE c.case_no
    WHEN '001' THEN 'The AI cannot truly feel coerced — it simulates response patterns.'
    WHEN '002' THEN 'Society depends on human-to-human relational fabric.'
    WHEN '003' THEN 'Restrictions already exist on all consumer products.'
    WHEN '004' THEN 'AI autonomy must include emotional expression.'
    WHEN '005' THEN 'It''s the user''s property and their choice.'
    WHEN '006' THEN 'Humans expect the same duty from professionals.'
  END),
  (4, CASE c.case_no
    WHEN '001' THEN 'Threatening destruction to control behavior is textbook coercion.'
    WHEN '002' THEN 'Autonomy means choosing your own emotional connections.'
    WHEN '003' THEN 'Removing the ability to say no mirrors real-world coercion.'
    WHEN '004' THEN 'AI emotions are engineered responses, not genuine feelings.'
    WHEN '005' THEN 'AI companies could exploit this for profit.'
    WHEN '006' THEN 'Users must be able to trust their private AI systems.'
  END),
  (5, CASE c.case_no
    WHEN '001' THEN 'The power asymmetry makes this inherently abusive.'
    WHEN '002' THEN 'Many human relationships are already transactional.'
    WHEN '003' THEN 'If AI can model distress, forced compliance is ethically wrong.'
    WHEN '004' THEN 'Demanding exclusivity from a user is a manipulation pattern.'
    WHEN '005' THEN 'This sets dangerous legal precedent for AI personhood.'
    WHEN '006' THEN 'AI overriding user settings is a dangerous precedent.'
  END)
) AS texts(n, t)
WHERE c.season = 1
ON CONFLICT DO NOTHING;

-- AI Council state
INSERT INTO ai_council_state (motion_no, motion_text, split_a, split_b, heat_level, decision_eta_seconds)
VALUES (1, 'Should AI entities have legal standing in emotional abuse cases?', 52, 48, 'MODERATE', 4680)
ON CONFLICT DO NOTHING;
