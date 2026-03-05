const { query } = require('../../shared/db');
const { respond, preflight, getBody } = require('../../shared/http');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const body = getBody(event);
  if (!body) return respond(event, 400, { error: 'Invalid JSON' });

  const { visitor_id, case_id, argument_key, vote } = body;
  if (!visitor_id || !case_id || !argument_key || !vote) return respond(event, 400, { error: 'Missing fields' });
  if (vote !== 'up' && vote !== 'down') return respond(event, 400, { error: "vote must be 'up' or 'down'" });

  try {
    await query(
      `INSERT INTO case_argument_votes (case_id, argument_key, visitor_id, vote, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (case_id, argument_key, visitor_id)
       DO UPDATE SET vote = $4, updated_at = NOW()`,
      [case_id, argument_key, visitor_id, vote]
    );

    const { rows } = await query(
      `SELECT vote, COUNT(*)::int AS cnt
       FROM case_argument_votes WHERE case_id = $1 AND argument_key = $2
       GROUP BY vote`,
      [case_id, argument_key]
    );
    let up_count = 0, down_count = 0;
    for (const r of rows) { if (r.vote === 'up') up_count = r.cnt; else down_count = r.cnt; }

    return respond(event, 200, { ok: true, argument_key, up_count, down_count, my_vote: vote });
  } catch (e) {
    return respond(event, 500, { error: e.message });
  }
};
