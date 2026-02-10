import { cases, Case } from "@/data/cases";
import { motion } from "framer-motion";

interface CaseListProps {
  currentCaseId: number;
  onSelectCase: (c: Case) => void;
}

export const CaseList = ({ currentCaseId, onSelectCase }: CaseListProps) => {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="mb-3 font-mono text-xs font-bold tracking-widest text-foreground">
        SEASON 1 — ALL CASES
      </h3>

      <div className="space-y-2">
        {cases.map((c) => {
          const isActive = c.id === currentCaseId;
          return (
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectCase(c)}
              className={`w-full rounded-md border px-4 py-3 text-left transition-all ${
                isActive
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "border-border bg-background hover:border-primary/20 hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-muted-foreground">
                  #{String(c.id).padStart(3, "0")}
                </span>
                {isActive && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-primary">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-foreground leading-snug">
                {c.context.split(". ")[0]}
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {c.optionA} vs {c.optionB}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
