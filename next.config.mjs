/** @type {import('next').NextConfig} */
const nextConfig = {
    // Esto es para que jale chido dentro de Docker a veces
    output: 'standalone',
    serverExternalPackages: ['@prisma/client'],
    experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;