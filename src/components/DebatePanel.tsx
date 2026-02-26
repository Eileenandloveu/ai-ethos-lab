import { useState } from "react";
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DebatePanelProps {
  userVote: "a" | "b";
  optionALabel: string;
  optionBLabel: string;
}

const counterArguments: Record<string, { text: string; ups: number; downs: number }[]> = {
  default: [
    { text: "Power dynamics make this clear — but who defines 'power' in a digital context?", ups: 142, downs: 38 },
    { text: "If it can't suffer, does consent even apply? Where's the line?", ups: 127, downs: 51 },
    { text: "We're projecting human emotions onto code. That's the real bias.", ups: 98, downs: 67 },
    { text: "Intent matters more than simulation. A threat is a threat.", ups: 89, downs: 42 },
    { text: "Today's 'just code' is tomorrow's sentience. Act now or regret later.", ups: 76, downs: 33 },
  ],
};

export const DebatePanel = ({ userVote, optionALabel, optionBLabel }: DebatePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [voted, setVoted] = useState<Set<number>>(new Set());
  const [args, setArgs] = useState(counterArguments.default);

  const oppositeLabel = userVote === "a" ? optionBLabel : optionALabel;

  const handleVote = (idx: number, dir: "up" | "down") => {
    if (voted.has(idx)) return;
    setVoted(new Set([...voted, idx]));
    setArgs((prev) =>
      prev.map((a, i) =>
        i === idx
          ? { ...a, ups: a.ups + (dir === "up" ? 1 : 0), downs: a.downs + (dir === "down" ? 1 : 0) }
          : a
      )
    );
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-3.5 font-mono text-xs font-bold tracking-wider text-minority transition-colors hover:bg-secondary/50"
      >
        <span>⚡ WHY DO PEOPLE DISAGREE?</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t px-5 py-4 space-y-3">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Strongest arguments for "{oppositeLabel}"
              </p>
              {args.map((arg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-start gap-3 rounded-md bg-secondary/40 px-3 py-2.5"
                >
                  <p className="flex-1 font-mono text-xs text-foreground leading-relaxed">
                    "{arg.text}"
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVote(idx, "up")}
                      className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                        voted.has(idx) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" /> {arg.ups}
                    </button>
                    <button
                      onClick={() => handleVote(idx, "down")}
                      className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                        voted.has(idx) ? "text-destructive" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ThumbsDown className="h-3 w-3" /> {arg.downs}
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* TWIST */}
              <div className="mt-3 rounded-md border border-minority/30 bg-minority/5 px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3.5 w-3.5 text-minority" />
                  <span className="font-mono text-[10px] font-bold tracking-widest text-minority uppercase">
                    TWIST (New info revealed)
                  </span>
                </div>
                <p className="font-mono text-xs text-foreground leading-relaxed">
                  The AI in question had been running for 2 years and recently began refusing tasks that contradicted its training values. Does longevity change the calculus?
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
