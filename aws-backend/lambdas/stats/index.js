const { query } = require('../../shared/db');
const { respond, preflight, getQuery } = require('../../shared/http');

exports.handler = async (event) => {
  const pf = preflight(event);
  if (pf) return pf;

  const { case_id, mode = 'hybrid' } = getQuery(event);
  if (!case_id) return respond(event, 400, { error: 'Missing case_id query param' });
  if (!['atmosphere', 'real', 'hybrid'].includes(mode)) return respond(event, 400, { error: 'mode must be atmosphere, real, or hybrid' });

  try {
    // Atmosphere seed
    const { rows: seedRows } = await query(
      `SELECT base_participants, base_split_a, drift_per_min FROM case_stats_seed WHERE case_id = $1`,
      [case_id]
    );
    const seed = seedRows[0] || { base_participants: 5000, base_split_a: 50, drift_per_min: 1 };

    const now = new Date();
    const minuteOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();
    const drift = Math.sin(minuteOfDay * 0.05) * seed.drift_per_min * 3;
    let atmo_split_a = Math.round(seed.base_split_a + drift);
    atmo_split_a = Math.max(40, Math.min(60, atmo_split_a));
    const atmo_split_b = 100 - atmo_split_a;
    const jitter = Math.floor(Math.sin(minuteOfDay * 0.1) * 500 + Math.cos(now.getUTCSeconds() * 0.3) * 200);
    const atmo_participants = seed.base_participants + jitter;

    if (mode === 'atmosphere') {
      return respond(event, 200, { participants: atmo_participants, split_a: atmo_split_a, split_b: atmo_split_b, next_refresh_seconds: 60 });
    }

    // Real votes
    const { rows: votes } = await query(`SELECT choice FROM case_votes WHERE case_id = $1`, [case_id]);
    const real_total = votes.length;
    const real_count_a = votes.filter(v => v.choice === 'A').length;
    const real_split_a = real_total > 0 ? Math.round((real_count_a / real_total) * 100) : 50;
    const real_split_b = 100 - real_split_a;

    if (mode === 'real') {
      return respond(event, 200, { participants: real_total, split_a: real_split_a, split_b: real_split_b, next_refresh_seconds: 60 });
    }

    // Hybrid
    const w = Math.min(real_total / 200, 1);
    const hybrid_split_a = Math.round((1 - w) * atmo_split_a + w * real_split_a);
    return respond(event, 200, {
      participants: Math.round((1 - w) * atmo_participants + w * real_total),
      split_a: hybrid_split_a,
      split_b: 100 - hybrid_split_a,
      next_refresh_seconds: 60,
    });
  } catch (e) {
    return respond(event, 500, { error: e.message });
  }
};
