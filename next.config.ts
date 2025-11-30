import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force cache bust - increment to force fresh build
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.modrinth.com',
      },
    ],
  },
};

export default nextConfig;
