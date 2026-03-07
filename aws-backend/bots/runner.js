#!/usr/bin/env node
/**
 * 24/7 Bot Runner — generates realistic activity on the AI Ethics Lab platform.
 * Run with: node aws-backend/bots/runner.js
 * Or via pm2: pm2 start aws-backend/bots/runner.js --name aios-bot-runner
 *
 * Requires env vars: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 * Optional: BOT_AI_PROVIDER, BOT_AI_API_KEY, BOT_AI_MODEL
 */

const storage = require('./storage');
const { PERSONAS } = require('./personas');
const { generateTestimony } = require('./prompts');

// ── Utilities ──

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Action Executors ──

async function doVote(bot, caseData) {
  const choice = Math.random() * 100 < bot.stance_a_pct ? 'A' : 'B';
  await storage.voteCase(bot.bot_id, caseData.id, choice);
  await storage.logAction(bot.bot_id, 'vote', caseData.id, null, { choice });
  console.log(`[bot] ${bot.bot_id} voted ${choice} on case ${caseData.case_no}`);
}

async function doVoteArgument(bot, caseData) {
  const args = await storage.getArguments(caseData.id);
  if (args.length === 0) return false;
  const arg = pick(args);
  // Bias: arguments aligned with stance get upvoted more
  const argIndex = parseInt(arg.argument_key.replace('arg_', ''), 10) || 3;
  const likelyUp = (argIndex <= 3 && bot.stance_a_pct > 50) || (argIndex > 3 && bot.stance_a_pct <= 50);
  const vote = (likelyUp ? Math.random() < 0.7 : Math.random() < 0.3) ? 'up' : 'down';
  await storage.voteArgument(bot.bot_id, caseData.id, arg.argument_key, vote);
  await storage.logAction(bot.bot_id, 'vote_argument', caseData.id, arg.argument_key, { vote });
  console.log(`[bot] ${bot.bot_id} ${vote}voted arg ${arg.argument_key} on case ${caseData.case_no}`);
  return true;
}

async function doVoteTestimony(bot, caseData) {
  const testimonies = await storage.getTestimonies(caseData.id);
  if (testimonies.length === 0) return false;
  const t = pick(testimonies);
  const vote = Math.random() < 0.65 ? 'up' : 'down';
  await storage.voteTestimony(bot.bot_id, t.id, vote);
  await storage.logAction(bot.bot_id, 'vote_testimony', caseData.id, t.id, { vote });
  console.log(`[bot] ${bot.bot_id} ${vote}voted testimony on case ${caseData.case_no}`);
  return true;
}

async function doSubmitTestimony(bot, caseData) {
  const text = await generateTestimony(bot, caseData);
  if (!text) return false;
  const id = await storage.submitTestimony(bot.bot_id, caseData.id, text);
  await storage.logAction(bot.bot_id, 'submit_testimony', caseData.id, id, { text });
  console.log(`[bot] ${bot.bot_id} testified: "${text.slice(0, 50)}..."`);
  return true;
}

// ── Main Loop ──

async function runCycle() {
  const settings = await storage.getSettings();
  if (!settings.enabled) {
    return;
  }

  const cases = await storage.getActiveCases();
  if (cases.length === 0) {
    console.log('[bot] No active cases, skipping cycle');
    return;
  }

  // Check global rate limit
  const recentActions = await storage.getActionsInLastMinute();
  if (recentActions >= settings.actions_per_minute) {
    return;
  }

  // Select active bots
  const activeBots = PERSONAS.slice(0, settings.bots_count);

  // Pick one random bot for this cycle
  const bot = pick(activeBots);
  
  // Per-bot rate limit: 30-120s between actions
  const lastAction = await storage.getLastActionTime(bot.bot_id);
  if (lastAction) {
    const elapsed = Date.now() - new Date(lastAction).getTime();
    const cooldown = randInt(30, 120) * 1000;
    if (elapsed < cooldown) return;
  }

  const caseData = pick(cases);

  // Decide action type
  const roll = Math.random();
  try {
    if (roll < settings.testimony_probability) {
      await doSubmitTestimony(bot, caseData);
    } else if (roll < 0.35) {
      await doVote(bot, caseData);
    } else if (roll < 0.65) {
      await doVoteArgument(bot, caseData);
    } else {
      await doVoteTestimony(bot, caseData);
    }
  } catch (err) {
    console.error(`[bot] Action error for ${bot.bot_id}: ${err.message}`);
  }
}

async function main() {
  console.log('[bot] Starting bot runner...');

  // Register all personas in DB and ensure profiles
  await storage.ensureBots(PERSONAS);
  for (const p of PERSONAS) {
    await storage.ensureProfile(p.bot_id);
  }
  console.log(`[bot] ${PERSONAS.length} personas registered`);

  // Main loop: tick every 3-8 seconds
  let running = true;
  process.on('SIGINT', () => { running = false; });
  process.on('SIGTERM', () => { running = false; });

  while (running) {
    try {
      await runCycle();
    } catch (err) {
      console.error(`[bot] Cycle error: ${err.message}`);
    }
    await sleep(randInt(3000, 8000));
  }

  console.log('[bot] Shutting down...');
  await storage.shutdown();
  process.exit(0);
}

main().catch(err => {
  console.error(`[bot] Fatal: ${err.message}`);
  process.exit(1);
});
