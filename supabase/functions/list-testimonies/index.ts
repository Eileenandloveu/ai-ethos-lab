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
  const case_id = url.searchParams.get("case_id");
  const visitor_id = url.searchParams.get("visitor_id");

  if (!case_id) return new Response(JSON.stringify({ error: "Missing case_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Get testimonies for case, newest first, limit 5
  const { data: testimonies, error } = await supabase
    .from("testimonies")
    .select("id, text, created_at")
    .eq("case_id", case_id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (!testimonies || testimonies.length === 0) {
    return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const ids = testimonies.map((t: any) => t.id);

  // Get all votes for these testimonies
  const { data: votes } = await supabase
    .from("testimony_votes")
    .select("testimony_id, vote")
    .in("testimony_id", ids);

  // Get my votes
  let myVotes: Record<string, string> = {};
  if (visitor_id) {
    const { data: mv } = await supabase
      .from("testimony_votes")
      .select("testimony_id, vote")
      .in("testimony_id", ids)
      .eq("visitor_id", visitor_id);
    if (mv) mv.forEach((v: any) => { myVotes[v.testimony_id] = v.vote; });
  }

  // Aggregate
  const counts: Record<string, { up: number; down: number }> = {};
  if (votes) {
    for (const v of votes) {
      if (!counts[v.testimony_id]) counts[v.testimony_id] = { up: 0, down: 0 };
      if (v.vote === "up") counts[v.testimony_id].up++;
      else counts[v.testimony_id].down++;
    }
  }

  // Sort by total votes desc, take top 5
  const result = testimonies.map((t: any) => ({
    id: t.id,
    text: t.text,
    up_count: counts[t.id]?.up ?? 0,
    down_count: counts[t.id]?.down ?? 0,
    my_vote: myVotes[t.id] ?? null,
  }));

  result.sort((a: any, b: any) => (b.up_count + b.down_count) - (a.up_count + a.down_count));

  return new Response(JSON.stringify(result.slice(0, 5)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
