import { useState } from "react";
import { Case, counterArguments } from "@/data/cases";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ChevronDown, ThumbsUp, ThumbsDown, Link } from "lucide-react";

interface VoteResultsProps {
  currentCase: Case;
  userVote: "a" | "b";
  onNextCase: () => void;
  onStay: () => void;
  autoCountdown: number;
  autoEnabled: boolean;
  trialNumber: number;
}

const SHARE_URL = "https://app.n-ai.org";

export const VoteResults = ({
  currentCase,
  userVote,
  onNextCase,
  onStay,
  autoCountdown,
  autoEnabled,
  trialNumber,
}: VoteResultsProps) => {
  const [showArguments, setShowArguments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [argLikes, setArgLikes] = useState<Record<string, { up: number; down: number }>>({});
  const [argVoted, setArgVoted] = useState<Set<string>>(new Set());

  const voteA = currentCase.mockVoteA;
  const voteB = 100 - voteA;
  const userPercent = userVote === "a" ? voteA : voteB;
  const isMinority = userPercent < 50;
  const userLabel = userVote === "a" ? currentCase.optionA : currentCase.optionB;

  const args = counterArguments[currentCase.id];
  const opposingArgs = userVote === "a" ? args.b : args.a;

  const shareText = `I voted ${userLabel} (${isMinority ? "minority" : "majority"} ${userPercent}%) on AIOS. Case #${String(currentCase.id).padStart(3, "0")}: "${currentCase.context}" Options: ${currentCase.optionA} vs ${currentCase.optionB}. Vote here: ${SHARE_URL}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(SHARE_URL);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleArgVote = (idx: number, dir: "up" | "down") => {
    const key = `${currentCase.id}-${idx}-${dir}`;
    if (argVoted.has(`${currentCase.id}-${idx}`)) return;
    setArgVoted(new Set([...argVoted, `${currentCase.id}-${idx}`]));
    setArgLikes((prev) => {
      const existing = prev[`${currentCase.id}-${idx}`] || { up: Math.floor(Math.random() * 30) + 5, down: Math.floor(Math.random() * 10) + 2 };
      return {
        ...prev,
        [`${currentCase.id}-${idx}`]: {
          up: existing.up + (dir === "up" ? 1 : 0),
          down: existing.down + (dir === "down" ? 1 : 0),
        },
      };
    });
  };

  const getArgCounts = (idx: number) =>
    argLikes[`${currentCase.id}-${idx}`] || { up: Math.floor(12 + idx * 7), down: Math.floor(3 + idx * 2) };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mt-4 space-y-4"
    >
      {/* Vote bar */}
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
          <span className="font-semibold text-vote-a">{currentCase.optionA}</span>
          <span className="font-semibold text-vote-b">{currentCase.optionB}</span>
        </div>
        <div className="relative h-8 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${voteA}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 rounded-l-full bg-vote-a"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${voteB}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="absolute inset-y-0 right-0 rounded-r-full bg-vote-b"
          />
          <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-foreground">
            {voteA}% vs {voteB}%
          </div>
        </div>

        {/* Minority/majority message */}
        <div className="mt-3 text-center space-y-1">
          <span
            className={`inline-block rounded-full px-4 py-1.5 font-mono text-xs font-semibold ${
              isMinority
                ? "bg-minority/10 text-minority"
                : "bg-majority/10 text-majority"
            }`}
          >
            {isMinority
              ? `YOU'RE IN THE MINORITY (${userPercent}%)`
              : `YOU'RE IN THE MAJORITY (${userPercent}%)`}
          </span>
          <p className="font-mono text-[10px] text-muted-foreground">
            Think they're wrong? React below.
          </p>
        </div>
      </div>

      {/* Why disagree */}
      <button
        onClick={() => setShowArguments(!showArguments)}
        className="flex w-full items-center justify-between rounded-lg border bg-card px-5 py-3 font-mono text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        WHY DO PEOPLE DISAGREE?
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            showArguments ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {showArguments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg border bg-console-bg"
          >
            <div className="p-4 space-y-3">
              <p className="font-mono text-xs font-semibold text-muted-foreground mb-2">
                STRONGEST ARGUMENTS AGAINST YOUR VOTE:
              </p>
              {opposingArgs.map((arg, i) => {
                const counts = getArgCounts(i);
                const hasVoted = argVoted.has(`${currentCase.id}-${i}`);
                return (
                  <div key={i} className="flex items-start gap-2 font-mono text-xs text-foreground">
                    <span className="text-primary mt-0.5">›</span>
                    <span className="flex-1">{arg}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleArgVote(i, "up")}
                        disabled={hasVoted}
                        className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] transition-colors ${hasVoted ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {counts.up}
                      </button>
                      <button
                        onClick={() => handleArgVote(i, "down")}
                        disabled={hasVoted}
                        className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] transition-colors ${hasVoted ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <ThumbsDown className="h-3 w-3" />
                        {counts.down}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Twist */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 animate-glow">
        <p className="font-mono text-[10px] font-bold text-primary mb-1 tracking-widest">
          TWIST — NEW INFO REVEALED
        </p>
        <p className="font-mono text-xs leading-relaxed text-foreground">
          {currentCase.twist}
        </p>
      </div>

      {/* Share */}
      <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
        <div className="flex-1 truncate font-mono text-[10px] text-muted-foreground">
          {shareText}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 font-mono text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "COPIED" : "SHARE"}
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 font-mono text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {linkCopied ? <Check className="h-3 w-3" /> : <Link className="h-3 w-3" />}
          {linkCopied ? "COPIED" : "COPY LINK"}
        </button>
      </div>

      {/* Next case CTA */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <div className="flex w-full gap-2">
          <button
            onClick={onNextCase}
            className="flex-1 rounded-md bg-primary px-6 py-3 font-mono text-sm font-bold tracking-wide text-primary-foreground shadow-md transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            RUN NEXT TRIAL
          </button>
          <button
            onClick={onStay}
            className="rounded-md border bg-card px-4 py-3 font-mono text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            STAY
          </button>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {autoEnabled
            ? `Next trial auto-starts in ${formatCountdown(autoCountdown)}`
            : "Auto-start paused"}{" "}
          · Trial {trialNumber} / 6 — Season 1
        </span>
      </div>
    </motion.div>
  );
};
