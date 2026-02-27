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

  // Get arguments for this case
  const { data: args, error } = await supabase
    .from("case_arguments")
    .select("argument_key, text")
    .eq("case_id", case_id)
    .order("argument_key");

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  // Get vote counts
  const { data: votes } = await supabase
    .from("case_argument_votes")
    .select("argument_key, vote")
    .eq("case_id", case_id);

  // Get my votes
  let myVotes: Record<string, string> = {};
  if (visitor_id) {
    const { data: mv } = await supabase
      .from("case_argument_votes")
      .select("argument_key, vote")
      .eq("case_id", case_id)
      .eq("visitor_id", visitor_id);
    if (mv) mv.forEach((v: any) => { myVotes[v.argument_key] = v.vote; });
  }

  // Aggregate
  const counts: Record<string, { up: number; down: number }> = {};
  if (votes) {
    for (const v of votes) {
      if (!counts[v.argument_key]) counts[v.argument_key] = { up: 0, down: 0 };
      if (v.vote === "up") counts[v.argument_key].up++;
      else counts[v.argument_key].down++;
    }
  }

  const result = (args || []).map((a: any) => ({
    argument_key: a.argument_key,
    text: a.text,
    up_count: counts[a.argument_key]?.up ?? 0,
    down_count: counts[a.argument_key]?.down ?? 0,
    my_vote: myVotes[a.argument_key] ?? null,
  }));

  return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
