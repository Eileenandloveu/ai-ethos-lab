import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("cases")
    .select("id, case_no, title, prompt, option_a_label, option_b_label, status, season")
    .eq("season", 1)
    .order("case_no", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const mapped = (data ?? []).map((row) => ({
    case_id: row.id,
    case_no: row.case_no,
    title: row.title,
    prompt: row.prompt,
    option_a_label: row.option_a_label,
    option_b_label: row.option_b_label,
    status: row.status,
    season: row.season,
  }));

  return new Response(JSON.stringify(mapped), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
