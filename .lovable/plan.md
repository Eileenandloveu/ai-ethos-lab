

## Plan: Create `current-case` Edge Function

### What it does
A GET endpoint that returns the most recent active case from `public.cases`.

### Files to create/modify

**1. `supabase/functions/current-case/index.ts`**
- Handle CORS preflight (OPTIONS)
- Only allow GET method
- Create Supabase client with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Query `public.cases` where `status = 'active'`, order by `created_at desc`, limit 1
- Return JSON with fields: `case_id` (mapped from `id`), `case_no`, `title`, `prompt`, `option_a_label`, `option_b_label`
- Return 404 if no active case found

**2. `supabase/config.toml`** — add function config:
```toml
[functions.current-case]
verify_jwt = false
```

### Technical details
- Uses service role key to bypass RLS (the `cases` table has RLS enabled but no policies defined, so anon key would return zero rows)
- Public endpoint, no auth required — this is read-only public data
- Single row response (not an array), since we only return the latest active case

