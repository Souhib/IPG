import { X } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useGetGameSummaryApiV1GamesGameIdSummaryGet } from "@/api/generated"
import { cn } from "@/lib/utils"

interface GameSummaryPlayer {
  user_id: string
  username: string
  role: string
  team?: string | null
}

interface GameSummary {
  id: string
  type: "undercover" | "codenames"
  start_time: string
  end_time: string | null
  number_of_players: number
  winner: string | null
  game_status: string | null
  players: GameSummaryPlayer[]
  vote_history?: { round: number; votes: { voter: string; target: string }[]; eliminated: { username: string; role: string } | null }[] | null
  clue_history?: { team: string; clue_word: string; clue_number: number; guesses: { word: string; correct: boolean }[] }[] | null
  word_explanations?: { civilian_word: string | null; undercover_word: string | null } | null
}

interface GameDetailModalProps {
  gameId: string
  gameType: "undercover" | "codenames"
  onClose: () => void
}

export function GameDetailModal({ gameId, gameType, onClose }: GameDetailModalProps) {
  const { t } = useTranslation()
  const { data: summary, isLoading } = useGetGameSummaryApiV1GamesGameIdSummaryGet(
    { game_id: gameId },
  ) as { data: GameSummary | undefined; isLoading: boolean }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl" onClick={onClose}>
      <div
        className="relative mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto glass rounded-2xl p-6 shadow-2xl shadow-black/10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-muted-foreground hover:text-foreground hover:bg-glow transition-all duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-5">{t("stats.gameDetail")}</h2>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">{t("common.loading")}</div>
        ) : !summary ? (
          <div className="py-8 text-center text-muted-foreground">{t("errors.loadFailed")}</div>
        ) : (
          <div className="space-y-5">
            {/* Game info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {gameType === "undercover" ? t("games.undercover.name") : t("games.codenames.name")}
              </span>
              {summary.winner && (
                <span className="rounded-xl bg-gradient-to-r from-primary/15 to-accent/10 px-3 py-1 text-xs font-bold text-primary">
                  {summary.winner}
                </span>
              )}
            </div>

            {/* Players */}
            <div>
              <h3 className="text-sm font-bold mb-2">{t("stats.playerRoles")}</h3>
              <div className="space-y-1.5">
                {summary.players.map((p) => (
                  <div
                    key={p.user_id}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm",
                      p.team === "red" ? "bg-red-50 dark:bg-red-950/20" :
                      p.team === "blue" ? "bg-blue-50 dark:bg-blue-950/20" :
                      "bg-muted/30",
                    )}
                  >
                    <span className="font-semibold">{p.username}</span>
                    <span className="text-xs text-muted-foreground capitalize">{p.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Word Explanations (Undercover) */}
            {summary.word_explanations && (
              <div>
                <h3 className="text-sm font-bold mb-2">{t("game.wordExplanations")}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {summary.word_explanations.civilian_word && (
                    <div className="rounded-xl bg-surface border border-border/30 p-3">
                      <p className="text-xs text-muted-foreground font-medium">{t("game.undercover.civilianWord")}</p>
                      <p className="font-bold text-sm mt-0.5">{summary.word_explanations.civilian_word}</p>
                    </div>
                  )}
                  {summary.word_explanations.undercover_word && (
                    <div className="rounded-xl bg-surface border border-border/30 p-3">
                      <p className="text-xs text-muted-foreground font-medium">{t("game.undercover.undercoverWord")}</p>
                      <p className="font-bold text-sm mt-0.5">{summary.word_explanations.undercover_word}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vote History (Undercover) */}
            {summary.vote_history && summary.vote_history.length > 0 && (
              <div>
                <h3 className="text-sm font-bold mb-2">{t("stats.voteHistory")}</h3>
                <div className="space-y-3">
                  {summary.vote_history.map((round) => (
                    <div key={round.round} className="rounded-xl border border-border/30 p-3.5">
                      <p className="text-xs font-bold text-muted-foreground mb-1.5">
                        {t("game.undercover.round", { number: round.round })}
                      </p>
                      <div className="space-y-1">
                        {round.votes.map((v, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{v.voter}</span> <span className="text-primary">&rarr;</span> <span className="font-semibold text-foreground">{v.target}</span>
                          </p>
                        ))}
                      </div>
                      {round.eliminated && (
                        <p className="mt-1.5 text-xs font-bold text-destructive">
                          {round.eliminated.username} ({round.eliminated.role})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clue History (Codenames) */}
            {summary.clue_history && summary.clue_history.length > 0 && (
              <div>
                <h3 className="text-sm font-bold mb-2">{t("stats.clueHistory")}</h3>
                <div className="space-y-2">
                  {summary.clue_history.map((clue, i) => (
                    <div key={i} className="rounded-xl border border-border/30 p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-xs font-bold",
                          clue.team === "red" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400",
                        )}>
                          {clue.team === "red" ? t("games.codenames.teams.red") : t("games.codenames.teams.blue")}
                        </span>
                        <span className="text-sm font-semibold">{clue.clue_word} <span className="font-mono text-muted-foreground">({clue.clue_number})</span></span>
                      </div>
                      {clue.guesses.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {clue.guesses.map((g, j) => (
                            <span
                              key={j}
                              className={cn(
                                "rounded-lg px-2 py-0.5 text-[10px] font-medium",
                                g.correct ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                              )}
                            >
                              {g.word}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duration */}
            {summary.start_time && summary.end_time && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
                {t("stats.duration")}: <span className="font-mono font-bold">{formatDuration(summary.start_time, summary.end_time)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}
