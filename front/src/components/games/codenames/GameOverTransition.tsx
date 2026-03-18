import { Trophy } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { memo } from "react"
import { useTranslation } from "react-i18next"

interface GameOverTransitionProps {
  show: boolean
}

export const GameOverTransition = memo(function GameOverTransition({ show }: GameOverTransitionProps) {
  const { t } = useTranslation()

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
              <Trophy className="h-16 w-16 mx-auto text-yellow-500 drop-shadow-lg" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-extrabold tracking-tight gradient-text"
            >
              {t("game.gameOver")}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg text-muted-foreground"
            >
              {t("game.gameOverTransition")}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
