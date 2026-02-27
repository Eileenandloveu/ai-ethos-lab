import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  let body: { visitor_id?: string; case_id?: string; choice?: string };
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }

  const { visitor_id, case_id, choice } = body;
  if (!visitor_id || !case_id || !choice) return new Response(JSON.stringify({ error: "Missing visitor_id, case_id, or choice" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (choice !== "A" && choice !== "B") return new Response(JSON.stringify({ error: "Choice must be 'A' or 'B'" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Upsert vote
  const { error } = await supabase
    .from("case_votes")
    .upsert({ case_id, visitor_id, choice, updated_at: new Date().toISOString() }, { onConflict: "case_id,visitor_id" });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  // Track completion: insert only if first time (ignore conflict)
  const { error: compErr } = await supabase
    .from("case_completions")
    .upsert({ visitor_id, case_id }, { onConflict: "visitor_id,case_id", ignoreDuplicates: true });

  // Count unique completions and update profile
  const { count } = await supabase
    .from("case_completions")
    .select("*", { count: "exact", head: true })
    .eq("visitor_id", visitor_id);

  if (count !== null) {
    await supabase
      .from("profiles")
      .update({ trials_completed: count, updated_at: new Date().toISOString() })
      .eq("visitor_id", visitor_id);
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
