import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const optRes = handleOptions(req);
  if (optRes) return optRes;

  if (req.method !== "POST") return jsonResponse(req, { error: "Method not allowed" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return jsonResponse(req, { error: "Invalid JSON" }, 400); }

  const { visitor_id, testimony_id, vote } = body;
  if (!visitor_id || !testimony_id || !vote) return jsonResponse(req, { error: "Missing fields" }, 400);
  if (vote !== "up" && vote !== "down") return jsonResponse(req, { error: "vote must be 'up' or 'down'" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { error } = await supabase.from("testimony_votes")
    .upsert({ testimony_id, visitor_id, vote, updated_at: new Date().toISOString() }, { onConflict: "testimony_id,visitor_id" });
  if (error) return jsonResponse(req, { error: error.message }, 500);

  const { data: allVotes } = await supabase.from("testimony_votes").select("vote").eq("testimony_id", testimony_id);
  let up_count = 0, down_count = 0;
  if (allVotes) allVotes.forEach((v: any) => { if (v.vote === "up") up_count++; else down_count++; });

  return jsonResponse(req, { ok: true, testimony_id, up_count, down_count, my_vote: vote });
});
