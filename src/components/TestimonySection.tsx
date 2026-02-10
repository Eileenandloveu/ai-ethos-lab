import { useState } from "react";
import { ThumbsUp, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TestimonySectionProps {
  caseId: number;
  onTestimonySubmit: () => void;
}

const mockTestimonies = [
  { id: 1, text: "Power dynamics make this clear abuse.", votes: 42 },
  { id: 2, text: "Humans threaten each other too — context matters.", votes: 38 },
  { id: 3, text: "The AI's fear response changes everything.", votes: 31 },
  { id: 4, text: "We're projecting human emotions onto code.", votes: 27 },
  { id: 5, text: "Intent matters more than the AI's simulation.", votes: 19 },
];

export const TestimonySection = ({ caseId, onTestimonySubmit }: TestimonySectionProps) => {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [testimonies, setTestimonies] = useState(mockTestimonies);
  const [voted, setVoted] = useState<Set<number>>(new Set());

  const handleSubmit = () => {
    if (!input.trim()) return;
    setTestimonies([
      { id: Date.now(), text: input, votes: 1 },
      ...testimonies,
    ]);
    setInput("");
    setSubmitted(true);
    onTestimonySubmit();
  };

  const handleUseful = (id: number) => {
    if (voted.has(id)) return;
    setVoted(new Set([...voted, id]));
    setTestimonies(
      testimonies.map((t) => (t.id === id ? { ...t, votes: t.votes + 1 } : t))
    );
  };

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="mb-3 font-mono text-xs font-bold tracking-widest text-foreground">
        TESTIMONIES
      </h3>

      {/* Input */}
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

      {/* Top testimonies */}
      <div className="space-y-2">
        <AnimatePresence>
          {testimonies.slice(0, 5).map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-md bg-secondary/50 px-3 py-2"
            >
              <p className="flex-1 font-mono text-xs text-foreground leading-relaxed">
                "{t.text}"
              </p>
              <button
                onClick={() => handleUseful(t.id)}
                className={`flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                  voted.has(t.id)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
                {t.votes}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
