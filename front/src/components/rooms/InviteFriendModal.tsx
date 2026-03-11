import { Loader2, Send, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/client"
import {
  useGetFriendsApiV1FriendsGet,
  useInviteFriendToRoomApiV1RoomsRoomIdInvitePost,
} from "@/api/generated"

interface FriendEntry {
  friendship_id: string
  user_id: string
  username: string
  status: string
}

interface InviteFriendModalProps {
  roomId: string
  onClose: () => void
}

export function InviteFriendModal({ roomId, onClose }: InviteFriendModalProps) {
  const { t } = useTranslation()
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set())

  const { data: friends = [] as FriendEntry[], isLoading } = useGetFriendsApiV1FriendsGet() as { data: FriendEntry[] | undefined; isLoading: boolean }
  const inviteMutation = useInviteFriendToRoomApiV1RoomsRoomIdInvitePost()
  const [invitingId, setInvitingId] = useState<string | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const handleInvite = async (friendUserId: string) => {
    setInvitingId(friendUserId)
    try {
      await inviteMutation.mutateAsync({ room_id: roomId, data: { friend_user_id: friendUserId } })
      setInvitedIds((prev) => new Set(prev).add(friendUserId))
      toast.success(t("room.inviteSent"))
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to invite friend"))
    } finally {
      setInvitingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl" onClick={onClose}>
      <div
        className="relative mx-4 max-h-[70vh] w-full max-w-sm overflow-y-auto glass rounded-2xl p-6 shadow-2xl shadow-black/10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-muted-foreground hover:text-foreground hover:bg-glow transition-all duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold mb-5">{t("room.inviteFriend")}</h2>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">{t("common.loading")}</div>
        ) : friends.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">{t("friends.noFriends")}</div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => {
              const isInvited = invitedIds.has(friend.user_id)
              const isInviting = invitingId === friend.user_id
              return (
                <div
                  key={friend.friendship_id}
                  className="flex items-center justify-between rounded-xl bg-muted/30 border border-border/30 px-3.5 py-3 hover:bg-muted/50 transition-all duration-150"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 text-xs font-bold text-primary">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold">{friend.username}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInvite(friend.user_id)}
                    disabled={isInvited || isInviting}
                    className="rounded-xl px-3 py-1.5 text-xs font-medium text-primary hover:bg-glow disabled:opacity-50 transition-all duration-200"
                  >
                    {isInviting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isInvited ? (
                      "Sent"
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
