import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/providers/AuthProvider"
import apiClient from "@/api/client"

interface UserStatsData {
  total_games_played: number
  total_games_won: number
  total_games_lost: number
  undercover_games_played: number
  undercover_games_won: number
  codenames_games_played: number
  codenames_games_won: number
  times_civilian: number
  times_undercover: number
  times_mr_white: number
  civilian_wins: number
  undercover_wins: number
  mr_white_wins: number
  times_spymaster: number
  times_operative: number
  spymaster_wins: number
  operative_wins: number
  current_win_streak: number
  longest_win_streak: number
  rooms_created: number
  games_hosted: number
}

export const Route = createFileRoute("/_auth/stats")({
  component: StatsPage,
})

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function StatsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    apiClient({ method: "GET", url: `/api/v1/stats/users/${user.id}/stats` })
      .then((res) => setStats(res.data as UserStatsData))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user?.id])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  const winRate =
    stats && stats.total_games_played > 0
      ? `${Math.round((stats.total_games_won / stats.total_games_played) * 100)}%`
      : "0%"

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("stats.title")}</h1>

      {/* Overview */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
        <StatCard label={t("stats.gamesPlayed")} value={stats?.total_games_played ?? 0} />
        <StatCard label={t("stats.gamesWon")} value={stats?.total_games_won ?? 0} />
        <StatCard label={t("stats.winRate")} value={winRate} />
        <StatCard label={t("stats.currentStreak")} value={stats?.current_win_streak ?? 0} />
      </div>

      {/* Undercover */}
      <h2 className="text-xl font-semibold mb-4">{t("games.undercover.name")}</h2>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-8">
        <StatCard label={t("stats.gamesPlayed")} value={stats?.undercover_games_played ?? 0} />
        <StatCard label={t("stats.gamesWon")} value={stats?.undercover_games_won ?? 0} />
        <StatCard label={t("stats.longestStreak")} value={stats?.longest_win_streak ?? 0} />
      </div>

      {/* Codenames */}
      <h2 className="text-xl font-semibold mb-4">{t("games.codenames.name")}</h2>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-8">
        <StatCard label={t("stats.gamesPlayed")} value={stats?.codenames_games_played ?? 0} />
        <StatCard label={t("stats.gamesWon")} value={stats?.codenames_games_won ?? 0} />
        <StatCard label="Rooms Created" value={stats?.rooms_created ?? 0} />
      </div>
    </div>
  )
}
