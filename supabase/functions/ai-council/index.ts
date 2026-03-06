import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const optRes = handleOptions(req);
  if (optRes) return optRes;

  if (req.method !== "GET") return jsonResponse(req, { error: "Method not allowed" }, 405);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data, error } = await supabase
    .from("ai_council_state")
    .select("motion_no, motion_text, split_a, split_b, heat_level, decision_eta_seconds")
    .limit(1)
    .maybeSingle();

  if (error) return jsonResponse(req, { error: error.message }, 500);
  if (!data) return jsonResponse(req, { error: "No council state found" }, 404);

  return jsonResponse(req, data);
});
