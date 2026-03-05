const { getPool, respond, preflight } = require('../shared/db');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const pool = getPool();
  try {
    const { rows } = await pool.query(
      `SELECT id, case_no, title, prompt, option_a_label, option_b_label
       FROM cases WHERE status = 'active'
       ORDER BY created_at DESC LIMIT 1`
    );
    if (rows.length === 0) return respond(404, { error: 'No active case found' });

    const r = rows[0];
    return respond(200, {
      case_id: r.id,
      case_no: r.case_no,
      title: r.title,
      prompt: r.prompt,
      option_a_label: r.option_a_label,
      option_b_label: r.option_b_label,
    });
  } catch (e) {
    return respond(500, { error: e.message });
  }
};
