import { LogOut } from "lucide-react"
import { memo } from "react"
import { useTranslation } from "react-i18next"

interface UndercoverLeaveButtonProps {
  onLeave: () => void
}

export const UndercoverLeaveButton = memo(function UndercoverLeaveButton({
  onLeave,
}: UndercoverLeaveButtonProps) {
  const { t } = useTranslation()

  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={onLeave}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-all duration-200 rounded-2xl px-4 py-2 hover:bg-destructive/5"
      >
        <LogOut className="h-4 w-4" />
        {t("game.undercover.leaveGame")}
      </button>
    </div>
  )
})
