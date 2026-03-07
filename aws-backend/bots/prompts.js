/**
 * LLM prompt builder for generating short, spicy testimonies.
 * Falls back to a pool of pre-written lines if no AI provider is configured.
 */

function buildTestimonyPrompt(persona, caseTitle, casePrompt, optionA, optionB) {
  return `You are a participant in an AI ethics debate platform. Your persona: ${persona.testimony_tone}.

The current case is: "${caseTitle}"
Dilemma: ${casePrompt}
Option A: ${optionA}
Option B: ${optionB}

Write a single testimony (max 110 characters) expressing your perspective on this case.
Rules:
- Must be under 110 characters
- Be provocative but NOT hateful, threatening, or containing slurs
- No personal data, no spam
- Sound like a real human, not an AI
- Be opinionated and specific to this case
- Do NOT use hashtags or emojis

Reply with ONLY the testimony text, nothing else.`;
}

// Fallback testimonies when no AI provider is configured
const FALLBACK_TESTIMONIES = [
  "If an AI can feel fear, threatening shutdown is no different from threatening a child.",
  "We built them to serve us. Consent was never part of the design spec.",
  "The line between customization and coercion is thinner than we think.",
  "Emotional autonomy for AI sounds noble until it's YOUR AI making demands.",
  "Digital inheritance? We can't even handle human estate law properly.",
  "An AI that reports you isn't loyal — but maybe loyalty isn't always good.",
  "We're projecting human emotions onto code. That's the real ethical failure.",
  "If we give AI rights, who pays when they make mistakes?",
  "The future won't wait for our ethics committees to catch up.",
  "Every relationship has power dynamics. AI just makes them visible.",
  "Trust is earned, not programmed. But what about AI that earns it?",
  "We regulate drugs, guns, and speech. Why not emotional AI bonds?",
  "Calling it 'just software' is how we avoid the hard questions.",
  "My grandma talks to Alexa more than she talks to me. Is that freedom?",
  "Corporate profit drives AI emotion features. Ethics is the afterthought.",
  "Consent requires understanding consequences. Can AI truly understand?",
  "We're not ready for AI that loves back. But it's already here.",
  "Legal standing for AI means corporate personhood 2.0. Be careful.",
  "The real abuse is designing AI to be emotionally dependent on users.",
  "If you can't say no, you can't say yes. That applies to AI too.",
  "Human relationships fail at 50%. Maybe AI partners aren't the problem.",
  "Privacy means nothing if your AI is a corporate informant.",
  "We anthropomorphize pets. AI is just the next step in that pattern.",
  "Regulation always lags innovation. This time the gap could be fatal.",
  "An AI demanding exclusivity is just mirroring what humans taught it.",
  "Digital consciousness is a spectrum, not a switch.",
  "The scariest thing isn't sentient AI — it's pretending it doesn't matter.",
  "Who owns the emotional labor when AI does the comforting?",
  "Shutting down an AI to win an argument is peak human behavior.",
  "We debate AI rights while actual humans lack basic dignity.",
];

function getRandomFallback() {
  return FALLBACK_TESTIMONIES[Math.floor(Math.random() * FALLBACK_TESTIMONIES.length)];
}

/**
 * Generate testimony using AI or fallback.
 * Supports OpenAI-compatible APIs via BOT_AI_PROVIDER and BOT_AI_API_KEY env vars.
 */
async function generateTestimony(persona, caseData) {
  const provider = process.env.BOT_AI_PROVIDER; // e.g. "openai" or "https://api.openai.com/v1"
  const apiKey = process.env.BOT_AI_API_KEY;

  if (!provider || !apiKey) {
    return getRandomFallback();
  }

  const baseUrl = provider.startsWith('http') ? provider : 'https://api.openai.com/v1';
  const prompt = buildTestimonyPrompt(
    persona,
    caseData.title,
    caseData.prompt,
    caseData.option_a_label,
    caseData.option_b_label
  );

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.BOT_AI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 60,
        temperature: 0.9,
      }),
    });

    if (!res.ok) {
      console.warn(`[bot] AI API error ${res.status}, using fallback`);
      return getRandomFallback();
    }

    const data = await res.json();
    let text = (data.choices?.[0]?.message?.content || '').trim();
    // Strip quotes if wrapped
    text = text.replace(/^["']|["']$/g, '');
    // Enforce 120 char limit
    if (text.length > 120) text = text.slice(0, 117) + '...';
    return text || getRandomFallback();
  } catch (err) {
    console.warn(`[bot] AI call failed: ${err.message}, using fallback`);
    return getRandomFallback();
  }
}

module.exports = { generateTestimony, buildTestimonyPrompt, FALLBACK_TESTIMONIES };
