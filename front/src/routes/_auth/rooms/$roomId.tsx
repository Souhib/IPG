import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Copy, Crown, KeyRound, Users } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import apiClient from "@/api/client"
import { useSocket } from "@/hooks/use-socket"
import { useAuth } from "@/providers/AuthProvider"
import { cn } from "@/lib/utils"

interface RoomData {
  id: string
  public_id: string
  owner_id: string
  password: string
  users: { id: string; username: string }[]
}

interface Player {
  id: string
  username: string
  is_host: boolean
}

export const Route = createFileRoute("/_auth/rooms/$roomId")({
  component: RoomLobbyPage,
})

type GameType = "undercover" | "codenames"

function RoomLobbyPage() {
  const { roomId } = Route.useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { emit, on, isConnected } = useSocket()
  const [players, setPlayers] = useState<Player[]>([])
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState("")
  const [gameType, setGameType] = useState<GameType>("undercover")
  const joinedRef = useRef(false)
  const roleDataRef = useRef<{ role: string; word: string | null } | null>(null)

  const isHost = roomData?.owner_id === user?.id

  // Fetch room details via REST
  useEffect(() => {
    apiClient({ method: "GET", url: `/api/v1/rooms/${roomId}` })
      .then((res) => {
        const data = res.data as RoomData
        setRoomData(data)
        // Set initial players from REST data
        setPlayers(
          data.users.map((u) => ({
            id: u.id,
            username: u.username,
            is_host: u.id === data.owner_id,
          })),
        )
      })
      .catch(() => setError("Failed to load room details"))
      .finally(() => setIsLoading(false))
  }, [roomId])

  // Socket.IO join room
  useEffect(() => {
    if (!isConnected || !roomData || !user) return
    if (joinedRef.current) return
    joinedRef.current = true

    emit("join_room", {
      user_id: user.id,
      public_room_id: roomData.public_id,
      password: roomData.password,
    })

    return () => {
      joinedRef.current = false
    }
  }, [isConnected, roomData, user, emit])

  // Listen for socket events (separate effect to avoid re-subscribing on roomData change)
  useEffect(() => {
    if (!isConnected || !roomData) return

    // room_status: sent to the joining user with full room data
    const offStatus = on("room_status", (data: unknown) => {
      const payload = data as { data: { users: { id: string; username: string }[]; owner_id: string } }
      if (payload.data?.users) {
        setPlayers(
          payload.data.users.map((u) => ({
            id: u.id,
            username: u.username,
            is_host: u.id === payload.data.owner_id,
          })),
        )
      }
    })

    // new_user_joined: sent to room when another user joins
    const offNewUser = on("new_user_joined", (data: unknown) => {
      const payload = data as { data: { users: { id: string; username: string }[]; owner_id: string } }
      if (payload.data?.users) {
        setPlayers(
          payload.data.users.map((u) => ({
            id: u.id,
            username: u.username,
            is_host: u.id === payload.data.owner_id,
          })),
        )
      }
    })

    // user_left: sent to room when a user leaves
    const offUserLeft = on("user_left", (data: unknown) => {
      const payload = data as { data: { users: { id: string; username: string }[]; owner_id: string } }
      if (payload.data?.users) {
        setPlayers(
          payload.data.users.map((u) => ({
            id: u.id,
            username: u.username,
            is_host: u.id === payload.data.owner_id,
          })),
        )
      }
    })

    // role_assigned: capture undercover role data before game_started navigates away
    const offRoleAssigned = on("role_assigned", (data: unknown) => {
      roleDataRef.current = data as { role: string; word: string | null }
    })

    // game_started: undercover game started, navigate to game page with role data
    const offGameStarted = on("game_started", (data: unknown) => {
      const { game_id, game_type, players: playerNames, mayor } = data as {
        game_id: string; game_type: string; players: string[]; mayor: string
      }
      if (game_type === "undercover") {
        // Store role data in sessionStorage so the game page can read it on mount
        if (roleDataRef.current) {
          sessionStorage.setItem(
            `ibg-game-init-${game_id}`,
            JSON.stringify({ roleData: roleDataRef.current, players: playerNames, mayor }),
          )
        }
        navigate({ to: "/game/undercover/$gameId", params: { gameId: game_id } })
      }
    })

    // codenames_game_started: codenames game started, navigate to game page
    const offCodenamesStarted = on("codenames_game_started", (data: unknown) => {
      const { game_id } = data as { game_id: string }
      navigate({ to: "/game/codenames/$gameId", params: { gameId: game_id } })
    })

    // error: socket error events
    const offError = on("error", (data: unknown) => {
      const payload = data as { message: string }
      setError(payload.message || "Socket error")
    })

    return () => {
      offStatus()
      offNewUser()
      offUserLeft()
      offRoleAssigned()
      offGameStarted()
      offCodenamesStarted()
      offError()
    }
  }, [isConnected, roomData, on, navigate])

  const handleStartGame = () => {
    if (gameType === "codenames") {
      emit("start_codenames_game", { room_id: roomId, user_id: user?.id, word_pack_ids: null })
    } else {
      emit("start_undercover_game", { room_id: roomId, user_id: user?.id })
    }
  }

  const minPlayers = gameType === "codenames" ? 4 : 3

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(""), 1500)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  if (error && !roomData) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">{error}</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{t("room.lobby")}</h1>
      </div>

      {/* Room Info */}
      {roomData && (
        <div className="rounded-xl border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Room Code</span>
            <button
              type="button"
              onClick={() => copyToClipboard(roomData.public_id, "code")}
              className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 font-mono text-lg font-bold tracking-widest hover:bg-muted/80 transition-colors"
            >
              {roomData.public_id}
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
            {copied === "code" && <span className="text-xs text-primary">Copied!</span>}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Password</span>
            <button
              type="button"
              onClick={() => copyToClipboard(roomData.password, "password")}
              className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 font-mono text-lg font-bold tracking-widest hover:bg-muted/80 transition-colors"
            >
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              {roomData.password}
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
            {copied === "password" && <span className="text-xs text-primary">Copied!</span>}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">{error}</div>
      )}

      {/* Players */}
      <div className="rounded-xl border bg-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">
            {t("room.players")} ({players.length})
          </h2>
        </div>

        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("room.waitingForPlayers")}</p>
        ) : (
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5"
              >
                <span className="text-sm font-medium">{player.username}</span>
                {player.is_host && (
                  <span className="flex items-center gap-1 text-xs text-accent">
                    <Crown className="h-3 w-3" />
                    {t("room.host")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Game Type Selector + Start Button (host only) */}
      {isHost && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Game Type</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGameType("undercover")}
                className={cn(
                  "flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                  gameType === "undercover"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80",
                )}
              >
                Undercover
              </button>
              <button
                type="button"
                onClick={() => setGameType("codenames")}
                className={cn(
                  "flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                  gameType === "codenames"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80",
                )}
              >
                Codenames
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartGame}
            disabled={players.length < minPlayers}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {players.length < minPlayers
              ? t("room.minPlayers", { count: minPlayers })
              : t("room.startGame")}
          </button>
        </div>
      )}

      {!isConnected && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
          Connecting to server...
        </div>
      )}
    </div>
  )
}
