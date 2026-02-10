import { useEffect, useState } from "react";

export const ParliamentTicker = () => {
  const [rulingCountdown, setRulingCountdown] = useState("");
  const [volatility, setVolatility] = useState("HIGH");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(now);
      target.setHours(now.getHours() + 2, 14, 36, 0);
      const diff = target.getTime() - now.getTime();
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setRulingCountdown(`${h}:${m}:${s}`);
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
      setVolatility(states[idx]);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
        <h3 className="font-mono text-xs font-bold tracking-widest text-foreground">
          AI PARLIAMENT LIVE
        </h3>
      </div>

      <div className="space-y-2.5 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Split</span>
          <span className="font-semibold text-foreground">53 / 47</span>
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
          <span className="text-muted-foreground">Volatility</span>
          <span
            className={`font-bold ${
              volatility === "CRITICAL"
                ? "text-live"
                : volatility === "HIGH"
                ? "text-minority"
                : "text-majority"
            }`}
          >
            {volatility}
          </span>
        </div>
        <div className="border-b border-dashed" />

        <div className="flex justify-between">
          <span className="text-muted-foreground">Ruling drops in</span>
          <span className="font-bold text-primary">{rulingCountdown}</span>
        </div>
      </div>
    </div>
  );
};
