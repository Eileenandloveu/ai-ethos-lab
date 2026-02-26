import { useState } from "react";
import { BackendCase } from "@/lib/api";
import { motion } from "framer-motion";
import { Copy, Check, Link } from "lucide-react";

interface VoteResultsProps {
  currentCase: BackendCase;
  userVote: "a" | "b";
  splitA: number;
  splitB: number;
  onNextCase: () => void;
  onStay: () => void;
  autoCountdown: number;
  autoEnabled: boolean;
  trialNumber: number;
  totalCases: number;
}

const SHARE_URL = "https://www.n-ai.org";

export const VoteResults = ({
  currentCase,
  userVote,
  splitA,
  splitB,
  onNextCase,
  onStay,
  autoCountdown,
  autoEnabled,
  trialNumber,
  totalCases,
}: VoteResultsProps) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const voteA = splitA;
  const voteB = splitB;
  const userPercent = userVote === "a" ? voteA : voteB;
  const isMinority = userPercent < 50;
  const userLabel = userVote === "a" ? currentCase.option_a_label : currentCase.option_b_label;

  const shareText = `I voted "${userLabel}" (${isMinority ? "minority" : "majority"} ${userPercent}%) on AIOS Case #${currentCase.case_no}: "${currentCase.prompt}" — ${currentCase.option_a_label} vs ${currentCase.option_b_label}. Vote: ${SHARE_URL}`;

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
      className="space-y-3"
    >
      {/* Vote bar */}
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
          <span className="font-semibold text-vote-a">{currentCase.option_a_label}</span>
          <span className="font-semibold text-vote-b">{currentCase.option_b_label}</span>
        </div>
        <div className="relative h-9 w-full overflow-hidden rounded-full bg-muted">
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
          <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-foreground drop-shadow-sm">
            {voteA}% vs {voteB}%
          </div>
        </div>

        <div className="mt-3 text-center">
          <span
            className={`inline-block rounded-full px-4 py-1.5 font-mono text-xs font-bold ${
              isMinority
                ? "bg-minority/10 text-minority border border-minority/20"
                : "bg-majority/10 text-majority border border-majority/20"
            }`}
          >
            {isMinority
              ? `YOU'RE IN THE MINORITY (${userPercent}%). Think they're wrong? React below.`
              : `YOU'RE IN THE MAJORITY (${userPercent}%)`}
          </span>
        </div>
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
      <div className="flex flex-col items-center gap-2 pt-1">
        <div className="flex w-full gap-2">
          <button
            onClick={onNextCase}
            className="flex-1 rounded-lg bg-primary px-6 py-3.5 font-mono text-sm font-bold tracking-wide text-primary-foreground shadow-md transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            RUN NEXT TRIAL
          </button>
          <button
            onClick={onStay}
            className="rounded-lg border bg-card px-4 py-3.5 font-mono text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            STAY ON THIS CASE
          </button>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {autoEnabled
            ? `Next trial auto-starts in ${formatCountdown(autoCountdown)}`
            : "Auto-start paused"}{" "}
          · Trial {trialNumber} / {totalCases} — Season 1
        </span>
      </div>
    </motion.div>
  );
};
