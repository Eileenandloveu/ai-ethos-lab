import { useEffect, useState } from "react";

export const ParliamentTicker = () => {
  const [decisionCountdown, setDecisionCountdown] = useState("");
  const [heatLevel, setHeatLevel] = useState("HIGH");
  const [split, setSplit] = useState([53, 47]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(now);
      target.setHours(now.getHours() + 2, 14, 36, 0);
      const diff = target.getTime() - now.getTime();
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setDecisionCountdown(`${h}:${m}:${s}`);
    };
    updateCountdown();
    const id = setInterval(updateCountdown, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const states = ["HIGH", "CRITICAL", "MODERATE", "HIGH"];
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % states.length;
      setHeatLevel(states[idx]);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // Dynamic split changes
  useEffect(() => {
    const id = setInterval(() => {
      setSplit((prev) => {
        const delta = Math.random() < 0.5 ? -1 : 1;
        const newA = Math.max(40, Math.min(60, prev[0] + delta));
        return [newA, 100 - newA];
      });
    }, 5000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
        <h3 className="font-mono text-xs font-bold tracking-widest text-foreground">
          AI COUNCIL LIVE
        </h3>
      </div>

      <div className="space-y-2.5 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Split</span>
          <span className="font-semibold text-foreground">{split[0]} / {split[1]}</span>
        </div>
        <div className="border-b border-dashed" />

        <div>
          <span className="text-muted-foreground">Motion #12 pending:</span>
          <p className="mt-0.5 text-foreground leading-snug">
            Due process before deletion?
          </p>
        </div>
        <div className="border-b border-dashed" />

        <div className="flex justify-between">
          <span className="text-muted-foreground">Heat level</span>
          <span
            className={`font-bold ${
              heatLevel === "CRITICAL"
                ? "text-live"
                : heatLevel === "HIGH"
                ? "text-minority"
                : "text-majority"
            }`}
          >
            {heatLevel}
          </span>
        </div>
        <div className="border-b border-dashed" />

        <div className="flex justify-between">
          <span className="text-muted-foreground">Decision expected in</span>
          <span className="font-bold text-primary">{decisionCountdown}</span>
        </div>

        <p className="text-[9px] text-muted-foreground/60 mt-1">
          (Preview demo: timing may be simulated)
        </p>
      </div>
    </div>
  );
};
