import { Skull } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { memo } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface VoteEntry {
  voter: string
  voter_id: string
  target: string
  target_id: string
}

interface EliminationOverlayProps {
  eliminatedUsername?: string
  eliminatedRole?: string
  votes?: VoteEntry[]
  onDismiss: () => void
}

const roleConfig: Record<string, { color: string; bg: string; border: string; label: string; glow: string }> = {
  civilian: {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "Civilian",
    glow: "shadow-green-500/20",
  },
  undercover: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "Undercover",
    glow: "shadow-red-500/20",
  },
  mr_white: {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    label: "Mr. White",
    glow: "shadow-purple-500/20",
  },
}

export const EliminationOverlay = memo(function EliminationOverlay({
  eliminatedUsername,
  eliminatedRole,
  votes,
  onDismiss,
}: EliminationOverlayProps) {
  const { t } = useTranslation()
  const config = roleConfig[eliminatedRole ?? ""] ?? roleConfig.civilian

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
      >
        {/* Red vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,oklch(0.3_0.15_25/0.15)_100%)] pointer-events-none" />

        <motion.div className="relative text-center space-y-5 max-w-md w-full px-6">
          {/* Skull icon with dramatic bounce */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
              <Skull className={cn("h-12 w-12", config.color)} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-extrabold tracking-tight"
          >
            {t("game.eliminated")}
          </motion.h2>

          {/* Player name */}
          {eliminatedUsername && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-bold"
            >
              {eliminatedUsername}
            </motion.p>
          )}

          {/* Role reveal card */}
          {eliminatedRole && (
            <motion.div
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className={cn(
                "inline-block rounded-2xl border px-6 py-3 shadow-lg",
                config.border,
                config.bg,
                config.glow,
              )}
            >
              <span className={cn("text-sm font-bold", config.color)}>
                {t("game.yourRole")}: {config.label}
              </span>
            </motion.div>
          )}

          {/* Vote Breakdown */}
          {votes && votes.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="glass rounded-2xl p-5 text-left mt-4"
            >
              <h3 className="text-sm font-bold mb-3 text-center">{t("game.undercover.voteBreakdown")}</h3>
              <div className="space-y-2">
                {votes.map((vote, idx) => (
                  <motion.div
                    key={vote.voter_id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.4 + idx * 0.1 }}
                    className="flex items-center text-sm text-muted-foreground"
                  >
                    <span className="font-semibold text-foreground">{vote.voter}</span>
                    <span className="mx-2 text-primary">&rarr;</span>
                    <span className={cn(
                      "font-semibold",
                      vote.target_id === votes.find((v) => v.voter === eliminatedUsername)?.voter_id
                        ? "text-destructive"
                        : "text-foreground",
                      vote.target === eliminatedUsername && "text-destructive",
                    )}>
                      {vote.target}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Continue button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: votes && votes.length > 0 ? 1.4 + votes.length * 0.1 + 0.3 : 1.2 }}
          >
            <button
              type="button"
              onClick={onDismiss}
              className="mt-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-px transition-all duration-200"
            >
              {t("game.undercover.continueGame")}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})
