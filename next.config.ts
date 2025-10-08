/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Webpack configuration for Cesium
  webpack: (config: any, { isServer }: any) => {
    // Cesium requires these to be copied to public directory
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Transpile Cesium and Resium
  transpilePackages: ['resium', 'cesium'],

  // Environment variables exposed to browser
  env: {
    CESIUM_BASE_URL: '/cesium/',
  },

  // Enable experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },

  // Output standalone for better Vercel deployment
  output: 'standalone',
};

export default nextConfig;
