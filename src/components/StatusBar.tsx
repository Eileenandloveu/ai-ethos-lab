import { useEffect, useState } from "react";
import { Info } from "lucide-react";

interface StatusBarProps {
  yourMatch: number;
  split: [number, number];
}

export const StatusBar = ({ yourMatch, split }: StatusBarProps) => {
  const [countdown, setCountdown] = useState("");
  const [participants, setParticipants] = useState(54231);

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

  // Non-linear ticking participants
  useEffect(() => {
    const tick = () => {
      const delta = Math.random() < 0.3 ? -Math.floor(Math.random() * 3) : Math.floor(Math.random() * 5);
      setParticipants((p) => Math.max(53800, p + delta));
    };
    const id = setInterval(tick, 2000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tracking-wider text-foreground">
            AIOS
          </span>
          <span className="font-mono text-xs text-muted-foreground">//</span>
          <span className="flex items-center gap-1.5 font-mono text-xs font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-live animate-pulse-live" />
            STATUS: LIVE
          </span>
        </div>

        <div className="hidden items-center gap-4 font-mono text-[11px] text-muted-foreground sm:flex">
          <span className="group relative cursor-help">
            Live participants: <strong className="text-foreground">{participants.toLocaleString()}</strong>
            <Info className="ml-0.5 inline h-3 w-3 text-muted-foreground/60" />
          </span>
          <span className="text-border">|</span>
          <span className="group relative cursor-help">
            Split: <strong className="text-foreground">{split[0]} / {split[1]}</strong>
          </span>
          <span className="text-border">|</span>
          <span className="group relative cursor-help">
            Your match: <strong className="text-primary">{yourMatch}%</strong>
            <Info className="ml-0.5 inline h-3 w-3 text-muted-foreground/60" />
          </span>
          <span className="text-border">|</span>
          <span>
            Next refresh:{" "}
            <strong className="text-primary">{countdown}</strong>
          </span>
        </div>
      </div>
    </header>
  );
};
