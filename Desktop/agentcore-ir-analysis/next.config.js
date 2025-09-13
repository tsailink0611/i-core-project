/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config, { dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    }
    
    // 開発環境でのソースマップ設定を削除（Next.jsのデフォルトを使用）
    
    return config
  },
  // ソースマップの生成を制御
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig