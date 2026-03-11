import { memo } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface GuessEntry {
  word: string
  card_type: string
  correct: boolean
}

interface ClueHistoryEntry {
  team: "red" | "blue"
  clue_word: string
  clue_number: number
  guesses: GuessEntry[]
}

interface ClueHistoryProps {
  history: ClueHistoryEntry[]
}

export const ClueHistory = memo(function ClueHistory({ history }: ClueHistoryProps) {
  const { t } = useTranslation()

  if (history.length === 0) return null

  return (
    <div className="glass rounded-2xl p-5 mt-6">
      <h3 className="font-bold mb-4">{t("game.codenames.clueHistory")}</h3>
      <div className="max-h-64 overflow-y-auto space-y-1">
        {[...history].reverse().map((entry, i) => (
          <div key={i} className="relative flex gap-3 py-2.5">
            {/* Timeline line */}
            {i < history.length - 1 && (
              <div className={cn(
                "absolute top-8 left-[7px] w-0.5 h-[calc(100%-8px)]",
                entry.team === "red" ? "bg-red-200 dark:bg-red-900/30" : "bg-blue-200 dark:bg-blue-900/30",
              )} />
            )}
            {/* Team dot */}
            <div className={cn(
              "relative z-10 mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2",
              entry.team === "red"
                ? "bg-red-500 border-red-300 dark:border-red-700"
                : "bg-blue-500 border-blue-300 dark:border-blue-700",
            )} />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold">
                {entry.clue_word} <span className="font-mono text-muted-foreground">({entry.clue_number})</span>
              </span>
              {entry.guesses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {entry.guesses.map((guess, j) => (
                    <span
                      key={j}
                      className={cn(
                        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
                        guess.correct
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      )}
                    >
                      {guess.word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
