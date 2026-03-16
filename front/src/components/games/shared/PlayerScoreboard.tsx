import { Check, X } from "lucide-react"
import { memo } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface PlayerScore {
  user_id: string
  username: string
  total_score: number
  current_round_answered: boolean
  current_round_points: number
}

interface PlayerScoreboardProps {
  players: PlayerScore[]
  currentUserId?: string
}

export const PlayerScoreboard = memo(function PlayerScoreboard({ players, currentUserId }: PlayerScoreboardProps) {
  const { t } = useTranslation()
  const sorted = [...players].sort((a, b) => b.total_score - a.total_score)

  return (
    <div className="glass rounded-2xl border-border/30 p-5">
      <h3 className="text-sm font-extrabold tracking-tight mb-3">{t("room.players")}</h3>
      <div className="space-y-1.5">
        {sorted.map((player) => (
          <div
            key={player.user_id}
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-200",
              player.user_id === currentUserId ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30",
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-bold text-primary-foreground">
                {player.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{player.username}</span>
            </div>
            <div className="flex items-center gap-3">
              {player.current_round_answered ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground/40" />
              )}
              <span className="font-mono tabular-nums font-bold text-xs">{player.total_score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
