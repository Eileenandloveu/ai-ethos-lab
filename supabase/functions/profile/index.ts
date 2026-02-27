import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const url = new URL(req.url);
  const visitor_id = url.searchParams.get("visitor_id");
  if (!visitor_id) return new Response(JSON.stringify({ error: "Missing visitor_id query param" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Upsert today's visit (America/Los_Angeles)
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  await supabase.from("daily_visits").upsert({ visitor_id, visit_date: today }, { onConflict: "visitor_id,visit_date", ignoreDuplicates: true });

  // Compute streak: get all visit dates desc
  const { data: visits } = await supabase
    .from("daily_visits")
    .select("visit_date")
    .eq("visitor_id", visitor_id)
    .order("visit_date", { ascending: false });

  let streak = 0;
  if (visits && visits.length > 0) {
    const todayDate = new Date(today + "T00:00:00");
    let expected = todayDate;
    for (const v of visits) {
      const d = new Date(v.visit_date + "T00:00:00");
      const diff = Math.round((expected.getTime() - d.getTime()) / 86400000);
      if (diff === 0) { streak++; expected = new Date(d.getTime() - 86400000); }
      else if (diff === 1) { streak++; expected = new Date(d.getTime() - 86400000); }
      else break;
    }
  }

  // Get or create profile
  let { data, error } = await supabase
    .from("profiles")
    .select("visitor_id, role, trials_completed, streak_days, match_pct, juror_unlocked, clerk_unlocked")
    .eq("visitor_id", visitor_id)
    .maybeSingle();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({ visitor_id, streak_days: streak })
      .select("visitor_id, role, trials_completed, streak_days, match_pct, juror_unlocked, clerk_unlocked")
      .single();
    if (insertError) return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    data = newProfile;
  } else if (data.streak_days !== streak) {
    await supabase.from("profiles").update({ streak_days: streak, updated_at: new Date().toISOString() }).eq("visitor_id", visitor_id);
    data.streak_days = streak;
  }

  return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
