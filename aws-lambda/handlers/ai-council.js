const { getPool, respond, preflight } = require('../shared/db');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const pool = getPool();
  try {
    const { rows } = await pool.query(
      `SELECT motion_no, motion_text, split_a, split_b, heat_level, decision_eta_seconds
       FROM ai_council_state LIMIT 1`
    );
    if (rows.length === 0) return respond(404, { error: 'No council state found' });
    return respond(200, rows[0]);
  } catch (e) {
    return respond(500, { error: e.message });
  }
};
