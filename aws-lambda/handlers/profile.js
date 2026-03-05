const { getPool, respond, preflight, getQuery } = require('../shared/db');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const { visitor_id } = getQuery(event);
  if (!visitor_id) return respond(400, { error: 'Missing visitor_id query param' });

  const pool = getPool();
  const client = await pool.connect();
  try {
    // Today in America/Los_Angeles
    const { rows: tzRows } = await client.query(
      `SELECT (NOW() AT TIME ZONE 'America/Los_Angeles')::date AS today`
    );
    const today = tzRows[0].today; // Date object

    // Upsert daily visit
    await client.query(
      `INSERT INTO daily_visits (visitor_id, visit_date) VALUES ($1, $2)
       ON CONFLICT (visitor_id, visit_date) DO NOTHING`,
      [visitor_id, today]
    );

    // Compute streak
    const { rows: visits } = await client.query(
      `SELECT visit_date FROM daily_visits WHERE visitor_id = $1 ORDER BY visit_date DESC`,
      [visitor_id]
    );

    let streak = 0;
    if (visits.length > 0) {
      let expected = new Date(today);
      for (const v of visits) {
        const d = new Date(v.visit_date);
        const diff = Math.round((expected.getTime() - d.getTime()) / 86400000);
        if (diff <= 1) {
          streak++;
          expected = new Date(d.getTime() - 86400000);
        } else {
          break;
        }
      }
    }

    // Get or create profile
    let { rows: profileRows } = await client.query(
      `SELECT visitor_id, role, trials_completed, streak_days, match_pct, juror_unlocked, clerk_unlocked
       FROM profiles WHERE visitor_id = $1`,
      [visitor_id]
    );

    if (profileRows.length === 0) {
      const { rows: inserted } = await client.query(
        `INSERT INTO profiles (visitor_id, streak_days)
         VALUES ($1, $2)
         RETURNING visitor_id, role, trials_completed, streak_days, match_pct, juror_unlocked, clerk_unlocked`,
        [visitor_id, streak]
      );
      profileRows = inserted;
    } else if (profileRows[0].streak_days !== streak) {
      await client.query(
        `UPDATE profiles SET streak_days = $1, updated_at = NOW() WHERE visitor_id = $2`,
        [streak, visitor_id]
      );
      profileRows[0].streak_days = streak;
    }

    return respond(200, profileRows[0]);
  } catch (e) {
    return respond(500, { error: e.message });
  } finally {
    client.release();
  }
};
