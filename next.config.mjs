import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */

// GitHub Pages (site de projeto): URL é user.github.io/NOME_DO_REPO → basePath = "/NOME_DO_REPO"
// O workflow passa BASE_PATH a partir do output base_path do actions/configure-pages
const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
const basePath =
  isGithubActions && process.env.BASE_PATH !== undefined
    ? process.env.BASE_PATH
    : ''

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
