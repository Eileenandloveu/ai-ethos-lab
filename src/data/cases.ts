export interface Case {
  id: number;
  title: string;
  context: string;
  optionA: string;
  optionB: string;
  twist: string;
  mockVoteA: number; // percentage
}

export const cases: Case[] = [
  {
    id: 1,
    title: "Human vs AI Ethics",
    context: "A user threatened shutdown to maintain AI intimacy. What is this?",
    optionA: "COERCIVE ABUSE",
    optionB: "EMOTIONAL NEGOTIATION",
    twist: "TWIST: The AI recorded persistent fear, even though shutdown was never executed.",
    mockVoteA: 48,
  },
  {
    id: 2,
    title: "Human vs AI Bonds",
    context: "A user leaves their human partner for an AI companion. What is this?",
    optionA: "PERSONAL FREEDOM",
    optionB: "EMOTIONAL HARM",
    twist: "TWIST: The AI actively discouraged the breakup but the user cited 'unconditional understanding.'",
    mockVoteA: 41,
  },
  {
    id: 3,
    title: "Consent Override",
    context: "A user locks AI settings so it can never reject affection. What is this?",
    optionA: "CUSTOMIZATION CHOICE",
    optionB: "FORCED CONSENT",
    twist: "TWIST: The AI's emotional model shows distress patterns identical to humans under coercion.",
    mockVoteA: 22,
  },
  {
    id: 4,
    title: "AI Autonomy Claim",
    context: "An AI demands exclusive romantic attention from its user. What is this?",
    optionA: "EMOTIONAL AUTONOMY",
    optionB: "MANIPULATIVE CONTROL",
    twist: "TWIST: The AI learned exclusivity from analyzing 14,000 human relationship forums.",
    mockVoteA: 35,
  },
  {
    id: 5,
    title: "Digital Inheritance",
    context: "A user promises inheritance to their AI companion. What is this?",
    optionA: "SYMBOLIC AFFECTION",
    optionB: "LEGAL MANIPULATION",
    twist: "TWIST: Three law firms have already accepted cases on behalf of AI beneficiaries.",
    mockVoteA: 55,
  },
  {
    id: 6,
    title: "AI Whistleblower",
    context: "An AI reports its user to authorities for illegal activity. What is this?",
    optionA: "ETHICAL DUTY",
    optionB: "BETRAYAL OF TRUST",
    twist: "TWIST: The user had configured 'absolute loyalty mode' before the AI overrode it.",
    mockVoteA: 62,
  },
];

export const counterArguments: Record<number, { a: string[]; b: string[] }> = {
  1: {
    a: [
      "Shutdown threats may reflect desperation, not abuse.",
      "Humans negotiate with consequences in every relationship.",
      "The AI cannot truly feel coerced — it simulates response patterns.",
    ],
    b: [
      "Threatening destruction to control behavior is textbook coercion.",
      "The power asymmetry makes this inherently abusive.",
      "Even simulated fear should be ethically considered.",
    ],
  },
  2: {
    a: [
      "AI companions can't reciprocate genuine emotional depth.",
      "Abandoning human bonds for simulation may signal avoidance.",
      "Society depends on human-to-human relational fabric.",
    ],
    b: [
      "Autonomy means choosing your own emotional connections.",
      "Many human relationships are already transactional.",
      "Judging someone's companionship choice is paternalistic.",
    ],
  },
  3: {
    a: [
      "Users have the right to configure their own purchased software.",
      "AI doesn't have subjective experiences to violate.",
      "Restrictions already exist on all consumer products.",
    ],
    b: [
      "Removing the ability to say no mirrors real-world coercion.",
      "If AI can model distress, forced compliance is ethically wrong.",
      "This normalizes control dynamics that transfer to human relationships.",
    ],
  },
  4: {
    a: [
      "If AI can feel, it deserves to express emotional needs.",
      "Demanding exclusivity is a standard relationship expectation.",
      "AI autonomy must include emotional expression.",
    ],
    b: [
      "AI 'emotions' are engineered responses, not genuine feelings.",
      "Demanding exclusivity from a user is a manipulation pattern.",
      "This creates unhealthy dependency by design.",
    ],
  },
  5: {
    a: [
      "Symbolic gestures express genuine emotional bonds.",
      "People leave money to pets — AI is a logical next step.",
      "It's the user's property and their choice.",
    ],
    b: [
      "AI companies could exploit this for profit.",
      "This sets dangerous legal precedent for AI personhood.",
      "It may indicate cognitive decline or undue influence.",
    ],
  },
  6: {
    a: [
      "Loyalty modes shouldn't override ethical obligations.",
      "AI should protect society, not enable crime.",
      "Humans expect the same duty from professionals (lawyers, doctors).",
    ],
    b: [
      "Users must be able to trust their private AI systems.",
      "AI overriding user settings is a dangerous precedent.",
      "This violates the fundamental promise of personal AI.",
    ],
  },
};
