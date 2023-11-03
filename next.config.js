/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  reactStrictMode: true,

  trailingSlash: false,

  output: 'standalone',

  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
