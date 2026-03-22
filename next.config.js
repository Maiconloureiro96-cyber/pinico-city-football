/** @type {import('next').NextConfig} */

// GitHub Pages: site em subpasta. BASE_PATH vem do workflow (configure-pages).
const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
const basePath =
  isGithubActions && process.env.BASE_PATH !== undefined
    ? process.env.BASE_PATH
    : ''

const assetPrefix = basePath === '' ? '' : basePath + '/'

module.exports = {
  output: 'export',
  basePath: basePath,
  assetPrefix: assetPrefix,
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
}
