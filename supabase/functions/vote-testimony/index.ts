import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  let body: any;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }

  const { visitor_id, testimony_id, vote } = body;
  if (!visitor_id || !testimony_id || !vote) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (vote !== "up" && vote !== "down") return new Response(JSON.stringify({ error: "vote must be 'up' or 'down'" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { error } = await supabase
    .from("testimony_votes")
    .upsert({ testimony_id, visitor_id, vote, updated_at: new Date().toISOString() }, { onConflict: "testimony_id,visitor_id" });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const { data: allVotes } = await supabase.from("testimony_votes").select("vote").eq("testimony_id", testimony_id);
  let up_count = 0, down_count = 0;
  if (allVotes) allVotes.forEach((v: any) => { if (v.vote === "up") up_count++; else down_count++; });

  return new Response(JSON.stringify({ ok: true, testimony_id, up_count, down_count, my_vote: vote }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
