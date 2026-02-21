import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { BookOpen, Grid2x2, Shield, Users } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/providers/AuthProvider"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Learn & Play</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          {t("home.title")}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("home.subtitle")}
        </p>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/rooms/create"
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                {t("home.createRoom")}
              </Link>
              <Link
                to="/rooms"
                className="rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 transition-colors"
              >
                {t("home.joinRoom")}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth/register"
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                {t("home.playNow")}
              </Link>
              <Link
                to="/auth/login"
                className="rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 transition-colors"
              >
                {t("nav.login")}
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Games Section */}
      <div className="mt-16 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Undercover */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{t("games.undercover.name")}</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {t("games.undercover.description")}
          </p>
          <div className="mt-6 flex gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {t("games.undercover.roles.civilian")}
            </span>
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
              {t("games.undercover.roles.undercover")}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {t("games.undercover.roles.mrWhite")}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>3-12 players</span>
          </div>
        </motion.div>

        {/* Codenames */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="rounded-xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-accent/10 p-3">
              <Grid2x2 className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold">{t("games.codenames.name")}</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {t("games.codenames.description")}
          </p>
          <div className="mt-6 flex gap-2">
            <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400">
              {t("games.codenames.teams.red")}
            </span>
            <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
              {t("games.codenames.teams.blue")}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>4-10 players</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
