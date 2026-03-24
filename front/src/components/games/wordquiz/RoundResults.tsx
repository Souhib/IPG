import { Check, X } from "lucide-react"
import { memo } from "react"
import { useTranslation } from "react-i18next"
import { motion } from "motion/react"

interface RoundResult {
  user_id: string
  username: string
  answered_at_hint: number | null
  points: number
}

interface RoundResultsProps {
  correctAnswer: string
  explanation?: string | null
  roundResults: RoundResult[]
  isHost: boolean
  isLastRound?: boolean
  onNextRound: () => void
  isAdvancing: boolean
}

export const RoundResults = memo(function RoundResults({
  correctAnswer,
  explanation,
  roundResults,
  isHost,
  isLastRound,
  onNextRound,
  isAdvancing,
}: RoundResultsProps) {
  const { t } = useTranslation()
  const sorted = [...roundResults].sort((a, b) => b.points - a.points)

  return (
    <div className="space-y-4">
      {/* Correct answer reveal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-2xl border-primary/30 p-5 text-center"
      >
        <p className="text-sm text-muted-foreground mb-1">{t("game.wordQuiz.correctAnswer", { answer: "" })}</p>
        <p className="text-2xl font-extrabold tracking-tight gradient-text">{correctAnswer}</p>
        {explanation && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{explanation}</p>
        )}
      </motion.div>

      {/* Results table */}
      <div className="glass rounded-2xl border-border/30 p-5">
        <div className="space-y-2">
          {sorted.map((result, index) => (
            <motion.div
              key={result.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between rounded-xl px-4 py-3 bg-muted/20 border border-border/20"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground w-5">#{index + 1}</span>
                <span className="text-sm font-medium">{result.username}</span>
              </div>
              <div className="flex items-center gap-3">
                {result.answered_at_hint ? (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {t("game.wordQuiz.hintNumber", { number: result.answered_at_hint, total: "" }).replace("/", "")}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-xs text-emerald-500 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      +{result.points}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {t("game.wordQuiz.notAnswered")}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next Round button (host only) */}
      {isHost && (
        <button
          type="button"
          onClick={onNextRound}
          disabled={isAdvancing}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 py-3 text-sm font-extrabold tracking-tight text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 transition-all duration-200"
        >
          {isAdvancing ? t("common.loading") : isLastRound ? t("game.wordQuiz.seeResults") : t("game.wordQuiz.nextRound")}
        </button>
      )}
    </div>
  )
})
