/** @type {import('next').NextConfig} */

// Detecta automaticamente o basePath quando rodando no GitHub Actions
const isProd = process.env.NODE_ENV === 'production'
const isGithubActions = process.env.GITHUB_ACTIONS === 'true'

// Se for GitHub Actions, pega o nome do repositório da variável de ambiente
// Isso é configurado automaticamente pelo actions/configure-pages
const basePath = isGithubActions && process.env.BASE_PATH ? process.env.BASE_PATH : ''

const nextConfig = {
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
