import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const optRes = handleOptions(req);
  if (optRes) return optRes;

  if (req.method !== "GET") return jsonResponse(req, { error: "Method not allowed" }, 405);

  const url = new URL(req.url);
  const case_id = url.searchParams.get("case_id");
  const visitor_id = url.searchParams.get("visitor_id");
  if (!case_id) return jsonResponse(req, { error: "Missing case_id" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: args, error } = await supabase.from("case_arguments").select("argument_key, text").eq("case_id", case_id).order("argument_key");
  if (error) return jsonResponse(req, { error: error.message }, 500);

  const { data: votes } = await supabase.from("case_argument_votes").select("argument_key, vote").eq("case_id", case_id);

  let myVotes: Record<string, string> = {};
  if (visitor_id) {
    const { data: mv } = await supabase.from("case_argument_votes").select("argument_key, vote").eq("case_id", case_id).eq("visitor_id", visitor_id);
    if (mv) mv.forEach((v: any) => { myVotes[v.argument_key] = v.vote; });
  }

  const counts: Record<string, { up: number; down: number }> = {};
  if (votes) for (const v of votes) { if (!counts[v.argument_key]) counts[v.argument_key] = { up: 0, down: 0 }; if (v.vote === "up") counts[v.argument_key].up++; else counts[v.argument_key].down++; }

  const result = (args || []).map((a: any) => ({
    argument_key: a.argument_key, text: a.text,
    up_count: counts[a.argument_key]?.up ?? 0, down_count: counts[a.argument_key]?.down ?? 0, my_vote: myVotes[a.argument_key] ?? null,
  }));

  return jsonResponse(req, result);
});
