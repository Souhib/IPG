import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/_auth/rooms/")({
  component: RoomsPage,
})

function RoomsPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t("nav.rooms")}</h1>
        <Link
          to="/rooms/create"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t("room.create")}
        </Link>
      </div>

      {/* Room list will be populated via Socket.IO / API */}
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-muted-foreground">{t("room.waitingForPlayers")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a room or join an existing one to start playing!
        </p>
      </div>
    </div>
  )
}
