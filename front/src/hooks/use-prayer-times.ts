import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Coordinates,
  PrayerTimes,
  Prayer,
  CalculationMethod,
  SunnahTimes,
} from "adhan"

type PrayerValue = (typeof Prayer)[keyof typeof Prayer]

interface PrayerTimeEntry {
  name: string
  key: string
  time: Date
}

interface UsePrayerTimesResult {
  prayers: PrayerTimeEntry[]
  tahajjud: Date | null
  nextPrayer: PrayerTimeEntry | null
  countdown: string
  loading: boolean
}

const PRAYER_KEYS: { prayer: PrayerValue; key: string; name: string }[] = [
  { prayer: Prayer.Fajr, key: "fajr", name: "Fajr" },
  { prayer: Prayer.Sunrise, key: "sunrise", name: "Sunrise" },
  { prayer: Prayer.Dhuhr, key: "dhuhr", name: "Dhuhr" },
  { prayer: Prayer.Asr, key: "asr", name: "Asr" },
  { prayer: Prayer.Maghrib, key: "maghrib", name: "Maghrib" },
  { prayer: Prayer.Isha, key: "isha", name: "Isha" },
]

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function usePrayerTimes(
  coordinates: { lat: number; lng: number } | null,
): UsePrayerTimesResult {
  const [countdown, setCountdown] = useState("--:--:--")

  const prayerTimes = useMemo(() => {
    if (!coordinates) return null
    const coords = new Coordinates(coordinates.lat, coordinates.lng)
    const params = CalculationMethod.MuslimWorldLeague()
    return new PrayerTimes(coords, new Date(), params)
  }, [coordinates])

  const sunnahTimes = useMemo(() => {
    if (!prayerTimes) return null
    return new SunnahTimes(prayerTimes)
  }, [prayerTimes])

  const prayers: PrayerTimeEntry[] = useMemo(() => {
    if (!prayerTimes) return []
    return PRAYER_KEYS.map(({ key, name, prayer }) => ({
      name,
      key,
      time: prayerTimes.timeForPrayer(prayer) as Date,
    }))
  }, [prayerTimes])

  const tahajjud = useMemo(() => {
    return sunnahTimes?.lastThirdOfTheNight ?? null
  }, [sunnahTimes])

  const findNextPrayer = useCallback((): PrayerTimeEntry | null => {
    if (!prayers.length) return null
    const current = new Date()
    for (const p of prayers) {
      if (p.time > current) return p
    }
    return prayers[0] // wrap to next day's Fajr
  }, [prayers])

  const nextPrayer = useMemo(() => findNextPrayer(), [findNextPrayer])

  useEffect(() => {
    if (!nextPrayer) return
    const interval = setInterval(() => {
      const current = new Date()
      const diff = nextPrayer.time.getTime() - current.getTime()
      setCountdown(formatCountdown(diff > 0 ? diff : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [nextPrayer])

  return {
    prayers,
    tahajjud,
    nextPrayer,
    countdown,
    loading: !coordinates,
  }
}
