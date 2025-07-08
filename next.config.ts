import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Improve performance for Docker builds
    optimizePackageImports: ['@reown/appkit', '@stripe/stripe-js']
  }
};

export default nextConfig;
