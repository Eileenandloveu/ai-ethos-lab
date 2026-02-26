import { useState, useEffect, useCallback, useRef } from "react";
import { StatusBar } from "@/components/StatusBar";
import { LiveTrial } from "@/components/LiveTrial";
import { VoteResults } from "@/components/VoteResults";
import { ParliamentTicker } from "@/components/ParliamentTicker";
import { ProgressBadge } from "@/components/ProgressBadge";
import { TestimonySection } from "@/components/TestimonySection";
import { CaseList } from "@/components/CaseList";
import {
  fetchCurrentCase,
  fetchListCases,
  fetchStats,
  fetchProfile,
  fetchCouncil,
  submitVote,
  getVisitorId,
  BackendCase,
  Stats,
  Profile,
  CouncilState,
} from "@/lib/api";

const AUTO_COUNTDOWN_SECONDS = 15 * 60;

const Index = () => {
  const visitorId = useRef(getVisitorId()).current;

  // Backend state
  const [currentCase, setCurrentCase] = useState<BackendCase | null>(null);
  const [allCases, setAllCases] = useState<BackendCase[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [council, setCouncil] = useState<CouncilState | null>(null);

  // UI state
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<"a" | "b" | null>(null);
  const [completedCaseIds, setCompletedCaseIds] = useState<Set<string>>(new Set());
  const [testimoniesGiven, setTestimoniesGiven] = useState(0);
  const [autoCountdown, setAutoCountdown] = useState(AUTO_COUNTDOWN_SECONDS);
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  const [yourMatch, setYourMatch] = useState(68);

  const trialsCompleted = completedCaseIds.size;

  // ── Initial load ──
  useEffect(() => {
    (async () => {
      try {
        const [activeCase, cases, prof, cncl] = await Promise.all([
          fetchCurrentCase(),
          fetchListCases(),
          fetchProfile(visitorId),
          fetchCouncil(),
        ]);
        setCurrentCase(activeCase);
        setAllCases(cases);
        setProfile(prof);
        setCouncil(cncl);
        if (prof) setYourMatch(prof.match_pct);
      } catch (e) {
        console.error("Load error:", e);
      }
    })();
  }, [visitorId]);

  // ── Stats polling ──
  useEffect(() => {
    if (!currentCase) return;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const s = await fetchStats(currentCase.case_id);
        setStats(s);
        timer = setTimeout(load, (s.next_refresh_seconds ?? 60) * 1000);
      } catch (e) {
        console.error("Stats error:", e);
        timer = setTimeout(load, 60000);
      }
    };
    load();
    return () => clearTimeout(timer);
  }, [currentCase?.case_id]);

  // ── Council polling (60s) ──
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        setCouncil(await fetchCouncil());
      } catch {}
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // ── Navigation ──
  const goToNextCase = useCallback(() => {
    if (!allCases.length || !currentCase) return;
    const idx = allCases.findIndex((c) => c.case_id === currentCase.case_id);
    const next = allCases[(idx + 1) % allCases.length];
    setCurrentCase(next);
    setHasVoted(false);
    setUserVote(null);
    setAutoCountdown(AUTO_COUNTDOWN_SECONDS);
    setAutoEnabled(true);
    setShowIdlePrompt(false);
  }, [allCases, currentCase]);

  const handleVote = async (choice: "a" | "b") => {
    if (!currentCase) return;
    setUserVote(choice);
    setHasVoted(true);
    setCompletedCaseIds((prev) => new Set([...prev, currentCase.case_id]));
    setAutoCountdown(AUTO_COUNTDOWN_SECONDS);
    setAutoEnabled(true);

    try {
      await submitVote(visitorId, currentCase.case_id, choice === "a" ? "A" : "B");
      // Refresh stats + profile after vote
      const [s, p] = await Promise.all([
        fetchStats(currentCase.case_id),
        fetchProfile(visitorId),
      ]);
      setStats(s);
      setProfile(p);
      if (p) setYourMatch(p.match_pct);
    } catch (e) {
      console.error("Vote error:", e);
    }
  };

  const handleSelectCase = (c: BackendCase) => {
    setCurrentCase(c);
    setHasVoted(false);
    setUserVote(null);
    setAutoCountdown(AUTO_COUNTDOWN_SECONDS);
    setAutoEnabled(true);
    setShowIdlePrompt(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStay = () => setAutoEnabled(false);

  // Auto countdown
  useEffect(() => {
    if (!hasVoted || !autoEnabled) return;
    if (autoCountdown <= 0) { goToNextCase(); return; }
    const id = setTimeout(() => setAutoCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [hasVoted, autoEnabled, autoCountdown, goToNextCase]);

  // Idle prompt
  useEffect(() => {
    if (hasVoted) return;
    const id = setTimeout(() => setShowIdlePrompt(true), 20000);
    return () => clearTimeout(id);
  }, [hasVoted, currentCase?.case_id]);

  if (!currentCase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="font-mono text-sm text-muted-foreground animate-pulse">Loading trial…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StatusBar
        yourMatch={yourMatch}
        split={stats ? [stats.split_a, stats.split_b] : [50, 50]}
        participants={stats?.participants}
        nextRefresh={stats?.next_refresh_seconds}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <LiveTrial
              currentCase={currentCase}
              onVote={handleVote}
              hasVoted={hasVoted}
            />

            {hasVoted && userVote && stats && (
              <VoteResults
                currentCase={currentCase}
                userVote={userVote}
                splitA={stats.split_a}
                splitB={stats.split_b}
                onNextCase={goToNextCase}
                onStay={handleStay}
                autoCountdown={autoCountdown}
                autoEnabled={autoEnabled}
                trialNumber={trialsCompleted}
                totalCases={allCases.length}
              />
            )}

            {hasVoted && (
              <TestimonySection
                caseId={currentCase.case_id}
                onTestimonySubmit={() => setTestimoniesGiven((p) => p + 1)}
              />
            )}

            {showIdlePrompt && !hasVoted && (
              <div className="animate-slide-up rounded-lg border border-primary/30 bg-primary/5 p-3 text-center font-mono text-xs text-foreground">
                Stay for one more decision → <span className="font-semibold text-primary">unlock Juror Mode</span>
              </div>
            )}

            <CaseList
              cases={allCases}
              currentCaseId={currentCase.case_id}
              onSelectCase={handleSelectCase}
            />
          </div>

          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <ParliamentTicker council={council} />
            <ProgressBadge
              trialsCompleted={profile?.trials_completed ?? trialsCompleted}
              streak={profile?.streak_days ?? 0}
              testimoniesGiven={testimoniesGiven}
              yourMatch={yourMatch}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
