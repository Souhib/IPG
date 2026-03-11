import { Shield } from "lucide-react"
import { memo, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { HintButton } from "@/components/games/shared/HintButton"
import { cn } from "@/lib/utils"

interface RoleRevealPhaseProps {
  myRole: string
  myWord?: string
  myWordHint?: string | null
  onHintViewed?: (word: string) => void
  onDismiss: () => void
}

const roleGlow: Record<string, string> = {
  civilian: "from-green-500/20 to-green-500/5 border-green-500/20",
  undercover: "from-red-500/20 to-red-500/5 border-red-500/20",
  mr_white: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
}

const roleBadgeColor: Record<string, string> = {
  civilian: "bg-green-500/10 text-green-600 dark:text-green-400",
  undercover: "bg-red-500/10 text-red-600 dark:text-red-400",
  mr_white: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

export const RoleRevealPhase = memo(function RoleRevealPhase({
  myRole,
  myWord,
  myWordHint,
  onHintViewed,
  onDismiss,
}: RoleRevealPhaseProps) {
  const { t } = useTranslation()

  const handleHintView = useCallback(() => {
    if (myWord && onHintViewed) onHintViewed(myWord)
  }, [myWord, onHintViewed])

  return (
    <div className={cn(
      "glass rounded-2xl p-8 text-center mb-8 bg-gradient-to-b border animate-scale-in",
      roleGlow[myRole] || roleGlow.civilian,
    )}>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Shield className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold mb-3">{t("game.yourRole")}</h2>
      <div className={cn(
        "inline-block rounded-2xl px-6 py-2.5 text-lg font-bold",
        roleBadgeColor[myRole] || roleBadgeColor.civilian,
      )}>
        {myRole === "civilian"
          ? t("games.undercover.roles.civilian")
          : myRole === "undercover"
            ? t("games.undercover.roles.undercover")
            : t("games.undercover.roles.mrWhite")}
      </div>
      {myWord && (
        <div className="mt-5">
          <p className="text-sm text-muted-foreground">{t("game.yourWord")}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <p className="text-3xl font-extrabold tracking-tight">{myWord}</p>
            <HintButton hint={myWordHint ?? null} onView={handleHintView} />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="mt-8 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-px transition-all duration-200"
      >
        {t("game.undercover.iUnderstand")}
      </button>
    </div>
  )
})
