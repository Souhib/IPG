import { Clock, Timer, Trophy, Zap } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useGetDurationStatsApiV1StatsUsersUserIdDurationGet } from "@/api/generated"

interface DurationData {
  average_seconds: number
  fastest_seconds: number | null
  longest_seconds: number | null
  undercover_avg_seconds: number | null
  codenames_avg_seconds: number | null
  total_games_with_duration: number
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === 0) return "-"
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

export function DurationStats({ userId }: { userId: string }) {
  const { t } = useTranslation()
  const { data, isLoading } = useGetDurationStatsApiV1StatsUsersUserIdDurationGet(
    { user_id: userId },
  ) as { data: DurationData | undefined; isLoading: boolean }

  if (isLoading) return null
  if (!data || data.total_games_with_duration === 0) return null

  const stats = [
    { label: t("stats.avgDuration"), value: formatDuration(data.average_seconds), icon: Clock },
    { label: t("stats.fastestGame"), value: formatDuration(data.fastest_seconds), icon: Zap },
    { label: t("stats.longestGame"), value: formatDuration(data.longest_seconds), icon: Trophy },
    { label: t("stats.gamesTracked"), value: String(data.total_games_with_duration), icon: Timer },
  ]

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        {t("stats.gameDuration")}
      </h3>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-muted/30 border border-border/30 p-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </div>
            <p className="text-xl font-bold font-mono tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>
      {(data.undercover_avg_seconds || data.codenames_avg_seconds) && (
        <div className="grid gap-4 grid-cols-2 mt-4 pt-4 border-t border-border/30">
          {data.undercover_avg_seconds && (
            <div className="rounded-xl bg-muted/30 border border-border/30 p-3.5">
              <p className="text-xs text-muted-foreground font-medium">{t("games.undercover.name")}</p>
              <p className="text-lg font-bold font-mono tabular-nums mt-1">{formatDuration(data.undercover_avg_seconds)}</p>
            </div>
          )}
          {data.codenames_avg_seconds && (
            <div className="rounded-xl bg-muted/30 border border-border/30 p-3.5">
              <p className="text-xs text-muted-foreground font-medium">{t("games.codenames.name")}</p>
              <p className="text-lg font-bold font-mono tabular-nums mt-1">{formatDuration(data.codenames_avg_seconds)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
