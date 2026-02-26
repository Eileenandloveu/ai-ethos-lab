import { BackendCase } from "@/lib/api";
import { motion } from "framer-motion";

interface LiveTrialProps {
  currentCase: BackendCase;
  onVote: (choice: "a" | "b") => void;
  hasVoted: boolean;
}

export const LiveTrial = ({ currentCase, onVote, hasVoted }: LiveTrialProps) => {
  return (
    <motion.div
      key={currentCase.case_id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border border-console-border/40 bg-card p-6 shadow-sm animate-glow"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-live animate-pulse-live" />
        <span className="font-mono text-xs font-semibold tracking-widest text-primary uppercase">
          Live Trial // Case #{currentCase.case_no}
        </span>
      </div>

      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
        LIVE TRIAL // Human × AI Ethics
      </h1>

      <p className="mb-5 font-mono text-sm leading-relaxed text-muted-foreground">
        {currentCase.prompt}
      </p>

      {!hasVoted && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => onVote("a")}
            className="group relative overflow-hidden rounded-lg border-2 border-vote-a bg-vote-a/5 px-6 py-5 font-mono text-sm font-bold tracking-wide text-vote-a transition-all hover:bg-vote-a hover:text-primary-foreground hover:shadow-lg hover:shadow-vote-a/25 active:scale-[0.97]"
          >
            <span className="relative z-10">VOTE: {currentCase.option_a_label}</span>
          </button>

          <button
            onClick={() => onVote("b")}
            className="group relative overflow-hidden rounded-lg border-2 border-vote-b bg-vote-b/5 px-6 py-5 font-mono text-sm font-bold tracking-wide text-vote-b transition-all hover:bg-vote-b hover:text-primary-foreground hover:shadow-lg hover:shadow-vote-b/25 active:scale-[0.97]"
          >
            <span className="relative z-10">VOTE: {currentCase.option_b_label}</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
