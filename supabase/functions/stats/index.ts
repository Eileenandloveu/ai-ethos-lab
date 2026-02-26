import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  if (!case_id) {
    return new Response(JSON.stringify({ error: "Missing case_id query param" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("case_stats_seed")
    .select("*")
    .eq("case_id", case_id)
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Defaults if no seed
  const base_participants = data?.base_participants ?? 5000;
  const base_split_a = data?.base_split_a ?? 50;
  const drift_per_min = data?.drift_per_min ?? 1;

  // Time-based gentle drift
  const now = new Date();
  const minuteOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();
  const drift = Math.sin(minuteOfDay * 0.05) * drift_per_min * 3;
  let split_a = Math.round(base_split_a + drift);
  split_a = Math.max(40, Math.min(60, split_a));
  const split_b = 100 - split_a;

  // Participant jitter
  const jitter = Math.floor(Math.sin(minuteOfDay * 0.1) * 500 + Math.cos(now.getUTCSeconds() * 0.3) * 200);
  const participants = base_participants + jitter;

  return new Response(JSON.stringify({
    participants,
    split_a,
    split_b,
    next_refresh_seconds: 60,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
