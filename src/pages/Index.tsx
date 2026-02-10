import { useState, useEffect, useCallback } from "react";
import { cases, Case } from "@/data/cases";
import { StatusBar } from "@/components/StatusBar";
import { LiveTrial } from "@/components/LiveTrial";
import { VoteResults } from "@/components/VoteResults";
import { ParliamentTicker } from "@/components/ParliamentTicker";
import { ProgressBadge } from "@/components/ProgressBadge";
import { TestimonySection } from "@/components/TestimonySection";
import { CaseList } from "@/components/CaseList";

const Index = () => {
  const [currentCase, setCurrentCase] = useState<Case>(cases[0]);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<"a" | "b" | null>(null);
  const [trialsCompleted, setTrialsCompleted] = useState(0);
  const [testimoniesGiven, setTestimoniesGiven] = useState(0);
  const [nextCountdown, setNextCountdown] = useState(10);
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);

  const goToNextCase = useCallback(() => {
    const currentIndex = cases.findIndex((c) => c.id === currentCase.id);
    const nextIndex = (currentIndex + 1) % cases.length;
    setCurrentCase(cases[nextIndex]);
    setHasVoted(false);
    setUserVote(null);
    setNextCountdown(10);
    setShowIdlePrompt(false);
  }, [currentCase.id]);

  const handleVote = (choice: "a" | "b") => {
    setUserVote(choice);
    setHasVoted(true);
    setTrialsCompleted((prev) => prev + 1);
    setNextCountdown(10);
  };

  const handleSelectCase = (c: Case) => {
    setCurrentCase(c);
    setHasVoted(false);
    setUserVote(null);
    setNextCountdown(10);
    setShowIdlePrompt(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Next case countdown after voting
  useEffect(() => {
    if (!hasVoted) return;
    if (nextCountdown <= 0) {
      goToNextCase();
      return;
    }
    const id = setTimeout(() => setNextCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [hasVoted, nextCountdown, goToNextCase]);

  // Idle prompt after 20 seconds of no interaction
  useEffect(() => {
    if (hasVoted) return;
    const id = setTimeout(() => setShowIdlePrompt(true), 20000);
    return () => clearTimeout(id);
  }, [hasVoted, currentCase.id]);

  return (
    <div className="min-h-screen bg-background">
      <StatusBar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main column */}
          <div className="space-y-4">
            <LiveTrial
              currentCase={currentCase}
              onVote={handleVote}
              hasVoted={hasVoted}
            />

            {hasVoted && userVote && (
              <VoteResults
                currentCase={currentCase}
                userVote={userVote}
                onNextCase={goToNextCase}
                countdown={nextCountdown}
                trialNumber={trialsCompleted}
              />
            )}

            {hasVoted && (
              <TestimonySection
                caseId={currentCase.id}
                onTestimonySubmit={() => setTestimoniesGiven((p) => p + 1)}
              />
            )}

            {/* Idle prompt */}
            {showIdlePrompt && !hasVoted && (
              <div className="animate-slide-up rounded-lg border border-primary/30 bg-primary/5 p-3 text-center font-mono text-xs text-foreground">
                Stay for one more decision → <span className="font-bold text-primary">unlock Juror Mode</span>
              </div>
            )}

            {/* Case list */}
            <CaseList
              currentCaseId={currentCase.id}
              onSelectCase={handleSelectCase}
            />
          </div>

          {/* Right sidebar */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <ParliamentTicker />
            <ProgressBadge
              trialsCompleted={trialsCompleted}
              streak={2}
              testimoniesGiven={testimoniesGiven}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
