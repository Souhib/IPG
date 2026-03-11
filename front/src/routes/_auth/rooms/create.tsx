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
          <label className="block text-sm font-medium mb-3">{t("room.gameType")}</label>
          <div className="grid grid-cols-2 gap-4">
            {(["undercover", "codenames"] as const).map((type) => {
              const selected = gameType === type
              const config = {
                undercover: { icon: "🕵️", players: "3-12" },
                codenames: { icon: "🔤", players: "4-10" },
              }[type]
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGameType(type)}
                  className={`relative card-hover rounded-2xl border-2 p-6 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                    selected
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 ring-2 ring-primary/30 scale-[1.02]"
                      : "border-border/30 glass hover:border-primary/40 hover:shadow-lg opacity-70 hover:opacity-100"
                  }`}
                >
                  {selected && (
                    <div className="absolute top-2.5 right-2.5 size-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="size-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-3xl mb-3">{config.icon}</div>
                  <div className={`font-extrabold tracking-tight ${selected ? "text-primary" : ""}`}>{t(`games.${type}.name`)}</div>
                  <div className="mt-1.5 text-xs text-muted-foreground font-mono tabular-nums">{config.players} {t("room.players")}</div>
                </button>
              )
            })}
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
