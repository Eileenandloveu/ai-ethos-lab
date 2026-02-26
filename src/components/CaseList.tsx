import { BackendCase } from "@/lib/api";
import { motion } from "framer-motion";

interface CaseListProps {
  cases: BackendCase[];
  currentCaseId: string;
  onSelectCase: (c: BackendCase) => void;
}

export const CaseList = ({ cases, currentCaseId, onSelectCase }: CaseListProps) => {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="mb-3 font-mono text-xs font-bold tracking-widest text-foreground">
        SEASON 1 — ALL CASES
      </h3>

      <div className="space-y-2">
        {cases.map((c) => {
          const isActive = c.case_id === currentCaseId;
          return (
            <motion.button
              key={c.case_id}
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
                  #{c.case_no}
                </span>
                {c.status === "active" && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-primary">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-foreground leading-snug">
                {c.prompt.split(". ")[0]}
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {c.option_a_label} vs {c.option_b_label}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
