/**
 * Backend API helper — calls edge functions via the Supabase project URL.
 * STATS_MODE controls how vote statistics are presented.
 */

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = `https://${PROJECT_ID}.supabase.co/functions/v1`;

export const STATS_MODE: "atmosphere" | "real" | "hybrid" = "hybrid";

function headers(json = false): HeadersInit {
  const h: Record<string, string> = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
  };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path}: ${res.status}`);
  return res.json();
}

// ── Visitor ID (stable per browser) ──
const VID_KEY = "aios_visitor_id";
export function getVisitorId(): string {
  let id = localStorage.getItem(VID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VID_KEY, id);
  }
  return id;
}

// ── Types ──
export interface BackendCase {
  case_id: string;
  case_no: string;
  title: string;
  prompt: string;
  option_a_label: string;
  option_b_label: string;
  status?: string;
  season?: number;
}

export interface Stats {
  participants: number;
  split_a: number;
  split_b: number;
  next_refresh_seconds: number;
}

export interface CouncilState {
  motion_no: number;
  motion_text: string;
  split_a: number;
  split_b: number;
  heat_level: string;
  decision_eta_seconds: number;
}

export interface Profile {
  visitor_id: string;
  role: string;
  trials_completed: number;
  streak_days: number;
  match_pct: number;
  juror_unlocked: boolean;
  clerk_unlocked: boolean;
}

export interface Argument {
  argument_key: string;
  text: string;
  up_count: number;
  down_count: number;
  my_vote: string | null;
}

export interface Testimony {
  id: string;
  text: string;
  up_count: number;
  down_count: number;
  my_vote: string | null;
}

export interface ArgumentVoteResult {
  ok: boolean;
  argument_key: string;
  up_count: number;
  down_count: number;
  my_vote: string;
}

export interface TestimonyVoteResult {
  ok: boolean;
  testimony_id: string;
  up_count: number;
  down_count: number;
  my_vote: string;
}

// ── Endpoints ──
export const fetchCurrentCase = () => get<BackendCase>("/current-case");
export const fetchListCases = () => get<BackendCase[]>("/list-cases");
export const fetchStats = (caseId: string, mode = STATS_MODE) =>
  get<Stats>(`/stats?case_id=${caseId}&mode=${mode}`);
export const fetchCouncil = () => get<CouncilState>("/ai-council");
export const fetchProfile = (visitorId: string) =>
  get<Profile>(`/profile?visitor_id=${visitorId}`);
export const submitVote = (visitorId: string, caseId: string, choice: "A" | "B") =>
  post<{ ok: boolean }>("/vote", { visitor_id: visitorId, case_id: caseId, choice });

// ── Arguments ──
export const fetchArguments = (caseId: string, visitorId: string) =>
  get<Argument[]>(`/list-arguments?case_id=${caseId}&visitor_id=${visitorId}`);
export const voteArgument = (visitorId: string, caseId: string, argumentKey: string, vote: "up" | "down") =>
  post<ArgumentVoteResult>("/vote-argument", { visitor_id: visitorId, case_id: caseId, argument_key: argumentKey, vote });

// ── Testimonies ──
export const fetchTestimonies = (caseId: string, visitorId: string) =>
  get<Testimony[]>(`/list-testimonies?case_id=${caseId}&visitor_id=${visitorId}`);
export const submitTestimony = (visitorId: string, caseId: string, text: string) =>
  post<Testimony[]>("/submit-testimony", { visitor_id: visitorId, case_id: caseId, text });
export const voteTestimony = (visitorId: string, testimonyId: string, vote: "up" | "down") =>
  post<TestimonyVoteResult>("/vote-testimony", { visitor_id: visitorId, testimony_id: testimonyId, vote });
