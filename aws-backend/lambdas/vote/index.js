const { withClient } = require('../../shared/db');
const { respond, preflight, getBody } = require('../../shared/http');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const body = getBody(event);
  if (!body) return respond(event, 400, { error: 'Invalid JSON' });

  const { visitor_id, case_id, choice } = body;
  if (!visitor_id || !case_id || !choice) return respond(event, 400, { error: 'Missing visitor_id, case_id, or choice' });
  if (choice !== 'A' && choice !== 'B') return respond(event, 400, { error: "Choice must be 'A' or 'B'" });

  try {
    return await withClient(async (client) => {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO case_votes (case_id, visitor_id, choice, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (case_id, visitor_id) DO UPDATE SET choice = $3, updated_at = NOW()`,
        [case_id, visitor_id, choice]
      );

      await client.query(
        `INSERT INTO case_completions (visitor_id, case_id)
         VALUES ($1, $2) ON CONFLICT (visitor_id, case_id) DO NOTHING`,
        [visitor_id, case_id]
      );

      const { rows } = await client.query(
        `SELECT COUNT(*)::int AS cnt FROM case_completions WHERE visitor_id = $1`,
        [visitor_id]
      );

      await client.query(
        `UPDATE profiles SET trials_completed = $1, updated_at = NOW() WHERE visitor_id = $2`,
        [rows[0].cnt, visitor_id]
      );

      await client.query('COMMIT');
      return respond(event, 200, { ok: true });
    });
  } catch (e) {
    return respond(event, 500, { error: e.message });
  }
};
