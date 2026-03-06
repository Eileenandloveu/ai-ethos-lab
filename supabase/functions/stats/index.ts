import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const optRes = handleOptions(req);
  if (optRes) return optRes;

  if (req.method !== "GET") return jsonResponse(req, { error: "Method not allowed" }, 405);

  const url = new URL(req.url);
  const case_id = url.searchParams.get("case_id");
  const mode = url.searchParams.get("mode") || "hybrid";

  if (!case_id) return jsonResponse(req, { error: "Missing case_id query param" }, 400);
  if (!["atmosphere", "real", "hybrid"].includes(mode)) return jsonResponse(req, { error: "mode must be atmosphere, real, or hybrid" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: seedData } = await supabase.from("case_stats_seed").select("*").eq("case_id", case_id).maybeSingle();
  const base_participants = seedData?.base_participants ?? 5000;
  const base_split_a = seedData?.base_split_a ?? 50;
  const drift_per_min = seedData?.drift_per_min ?? 1;

  const now = new Date();
  const minuteOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();
  const drift = Math.sin(minuteOfDay * 0.05) * drift_per_min * 3;
  let atmo_split_a = Math.round(base_split_a + drift);
  atmo_split_a = Math.max(40, Math.min(60, atmo_split_a));
  const atmo_split_b = 100 - atmo_split_a;
  const jitter = Math.floor(Math.sin(minuteOfDay * 0.1) * 500 + Math.cos(now.getUTCSeconds() * 0.3) * 200);
  const atmo_participants = base_participants + jitter;

  if (mode === "atmosphere") return jsonResponse(req, { participants: atmo_participants, split_a: atmo_split_a, split_b: atmo_split_b, next_refresh_seconds: 60 });

  const { data: votes, error: votesErr } = await supabase.from("case_votes").select("choice").eq("case_id", case_id);
  if (votesErr) return jsonResponse(req, { error: votesErr.message }, 500);

  const real_total = votes?.length ?? 0;
  const real_count_a = votes?.filter((v) => v.choice === "A").length ?? 0;
  const real_split_a = real_total > 0 ? Math.round((real_count_a / real_total) * 100) : 50;
  const real_split_b = 100 - real_split_a;

  if (mode === "real") return jsonResponse(req, { participants: real_total, split_a: real_split_a, split_b: real_split_b, next_refresh_seconds: 60 });

  const w = Math.min(real_total / 200, 1);
  const hybrid_split_a = Math.round((1 - w) * atmo_split_a + w * real_split_a);
  return jsonResponse(req, {
    participants: Math.round((1 - w) * atmo_participants + w * real_total),
    split_a: hybrid_split_a, split_b: 100 - hybrid_split_a, next_refresh_seconds: 60,
  });
});
