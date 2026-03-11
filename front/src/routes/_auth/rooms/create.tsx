import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/client"
import { useCreateRoomApiV1RoomsPost } from "@/api/generated"

export const Route = createFileRoute("/_auth/rooms/create")({
  component: CreateRoomPage,
})

function CreateRoomPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [gameType, setGameType] = useState<"undercover" | "codenames">("undercover")
  const [error, setError] = useState("")

  const createMutation = useCreateRoomApiV1RoomsPost({
    mutation: {
      onSuccess: (data) => {
        const room = data as { id: string }
        toast.success(t("toast.roomCreated"))
        navigate({ to: "/rooms/$roomId", params: { roomId: room.id } })
      },
      onError: (err) => setError(getApiErrorMessage(err)),
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    createMutation.mutate({ data: { game_type: gameType } })
  }

  const isLoading = createMutation.isPending

  return (
    <div className="mx-auto max-w-md px-4 py-8 animate-slide-up">
      <h1 className="text-3xl font-extrabold tracking-tight gradient-text mb-8">{t("room.create")}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive animate-scale-in">{error}</div>
        )}

        {/* Game Type */}
        <div>
          <label className="block text-sm font-medium mb-3">Game Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setGameType("undercover")}
              className={`card-hover rounded-2xl border-2 p-6 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                gameType === "undercover"
                  ? "border-primary glass shadow-md shadow-primary/15"
                  : "border-border/30 glass hover:border-primary/40 hover:shadow-lg"
              }`}
            >
              <div className="text-3xl mb-3">🕵️</div>
              <div className="font-extrabold tracking-tight">{t("games.undercover.name")}</div>
              <div className="mt-1.5 text-xs text-muted-foreground font-mono tabular-nums">3-12 players</div>
            </button>
            <button
              type="button"
              onClick={() => setGameType("codenames")}
              className={`card-hover rounded-2xl border-2 p-6 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                gameType === "codenames"
                  ? "border-primary glass shadow-md shadow-primary/15"
                  : "border-border/30 glass hover:border-primary/40 hover:shadow-lg"
              }`}
            >
              <div className="text-3xl mb-3">🔤</div>
              <div className="font-extrabold tracking-tight">{t("games.codenames.name")}</div>
              <div className="mt-1.5 text-xs text-muted-foreground font-mono tabular-nums">4-10 players</div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 py-3 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-50 transition-all duration-200"
        >
          {isLoading ? t("common.loading") : t("room.create")}
        </button>
      </form>
    </div>
  )
}
