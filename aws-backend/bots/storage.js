/**
 * Database helpers for the bot runner.
 * Uses the same pg Pool pattern as the main backend.
 */

const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function query(sql, params) {
  return getPool().query(sql, params);
}

// ── Settings ──

async function getSettings() {
  const { rows } = await query('SELECT * FROM bot_settings WHERE id = 1');
  return rows[0] || { enabled: false, bots_count: 5, actions_per_minute: 10, testimony_probability: 0.05 };
}

// ── Bots registry ──

async function ensureBots(personas) {
  for (const p of personas) {
    await query(
      `INSERT INTO bots (bot_id, persona) VALUES ($1, $2) ON CONFLICT (bot_id) DO NOTHING`,
      [p.bot_id, p.persona]
    );
  }
}

// ── Cases ──

async function getActiveCases() {
  const { rows } = await query(`SELECT id, case_no, title, prompt, option_a_label, option_b_label FROM cases WHERE status = 'active'`);
  return rows;
}

// ── Actions ──

async function logAction(botId, actionType, caseId, targetId, payload) {
  await query(
    `INSERT INTO bot_actions (bot_id, action_type, case_id, target_id, payload) VALUES ($1, $2, $3, $4, $5)`,
    [botId, actionType, caseId, targetId, JSON.stringify(payload)]
  );
}

async function getLastActionTime(botId) {
  const { rows } = await query(
    `SELECT created_at FROM bot_actions WHERE bot_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [botId]
  );
  return rows[0]?.created_at ? new Date(rows[0].created_at) : null;
}

async function getActionsInLastMinute() {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS cnt FROM bot_actions WHERE created_at > NOW() - INTERVAL '1 minute'`
  );
  return rows[0]?.cnt || 0;
}

// ── Vote on case ──

async function voteCase(botId, caseId, choice) {
  await query(
    `INSERT INTO case_votes (case_id, visitor_id, choice, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (case_id, visitor_id) DO UPDATE SET choice = $3, updated_at = NOW()`,
    [caseId, botId, choice]
  );
  await query(
    `INSERT INTO case_completions (visitor_id, case_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [botId, caseId]
  );
}

// ── Vote on argument ──

async function getArguments(caseId) {
  const { rows } = await query(
    `SELECT argument_key, text FROM case_arguments WHERE case_id = $1`,
    [caseId]
  );
  return rows;
}

async function voteArgument(botId, caseId, argumentKey, vote) {
  await query(
    `INSERT INTO case_argument_votes (case_id, argument_key, visitor_id, vote, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (case_id, argument_key, visitor_id) DO UPDATE SET vote = $4, updated_at = NOW()`,
    [caseId, argumentKey, botId, vote]
  );
}

// ── Testimonies ──

async function submitTestimony(botId, caseId, text) {
  const { rows } = await query(
    `INSERT INTO testimonies (case_id, visitor_id, text) VALUES ($1, $2, $3) RETURNING id`,
    [caseId, botId, text.slice(0, 120)]
  );
  return rows[0]?.id;
}

async function getTestimonies(caseId) {
  const { rows } = await query(
    `SELECT id, text FROM testimonies WHERE case_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [caseId]
  );
  return rows;
}

async function voteTestimony(botId, testimonyId, vote) {
  await query(
    `INSERT INTO testimony_votes (testimony_id, visitor_id, vote, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (testimony_id, visitor_id) DO UPDATE SET vote = $3, updated_at = NOW()`,
    [testimonyId, botId, vote]
  );
}

// ── Profile ──

async function ensureProfile(botId) {
  await query(
    `INSERT INTO profiles (visitor_id) VALUES ($1) ON CONFLICT (visitor_id) DO NOTHING`,
    [botId]
  );
}

// ── Cleanup ──

async function shutdown() {
  if (pool) await pool.end();
}

module.exports = {
  getSettings, ensureBots, getActiveCases, logAction,
  getLastActionTime, getActionsInLastMinute,
  voteCase, getArguments, voteArgument,
  submitTestimony, getTestimonies, voteTestimony,
  ensureProfile, shutdown,
};
