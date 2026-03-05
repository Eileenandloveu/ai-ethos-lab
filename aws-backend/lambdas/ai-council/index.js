const { query } = require('../../shared/db');
const { respond, preflight } = require('../../shared/http');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  try {
    const { rows } = await query(
      `SELECT motion_no, motion_text, split_a, split_b, heat_level, decision_eta_seconds
       FROM ai_council_state LIMIT 1`
    );
    if (rows.length === 0) return respond(event, 404, { error: 'No council state found' });
    return respond(event, 200, rows[0]);
  } catch (e) {
    return respond(event, 500, { error: e.message });
  }
};
