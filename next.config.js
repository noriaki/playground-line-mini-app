/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig