import { createFileRoute } from "@tanstack/react-router"
import { Shield, Skull, ThumbsUp, User } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSocket } from "@/hooks/use-socket"
import { useAuth } from "@/providers/AuthProvider"
import { cn } from "@/lib/utils"

interface UndercoverPlayer {
  id: string
  username: string
  is_alive: boolean
  role?: string
  word?: string
  vote_count?: number
}

interface GameState {
  players: UndercoverPlayer[]
  phase: "role_reveal" | "discussion" | "voting" | "elimination" | "game_over"
  round: number
  my_role?: string
  my_word?: string
  eliminated_player?: UndercoverPlayer
  winner?: string
}

export const Route = createFileRoute("/_auth/game/undercover/$gameId")({
  component: UndercoverGamePage,
})

function UndercoverGamePage() {
  const { gameId } = Route.useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { emit, on, isConnected } = useSocket()

  const [gameState, setGameState] = useState<GameState>(() => {
    const initial: GameState = {
      players: [],
      phase: "role_reveal",
      round: 1,
    }
    // Read initial state passed from lobby via sessionStorage
    try {
      const stored = sessionStorage.getItem(`ibg-game-init-${gameId}`)
      if (stored) {
        sessionStorage.removeItem(`ibg-game-init-${gameId}`)
        const { roleData, players: playerNames } = JSON.parse(stored) as {
          roleData?: { role: string; word: string | null }
          players?: string[]
          mayor?: string
        }
        if (roleData) {
          initial.my_role = roleData.role
          initial.my_word = roleData.word || undefined
        }
        if (playerNames) {
          initial.players = playerNames.map((username) => ({
            id: username,
            username,
            is_alive: true,
          }))
        }
      }
    } catch {}
    return initial
  })
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    if (!isConnected) return

    const offRoleAssigned = on("role_assigned", (data: unknown) => {
      const roleData = data as { role: string; word: string | null }
      setGameState((prev) => ({
        ...prev,
        my_role: roleData.role,
        my_word: roleData.word || undefined,
        phase: "role_reveal",
      }))
    })

    const offVotingStarted = on("voting_started", () => {
      setGameState((prev) => ({ ...prev, phase: "voting" }))
      setSelectedVote(null)
      setHasVoted(false)
    })

    const offPlayerEliminated = on("player_eliminated", (data: unknown) => {
      const elimData = data as { player: UndercoverPlayer }
      setGameState((prev) => ({
        ...prev,
        phase: "elimination",
        eliminated_player: elimData.player,
        players: prev.players.map((p) =>
          p.id === elimData.player.id ? { ...p, is_alive: false } : p,
        ),
      }))
    })

    const offGameOver = on("game_over", (data: unknown) => {
      const gameOverData = data as { winner: string; players: UndercoverPlayer[] }
      setGameState((prev) => ({
        ...prev,
        phase: "game_over",
        winner: gameOverData.winner,
        players: gameOverData.players || prev.players,
      }))
    })

    const offGameState = on("game_state", (data: unknown) => {
      const state = data as Partial<GameState>
      setGameState((prev) => ({ ...prev, ...state }))
    })

    return () => {
      offRoleAssigned()
      offVotingStarted()
      offPlayerEliminated()
      offGameOver()
      offGameState()
    }
  }, [isConnected, on])

  const handleVote = useCallback(
    (playerId: string) => {
      if (hasVoted) return
      setSelectedVote(playerId)
      emit("vote", { game_id: gameId, voted_for: playerId })
      setHasVoted(true)
    },
    [hasVoted, emit, gameId],
  )

  const myPlayer = gameState.players.find((p) => p.id === user?.id)
  const isAlive = myPlayer?.is_alive !== false

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Game Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{t("games.undercover.name")}</h1>
        <p className="text-sm text-muted-foreground mt-1">Round {gameState.round}</p>
      </div>

      {/* Role Reveal */}
      {gameState.phase === "role_reveal" && gameState.my_role && (
        <div className="rounded-xl border bg-card p-8 text-center mb-8">
          <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
          <h2 className="text-xl font-bold mb-2">{t("game.yourRole")}</h2>
          <div className="inline-block rounded-full bg-primary/10 px-6 py-2 text-lg font-bold text-primary">
            {gameState.my_role === "civilian"
              ? t("games.undercover.roles.civilian")
              : gameState.my_role === "undercover"
                ? t("games.undercover.roles.undercover")
                : t("games.undercover.roles.mrWhite")}
          </div>
          {gameState.my_word && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{t("game.yourWord")}</p>
              <p className="text-2xl font-bold mt-1">{gameState.my_word}</p>
            </div>
          )}
        </div>
      )}

      {/* Voting Phase */}
      {gameState.phase === "voting" && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-center mb-4">{t("game.vote")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {gameState.players
              .filter((p) => p.is_alive && p.id !== user?.id)
              .map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleVote(player.id)}
                  disabled={hasVoted || !isAlive}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-4 transition-colors",
                    selectedVote === player.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50",
                    (hasVoted || !isAlive) && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{player.username}</div>
                    {selectedVote === player.id && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <ThumbsUp className="h-3 w-3" />
                        Voted
                      </div>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Elimination */}
      {gameState.phase === "elimination" && gameState.eliminated_player && (
        <div className="rounded-xl border bg-card p-8 text-center mb-8">
          <Skull className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold">{t("game.eliminated")}</h2>
          <p className="text-lg mt-2">{gameState.eliminated_player.username}</p>
          {gameState.eliminated_player.role && (
            <p className="text-sm text-muted-foreground mt-1">
              Role: {gameState.eliminated_player.role}
            </p>
          )}
        </div>
      )}

      {/* Game Over */}
      {gameState.phase === "game_over" && (
        <div className="rounded-xl border bg-card p-8 text-center mb-8">
          <h2 className="text-3xl font-bold">{t("game.gameOver")}</h2>
          <p className="text-xl mt-4">
            {t("game.winner")}: {gameState.winner}
          </p>
        </div>
      )}

      {/* Player List */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-3">
          {t("room.players")} ({gameState.players.filter((p) => p.is_alive).length}/
          {gameState.players.length})
        </h3>
        <div className="space-y-2">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-2",
                player.is_alive ? "bg-muted/50" : "bg-destructive/5 line-through opacity-50",
              )}
            >
              <span className="text-sm">{player.username}</span>
              <span className="text-xs text-muted-foreground">
                {player.is_alive ? t("game.alive") : t("game.eliminated")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
