import { APIProvider } from "@vis.gl/react-google-maps"
import type { ReactNode } from "react"

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  if (!GOOGLE_MAPS_API_KEY) {
    return <>{children}</>
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      {children}
    </APIProvider>
  )
}
