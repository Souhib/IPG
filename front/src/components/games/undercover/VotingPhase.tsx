import { Check, Crown, MessageCircle, Skull, ThumbsUp, User } from "lucide-react"
import { memo, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { HintButton } from "@/components/games/shared/HintButton"
import { cn } from "@/lib/utils"

interface DescriptionOrderEntry {
  user_id: string
  username: string
}

interface UndercoverPlayer {
  id: string
  username: string
  is_alive: boolean
  is_mayor?: boolean
}

interface VotingPhaseProps {
  players: UndercoverPlayer[]
  myRole?: string
  myWord?: string
  myWordHint?: string | null
  onHintViewed?: (word: string) => void
  descriptions: Record<string, string>
  descriptionOrder: DescriptionOrderEntry[]
  isAlive: boolean
  hasVoted: boolean
  selectedVote: string | null
  votedPlayers: string[]
  currentUserId?: string
  onSelectPlayer: (playerId: string) => void
  onConfirmVote: () => void
}

export const VotingPhase = memo(function VotingPhase({
  players,
  myRole,
  myWord,
  myWordHint,
  onHintViewed,
  descriptions,
  descriptionOrder,
  isAlive,
  hasVoted,
  selectedVote,
  votedPlayers,
  currentUserId,
  onSelectPlayer,
  onConfirmVote,
}: VotingPhaseProps) {
  const { t } = useTranslation()

  const handleHintView = useCallback(() => {
    if (myWord && onHintViewed) onHintViewed(myWord)
  }, [myWord, onHintViewed])

  const alivePlayers = useMemo(
    () => players.filter((p) => p.is_alive),
    [players],
  )
  const totalVoters = alivePlayers.length
  const currentVotes = votedPlayers.length

  // Build list of who has voted (by username)
  const votedPlayerNames = useMemo(() => {
    return alivePlayers
      .filter((p) => votedPlayers.includes(p.id))
      .map((p) => ({
        id: p.id,
        username: p.id === currentUserId ? t("game.undercover.youHaveVoted") : t("game.undercover.playerHasVoted", { username: p.username }),
      }))
  }, [alivePlayers, votedPlayers, currentUserId, t])

  return (
    <div className="mb-8">
      {/* Role/Word reminder */}
      {myRole && myRole !== "mr_white" && myWord && (
        <div className="glass rounded-2xl border-primary/10 p-3.5 mb-4 text-center">
          <span className="text-sm text-muted-foreground">{t("game.undercover.yourWordReminder")}:</span>{" "}
          <span className="font-bold text-primary">{myWord}</span>
          <HintButton hint={myWordHint ?? null} onView={handleHintView} />
        </div>
      )}

      {/* Show descriptions from the describing phase */}
      {Object.keys(descriptions).length > 0 && (
        <div className="glass rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            {t("game.undercover.descriptionOrder")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {descriptionOrder.map((entry) => {
              const word = descriptions[entry.user_id]
              if (!word) return null
              return (
                <div key={entry.user_id} className="rounded-xl bg-muted/50 border border-border/30 px-3.5 py-2 text-sm">
                  <span className="font-medium text-muted-foreground">{entry.username}:</span>{" "}
                  <span className="text-primary font-bold">{word}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!isAlive && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-3.5 mb-4 text-center">
          <Skull className="h-5 w-5 inline mr-2 text-destructive" />
          <span className="text-sm font-bold text-destructive">{t("game.undercover.youAreDead")}</span>
        </div>
      )}

      <h2 className="text-xl font-extrabold tracking-tight text-center mb-2">{t("game.undercover.discussAndVote")}</h2>
      <p className="text-sm text-muted-foreground text-center mb-5">{t("game.undercover.selectPlayerToVote")}</p>

      {/* Vote Progress */}
      <div className="glass rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-bold">{t("game.undercover.voteProgress", { current: currentVotes, total: totalVoters })}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 mb-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500"
            style={{ width: `${totalVoters > 0 ? (currentVotes / totalVoters) * 100 : 0}%` }}
          />
        </div>
        {votedPlayerNames.length > 0 && (
          <div className="space-y-1.5">
            {votedPlayerNames.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span>{entry.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* After voting: just show waiting message */}
      {hasVoted && (
        <div className="glass rounded-2xl border-primary/10 p-4 mb-4 text-center animate-scale-in">
          <Check className="h-5 w-5 inline mr-2 text-primary" />
          <span className="text-sm font-bold text-primary">{t("game.undercover.youHaveVoted")}</span>
          <p className="text-xs text-muted-foreground mt-1">{t("game.undercover.waitingForVotes")}</p>
        </div>
      )}

      {/* Player grid */}
      {isAlive && !hasVoted && (
        <div className="grid gap-3 sm:grid-cols-2">
          {players
            .filter((p) => p.is_alive && p.id !== currentUserId)
            .map((player) => {
              return (
                <button
                  key={player.id}
                  type="button"
                  aria-pressed={selectedVote === player.id}
                  aria-label={t("game.undercover.voteFor", { username: player.username, defaultValue: `Vote for ${player.username}` })}
                  onClick={() => onSelectPlayer(player.id)}
                  className={cn(
                    "flex items-center gap-3 glass rounded-2xl p-4 transition-all duration-200",
                    selectedVote === player.id
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-lg shadow-primary/10 -translate-y-0.5"
                      : "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
                  )}
                >
                  <div className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                    selectedVote === player.id
                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                      : "bg-muted",
                  )}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {player.username}
                      {player.is_mayor && (
                        <Crown className="h-3.5 w-3.5 text-yellow-500" />
                      )}
                    </div>
                    {selectedVote === player.id && (
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <ThumbsUp className="h-3 w-3" />
                        {t("game.undercover.selected")}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
        </div>
      )}

      {/* Vote Confirmation Button */}
      {isAlive && !hasVoted && (
        <button
          type="button"
          onClick={onConfirmVote}
          disabled={!selectedVote}
          className={cn(
            "mt-5 w-full rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200",
            selectedVote
              ? "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-md shadow-destructive/20 hover:shadow-lg hover:-translate-y-px"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {t("game.undercover.voteToEliminate")}
        </button>
      )}
    </div>
  )
})
