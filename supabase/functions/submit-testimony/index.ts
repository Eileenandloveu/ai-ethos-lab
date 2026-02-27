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

  const { visitor_id, case_id, text } = body;
  if (!visitor_id || !case_id || !text) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const trimmed = String(text).slice(0, 120);
  if (trimmed.length === 0) return new Response(JSON.stringify({ error: "Empty text" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { error } = await supabase.from("testimonies").insert({ case_id, visitor_id, text: trimmed });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  // Return refreshed top 5 (reuse list logic)
  const { data: testimonies } = await supabase
    .from("testimonies")
    .select("id, text")
    .eq("case_id", case_id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!testimonies || testimonies.length === 0) {
    return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const ids = testimonies.map((t: any) => t.id);
  const { data: votes } = await supabase.from("testimony_votes").select("testimony_id, vote").in("testimony_id", ids);
  const { data: mv } = await supabase.from("testimony_votes").select("testimony_id, vote").in("testimony_id", ids).eq("visitor_id", visitor_id);

  const myVotes: Record<string, string> = {};
  if (mv) mv.forEach((v: any) => { myVotes[v.testimony_id] = v.vote; });

  const counts: Record<string, { up: number; down: number }> = {};
  if (votes) for (const v of votes) { if (!counts[v.testimony_id]) counts[v.testimony_id] = { up: 0, down: 0 }; if (v.vote === "up") counts[v.testimony_id].up++; else counts[v.testimony_id].down++; }

  const result = testimonies.map((t: any) => ({
    id: t.id, text: t.text,
    up_count: counts[t.id]?.up ?? 0, down_count: counts[t.id]?.down ?? 0,
    my_vote: myVotes[t.id] ?? null,
  }));
  result.sort((a: any, b: any) => (b.up_count + b.down_count) - (a.up_count + a.down_count));

  return new Response(JSON.stringify(result.slice(0, 5)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
