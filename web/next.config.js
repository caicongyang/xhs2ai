/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['picsum.photos'],
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : undefined,
  output: 'export',
  poweredByHeader: false,
  basePath: '',
  trailingSlash: true,
}

module.exports = nextConfig 