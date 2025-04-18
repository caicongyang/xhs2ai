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
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      '/': { page: '/' },
      '/title-generator': { page: '/title-generator' },
      '/content-rewriter': { page: '/content-rewriter' },
      '/cover-generator': { page: '/cover-generator' },
      '/image-generator': { page: '/image-generator' },
      '/video-generator': { page: '/video-generator' },
      '/history': { page: '/history' },
      '/magazine-card-generator': { page: '/magazine-card-generator' },
    };
  },
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.html$/,
      use: 'raw-loader',
    });
    return config;
  },
}

module.exports = nextConfig 