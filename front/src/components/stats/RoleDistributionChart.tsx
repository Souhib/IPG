import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { useTranslation } from "react-i18next"

ChartJS.register(ArcElement, Tooltip, Legend)

interface RoleDistributionProps {
  timesCivilian: number
  timesUndercover: number
  timesMrWhite: number
  timesSpymaster: number
  timesOperative: number
}

export function RoleDistributionChart({
  timesCivilian,
  timesUndercover,
  timesMrWhite,
  timesSpymaster,
  timesOperative,
}: RoleDistributionProps) {
  const { t } = useTranslation()

  const total = timesCivilian + timesUndercover + timesMrWhite + timesSpymaster + timesOperative
  if (total === 0) return null

  const data = {
    labels: [
      t("games.undercover.roles.civilian"),
      t("games.undercover.roles.undercover"),
      t("games.undercover.roles.mrWhite"),
      t("games.codenames.roles.spymaster"),
      t("games.codenames.roles.operative"),
    ],
    datasets: [
      {
        data: [timesCivilian, timesUndercover, timesMrWhite, timesSpymaster, timesOperative],
        backgroundColor: [
          "oklch(0.60 0.18 145)",
          "oklch(0.55 0.22 25)",
          "oklch(0.58 0.16 280)",
          "oklch(0.55 0.12 240)",
          "oklch(0.78 0.15 75)",
        ],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-4">{t("stats.roleDistribution")}</h3>
      <div className="h-64 flex items-center justify-center">
        <Doughnut
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
              legend: { position: "bottom" },
            },
          }}
        />
      </div>
    </div>
  )
}
