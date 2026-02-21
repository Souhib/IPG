import { createFileRoute, Link } from "@tanstack/react-router"
import { Award, BarChart3, Gamepad2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/providers/AuthProvider"

export const Route = createFileRoute("/_auth/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* User Info */}
      <div className="rounded-xl border bg-card p-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/stats"
          className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
        >
          <BarChart3 className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold">{t("stats.title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">View your game statistics</p>
        </Link>

        <Link
          to="/achievements"
          className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
        >
          <Award className="h-8 w-8 text-accent mb-3" />
          <h3 className="font-semibold">{t("achievements.title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">View your earned badges</p>
        </Link>

        <Link
          to="/rooms"
          className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
        >
          <Gamepad2 className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold">{t("nav.rooms")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">Join or create a game room</p>
        </Link>
      </div>
    </div>
  )
}
