import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchArguments, voteArgument, getVisitorId, Argument } from "@/lib/api";

interface DebatePanelProps {
  caseId: string;
  userVote: "a" | "b";
  optionALabel: string;
  optionBLabel: string;
}

export const DebatePanel = ({ caseId, userVote, optionALabel, optionBLabel }: DebatePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [args, setArgs] = useState<Argument[]>([]);
  const [loading, setLoading] = useState(false);
  const visitorId = getVisitorId();

  const oppositeLabel = userVote === "a" ? optionBLabel : optionALabel;

  // Load arguments when panel opens or caseId changes
  useEffect(() => {
    if (!isOpen || !caseId) return;
    setLoading(true);
    fetchArguments(caseId, visitorId)
      .then(setArgs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, caseId, visitorId]);

  const handleVote = async (argKey: string, dir: "up" | "down") => {
    const existing = args.find(a => a.argument_key === argKey);
    if (existing?.my_vote) return; // already voted
    try {
      const result = await voteArgument(visitorId, caseId, argKey, dir);
      setArgs(prev => prev.map(a =>
        a.argument_key === result.argument_key
          ? { ...a, up_count: result.up_count, down_count: result.down_count, my_vote: result.my_vote }
          : a
      ));
    } catch (e) {
      console.error("Vote argument error:", e);
    }
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
              {loading && <p className="font-mono text-xs text-muted-foreground animate-pulse">Loading…</p>}
              {args.map((arg, idx) => (
                <motion.div
                  key={arg.argument_key}
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
                      onClick={() => handleVote(arg.argument_key, "up")}
                      className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                        arg.my_vote === "up" ? "text-primary" : arg.my_vote ? "text-muted-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                      disabled={!!arg.my_vote}
                    >
                      <ThumbsUp className="h-3 w-3" /> {arg.up_count}
                    </button>
                    <button
                      onClick={() => handleVote(arg.argument_key, "down")}
                      className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                        arg.my_vote === "down" ? "text-destructive" : arg.my_vote ? "text-muted-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                      disabled={!!arg.my_vote}
                    >
                      <ThumbsDown className="h-3 w-3" /> {arg.down_count}
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
