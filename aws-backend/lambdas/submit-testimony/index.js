const { query } = require('../../shared/db');
const { respond, preflight, getBody } = require('../../shared/http');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const body = getBody(event);
  if (!body) return respond(event, 400, { error: 'Invalid JSON' });

  const { visitor_id, case_id, text } = body;
  if (!visitor_id || !case_id || !text) return respond(event, 400, { error: 'Missing fields' });

  const trimmed = String(text).slice(0, 120);
  if (trimmed.length === 0) return respond(event, 400, { error: 'Empty text' });

  try {
    await query(
      `INSERT INTO testimonies (case_id, visitor_id, text) VALUES ($1, $2, $3)`,
      [case_id, visitor_id, trimmed]
    );

    // Return refreshed top 5
    const { rows: testimonies } = await query(
      `SELECT id, text FROM testimonies WHERE case_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [case_id]
    );
    if (testimonies.length === 0) return respond(event, 200, []);

    const ids = testimonies.map(t => t.id);
    const { rows: voteCounts } = await query(
      `SELECT testimony_id, vote, COUNT(*)::int AS cnt FROM testimony_votes WHERE testimony_id = ANY($1) GROUP BY testimony_id, vote`,
      [ids]
    );
    const { rows: mv } = await query(
      `SELECT testimony_id, vote FROM testimony_votes WHERE testimony_id = ANY($1) AND visitor_id = $2`,
      [ids, visitor_id]
    );

    const counts = {};
    for (const v of voteCounts) { if (!counts[v.testimony_id]) counts[v.testimony_id] = { up: 0, down: 0 }; counts[v.testimony_id][v.vote] = v.cnt; }
    const myVotes = {};
    for (const v of mv) myVotes[v.testimony_id] = v.vote;

    const result = testimonies.map(t => ({
      id: t.id, text: t.text,
      up_count: counts[t.id]?.up ?? 0, down_count: counts[t.id]?.down ?? 0,
      my_vote: myVotes[t.id] ?? null,
    }));
    result.sort((a, b) => (b.up_count + b.down_count) - (a.up_count + a.down_count));
    return respond(event, 200, result.slice(0, 5));
  } catch (e) {
    return respond(event, 500, { error: e.message });
  }
};
