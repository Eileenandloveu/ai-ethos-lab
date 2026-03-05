const { query } = require('../../shared/db');
const { respond, preflight } = require('../../shared/http');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  try {
    const { rows } = await query(
      `SELECT id, case_no, title, prompt, option_a_label, option_b_label
       FROM cases WHERE status = 'active'
       ORDER BY created_at DESC LIMIT 1`
    );
    if (rows.length === 0) return respond(event, 404, { error: 'No active case found' });
    const r = rows[0];
    return respond(event, 200, {
      case_id: r.id,
      case_no: r.case_no,
      title: r.title,
      prompt: r.prompt,
      option_a_label: r.option_a_label,
      option_b_label: r.option_b_label,
    });
  } catch (e) {
    return respond(event, 500, { error: e.message });
  }
};
