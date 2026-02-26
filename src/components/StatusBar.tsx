import { useEffect, useState, useRef } from "react";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

interface StatusBarProps {
  yourMatch: number;
  split: [number, number];
  participants?: number;
  nextRefresh?: number;
}

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <span className="group relative cursor-help">
    {children}
    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 font-mono text-[10px] text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
      {text}
    </span>
  </span>
);

export const StatusBar = ({ yourMatch, split, participants: extParticipants, nextRefresh }: StatusBarProps) => {
  const [countdown, setCountdown] = useState("");
  const [displayParticipants, setDisplayParticipants] = useState(extParticipants ?? 0);
  const [displaySplit, setDisplaySplit] = useState(split);
  const targetParticipants = useRef(extParticipants ?? 0);

  // Update targets when props change
  useEffect(() => {
    targetParticipants.current = extParticipants ?? 0;
    setDisplayParticipants(extParticipants ?? 0);
  }, [extParticipants]);

  useEffect(() => {
    setDisplaySplit(split);
  }, [split]);

  // Irregular participant ticking
  useEffect(() => {
    const tick = () => {
      setDisplayParticipants((prev) => {
        const jitter = Math.floor(Math.random() * 7) - 2; // -2 to +4
        const target = targetParticipants.current;
        return Math.max(0, target + jitter);
      });
      setDisplaySplit(([a, b]) => {
        const drift = (Math.random() - 0.45) * 0.6; // slight upward bias
        const newA = Math.max(1, Math.min(99, a + drift));
        return [Math.round(newA * 10) / 10, Math.round((100 - newA) * 10) / 10];
      });
    };
    const id = setInterval(tick, 2000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, []);

  // Next refresh countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setCountdown(`${h}:${m}:${s}`);
    };
    updateCountdown();
    const id = setInterval(updateCountdown, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-console-border/30 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-bold tracking-wider text-foreground">
            AIOS
          </span>
          <span className="font-mono text-xs text-muted-foreground">//</span>
          <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-live animate-pulse-live" />
            STATUS: LIVE
          </span>
        </div>

        <div className="hidden items-center gap-4 font-mono text-[11px] text-muted-foreground md:flex">
          <Tooltip text="People participating in this experiment right now">
            <span>
              Live participants:{" "}
              <motion.strong
                key={displayParticipants}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                className="text-foreground"
              >
                {displayParticipants.toLocaleString()}
              </motion.strong>
              <Info className="ml-0.5 inline h-3 w-3 text-muted-foreground/60" />
            </span>
          </Tooltip>
          <span className="text-border">|</span>
          <Tooltip text="Current vote distribution for the active case">
            <span>
              Split right now:{" "}
              <strong className="text-foreground">
                {Math.round(displaySplit[0])} / {Math.round(displaySplit[1])}
              </strong>
            </span>
          </Tooltip>
          <span className="text-border">|</span>
          <Tooltip text="% of people whose choices match yours so far">
            <span>
              Your match:{" "}
              <strong className="text-primary">{yourMatch}%</strong>
              <Info className="ml-0.5 inline h-3 w-3 text-muted-foreground/60" />
            </span>
          </Tooltip>
          <span className="text-border">|</span>
          <Tooltip text="Next global checkpoint / new case rotation">
            <span>
              Next refresh:{" "}
              <strong className="text-primary">{countdown}</strong>
            </span>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};
