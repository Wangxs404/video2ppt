import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// 支持的语言列表
export const locales = ['zh', 'en'] as const
export type Locale = (typeof locales)[number]

// 默认语言
export const defaultLocale: Locale = 'zh'

// 类型检查函数
export function hasLocale(locales: readonly string[], locale: unknown): locale is string {
  return typeof locale === 'string' && locales.includes(locale)
}

export default getRequestConfig(async ({ requestLocale }) => {
  // 获取请求的语言
  const requested = await requestLocale
  
  // 验证并设置语言
  const locale = hasLocale(locales, requested) ? requested : defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
}) 