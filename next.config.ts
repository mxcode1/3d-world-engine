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
      {
        protocol: 'https',
        hostname: 'originalglobetrotters.com',
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

    // Handle Cesium assets
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: 'file-loader',
      },
    });

    return config;
  },

  // Transpile Cesium and Resium
  transpilePackages: ['resium', 'cesium'],

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CESIUM_ION_TOKEN: process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    CESIUM_BASE_URL: '/cesium/',
  },

  // Rewrites for Cesium assets
  async rewrites() {
    return [
      {
        source: '/_next/static/cesium/:path*',
        destination: '/cesium/:path*',
      },
    ];
  },

  // Enable experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },

  // TypeScript configuration
  typescript: {
    // Allows production builds to successfully complete even with type errors
    // Set to false in production for stricter builds
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Directories to run ESLint on during build
    dirs: ['app', 'components', 'lib', 'stores'],
  },
};

export default nextConfig;
