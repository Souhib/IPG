import { AlertTriangle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"

interface GameErrorFallbackProps {
  error?: Error
  onReset?: () => void
}

export function GameErrorFallback({ error, onReset }: GameErrorFallbackProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="glass rounded-2xl p-8 text-center border-destructive/20 animate-scale-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive animate-float" />
        </div>
        <h2 className="text-xl font-bold text-destructive mb-2">{t("common.error")}</h2>
        {error && (
          <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-px transition-all duration-200"
            >
              {t("common.retry")}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate({ to: "/rooms" })}
            className="rounded-xl border border-border/50 px-5 py-2.5 text-sm font-medium hover:bg-glow transition-all duration-200"
          >
            {t("game.backToRoom")}
          </button>
        </div>
      </div>
    </div>
  )
}
