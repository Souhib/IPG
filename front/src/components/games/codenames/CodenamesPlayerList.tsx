import { Users } from "lucide-react"
import { memo } from "react"
import { useTranslation } from "react-i18next"

interface CodenamesPlayer {
  user_id: string
  username: string
  team: string
  role: string
}

interface CodenamesPlayerListProps {
  players: CodenamesPlayer[]
}

export const CodenamesPlayerList = memo(function CodenamesPlayerList({ players }: CodenamesPlayerListProps) {
  const { t } = useTranslation()

  const redPlayers = players.filter((p) => p.team === "red")
  const bluePlayers = players.filter((p) => p.team === "blue")

  if (players.length === 0) return null

  return (
    <div className="mt-6 glass rounded-2xl border-border/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-extrabold tracking-tight text-sm">{t("game.codenames.players")}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TeamColumn
          players={redPlayers}
          team="red"
          label={t("games.codenames.teams.red")}
        />
        <TeamColumn
          players={bluePlayers}
          team="blue"
          label={t("games.codenames.teams.blue")}
        />
      </div>
    </div>
  )
})

const TeamColumn = memo(function TeamColumn({
  players,
  team,
  label,
}: {
  players: CodenamesPlayer[]
  team: "red" | "blue"
  label: string
}) {
  const { t } = useTranslation()

  const isRed = team === "red"

  return (
    <div className="relative">
      <div className={`absolute inset-y-0 left-0 w-1 rounded-full ${isRed ? "bg-red-500/70" : "bg-blue-500/70"}`} />
      <div className="pl-4">
        <h4 className={`text-xs font-extrabold tracking-tight mb-2 ${isRed ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
          {label}
        </h4>
        <div className="space-y-1.5">
          {players.map((p) => (
            <div
              key={p.user_id}
              className={`flex items-center justify-between rounded-2xl px-3 py-1.5 text-sm transition-all duration-200 ${
                isRed
                  ? "bg-red-50/80 dark:bg-red-950/30 border border-red-200/30 dark:border-red-800/20 hover:bg-red-100/80 dark:hover:bg-red-950/50"
                  : "bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/30 dark:border-blue-800/20 hover:bg-blue-100/80 dark:hover:bg-blue-950/50"
              }`}
            >
              <span className="font-medium">{p.username}</span>
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {p.role === "spymaster" ? t("games.codenames.roles.spymaster") : t("games.codenames.roles.operative")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
