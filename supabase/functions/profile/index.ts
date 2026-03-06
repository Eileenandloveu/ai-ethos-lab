import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const optRes = handleOptions(req);
  if (optRes) return optRes;

  if (req.method !== "GET") return jsonResponse(req, { error: "Method not allowed" }, 405);

  const url = new URL(req.url);
  const visitor_id = url.searchParams.get("visitor_id");
  if (!visitor_id) return jsonResponse(req, { error: "Missing visitor_id query param" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  await supabase.from("daily_visits").upsert({ visitor_id, visit_date: today }, { onConflict: "visitor_id,visit_date", ignoreDuplicates: true });

  const { data: visits } = await supabase
    .from("daily_visits").select("visit_date").eq("visitor_id", visitor_id).order("visit_date", { ascending: false });

  let streak = 0;
  if (visits && visits.length > 0) {
    const todayDate = new Date(today + "T00:00:00");
    let expected = todayDate;
    for (const v of visits) {
      const d = new Date(v.visit_date + "T00:00:00");
      const diff = Math.round((expected.getTime() - d.getTime()) / 86400000);
      if (diff === 0 || diff === 1) { streak++; expected = new Date(d.getTime() - 86400000); }
      else break;
    }
  }

  let { data, error } = await supabase
    .from("profiles")
    .select("visitor_id, role, trials_completed, streak_days, match_pct, juror_unlocked, clerk_unlocked")
    .eq("visitor_id", visitor_id).maybeSingle();

  if (error) return jsonResponse(req, { error: error.message }, 500);

  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles").insert({ visitor_id, streak_days: streak })
      .select("visitor_id, role, trials_completed, streak_days, match_pct, juror_unlocked, clerk_unlocked").single();
    if (insertError) return jsonResponse(req, { error: insertError.message }, 500);
    data = newProfile;
  } else if (data.streak_days !== streak) {
    await supabase.from("profiles").update({ streak_days: streak, updated_at: new Date().toISOString() }).eq("visitor_id", visitor_id);
    data.streak_days = streak;
  }

  return jsonResponse(req, data);
});
