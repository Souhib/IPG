import { Crown } from "lucide-react"
import { memo } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface Player {
  id: string
  username: string
  is_alive: boolean
  is_mayor?: boolean
}

interface UndercoverPlayerListProps {
  players: Player[]
}

export const UndercoverPlayerList = memo(function UndercoverPlayerList({
  players,
}: UndercoverPlayerListProps) {
  const { t } = useTranslation()
  const aliveCount = players.filter((p) => p.is_alive).length

  return (
    <div className="glass rounded-2xl border-border/30 p-6 transition-all duration-200">
      <h3 className="font-extrabold tracking-tight mb-4">
        {t("room.players")} ({aliveCount}/{players.length})
      </h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center justify-between rounded-2xl px-4 py-2.5 border transition-all duration-200",
              player.is_alive
                ? "glass border-border/30 hover:border-border/50"
                : "bg-destructive/5 border-destructive/10 line-through opacity-50",
            )}
          >
            <span className="text-sm flex items-center gap-2 font-medium">
              {player.username}
              {player.is_mayor && <Crown className="h-3 w-3 text-yellow-500 drop-shadow-sm" />}
            </span>
            <span className="text-xs text-muted-foreground font-mono tabular-nums">
              {player.is_alive ? t("game.alive") : t("game.eliminated")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
