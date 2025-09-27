/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better debugging
  reactStrictMode: true,

  // Enable SWC minification for better performance
  swcMinify: true,

  // Experimental features for performance
  experimental: {
    // Server components optimization
    serverComponentsExternalPackages: ['openai'],
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        // Enable aggressive tree shaking
        usedExports: true,
        sideEffects: false,
        // Split chunks for better caching
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
            },
          },
        },
      }
    }

    // Optimize for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }

    return config
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression and performance
  compress: true,
  poweredByHeader: false,

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Output configuration for deployment
  output: 'standalone',

  // TypeScript configuration
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Enable linting during build
    ignoreDuringBuilds: false,
    dirs: ['src', 'pages', 'components', 'lib', 'hooks'],
  },

  // Trailing slash handling
  trailingSlash: false,

  // Generate ETags for caching
  generateEtags: true,

  // Page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

}

module.exports = nextConfig