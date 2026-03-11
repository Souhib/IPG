import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Trophy } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useGetLeaderboardApiV1StatsLeaderboardGet } from "@/api/generated"

interface LeaderboardEntry {
  user_id: string
  username: string
  total_games_played: number
  total_games_won: number
  win_rate: number
  current_win_streak: number
  longest_win_streak: number
}

type SortField = "total_games_won" | "win_rate" | "longest_win_streak"

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
})

function RankBadge({ index }: { index: number }) {
  if (index === 0) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-sm font-bold text-white shadow-md shadow-amber-500/30">
        1
      </span>
    )
  }
  if (index === 1) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-sm font-bold text-white shadow-md shadow-gray-400/30">
        2
      </span>
    )
  }
  if (index === 2) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-sm font-bold text-white shadow-md shadow-amber-700/30">
        3
      </span>
    )
  }
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center text-sm font-mono tabular-nums text-muted-foreground">
      #{index + 1}
    </span>
  )
}

function LeaderboardPage() {
  const { t } = useTranslation()
  const [sortField, setSortField] = useState<SortField>("total_games_won")

  const { data: entries = [] as LeaderboardEntry[], isLoading } = useGetLeaderboardApiV1StatsLeaderboardGet(
    { stat_field: sortField, limit: 50 },
  ) as { data: LeaderboardEntry[] | undefined; isLoading: boolean }

  const sortTabs: { field: SortField; label: string }[] = [
    { field: "total_games_won", label: t("leaderboard.wins") },
    { field: "win_rate", label: t("leaderboard.winRate") },
    { field: "longest_win_streak", label: t("leaderboard.streak") },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-10"
      >
        <div className="rounded-2xl bg-accent/10 p-3">
          <Trophy className="h-7 w-7 text-accent" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">{t("leaderboard.title")}</h1>
      </motion.div>

      {/* Sort Tabs */}
      <div className="flex gap-2 mb-6">
        {sortTabs.map((tab) => (
          <button
            key={tab.field}
            type="button"
            onClick={() => setSortField(tab.field)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              sortField === tab.field
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:-translate-y-0.5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glass rounded-2xl border border-border/30 overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 bg-muted/30">
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("leaderboard.rank")}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("leaderboard.player")}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("leaderboard.wins")}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("leaderboard.games")}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("leaderboard.winRate")}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("leaderboard.streak")}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-border/20">
                    <td colSpan={6} className="px-6 py-5">
                      <div className="h-4 rounded-full bg-muted animate-pulse" />
                    </td>
                  </tr>
                ))}
              </>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                  {t("leaderboard.noPlayers")}
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <motion.tr
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className={`border-b border-border/20 last:border-b-0 transition-all duration-200 ${
                    index < 3
                      ? "bg-gradient-to-r from-accent/5 to-transparent hover:from-accent/10"
                      : "hover:bg-muted/20"
                  }`}
                >
                  <td className="px-6 py-4">
                    <RankBadge index={index} />
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    <Link
                      to="/players/$userId"
                      params={{ userId: entry.user_id }}
                      className="hover:text-primary transition-colors duration-200"
                    >
                      {entry.username}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-mono tabular-nums">{entry.total_games_won}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono tabular-nums text-muted-foreground">{entry.total_games_played}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono tabular-nums">{entry.win_rate}%</td>
                  <td className="px-6 py-4 text-sm text-right font-mono tabular-nums">{entry.longest_win_streak}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
