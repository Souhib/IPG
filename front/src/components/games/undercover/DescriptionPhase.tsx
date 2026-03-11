import { Loader2, MessageCircle } from "lucide-react"
import { memo, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { HintButton } from "@/components/games/shared/HintButton"
import { cn } from "@/lib/utils"

interface DescriptionOrderEntry {
  user_id: string
  username: string
}

interface DescriptionPhaseProps {
  myRole?: string
  myWord?: string
  myWordHint?: string | null
  onHintViewed?: (word: string) => void
  descriptionOrder: DescriptionOrderEntry[]
  currentDescriberIndex: number
  descriptions: Record<string, string>
  currentUserId?: string
  isMyTurnToDescribe: boolean
  isAlive: boolean
  descriptionInput: string
  descriptionError: string
  isSubmittingDescription: boolean
  onDescriptionInputChange: (value: string) => void
  onSubmitDescription: () => void
}

export const DescriptionPhase = memo(function DescriptionPhase({
  myRole,
  myWord,
  myWordHint,
  onHintViewed,
  descriptionOrder,
  currentDescriberIndex,
  descriptions,
  currentUserId,
  isMyTurnToDescribe,
  isAlive,
  descriptionInput,
  descriptionError,
  isSubmittingDescription,
  onDescriptionInputChange,
  onSubmitDescription,
}: DescriptionPhaseProps) {
  const { t } = useTranslation()

  const handleHintView = useCallback(() => {
    if (myWord && onHintViewed) onHintViewed(myWord)
  }, [myWord, onHintViewed])

  const currentDescriber =
    descriptionOrder.length > 0 && currentDescriberIndex < descriptionOrder.length
      ? descriptionOrder[currentDescriberIndex]
      : null

  return (
    <div className="mb-8">
      {/* Role/Word reminder */}
      {myRole && myRole !== "mr_white" && myWord && (
        <div className="glass rounded-2xl border-primary/10 p-3.5 mb-4 text-center">
          <span className="text-sm text-muted-foreground">{t("game.undercover.yourWordReminder")}:</span>{" "}
          <span className="font-bold text-primary">{myWord}</span>
          <HintButton hint={myWordHint ?? null} onView={handleHintView} />
        </div>
      )}

      {/* Dynamic title based on who is describing */}
      {isMyTurnToDescribe ? (
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 mb-4 text-center animate-glow-pulse">
          <h2 className="text-xl font-bold text-primary">{t("game.undercover.yourTurnToDescribe")}</h2>
        </div>
      ) : currentDescriber ? (
        <div className="glass rounded-2xl p-4 mb-4 text-center">
          <h2 className="text-xl font-bold flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            {t("game.undercover.describingTitle", { username: currentDescriber.username })}
          </h2>
        </div>
      ) : (
        <h2 className="text-xl font-bold text-center mb-4">{t("game.undercover.describeYourWord")}</h2>
      )}

      {/* Description Order — horizontal stepper */}
      {descriptionOrder.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            {t("game.undercover.descriptionOrder")}
          </h3>
          <div className="space-y-1.5">
            {descriptionOrder.map((entry, idx) => {
              const hasDescribed = !!descriptions[entry.user_id]
              const isCurrent = idx === currentDescriberIndex && !hasDescribed
              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2 text-sm transition-all duration-200",
                    isCurrent && "bg-primary/10 border border-primary/20 shadow-sm",
                    hasDescribed && "opacity-50",
                  )}
                >
                  <span className={cn("font-medium", isCurrent && "text-primary")}>
                    {idx + 1}. {entry.username}
                    {entry.user_id === currentUserId && " (you)"}
                  </span>
                  {hasDescribed && (
                    <span className="text-xs glass rounded-xl px-2.5 py-1 font-medium">
                      {descriptions[entry.user_id]}
                    </span>
                  )}
                  {isCurrent && !hasDescribed && (
                    <span className="text-xs text-primary font-bold">
                      {entry.user_id === currentUserId ? t("game.undercover.yourTurn") : "..."}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Description Input (my turn) */}
      {isMyTurnToDescribe && isAlive && (
        <div className="glass rounded-2xl p-5 mb-4 border-primary/10">
          <label htmlFor="description-input" className="block text-sm font-bold mb-2.5">
            {t("game.undercover.describeYourWord")}
          </label>
          <div className="flex gap-2.5">
            <input
              id="description-input"
              type="text"
              value={descriptionInput}
              onChange={(e) => onDescriptionInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmitDescription()
              }}
              placeholder={t("game.undercover.describeYourWord")}
              maxLength={50}
              disabled={isSubmittingDescription}
              className="flex-1 rounded-xl border border-border/50 bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
            />
            <button
              type="button"
              onClick={onSubmitDescription}
              disabled={isSubmittingDescription || !descriptionInput.trim()}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-px disabled:opacity-50 transition-all duration-200"
            >
              {isSubmittingDescription ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("game.undercover.submitDescription")
              )}
            </button>
          </div>
          {descriptionError && (
            <p className="text-xs text-destructive mt-1.5">{descriptionError}</p>
          )}
        </div>
      )}

      {/* Waiting message (not my turn) */}
      {!isMyTurnToDescribe && currentDescriber && (
        <div className="glass rounded-2xl p-3.5 mb-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("game.undercover.waitingForDescription", { username: currentDescriber.username })}
          </p>
        </div>
      )}

      {/* All descriptions done but transition not yet visible */}
      {currentDescriberIndex >= descriptionOrder.length && descriptionOrder.length > 0 && (
        <div className="glass rounded-2xl p-3.5 mb-4 text-center">
          <Loader2 className="h-4 w-4 inline animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
        </div>
      )}
    </div>
  )
})
