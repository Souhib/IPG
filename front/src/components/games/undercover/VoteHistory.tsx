import { ChevronDown, ChevronUp } from "lucide-react"
import { memo, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface VoteEntry {
  voter: string
  voter_id: string
  target: string
  target_id: string
}

interface EliminatedInfo {
  username: string
  role: string
  user_id: string
}

interface VoteRound {
  round: number
  votes: VoteEntry[]
  eliminated: EliminatedInfo | null
}

interface VoteHistoryProps {
  history: VoteRound[]
}

const roleColors: Record<string, string> = {
  civilian: "text-green-600 dark:text-green-400",
  undercover: "text-red-600 dark:text-red-400",
  mr_white: "text-purple-600 dark:text-purple-400",
}

const roleBg: Record<string, string> = {
  civilian: "bg-green-500/5 border-green-500/20",
  undercover: "bg-red-500/5 border-red-500/20",
  mr_white: "bg-purple-500/5 border-purple-500/20",
}

export const VoteHistory = memo(function VoteHistory({ history }: VoteHistoryProps) {
  const { t } = useTranslation()
  const [expandedRound, setExpandedRound] = useState<number | null>(null)

  // Auto-expand the latest round when history changes
  useEffect(() => {
    if (history.length > 0) {
      setExpandedRound(history[history.length - 1].round)
    }
  }, [history.length])

  if (history.length === 0) return null

  return (
    <div className="glass rounded-2xl p-5 mb-6">
      <h3 className="font-bold mb-3">{t("game.undercover.voteHistory")}</h3>
      <div className="space-y-2">
        {history.map((round) => (
          <div key={round.round} className={cn(
            "rounded-xl border transition-all duration-200",
            expandedRound === round.round ? "bg-muted/30" : "bg-muted/10 hover:bg-muted/20",
          )}>
            <button
              type="button"
              onClick={() => setExpandedRound(expandedRound === round.round ? null : round.round)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold"
            >
              <span>{t("game.undercover.round", { number: round.round })}</span>
              <div className="flex items-center gap-2">
                {round.eliminated && (
                  <span className={cn("text-xs font-bold", roleColors[round.eliminated.role] || "text-muted-foreground")}>
                    {round.eliminated.username}
                  </span>
                )}
                {expandedRound === round.round ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
            {expandedRound === round.round && (
              <div className="px-4 pb-3.5 space-y-1.5">
                {round.votes.map((vote) => (
                  <div key={vote.voter_id} className="flex items-center text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{vote.voter}</span>
                    <span className="mx-1.5 text-primary">&rarr;</span>
                    <span className="font-semibold text-foreground">{vote.target}</span>
                  </div>
                ))}
                {round.eliminated && (
                  <div className={cn(
                    "text-xs font-bold mt-2.5 pt-2.5 border-t rounded-lg px-3 py-2",
                    roleBg[round.eliminated.role] || "",
                    roleColors[round.eliminated.role] || "text-muted-foreground",
                  )}>
                    {t("game.undercover.wasEliminated", {
                      username: round.eliminated.username,
                      role: round.eliminated.role,
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})
