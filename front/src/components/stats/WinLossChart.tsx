import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { useTranslation } from "react-i18next"
import { useGetGameHistoryApiV1StatsUsersUserIdHistoryGet } from "@/api/generated"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

interface DailyRecord {
  date: string
  wins: number
  losses: number
  total: number
}

export function WinLossChart({ userId }: { userId: string }) {
  const { t } = useTranslation()
  const { data = [] as DailyRecord[], isLoading } = useGetGameHistoryApiV1StatsUsersUserIdHistoryGet(
    { user_id: userId },
    { days: 30 },
  ) as { data: DailyRecord[] | undefined; isLoading: boolean }

  if (isLoading) return <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">{t("common.loading")}</div>
  if (data.length === 0) return null

  const chartData = {
    labels: data.map((d) => new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })),
    datasets: [
      {
        label: t("stats.won"),
        data: data.map((d) => d.wins),
        borderColor: "oklch(0.60 0.18 145)",
        backgroundColor: "oklch(0.60 0.18 145 / 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: t("stats.lost"),
        data: data.map((d) => d.losses),
        borderColor: "oklch(0.55 0.22 25)",
        backgroundColor: "oklch(0.55 0.22 25 / 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-4">{t("stats.winLossOverTime")}</h3>
      <div className="h-64">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } },
            },
            plugins: {
              legend: { position: "bottom" },
            },
          }}
        />
      </div>
    </div>
  )
}
