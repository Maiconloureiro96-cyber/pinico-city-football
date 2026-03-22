/** @type {import('next').NextConfig} */

// GitHub Pages (projeto): user.github.io/REPO -> basePath = "/REPO"
// Workflow define BASE_PATH via actions/configure-pages (output base_path)
const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
const basePath =
  isGithubActions && process.env.BASE_PATH !== undefined
    ? process.env.BASE_PATH
    : ''

module.exports = {
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
}
