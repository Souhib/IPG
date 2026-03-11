import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Check, Clock, Search, UserMinus, UserPlus, Users, X } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/client"
import {
  useGetFriendsApiV1FriendsGet,
  useGetPendingRequestsApiV1FriendsPendingGet,
  getFriendsApiV1FriendsGetQueryKey,
  getPendingRequestsApiV1FriendsPendingGetQueryKey,
  useAcceptFriendRequestApiV1FriendsFriendshipIdAcceptPost,
  useRejectFriendRequestApiV1FriendsFriendshipIdRejectPost,
  useRemoveFriendApiV1FriendsFriendshipIdDelete,
} from "@/api/generated"
import { useAuth } from "@/providers/AuthProvider"
import { cn } from "@/lib/utils"

interface FriendEntry {
  friendship_id: string
  user_id: string
  username: string
  status: string
}

type Tab = "friends" | "pending"

export const Route = createFileRoute("/_auth/friends")({
  component: FriendsPage,
})

function FriendsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>("friends")
  const [searchQuery, setSearchQuery] = useState("")

  const { data: friends = [] as FriendEntry[], isLoading: friendsLoading } = useGetFriendsApiV1FriendsGet(
    { query: { enabled: !!user } },
  ) as { data: FriendEntry[] | undefined; isLoading: boolean }

  const { data: pending = [] as FriendEntry[], isLoading: pendingLoading } = useGetPendingRequestsApiV1FriendsPendingGet(
    { query: { enabled: !!user } },
  ) as { data: FriendEntry[] | undefined; isLoading: boolean }

  const isLoading = friendsLoading || pendingLoading
  const queryClient = useQueryClient()

  const invalidateFriendQueries = () => {
    queryClient.invalidateQueries({ queryKey: getFriendsApiV1FriendsGetQueryKey() })
    queryClient.invalidateQueries({ queryKey: getPendingRequestsApiV1FriendsPendingGetQueryKey() })
  }

  const acceptMutation = useAcceptFriendRequestApiV1FriendsFriendshipIdAcceptPost({
    mutation: {
      onSuccess: () => { toast.success(t("friends.requestAccepted")); invalidateFriendQueries() },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    },
  })

  const rejectMutation = useRejectFriendRequestApiV1FriendsFriendshipIdRejectPost({
    mutation: {
      onSuccess: () => { toast.success(t("friends.requestRejected")); invalidateFriendQueries() },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    },
  })

  const removeMutation = useRemoveFriendApiV1FriendsFriendshipIdDelete({
    mutation: {
      onSuccess: () => { toast.success(t("friends.friendRemoved")); invalidateFriendQueries() },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    },
  })

  const handleAccept = (friendshipId: string) => {
    acceptMutation.mutate({ friendship_id: friendshipId })
  }

  const handleReject = (friendshipId: string) => {
    rejectMutation.mutate({ friendship_id: friendshipId })
  }

  const handleRemove = (friendshipId: string) => {
    removeMutation.mutate({ friendship_id: friendshipId })
  }

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-slide-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">{t("friends.title")}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("friends")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200",
            tab === "friends"
              ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20"
              : "glass text-muted-foreground hover:text-foreground",
          )}
        >
          <Users className="h-4 w-4" />
          {t("friends.myFriends")} ({friends.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("pending")}
          className={cn(
            "relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200",
            tab === "pending"
              ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20"
              : "glass text-muted-foreground hover:text-foreground",
          )}
        >
          <Clock className="h-4 w-4" />
          {t("friends.pendingRequests")}
          {pending.length > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {pending.length}
            </span>
          )}
        </button>
      </div>

      {tab === "friends" && (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("friends.searchPlaceholder")}
              className="w-full rounded-xl border border-border/30 bg-background py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            />
          </div>

          {/* Friends List */}
          <div className="glass rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
            ) : filteredFriends.length === 0 ? (
              <div className="p-8 text-center">
                <UserPlus className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? t("friends.noResults") : t("friends.noFriends")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {filteredFriends.map((friend) => (
                  <div key={friend.friendship_id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-all duration-200">
                    <Link
                      to="/players/$userId"
                      params={{ userId: friend.user_id }}
                      className="flex items-center gap-3 hover:opacity-80 transition-all duration-200"
                    >
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground shadow-sm">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                      </div>
                      <span className="font-medium">{friend.username}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(friend.friendship_id)}
                      className="rounded-xl p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                      aria-label={t("friends.removeFriend")}
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "pending" && (
        <div className="glass rounded-2xl overflow-hidden animate-scale-in">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
          ) : pending.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{t("friends.noPending")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {pending.map((request) => (
                <div key={request.friendship_id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-all duration-200">
                  <Link
                    to="/players/$userId"
                    params={{ userId: request.user_id }}
                    className="flex items-center gap-3 hover:opacity-80 transition-all duration-200"
                  >
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-primary/40 text-sm font-bold text-primary-foreground shadow-sm">
                        {request.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-yellow-500" />
                    </div>
                    <span className="font-medium">{request.username}</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(request.friendship_id)}
                      className="rounded-xl p-2 text-primary hover:bg-primary/10 bg-glow transition-all duration-200"
                      aria-label={t("friends.accept")}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(request.friendship_id)}
                      className="rounded-xl p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                      aria-label={t("friends.reject")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
