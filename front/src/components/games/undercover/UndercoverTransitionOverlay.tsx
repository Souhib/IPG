import { MessageCircle, Trophy } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { memo } from "react"
import { useTranslation } from "react-i18next"

interface UndercoverTransitionOverlayProps {
  type: "game_over" | "voting"
  show: boolean
}

export const UndercoverTransitionOverlay = memo(function UndercoverTransitionOverlay({
  type,
  show,
}: UndercoverTransitionOverlayProps) {
  const { t } = useTranslation()

  const isGameOver = type === "game_over"
  const Icon = isGameOver ? Trophy : MessageCircle
  const iconClass = isGameOver ? "text-yellow-500 drop-shadow-lg" : "text-primary drop-shadow-lg"
  const title = isGameOver ? t("game.gameOver") : t("game.undercover.allDescriptionsIn")
  const subtitle = isGameOver ? t("game.gameOverTransition") : t("game.undercover.timeToVote")

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
        >
          <motion.div className="glass rounded-2xl border-border/30 p-10 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Icon className={`h-16 w-16 mx-auto ${iconClass}`} />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-extrabold tracking-tight gradient-text"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg text-muted-foreground"
            >
              {subtitle}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
