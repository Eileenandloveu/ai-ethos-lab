import { useState } from "react";
import { Case, counterArguments } from "@/data/cases";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ChevronDown } from "lucide-react";

interface VoteResultsProps {
  currentCase: Case;
  userVote: "a" | "b";
  onNextCase: () => void;
  countdown: number;
  trialNumber: number;
}

export const VoteResults = ({
  currentCase,
  userVote,
  onNextCase,
  countdown,
  trialNumber,
}: VoteResultsProps) => {
  const [showArguments, setShowArguments] = useState(false);
  const [copied, setCopied] = useState(false);

  const voteA = currentCase.mockVoteA;
  const voteB = 100 - voteA;
  const userPercent = userVote === "a" ? voteA : voteB;
  const isMinority = userPercent < 50;
  const userLabel = userVote === "a" ? currentCase.optionA : currentCase.optionB;

  const args = counterArguments[currentCase.id];
  const opposingArgs = userVote === "a" ? args.b : args.a;

  const shareText = `I voted ${userLabel} (${isMinority ? "minority" : "majority"} ${userPercent}%). What would you vote? #AIOS`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="mt-3 text-center">
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
            <div className="p-4 space-y-2">
              <p className="font-mono text-xs font-semibold text-muted-foreground mb-2">
                STRONGEST ARGUMENTS AGAINST YOUR VOTE:
              </p>
              {opposingArgs.map((arg, i) => (
                <div key={i} className="flex gap-2 font-mono text-xs text-foreground">
                  <span className="text-primary">›</span>
                  <span>{arg}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Twist */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 animate-glow">
        <p className="font-mono text-xs leading-relaxed text-foreground">
          <span className="font-bold text-primary">⚡ </span>
          {currentCase.twist}
        </p>
      </div>

      {/* Share */}
      <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
        <div className="flex-1 truncate font-mono text-xs text-muted-foreground">
          {shareText}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 font-mono text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "COPIED" : "SHARE"}
        </button>
      </div>

      {/* Next case CTA */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          onClick={onNextCase}
          className="w-full rounded-md bg-primary px-6 py-3 font-mono text-sm font-bold tracking-wide text-primary-foreground shadow-md transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
        >
          RUN NEXT TRIAL ({countdown}s)
        </button>
        <span className="font-mono text-[10px] text-muted-foreground">
          Trial {trialNumber} / 6 — Season 1
        </span>
      </div>
    </motion.div>
  );
};
