import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.modrinth.com',
      },
    ],
  },
  async rewrites() {
    const dynmapUrl = process.env.NEXT_PUBLIC_DYNMAP_URL;
    if (!dynmapUrl) {
      return [];
    }
    return [
      {
        source: '/dynmap/:path*',
        destination: `${dynmapUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
