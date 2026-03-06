import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const optRes = handleOptions(req);
  if (optRes) return optRes;

  if (req.method !== "POST") return jsonResponse(req, { error: "Method not allowed" }, 405);

  let body: { visitor_id?: string; case_id?: string; choice?: string };
  try { body = await req.json(); } catch { return jsonResponse(req, { error: "Invalid JSON" }, 400); }

  const { visitor_id, case_id, choice } = body;
  if (!visitor_id || !case_id || !choice) return jsonResponse(req, { error: "Missing visitor_id, case_id, or choice" }, 400);
  if (choice !== "A" && choice !== "B") return jsonResponse(req, { error: "Choice must be 'A' or 'B'" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { error } = await supabase
    .from("case_votes")
    .upsert({ case_id, visitor_id, choice, updated_at: new Date().toISOString() }, { onConflict: "case_id,visitor_id" });

  if (error) return jsonResponse(req, { error: error.message }, 500);

  const { error: compErr } = await supabase
    .from("case_completions")
    .upsert({ visitor_id, case_id }, { onConflict: "visitor_id,case_id", ignoreDuplicates: true });

  const { count } = await supabase
    .from("case_completions")
    .select("*", { count: "exact", head: true })
    .eq("visitor_id", visitor_id);

  if (count !== null) {
    await supabase.from("profiles").update({ trials_completed: count, updated_at: new Date().toISOString() }).eq("visitor_id", visitor_id);
  }

  return jsonResponse(req, { ok: true });
});
