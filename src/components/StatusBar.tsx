import { useEffect, useState } from "react";

export const StatusBar = () => {
  const [countdown, setCountdown] = useState("");

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

        <div className="hidden items-center gap-4 font-mono text-xs text-muted-foreground sm:flex">
          <span>Nodes: <strong className="text-foreground">10</strong></span>
          <span className="text-border">|</span>
          <span>Participants: <strong className="text-foreground">54k</strong></span>
          <span className="text-border">|</span>
          <span>Consensus: <strong className="text-foreground">68%</strong></span>
          <span className="text-border">|</span>
          <span>
            Daily reset in{" "}
            <strong className="text-primary">{countdown}</strong>
          </span>
        </div>
      </div>
    </header>
  );
};
