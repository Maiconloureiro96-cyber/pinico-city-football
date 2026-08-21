import type { MetadataRoute } from "next"

/** Necessário com `output: 'export'` no Next 16+ */
export const dynamic = "force-static"

/**
 * Mesma regra do next.config: no GitHub Actions usa BASE_PATH do Pages
 * (ex.: /pinico-city-football). Paths absolutos no manifest precisam do prefixo,
 * senão o browser resolve em user.github.io/icon.png (fora do repo).
 */
function getBasePath(): string {
  if (
    process.env.GITHUB_ACTIONS === "true" &&
    process.env.BASE_PATH !== undefined
  ) {
    return process.env.BASE_PATH
  }
  return process.env.NEXT_PUBLIC_BASE_PATH ?? ""
}

export default function manifest(): MetadataRoute.Manifest {
  const base = getBasePath()
  const root = base ? `${base}/` : "/"

  return {
    id: root,
    name: "Pinico City FC — Sorteio de Times",
    short_name: "Pinico City",
    description:
      "Sorteie times equilibrados para as peladas do Pinico City Futebol Clube",
    start_url: root,
    scope: root,
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#1a2744",
    theme_color: "#1a2744",
    lang: "pt-BR",
    categories: ["sports", "utilities"],
    icons: [
      {
        src: `${base}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
