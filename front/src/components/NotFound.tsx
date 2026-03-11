import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center animate-scale-in">
        <h1 className="text-8xl font-extrabold tracking-tighter gradient-text">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-xl bg-gradient-to-r from-primary to-primary/90 px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-px transition-all duration-200"
        >
          {t("nav.home")}
        </Link>
      </div>
    </div>
  )
}
