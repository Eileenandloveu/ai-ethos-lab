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

  const { data: testimonies, error } = await supabase.from("testimonies").select("id, text, created_at").eq("case_id", case_id).order("created_at", { ascending: false }).limit(20);
  if (error) return jsonResponse(req, { error: error.message }, 500);
  if (!testimonies || testimonies.length === 0) return jsonResponse(req, []);

  const ids = testimonies.map((t: any) => t.id);
  const { data: votes } = await supabase.from("testimony_votes").select("testimony_id, vote").in("testimony_id", ids);

  let myVotes: Record<string, string> = {};
  if (visitor_id) {
    const { data: mv } = await supabase.from("testimony_votes").select("testimony_id, vote").in("testimony_id", ids).eq("visitor_id", visitor_id);
    if (mv) mv.forEach((v: any) => { myVotes[v.testimony_id] = v.vote; });
  }

  const counts: Record<string, { up: number; down: number }> = {};
  if (votes) for (const v of votes) { if (!counts[v.testimony_id]) counts[v.testimony_id] = { up: 0, down: 0 }; if (v.vote === "up") counts[v.testimony_id].up++; else counts[v.testimony_id].down++; }

  const result = testimonies.map((t: any) => ({
    id: t.id, text: t.text, up_count: counts[t.id]?.up ?? 0, down_count: counts[t.id]?.down ?? 0, my_vote: myVotes[t.id] ?? null,
  }));
  result.sort((a: any, b: any) => (b.up_count + b.down_count) - (a.up_count + a.down_count));

  return jsonResponse(req, result.slice(0, 5));
});
