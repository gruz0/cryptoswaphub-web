/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  reactStrictMode: true,

  trailingSlash: false,

  output: 'standalone',

  productionBrowserSourceMaps: false,

  // NOTE: All of these variables should be defined in:
  // 1. Dockerfile
  // 2. docker-compose.production.yml
  publicRuntimeConfig: {
    tokenContract: process.env.TOKEN_CONTRACT,
  },
}

module.exports = nextConfig
