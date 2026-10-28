"use client"

import { useEffect, useState } from "react"
import { Download, Share, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "pinico-pwa-install-hint-dismissed"
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    Boolean(
      (navigator as Navigator & { standalone?: boolean }).standalone,
    )
  )
}

function isIosDevice() {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return true
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
}

export function PwaInstallHint() {
  const [visible, setVisible] = useState(false)
  const [ios, setIos] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  )

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(STORAGE_KEY) === "1") return

    const mobile =
      window.matchMedia("(max-width: 767px)").matches || isIosDevice()
    if (!mobile) return

    setIos(isIosDevice())
    setVisible(true)

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    setDeferred(null)
    dismiss()
  }

  return (
    <div
      role="status"
      className="mt-4 w-full max-w-md rounded-lg border border-border bg-secondary/80 px-3 py-2.5 text-left"
    >
      <div className="flex items-start gap-3">
        <img
          src={`${BASE_PATH}/apple-icon.png`}
          alt=""
          width={40}
          height={40}
          className="mt-0.5 size-10 shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            Instalar o app
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {ios ? (
              <>
                No Safari, toque em{" "}
                <Share className="inline-block size-3.5 align-text-bottom" />{" "}
                Compartilhar e depois em <strong>Adicionar à Tela de Início</strong>.
              </>
            ) : deferred ? (
              <>Abra em tela cheia, sem a barra do navegador.</>
            ) : (
              <>
                No menu do Chrome, toque em{" "}
                <strong>Instalar aplicativo</strong> ou{" "}
                <strong>Adicionar à tela inicial</strong>.
              </>
            )}
          </p>
          {deferred && !ios ? (
            <Button
              type="button"
              size="sm"
              className="mt-2"
              onClick={install}
            >
              <Download className="size-4" />
              Instalar
            </Button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Fechar dica de instalação"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
