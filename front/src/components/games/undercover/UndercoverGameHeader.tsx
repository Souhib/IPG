import { Eye } from "lucide-react"
import { memo } from "react"
import { useTranslation } from "react-i18next"

interface UndercoverGameHeaderProps {
  round: number
  isSpectator: boolean
}

export const UndercoverGameHeader = memo(function UndercoverGameHeader({
  round,
  isSpectator,
}: UndercoverGameHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-extrabold tracking-tight gradient-text">{t("games.undercover.name")}</h1>
      <p className="text-sm text-muted-foreground mt-2 font-mono tabular-nums">Round {round}</p>
      {isSpectator && (
        <div className="mt-3 glass inline-flex items-center gap-1.5 rounded-full border-border/30 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200">
          <Eye className="h-3 w-3" />
          {t("game.spectating")}
        </div>
      )}
    </div>
  )
})
