const { getPool, respond, preflight, getQuery } = require('../shared/db');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const { case_id, visitor_id } = getQuery(event);
  if (!case_id) return respond(400, { error: 'Missing case_id' });

  const pool = getPool();
  try {
    const { rows: testimonies } = await pool.query(
      `SELECT id, text, created_at FROM testimonies WHERE case_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [case_id]
    );
    if (testimonies.length === 0) return respond(200, []);

    const ids = testimonies.map(t => t.id);

    // Aggregate votes
    const { rows: votes } = await pool.query(
      `SELECT testimony_id, vote, COUNT(*)::int AS cnt
       FROM testimony_votes WHERE testimony_id = ANY($1)
       GROUP BY testimony_id, vote`,
      [ids]
    );
    const counts = {};
    for (const v of votes) {
      if (!counts[v.testimony_id]) counts[v.testimony_id] = { up: 0, down: 0 };
      counts[v.testimony_id][v.vote] = v.cnt;
    }

    // My votes
    let myVotes = {};
    if (visitor_id) {
      const { rows: mv } = await pool.query(
        `SELECT testimony_id, vote FROM testimony_votes WHERE testimony_id = ANY($1) AND visitor_id = $2`,
        [ids, visitor_id]
      );
      for (const v of mv) myVotes[v.testimony_id] = v.vote;
    }

    const result = testimonies.map(t => ({
      id: t.id,
      text: t.text,
      up_count: counts[t.id]?.up ?? 0,
      down_count: counts[t.id]?.down ?? 0,
      my_vote: myVotes[t.id] ?? null,
    }));

    result.sort((a, b) => (b.up_count + b.down_count) - (a.up_count + a.down_count));
    return respond(200, result.slice(0, 5));
  } catch (e) {
    return respond(500, { error: e.message });
  }
};
