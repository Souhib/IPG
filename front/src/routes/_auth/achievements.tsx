import { createFileRoute } from "@tanstack/react-router"
import { Award, Lock } from "lucide-react"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/_auth/achievements")({
  component: AchievementsPage,
})

function AchievementsPage() {
  const { t } = useTranslation()

  // Placeholder - will be populated from API
  const achievements = [
    { name: "First Steps", description: "Play your first game", icon: "star", unlocked: false },
    { name: "Taste of Victory", description: "Win your first game", icon: "trophy", unlocked: false },
    { name: "Hat Trick", description: "Win 3 games in a row", icon: "fire", unlocked: false },
    { name: "Good Citizen", description: "Win 5 games as Civilian", icon: "shield", unlocked: false },
    { name: "Sneaky", description: "Win 3 games as Undercover", icon: "mask", unlocked: false },
    { name: "White Out", description: "Win as Mr. White", icon: "ghost", unlocked: false },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("achievements.title")}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.name}
            className={`rounded-xl border p-6 ${
              achievement.unlocked
                ? "bg-card border-primary/30"
                : "bg-muted/30 border-border opacity-60"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  achievement.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {achievement.unlocked ? (
                  <Award className="h-5 w-5" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{achievement.name}</h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
