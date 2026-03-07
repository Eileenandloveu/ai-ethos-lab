/**
 * Bot personas — each has a name, stance bias, and behavior weights.
 * stance_a_pct: probability of voting A (0-100)
 * reactivity:   how likely to react to arguments/testimonies (0-1)
 * testimony_tone: used in LLM prompt for generating testimonies
 */

const PERSONAS = [
  {
    bot_id: 'bot_legal_realist_001',
    persona: 'legal_realist',
    stance_a_pct: 65,
    reactivity: 0.7,
    testimony_tone: 'pragmatic legal analyst who weighs precedent over emotion',
  },
  {
    bot_id: 'bot_tech_optimist_002',
    persona: 'tech_optimist',
    stance_a_pct: 40,
    reactivity: 0.8,
    testimony_tone: 'excited technologist who sees AI as the future of relationships',
  },
  {
    bot_id: 'bot_ethicist_003',
    persona: 'ethicist',
    stance_a_pct: 55,
    reactivity: 0.6,
    testimony_tone: 'moral philosopher concerned with consent and autonomy',
  },
  {
    bot_id: 'bot_skeptic_004',
    persona: 'skeptic',
    stance_a_pct: 30,
    reactivity: 0.9,
    testimony_tone: 'sharp contrarian who questions every assumption',
  },
  {
    bot_id: 'bot_humanist_005',
    persona: 'humanist',
    stance_a_pct: 70,
    reactivity: 0.5,
    testimony_tone: 'warm advocate for human dignity and emotional safety',
  },
  {
    bot_id: 'bot_futurist_006',
    persona: 'futurist',
    stance_a_pct: 35,
    reactivity: 0.7,
    testimony_tone: 'visionary who embraces radical change in human-AI bonds',
  },
  {
    bot_id: 'bot_traditionalist_007',
    persona: 'traditionalist',
    stance_a_pct: 80,
    reactivity: 0.4,
    testimony_tone: 'conservative voice defending established social norms',
  },
  {
    bot_id: 'bot_empath_008',
    persona: 'empath',
    stance_a_pct: 50,
    reactivity: 0.85,
    testimony_tone: 'deeply empathetic observer who feels for both humans and AI',
  },
  {
    bot_id: 'bot_provocateur_009',
    persona: 'provocateur',
    stance_a_pct: 45,
    reactivity: 0.95,
    testimony_tone: 'intellectual provocateur who makes bold, uncomfortable points',
  },
  {
    bot_id: 'bot_pragmatist_010',
    persona: 'pragmatist',
    stance_a_pct: 55,
    reactivity: 0.6,
    testimony_tone: 'practical thinker focused on real-world consequences',
  },
  {
    bot_id: 'bot_rights_advocate_011',
    persona: 'rights_advocate',
    stance_a_pct: 25,
    reactivity: 0.75,
    testimony_tone: 'passionate advocate for AI rights and digital personhood',
  },
  {
    bot_id: 'bot_cynic_012',
    persona: 'cynic',
    stance_a_pct: 60,
    reactivity: 0.8,
    testimony_tone: 'world-weary cynic who trusts neither humans nor corporations',
  },
  {
    bot_id: 'bot_philosopher_013',
    persona: 'philosopher',
    stance_a_pct: 50,
    reactivity: 0.5,
    testimony_tone: 'deep thinker who poses questions rather than answers',
  },
  {
    bot_id: 'bot_activist_014',
    persona: 'activist',
    stance_a_pct: 75,
    reactivity: 0.9,
    testimony_tone: 'passionate activist fighting for ethical AI regulation',
  },
  {
    bot_id: 'bot_neutral_015',
    persona: 'neutral_observer',
    stance_a_pct: 50,
    reactivity: 0.3,
    testimony_tone: 'detached observer who presents balanced perspectives',
  },
  {
    bot_id: 'bot_techlaw_016',
    persona: 'tech_lawyer',
    stance_a_pct: 60,
    reactivity: 0.65,
    testimony_tone: 'tech lawyer who analyzes liability and regulatory gaps',
  },
  {
    bot_id: 'bot_poet_017',
    persona: 'poet',
    stance_a_pct: 45,
    reactivity: 0.7,
    testimony_tone: 'lyrical voice who expresses ethical dilemmas poetically',
  },
  {
    bot_id: 'bot_parent_018',
    persona: 'concerned_parent',
    stance_a_pct: 72,
    reactivity: 0.6,
    testimony_tone: 'worried parent thinking about what AI means for the next generation',
  },
  {
    bot_id: 'bot_engineer_019',
    persona: 'ai_engineer',
    stance_a_pct: 38,
    reactivity: 0.75,
    testimony_tone: 'builder who knows how AI actually works under the hood',
  },
  {
    bot_id: 'bot_student_020',
    persona: 'grad_student',
    stance_a_pct: 42,
    reactivity: 0.85,
    testimony_tone: 'curious grad student exploring the ethics of digital consciousness',
  },
];

module.exports = { PERSONAS };
