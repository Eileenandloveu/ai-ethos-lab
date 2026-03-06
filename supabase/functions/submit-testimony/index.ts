import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const optRes = handleOptions(req);
  if (optRes) return optRes;

  if (req.method !== "POST") return jsonResponse(req, { error: "Method not allowed" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return jsonResponse(req, { error: "Invalid JSON" }, 400); }

  const { visitor_id, case_id, text } = body;
  if (!visitor_id || !case_id || !text) return jsonResponse(req, { error: "Missing fields" }, 400);

  const trimmed = String(text).slice(0, 120);
  if (trimmed.length === 0) return jsonResponse(req, { error: "Empty text" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { error } = await supabase.from("testimonies").insert({ case_id, visitor_id, text: trimmed });
  if (error) return jsonResponse(req, { error: error.message }, 500);

  const { data: testimonies } = await supabase.from("testimonies").select("id, text").eq("case_id", case_id).order("created_at", { ascending: false }).limit(20);
  if (!testimonies || testimonies.length === 0) return jsonResponse(req, []);

  const ids = testimonies.map((t: any) => t.id);
  const { data: votes } = await supabase.from("testimony_votes").select("testimony_id, vote").in("testimony_id", ids);
  const { data: mv } = await supabase.from("testimony_votes").select("testimony_id, vote").in("testimony_id", ids).eq("visitor_id", visitor_id);

  const myVotes: Record<string, string> = {};
  if (mv) mv.forEach((v: any) => { myVotes[v.testimony_id] = v.vote; });

  const counts: Record<string, { up: number; down: number }> = {};
  if (votes) for (const v of votes) { if (!counts[v.testimony_id]) counts[v.testimony_id] = { up: 0, down: 0 }; if (v.vote === "up") counts[v.testimony_id].up++; else counts[v.testimony_id].down++; }

  const result = testimonies.map((t: any) => ({
    id: t.id, text: t.text, up_count: counts[t.id]?.up ?? 0, down_count: counts[t.id]?.down ?? 0, my_vote: myVotes[t.id] ?? null,
  }));
  result.sort((a: any, b: any) => (b.up_count + b.down_count) - (a.up_count + a.down_count));

  return jsonResponse(req, result.slice(0, 5));
});
