import { useState } from "react";
import { Lock, Shield, Eye, FileText, User, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ProgressBadgeProps {
  trialsCompleted: number;
  streak: number;
  testimoniesGiven: number;
  yourMatch: number;
}

export const ProgressBadge = ({ trialsCompleted, streak, testimoniesGiven, yourMatch }: ProgressBadgeProps) => {
  const [showRolesModal, setShowRolesModal] = useState(false);

  const isJurorUnlocked = trialsCompleted >= 3 && testimoniesGiven >= 1;
  const isClerkUnlocked = isJurorUnlocked && trialsCompleted >= 7;

  const currentRole = isClerkUnlocked ? "CLERK" : isJurorUnlocked ? "JUROR" : "WITNESS";

  return (
    <>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="mb-3 font-mono text-xs font-bold tracking-widest text-foreground">
          YOUR PROFILE
        </h3>

        <div className="space-y-3">
          {/* Avatar */}
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/5">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-mono text-xs font-semibold text-foreground">{currentRole}</p>
              <p className="font-mono text-[10px] text-muted-foreground">Season 1 participant</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-muted-foreground">Trials completed</span>
            <span className="font-bold text-foreground">{trialsCompleted} / 6</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(Math.min(trialsCompleted, 6) / 6) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-muted-foreground">Streak</span>
            <span className="font-bold text-foreground">{streak} days</span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-muted-foreground">Your match</span>
            <span className="font-bold text-primary">{yourMatch}%</span>
          </div>

          {/* Badges */}
          <div className="mt-2 space-y-2">
            {/* WITNESS - always visible, shiny when active */}
            <div className={`flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs transition-all ${
              currentRole === "WITNESS"
                ? "bg-primary/10 text-primary border border-primary/30 shadow-sm shadow-primary/10"
                : "bg-muted text-muted-foreground"
            }`}>
              <Eye className="h-3.5 w-3.5" />
              <span className="font-semibold">WITNESS</span>
              {currentRole === "WITNESS" && <span className="ml-auto text-[10px] font-bold">✦ ACTIVE</span>}
            </div>

            {/* JUROR */}
            <div className={`flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs transition-all ${
              currentRole === "JUROR"
                ? "bg-primary/10 text-primary border border-primary/30 shadow-sm shadow-primary/10"
                : isJurorUnlocked
                ? "bg-muted text-foreground"
                : "bg-muted text-badge-locked"
            }`}>
              <Shield className="h-3.5 w-3.5" />
              <span className="font-semibold">JUROR</span>
              {!isJurorUnlocked && <Lock className="ml-auto h-3 w-3" />}
              {currentRole === "JUROR" && <span className="ml-auto text-[10px] font-bold">✦ ACTIVE</span>}
            </div>

            {/* Unlock hint - NOT a button */}
            {!isJurorUnlocked && (
              <p className="font-mono text-[10px] text-muted-foreground pl-1">
                Unlock Juror: complete 3 trials + 1 testimony
              </p>
            )}

            {/* CLERK */}
            <div className={`flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs transition-all ${
              currentRole === "CLERK"
                ? "bg-primary/10 text-primary border border-primary/30 shadow-sm shadow-primary/10"
                : isClerkUnlocked
                ? "bg-muted text-foreground"
                : "bg-muted text-badge-locked"
            }`}>
              <FileText className="h-3.5 w-3.5" />
              <span className="font-semibold">CLERK</span>
              {!isClerkUnlocked && <Lock className="ml-auto h-3 w-3" />}
              {currentRole === "CLERK" && <span className="ml-auto text-[10px] font-bold">✦ ACTIVE</span>}
            </div>
          </div>

          {/* Roles info link */}
          <button
            onClick={() => setShowRolesModal(true)}
            className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors mt-1"
          >
            <Info className="h-3 w-3" />
            What are WITNESS / JUROR / CLERK?
          </button>
        </div>
      </div>

      {/* Roles Modal */}
      <AnimatePresence>
        {showRolesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
            onClick={() => setShowRolesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-lg border bg-card p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-mono text-xs font-bold tracking-widest text-foreground">ROLES</h4>
                <button onClick={() => setShowRolesModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold text-foreground">WITNESS</span>
                    <span className="text-[9px] text-muted-foreground">(default)</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">You vote on cases and share your perspective. Everyone starts here.</p>
                </div>
                <div className="border-b border-dashed" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold text-foreground">JUROR</span>
                    <span className="text-[9px] text-muted-foreground">(unlock: 3 trials + 1 testimony)</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">Your votes shape the rules. Unlocked first.</p>
                </div>
                <div className="border-b border-dashed" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold text-foreground">CLERK</span>
                    <span className="text-[9px] text-muted-foreground">(unlock after Juror + 7 trials)</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">Generate case summaries. Your work is displayed and referenced — prestige.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
