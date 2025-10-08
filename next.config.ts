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

      // Ensure proper module resolution for Cesium
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'webassembly/async',
      });

      // Handle worker files
      config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      });
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
};

export default nextConfig;
