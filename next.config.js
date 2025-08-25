/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig