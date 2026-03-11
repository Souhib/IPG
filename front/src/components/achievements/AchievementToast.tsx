import { motion } from "motion/react"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

interface UnlockedAchievement {
  code: string
  name: string
  icon: string
  tier: number
}

interface AchievementNotification {
  user_id: string
  achievements: UnlockedAchievement[]
}

const TIER_COLORS: Record<number, string> = {
  1: "text-amber-700",
  2: "text-gray-400",
  3: "text-yellow-500",
  4: "text-emerald-500",
  5: "text-purple-500",
  6: "text-red-500",
}

const TIER_GLOW: Record<number, string> = {
  1: "shadow-amber-700/20",
  2: "shadow-gray-400/20",
  3: "shadow-yellow-500/20",
  4: "shadow-emerald-500/20",
  5: "shadow-purple-500/20",
  6: "shadow-red-500/20",
}

function AchievementToastContent({ achievement }: { achievement: UnlockedAchievement }) {
  const { t } = useTranslation()
  const color = TIER_COLORS[achievement.tier] ?? "text-primary"
  const glow = TIER_GLOW[achievement.tier] ?? "shadow-primary/20"

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-3 rounded-2xl`}
    >
      <div className={`text-2xl ${color} ${glow} shadow-lg rounded-xl p-1.5`}>
        {achievement.icon}
      </div>
      <div>
        <p className="font-bold text-sm">{t("achievements.unlocked")}!</p>
        <p className="text-xs text-muted-foreground">{achievement.name}</p>
      </div>
    </motion.div>
  )
}

export function useAchievementNotifications(
  notifications: AchievementNotification[] | undefined,
  currentUserId: string | undefined,
) {
  const shownRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!notifications || !currentUserId) return

    for (const notification of notifications) {
      if (notification.user_id !== currentUserId) continue
      for (const achievement of notification.achievements) {
        const key = `${achievement.code}`
        if (shownRef.current.has(key)) continue
        shownRef.current.add(key)
        toast.custom(() => <AchievementToastContent achievement={achievement} />, {
          duration: 5000,
        })
      }
    }
  }, [notifications, currentUserId])
}
