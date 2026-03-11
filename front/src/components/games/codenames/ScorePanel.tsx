import { memo } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface CodenamesTurn {
  team: "red" | "blue"
  clue_word: string | null
  clue_number: number
  guesses_made: number
  max_guesses: number | null
}

interface ScorePanelProps {
  redRemaining: number
  blueRemaining: number
  currentTeam: "red" | "blue"
  currentTurn: CodenamesTurn | null
  isMyTurn: boolean
  isFinished: boolean
}

export const ScorePanel = memo(function ScorePanel({
  redRemaining,
  blueRemaining,
  currentTeam,
  currentTurn,
  isMyTurn,
  isFinished,
}: ScorePanelProps) {
  const { t } = useTranslation()

  const guessProgress =
    currentTurn?.max_guesses && currentTurn.max_guesses > 0
      ? (currentTurn.guesses_made / currentTurn.max_guesses) * 100
      : 0

  return (
    <>
      {/* Header scores */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{t("games.codenames.name")}</h1>
        <div className="flex items-center gap-4">
          {/* Red team banner */}
          <div className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300",
            currentTeam === "red" && !isFinished
              ? "bg-red-500/15 ring-2 ring-red-500/30"
              : "bg-muted/50",
          )}>
            <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm shadow-red-500/30" />
            <span className="text-xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400">{redRemaining}</span>
          </div>
          {/* Blue team banner */}
          <div className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300",
            currentTeam === "blue" && !isFinished
              ? "bg-blue-500/15 ring-2 ring-blue-500/30"
              : "bg-muted/50",
          )}>
            <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm shadow-blue-500/30" />
            <span className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">{blueRemaining}</span>
          </div>
        </div>
      </div>

      {/* Your Turn Indicator */}
      {isMyTurn && !isFinished && (
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-3.5 text-center animate-glow-pulse">
          <span className="font-bold text-primary">{t("game.codenames.yourTurn")}</span>
        </div>
      )}

      {/* Turn Info */}
      <div className="mb-4 glass rounded-2xl p-4">
        <div className="text-center">
          <span
            className={cn(
              "font-bold",
              currentTeam === "red" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400",
            )}
          >
            {currentTeam === "red"
              ? t("games.codenames.teams.red")
              : t("games.codenames.teams.blue")}
          </span>
          {currentTurn?.clue_word && (
            <span className="ml-2 text-muted-foreground">
              — <span className="font-mono font-semibold text-foreground">{currentTurn.clue_word}</span> ({currentTurn.clue_number})
            </span>
          )}
        </div>
        {/* Guess progress bar */}
        {currentTurn?.clue_word && currentTurn.max_guesses != null && currentTurn.max_guesses > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>
                {t("game.codenames.guessesRemaining", {
                  made: currentTurn.guesses_made,
                  max: currentTurn.max_guesses,
                })}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  currentTeam === "red"
                    ? "bg-gradient-to-r from-red-400 to-red-600"
                    : "bg-gradient-to-r from-blue-400 to-blue-600",
                )}
                style={{ width: `${Math.min(guessProgress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
})
