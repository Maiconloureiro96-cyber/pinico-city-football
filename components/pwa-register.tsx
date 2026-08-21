"use client"

import { useEffect } from "react"

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/**
 * Registra o service worker em produção (export estático / GitHub Pages).
 * Escopo e URL respeitam o basePath do repositório.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    if (process.env.NODE_ENV !== "production") return

    const swUrl = `${base}/sw.js`
    const scope = `${base}/`

    navigator.serviceWorker.register(swUrl, { scope }).catch((err) => {
      console.warn("[PWA] Falha ao registrar service worker:", err)
    })
  }, [])

  return null
}
