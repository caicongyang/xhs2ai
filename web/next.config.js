/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['picsum.photos'],
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : undefined,
  output: 'standalone',
  poweredByHeader: false,
}

module.exports = nextConfig 