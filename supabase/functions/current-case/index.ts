import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const optRes = handleOptions(req);
  if (optRes) return optRes;

  if (req.method !== "GET") return jsonResponse(req, { error: "Method not allowed" }, 405);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data, error } = await supabase
    .from("cases")
    .select("id, case_no, title, prompt, option_a_label, option_b_label")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return jsonResponse(req, { error: error.message }, 500);
  if (!data) return jsonResponse(req, { error: "No active case found" }, 404);

  return jsonResponse(req, {
    case_id: data.id, case_no: data.case_no, title: data.title,
    prompt: data.prompt, option_a_label: data.option_a_label, option_b_label: data.option_b_label,
  });
});
