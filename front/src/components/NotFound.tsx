import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t("nav.home")}
        </Link>
      </div>
    </div>
  )
}
