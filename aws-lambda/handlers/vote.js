const { getPool, respond, preflight, getBody } = require('../shared/db');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const body = getBody(event);
  if (!body) return respond(400, { error: 'Invalid JSON' });

  const { visitor_id, case_id, choice } = body;
  if (!visitor_id || !case_id || !choice) return respond(400, { error: 'Missing visitor_id, case_id, or choice' });
  if (choice !== 'A' && choice !== 'B') return respond(400, { error: "Choice must be 'A' or 'B'" });

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert vote
    await client.query(
      `INSERT INTO case_votes (case_id, visitor_id, choice, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (case_id, visitor_id) DO UPDATE SET choice = $3, updated_at = NOW()`,
      [case_id, visitor_id, choice]
    );

    // Track completion (ignore if exists)
    await client.query(
      `INSERT INTO case_completions (visitor_id, case_id)
       VALUES ($1, $2) ON CONFLICT (visitor_id, case_id) DO NOTHING`,
      [visitor_id, case_id]
    );

    // Count completions and update profile
    const { rows } = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM case_completions WHERE visitor_id = $1`,
      [visitor_id]
    );
    const cnt = rows[0].cnt;

    await client.query(
      `UPDATE profiles SET trials_completed = $1, updated_at = NOW() WHERE visitor_id = $2`,
      [cnt, visitor_id]
    );

    await client.query('COMMIT');
    return respond(200, { ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    return respond(500, { error: e.message });
  } finally {
    client.release();
  }
};
