import { memo } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface CodenamesMyInfoProps {
  myTeam: "red" | "blue"
  myRole: "spymaster" | "operative"
}

export const CodenamesMyInfo = memo(function CodenamesMyInfo({ myTeam, myRole }: CodenamesMyInfoProps) {
  const { t } = useTranslation()

  return (
    <div className="mt-6 glass rounded-2xl border-border/30 p-4 text-center text-sm text-muted-foreground transition-all duration-200">
      {t("game.codenames.youAre")}{" "}
      <span
        className={cn(
          "font-extrabold tracking-tight",
          myTeam === "red" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400",
        )}
      >
        {myTeam === "red"
          ? t("games.codenames.teams.red")
          : t("games.codenames.teams.blue")}
      </span>{" "}
      <span className="font-extrabold tracking-tight">
        {myRole === "spymaster"
          ? t("games.codenames.roles.spymaster")
          : t("games.codenames.roles.operative")}
      </span>
    </div>
  )
})
