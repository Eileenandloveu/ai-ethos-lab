import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const case_id = url.searchParams.get("case_id");
  const mode = url.searchParams.get("mode") || "hybrid";

  if (!case_id) {
    return new Response(JSON.stringify({ error: "Missing case_id query param" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!["atmosphere", "real", "hybrid"].includes(mode)) {
    return new Response(JSON.stringify({ error: "mode must be atmosphere, real, or hybrid" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── Atmosphere stats (seed + drift) ──
  const { data: seedData } = await supabase
    .from("case_stats_seed")
    .select("*")
    .eq("case_id", case_id)
    .maybeSingle();

  const base_participants = seedData?.base_participants ?? 5000;
  const base_split_a = seedData?.base_split_a ?? 50;
  const drift_per_min = seedData?.drift_per_min ?? 1;

  const now = new Date();
  const minuteOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();
  const drift = Math.sin(minuteOfDay * 0.05) * drift_per_min * 3;
  let atmo_split_a = Math.round(base_split_a + drift);
  atmo_split_a = Math.max(40, Math.min(60, atmo_split_a));
  const atmo_split_b = 100 - atmo_split_a;

  const jitter = Math.floor(
    Math.sin(minuteOfDay * 0.1) * 500 +
    Math.cos(now.getUTCSeconds() * 0.3) * 200
  );
  const atmo_participants = base_participants + jitter;

  if (mode === "atmosphere") {
    return new Response(JSON.stringify({
      participants: atmo_participants,
      split_a: atmo_split_a,
      split_b: atmo_split_b,
      next_refresh_seconds: 60,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Real stats from case_votes ──
  const { data: votes, error: votesErr } = await supabase
    .from("case_votes")
    .select("choice")
    .eq("case_id", case_id);

  if (votesErr) {
    return new Response(JSON.stringify({ error: votesErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const real_total = votes?.length ?? 0;
  const real_count_a = votes?.filter((v) => v.choice === "A").length ?? 0;
  const real_count_b = real_total - real_count_a;
  const real_split_a = real_total > 0 ? Math.round((real_count_a / real_total) * 100) : 50;
  const real_split_b = 100 - real_split_a;

  if (mode === "real") {
    return new Response(JSON.stringify({
      participants: real_total,
      split_a: real_split_a,
      split_b: real_split_b,
      next_refresh_seconds: 60,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Hybrid: blend atmosphere + real ──
  // w=0 at 0 votes → pure atmosphere, w=1 at 200+ votes → pure real
  const w = Math.min(real_total / 200, 1);
  const hybrid_split_a = Math.round((1 - w) * atmo_split_a + w * real_split_a);
  const hybrid_split_b = 100 - hybrid_split_a;
  const hybrid_participants = Math.round((1 - w) * atmo_participants + w * real_total);

  return new Response(JSON.stringify({
    participants: hybrid_participants,
    split_a: hybrid_split_a,
    split_b: hybrid_split_b,
    next_refresh_seconds: 60,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
