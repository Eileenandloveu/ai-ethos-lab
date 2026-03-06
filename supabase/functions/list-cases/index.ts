import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const optRes = handleOptions(req);
  if (optRes) return optRes;

  if (req.method !== "GET") return jsonResponse(req, { error: "Method not allowed" }, 405);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data, error } = await supabase
    .from("cases")
    .select("id, case_no, title, prompt, option_a_label, option_b_label, status, season")
    .eq("season", 1)
    .order("case_no", { ascending: true });

  if (error) return jsonResponse(req, { error: error.message }, 500);

  const mapped = (data ?? []).map((row) => ({
    case_id: row.id, case_no: row.case_no, title: row.title, prompt: row.prompt,
    option_a_label: row.option_a_label, option_b_label: row.option_b_label, status: row.status, season: row.season,
  }));

  return jsonResponse(req, mapped);
});
