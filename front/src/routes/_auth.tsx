import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { io, type Socket } from "socket.io-client"
import { toast } from "sonner"
import { getStoredToken } from "@/lib/auth"
import { useAuth } from "@/providers/AuthProvider"

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
})

function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const inviteSocketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/auth/login" })
    }
  }, [isAuthenticated, isLoading, navigate])

  // Personal Socket.IO connection for room invite notifications
  useEffect(() => {
    if (!user?.id) return

    const token = getStoredToken()
    if (!token) return

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    })

    socket.on("room_invite", (data: { room_id: string; public_id: string; password: string; invited_by: string }) => {
      toast(t("room.inviteReceived", { username: data.invited_by }), {
        action: {
          label: t("room.joinInvite"),
          onClick: () => {
            navigate({ to: "/rooms/$roomId", params: { roomId: data.room_id } })
          },
        },
        duration: 10000,
      })
    })

    inviteSocketRef.current = socket

    return () => {
      socket.disconnect()
      inviteSocketRef.current = null
    }
  }, [user?.id, navigate, t])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Branded loading spinner */}
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <span className="text-sm text-muted-foreground animate-pulse">{t("common.loading", "Loading...")}</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <Outlet />
}
