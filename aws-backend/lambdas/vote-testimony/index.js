const { query } = require('../../shared/db');
const { respond, preflight, getBody } = require('../../shared/http');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const body = getBody(event);
  if (!body) return respond(event, 400, { error: 'Invalid JSON' });

  const { visitor_id, testimony_id, vote } = body;
  if (!visitor_id || !testimony_id || !vote) return respond(event, 400, { error: 'Missing fields' });
  if (vote !== 'up' && vote !== 'down') return respond(event, 400, { error: "vote must be 'up' or 'down'" });

  try {
    await query(
      `INSERT INTO testimony_votes (testimony_id, visitor_id, vote, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (testimony_id, visitor_id)
       DO UPDATE SET vote = $3, updated_at = NOW()`,
      [testimony_id, visitor_id, vote]
    );

    const { rows } = await query(
      `SELECT vote, COUNT(*)::int AS cnt FROM testimony_votes WHERE testimony_id = $1 GROUP BY vote`,
      [testimony_id]
    );
    let up_count = 0, down_count = 0;
    for (const r of rows) { if (r.vote === 'up') up_count = r.cnt; else down_count = r.cnt; }

    return respond(event, 200, { ok: true, testimony_id, up_count, down_count, my_vote: vote });
  } catch (e) {
    return respond(event, 500, { error: e.message });
  }
};
