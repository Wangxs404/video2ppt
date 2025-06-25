import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { locales, defaultLocale } from './i18n'

// 检测浏览器首选语言
function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language')
  
  if (!acceptLanguage) {
    return 'en' // 默认返回英文
  }

  // 解析 Accept-Language 头
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=')
      return {
        code: code.toLowerCase(),
        quality: parseFloat(q)
      }
    })
    .sort((a, b) => b.quality - a.quality)

  // 检查是否包含中文
  for (const lang of languages) {
    const langCode = lang.code.split('-')[0]
    if (langCode === 'zh' || langCode === 'zh-cn' || langCode === 'zh-tw') {
      return 'zh'
    }
  }

  // 如果没有中文，返回英文
  return 'en'
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // 自定义语言检测
  localeDetection: false // 禁用默认检测，使用我们的自定义逻辑
})

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 检查是否已经有语言前缀
  const hasLocalePrefix = locales.some(locale => 
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  // 如果没有语言前缀，根据浏览器语言重定向
  if (!hasLocalePrefix && pathname === '/') {
    const preferredLocale = getPreferredLocale(request)
    const url = request.nextUrl.clone()
    url.pathname = `/${preferredLocale}`
    return Response.redirect(url)
  }
  
  return intlMiddleware(request)
}

export const config = {
  // 匹配所有路径除了api、_next/static、_next/image、favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 