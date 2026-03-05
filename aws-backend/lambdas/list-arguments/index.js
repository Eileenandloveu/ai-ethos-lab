const { query } = require('../../shared/db');
const { respond, preflight, getQuery } = require('../../shared/http');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const { case_id, visitor_id } = getQuery(event);
  if (!case_id) return respond(event, 400, { error: 'Missing case_id' });

  try {
    const { rows: args } = await query(
      `SELECT argument_key, text FROM case_arguments WHERE case_id = $1 ORDER BY argument_key`,
      [case_id]
    );

    // Aggregate votes using GROUP BY (more efficient than fetching all rows)
    const { rows: voteCounts } = await query(
      `SELECT argument_key, vote, COUNT(*)::int AS cnt
       FROM case_argument_votes WHERE case_id = $1
       GROUP BY argument_key, vote`,
      [case_id]
    );
    const counts = {};
    for (const v of voteCounts) {
      if (!counts[v.argument_key]) counts[v.argument_key] = { up: 0, down: 0 };
      counts[v.argument_key][v.vote] = v.cnt;
    }

    let myVotes = {};
    if (visitor_id) {
      const { rows: mv } = await query(
        `SELECT argument_key, vote FROM case_argument_votes WHERE case_id = $1 AND visitor_id = $2`,
        [case_id, visitor_id]
      );
      for (const v of mv) myVotes[v.argument_key] = v.vote;
    }

    const result = args.map(a => ({
      argument_key: a.argument_key,
      text: a.text,
      up_count: counts[a.argument_key]?.up ?? 0,
      down_count: counts[a.argument_key]?.down ?? 0,
      my_vote: myVotes[a.argument_key] ?? null,
    }));

    return respond(event, 200, result);
  } catch (e) {
    return respond(event, 500, { error: e.message });
  }
};
