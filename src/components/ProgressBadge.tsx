import { Lock, Shield, Eye, FileText } from "lucide-react";

interface ProgressBadgeProps {
  trialsCompleted: number;
  streak: number;
  testimoniesGiven: number;
}

export const ProgressBadge = ({ trialsCompleted, streak, testimoniesGiven }: ProgressBadgeProps) => {
  const isJurorUnlocked = trialsCompleted >= 3 && testimoniesGiven >= 1;
  const isClerkUnlocked = trialsCompleted >= 7;

  const currentRole = isClerkUnlocked ? "CLERK" : isJurorUnlocked ? "JUROR" : "WITNESS";

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="mb-3 font-mono text-xs font-bold tracking-widest text-foreground">
        YOUR STATUS
      </h3>

      <div className="space-y-3">
        {/* Progress */}
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground">Trial Progress</span>
          <span className="font-bold text-foreground">{trialsCompleted} / 6</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(trialsCompleted / 6) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground">Streak</span>
          <span className="font-bold text-primary">{streak} days</span>
        </div>

        {/* Badges */}
        <div className="mt-2 space-y-2">
          <div className={`flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs ${
            currentRole === "WITNESS" ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground"
          }`}>
            <Eye className="h-3.5 w-3.5" />
            <span className="font-semibold">WITNESS</span>
            {currentRole === "WITNESS" && <span className="ml-auto text-[10px]">ACTIVE</span>}
          </div>

          <div className={`flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs ${
            currentRole === "JUROR" ? "bg-primary/10 text-primary border border-primary/30" :
            isJurorUnlocked ? "bg-muted text-foreground" : "bg-muted text-badge-locked"
          }`}>
            <Shield className="h-3.5 w-3.5" />
            <span className="font-semibold">JUROR</span>
            {!isJurorUnlocked && <Lock className="ml-auto h-3 w-3" />}
            {currentRole === "JUROR" && <span className="ml-auto text-[10px]">ACTIVE</span>}
          </div>

          <div className={`flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs ${
            currentRole === "CLERK" ? "bg-primary/10 text-primary border border-primary/30" :
            isClerkUnlocked ? "bg-muted text-foreground" : "bg-muted text-badge-locked"
          }`}>
            <FileText className="h-3.5 w-3.5" />
            <span className="font-semibold">CLERK</span>
            {!isClerkUnlocked && <Lock className="ml-auto h-3 w-3" />}
            {currentRole === "CLERK" && <span className="ml-auto text-[10px]">ACTIVE</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
