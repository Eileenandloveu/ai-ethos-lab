import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const optRes = handleOptions(req);
  if (optRes) return optRes;

  if (req.method !== "POST") return jsonResponse(req, { error: "Method not allowed" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return jsonResponse(req, { error: "Invalid JSON" }, 400); }

  const { visitor_id, case_id, argument_key, vote } = body;
  if (!visitor_id || !case_id || !argument_key || !vote) return jsonResponse(req, { error: "Missing fields" }, 400);
  if (vote !== "up" && vote !== "down") return jsonResponse(req, { error: "vote must be 'up' or 'down'" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { error } = await supabase.from("case_argument_votes")
    .upsert({ case_id, argument_key, visitor_id, vote, updated_at: new Date().toISOString() }, { onConflict: "case_id,argument_key,visitor_id" });
  if (error) return jsonResponse(req, { error: error.message }, 500);

  const { data: allVotes } = await supabase.from("case_argument_votes").select("vote").eq("case_id", case_id).eq("argument_key", argument_key);
  let up_count = 0, down_count = 0;
  if (allVotes) allVotes.forEach((v: any) => { if (v.vote === "up") up_count++; else down_count++; });

  return jsonResponse(req, { ok: true, argument_key, up_count, down_count, my_vote: vote });
});
