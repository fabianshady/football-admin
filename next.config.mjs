import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vpl0mb2pgnbucvy2.public.blob.vercel-storage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
