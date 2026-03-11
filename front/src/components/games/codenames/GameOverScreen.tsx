import { BookOpen, LogOut, RotateCcw } from "lucide-react"
import { memo, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/client"
import { useRematchApiV1RoomsRoomIdRematchPost } from "@/api/generated"
import { cn } from "@/lib/utils"

interface CodenamesCard {
  word: string
  card_type: "red" | "blue" | "neutral" | "assassin" | null
  revealed: boolean
  hint?: string | null
}

interface GameOverScreenProps {
  winner: "red" | "blue"
  roomId: string | null
  board?: CodenamesCard[]
  onBackToRoom: () => void
  onLeaveRoom: () => void
}

export const GameOverScreen = memo(function GameOverScreen({
  winner,
  roomId,
  board,
  onBackToRoom,
  onLeaveRoom,
}: GameOverScreenProps) {
  const { t } = useTranslation()
  const rematchMutation = useRematchApiV1RoomsRoomIdRematchPost()
  const isRematchLoading = rematchMutation.isPending

  const handlePlayAgain = useCallback(async () => {
    if (!roomId || isRematchLoading) return
    try {
      await rematchMutation.mutateAsync({ room_id: roomId })
      onBackToRoom()
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to start rematch"))
    }
  }, [roomId, isRematchLoading, onBackToRoom, rematchMutation])

  return (
    <div className="glass rounded-2xl p-8 text-center mt-6 animate-scale-in">
      {/* Winner banner */}
      <h2 className="text-4xl font-extrabold tracking-tight">{t("game.gameOver")}</h2>
      <div className={cn(
        "inline-block mt-4 rounded-2xl px-6 py-2.5",
        winner === "red"
          ? "bg-gradient-to-r from-red-500/20 to-red-500/10"
          : "bg-gradient-to-r from-blue-500/20 to-blue-500/10",
      )}>
        <p
          className={cn(
            "text-xl font-bold",
            winner === "red" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400",
          )}
        >
          {winner === "red"
            ? t("games.codenames.teams.red")
            : t("games.codenames.teams.blue")}{" "}
          {t("game.codenames.wins")}
        </p>
      </div>

      {/* Word Explanations */}
      {board && board.some((c) => c.hint) && (
        <div className="mt-6 rounded-2xl border border-border/30 bg-muted/20 p-5 text-left max-h-56 overflow-y-auto">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            {t("game.wordExplanations")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {board.filter((c) => c.hint).map((card) => (
              <div key={card.word} className="rounded-xl bg-surface px-3 py-2.5 border border-border/30">
                <p className="text-sm font-bold">{card.word}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-3">
        {roomId && (
          <button
            type="button"
            onClick={handlePlayAgain}
            disabled={isRematchLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-px disabled:opacity-50 transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4" />
            {isRematchLoading ? t("common.loading") : t("game.playAgain")}
          </button>
        )}
        <button
          type="button"
          onClick={onLeaveRoom}
          className="inline-flex items-center gap-2 rounded-xl border border-border/50 px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-glow transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          {t("room.leave")}
        </button>
      </div>
    </div>
  )
})
