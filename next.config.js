const withNextIntl = require('next-intl/plugin')('./i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SWC 优化配置
  swcMinify: true,
  experimental: {
    // 确保使用 SWC 进行优化
    forceSwcTransforms: false,
    // 改善 SWC 错误处理
    swcTraceProfiling: false,
  },
  // 在 SWC 不可用时回退到 Babel
  compiler: {
    // 移除 console 语句（仅在生产环境）
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = withNextIntl(nextConfig) 