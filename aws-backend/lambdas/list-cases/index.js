const { query } = require('../../shared/db');
const { respond, preflight } = require('../../shared/http');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  try {
    const { rows } = await query(
      `SELECT id, case_no, title, prompt, option_a_label, option_b_label, status, season
       FROM cases WHERE season = 1 ORDER BY case_no ASC`
    );
    const mapped = rows.map(r => ({
      case_id: r.id,
      case_no: r.case_no,
      title: r.title,
      prompt: r.prompt,
      option_a_label: r.option_a_label,
      option_b_label: r.option_b_label,
      status: r.status,
      season: r.season,
    }));
    return respond(event, 200, mapped);
  } catch (e) {
    return respond(event, 500, { error: e.message });
  }
};
