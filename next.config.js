/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable React Server Components optimizations
    serverComponentsExternalPackages: ['openai'],
    // Optimize client-side bundles
    optimizeCss: true,
    // Enable modern output
    typedRoutes: true,
  },

  // Compress responses
  compress: true,

  // Enable source maps only in development
  productionBrowserSourceMaps: false,

  // Optimize images
  images: {
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Optimize images on-demand
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images
    minimumCacheTTL: 31536000, // 1 year
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      // Enable tree shaking
      config.optimization.usedExports = true
      config.optimization.sideEffects = false

      // Bundle splitting for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
          },
          // React and related libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 30,
          },
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@tailwindcss|tailwindcss)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 25,
          },
          // OpenAI and AI-related libraries
          ai: {
            test: /[\\/]node_modules[\\/](openai)[\\/]/,
            name: 'ai',
            chunks: 'all',
            priority: 25,
          },
          // Common chunks
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
        },
      }
    }

    // Resolve modules efficiently
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    }

    // Optimize module resolution
    config.resolve.modules = ['node_modules', require('path').resolve(__dirname, 'src')]

    return config
  },

  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache API responses for a short time
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable SWC minification for better performance
  swcMinify: true,

  // Optimize fonts
  optimizeFonts: true,

  // Output configuration
  output: 'standalone',
}

module.exports = nextConfig