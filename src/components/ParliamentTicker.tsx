import { useEffect, useState } from "react";
import { CouncilState } from "@/lib/api";

interface ParliamentTickerProps {
  council: CouncilState | null;
}

export const ParliamentTicker = ({ council }: ParliamentTickerProps) => {
  const [decisionCountdown, setDecisionCountdown] = useState("");
  const [displaySplit, setDisplaySplit] = useState<[number, number]>([50, 50]);

  const etaSeconds = council?.decision_eta_seconds ?? 4680;
  const heatLevel = council?.heat_level ?? "MODERATE";
  const motionNo = council?.motion_no ?? 0;
  const motionText = council?.motion_text ?? "Loading…";

  // Countdown
  useEffect(() => {
    let remaining = etaSeconds;
    const tick = () => {
      remaining = Math.max(0, remaining - 1);
      const h = String(Math.floor(remaining / 3600)).padStart(2, "0");
      const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
      const s = String(remaining % 60).padStart(2, "0");
      setDecisionCountdown(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [etaSeconds]);

  // Irregular split ticking
  useEffect(() => {
    const a = council?.split_a ?? 50;
    const b = council?.split_b ?? 50;
    setDisplaySplit([a, b]);

    const tick = () => {
      setDisplaySplit(([prevA]) => {
        const drift = (Math.random() - 0.5) * 1.2;
        const newA = Math.max(10, Math.min(90, prevA + drift));
        return [Math.round(newA), Math.round(100 - newA)];
      });
    };
    const id = setInterval(tick, 3000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [council?.split_a, council?.split_b]);

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
          <span className="font-semibold text-foreground">{displaySplit[0]} / {displaySplit[1]}</span>
        </div>
        <div className="border-b border-dashed" />

        <div>
          <span className="text-muted-foreground">Motion #{motionNo} pending:</span>
          <p className="mt-0.5 text-foreground leading-snug">{motionText}</p>
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
      </div>

      <p className="mt-3 font-mono text-[9px] text-muted-foreground/60 italic">
        (Preview demo: timing may be simulated)
      </p>
    </div>
  );
};
