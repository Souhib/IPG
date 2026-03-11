import { memo } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface CluePanelProps {
  clueWord: string
  clueNumber: number
  isSubmitting: boolean
  onClueWordChange: (value: string) => void
  onClueNumberChange: (value: number) => void
  onSubmit: () => void
}

export const CluePanel = memo(function CluePanel({
  clueWord,
  clueNumber,
  isSubmitting,
  onClueWordChange,
  onClueNumberChange,
  onSubmit,
}: CluePanelProps) {
  const { t } = useTranslation()

  return (
    <div className="glass rounded-2xl p-5 mb-4 border-primary/10">
      <h3 className="font-bold mb-1.5">{t("game.codenames.giveClue")}</h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t("game.codenames.guessesRemaining", { made: 0, max: clueNumber + 1 })}
      </p>
      <div className="flex gap-3">
        <input
          type="text"
          value={clueWord}
          onChange={(e) => onClueWordChange(e.target.value)}
          placeholder={t("game.codenames.cluePlaceholder")}
          className="flex-1 rounded-xl border border-border/50 bg-background/80 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
        />
        <input
          type="number"
          value={clueNumber}
          onChange={(e) => onClueNumberChange(parseInt(e.target.value) || 1)}
          min={1}
          max={9}
          className="w-16 rounded-xl border border-border/50 bg-background/80 px-3 py-2.5 text-sm font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-px transition-all duration-200",
            isSubmitting && "opacity-50 cursor-not-allowed",
          )}
        >
          {isSubmitting ? t("game.codenames.sending") : t("common.submit")}
        </button>
      </div>
    </div>
  )
})
