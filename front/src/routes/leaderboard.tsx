import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Trophy } from "lucide-react"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <Trophy className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold">{t("leaderboard.title")}</h1>
      </motion.div>

      {/* Leaderboard table - will be populated from API */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-xl border bg-card overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                {t("leaderboard.rank")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                {t("leaderboard.player")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                {t("leaderboard.wins")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                {t("leaderboard.games")}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                No players yet. Be the first to play!
              </td>
            </tr>
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
