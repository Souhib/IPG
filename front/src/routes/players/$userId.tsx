import { createFileRoute, Link } from "@tanstack/react-router"
import { Award, BarChart3, Gamepad2, Swords, UserPlus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/client"
import {
  useGetPublicProfileApiV1ProfilesUsersUserIdGet,
  useGetHeadToHeadApiV1StatsUsersUserIdVsOpponentIdGet,
  useSendFriendRequestApiV1FriendsRequestPost,
} from "@/api/generated"
import { useAuth } from "@/providers/AuthProvider"

interface PublicProfile {
  user_id: string
  username: string
  bio: string | null
  total_games_played: number
  total_games_won: number
  win_rate: number
  current_win_streak: number
}

export const Route = createFileRoute("/players/$userId")({
  component: PlayerProfilePage,
})

function PlayerProfilePage() {
  const { userId } = Route.useParams()
  const { t } = useTranslation()
  const { user } = useAuth()

  const isOwnProfile = user?.id === userId

  const { data: profile, isLoading, error: queryError } = useGetPublicProfileApiV1ProfilesUsersUserIdGet(
    { user_id: userId },
  ) as { data: PublicProfile | undefined; isLoading: boolean; error: Error | null }

  const error = queryError ? getApiErrorMessage(queryError, t("common.error")) : null

  const { data: h2h } = useGetHeadToHeadApiV1StatsUsersUserIdVsOpponentIdGet(
    { user_id: user?.id ?? "", opponent_id: userId },
    { query: { enabled: !!user?.id && !isOwnProfile } },
  ) as { data: { user_wins: number; opponent_wins: number; draws: number; total_games: number } | undefined }

  const sendRequestMutation = useSendFriendRequestApiV1FriendsRequestPost()
  const isSendingRequest = sendRequestMutation.isPending

  const handleAddFriend = async () => {
    if (isSendingRequest) return
    try {
      await sendRequestMutation.mutateAsync({ data: { addressee_id: userId } })
      toast.success(t("friends.requestSent"))
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="glass rounded-2xl border border-destructive/30 p-6 text-center text-destructive">
          {error ?? t("common.error")}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Profile Header */}
      <div className="glass rounded-2xl border border-border/30 p-8 mb-8 animate-scale-in">
        <div className="flex items-center gap-5">
          {/* Avatar with gradient ring */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-70 blur-sm" />
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-90" />
            <div className="relative flex h-18 w-18 items-center justify-center rounded-full bg-background text-2xl font-extrabold text-primary ring-2 ring-background">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text">{profile.username}</h1>
            {profile.bio && (
              <p className="mt-1.5 text-muted-foreground">{profile.bio}</p>
            )}
          </div>
          {!isOwnProfile && user && (
            <button
              type="button"
              onClick={handleAddFriend}
              disabled={isSendingRequest}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/90 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              {t("friends.addFriend")}
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { value: profile.total_games_played, label: t("stats.gamesPlayed"), delay: 0 },
          { value: profile.total_games_won, label: t("stats.gamesWon"), delay: 0.05 },
          { value: `${profile.win_rate}%`, label: t("stats.winRate"), delay: 0.1 },
          { value: profile.current_win_streak, label: t("stats.currentStreak"), delay: 0.15 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-2xl border border-border/30 p-5 text-center hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 animate-slide-up"
          >
            <p className="text-3xl font-extrabold tracking-tight font-mono tabular-nums gradient-text">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Head-to-Head */}
      {!isOwnProfile && h2h && h2h.total_games > 0 && (
        <div className="glass rounded-2xl border border-border/30 p-7 mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-2xl bg-primary/10 p-2.5">
              <Swords className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-extrabold tracking-tight text-lg">{t("stats.headToHead")}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="glass rounded-2xl border border-border/30 p-4">
              <p className="text-3xl font-extrabold font-mono tabular-nums text-primary">{h2h.user_wins}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{t("stats.yourWins")}</p>
            </div>
            <div className="glass rounded-2xl border border-border/30 p-4">
              <p className="text-3xl font-extrabold font-mono tabular-nums text-muted-foreground">{h2h.draws}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{t("stats.draws")}</p>
            </div>
            <div className="glass rounded-2xl border border-border/30 p-4">
              <p className="text-3xl font-extrabold font-mono tabular-nums text-destructive">{h2h.opponent_wins}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{t("stats.theirWins")}</p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground font-mono tabular-nums">
            {t("stats.totalGames", { count: h2h.total_games })}
          </p>
        </div>
      )}

      {/* Quick Links */}
      {isOwnProfile && (
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/stats"
            className="glass rounded-2xl border border-border/30 p-7 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="rounded-2xl bg-primary/10 p-3 w-fit mb-4 group-hover:bg-primary/15 transition-colors duration-200">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-extrabold tracking-tight">{t("stats.title")}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("profile.viewStats")}</p>
          </Link>

          <Link
            to="/achievements"
            className="glass rounded-2xl border border-border/30 p-7 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="rounded-2xl bg-accent/10 p-3 w-fit mb-4 group-hover:bg-accent/15 transition-colors duration-200">
              <Award className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-extrabold tracking-tight">{t("achievements.title")}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("profile.viewAchievements")}</p>
          </Link>

          <Link
            to="/rooms"
            className="glass rounded-2xl border border-border/30 p-7 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="rounded-2xl bg-primary/10 p-3 w-fit mb-4 group-hover:bg-primary/15 transition-colors duration-200">
              <Gamepad2 className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-extrabold tracking-tight">{t("nav.rooms")}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("profile.joinOrCreate")}</p>
          </Link>
        </div>
      )}
    </div>
  )
}
