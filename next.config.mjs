/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    'localhost:5000',
    '127.0.0.1:5000',
    '*.replit.dev',
    '*.replit.app',
    '*.sisko.replit.dev',
  ],
}

export default nextConfig
