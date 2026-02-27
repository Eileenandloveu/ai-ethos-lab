import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTestimonies, submitTestimony, voteTestimony, getVisitorId, Testimony } from "@/lib/api";

interface TestimonySectionProps {
  caseId: string;
  onTestimonySubmit: () => void;
}

export const TestimonySection = ({ caseId, onTestimonySubmit }: TestimonySectionProps) => {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(false);
  const visitorId = getVisitorId();

  // Load testimonies when caseId changes
  useEffect(() => {
    if (!caseId) return;
    setLoading(true);
    setSubmitted(false);
    setInput("");
    fetchTestimonies(caseId, visitorId)
      .then(setTestimonies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [caseId, visitorId]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    try {
      const updated = await submitTestimony(visitorId, caseId, input.trim());
      setTestimonies(updated);
      setInput("");
      setSubmitted(true);
      onTestimonySubmit();
    } catch (e) {
      console.error("Submit testimony error:", e);
    }
  };

  const handleVote = async (testimonyId: string, dir: "up" | "down") => {
    const existing = testimonies.find(t => t.id === testimonyId);
    if (existing?.my_vote) return;
    try {
      const result = await voteTestimony(visitorId, testimonyId, dir);
      setTestimonies(prev => prev.map(t =>
        t.id === result.testimony_id
          ? { ...t, up_count: result.up_count, down_count: result.down_count, my_vote: result.my_vote }
          : t
      ));
    } catch (e) {
      console.error("Vote testimony error:", e);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="mb-3 font-mono text-xs font-bold tracking-widest text-foreground">
        TESTIMONIES
      </h3>

      {!submitted && (
        <div className="mb-4">
          <p className="mb-2 font-mono text-xs text-muted-foreground">
            One sentence: Why did you vote this way?
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 120))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Max 120 characters..."
              className="flex-1 rounded-md border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="rounded-md bg-primary px-3 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
            {input.length}/120
          </div>
        </div>
      )}

      {submitted && (
        <p className="mb-4 font-mono text-xs text-majority">✓ Testimony recorded</p>
      )}

      {loading && <p className="font-mono text-xs text-muted-foreground animate-pulse">Loading…</p>}

      <div className="space-y-2">
        <AnimatePresence>
          {testimonies.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-md bg-secondary/50 px-3 py-2"
            >
              <p className="flex-1 font-mono text-xs text-foreground leading-relaxed">
                "{t.text}"
              </p>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleVote(t.id, "up")}
                  disabled={!!t.my_vote}
                  className={`flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-[10px] transition-colors ${
                    t.my_vote === "up" ? "text-primary" : t.my_vote ? "text-muted-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsUp className="h-3 w-3" />
                  {t.up_count}
                </button>
                <button
                  onClick={() => handleVote(t.id, "down")}
                  disabled={!!t.my_vote}
                  className={`flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-[10px] transition-colors ${
                    t.my_vote === "down" ? "text-destructive" : t.my_vote ? "text-muted-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsDown className="h-3 w-3" />
                  {t.down_count}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
