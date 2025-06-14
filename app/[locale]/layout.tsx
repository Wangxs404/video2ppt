import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '../../i18n'
import Navigation from '../../components/navigation'
import Footer from '../../components/footer'
import '../globals.css'
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Meta' })
  
  const baseUrl = 'https://video2ppt.com'
  const currentUrl = `${baseUrl}/${locale}`
  
  return {
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`,
    },
    description: t('description'),
    keywords: [
      'video to ppt',
      'video converter',
      'presentation maker',
      'AI video processing',
      'screen recording',
      'video analysis',
      locale === 'zh' ? '视频转PPT' : '',
      locale === 'zh' ? '演示文稿制作' : '',
      locale === 'zh' ? '在线工具' : '',
    ].filter(Boolean),
    authors: [{ name: 'Video2PPT Team' }],
    creator: 'Video2PPT Team',
    publisher: 'Video2PPT',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: currentUrl,
      languages: {
        'zh': `${baseUrl}/zh`,
        'en': `${baseUrl}/en`,
        'x-default': `${baseUrl}/zh`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: currentUrl,
      siteName: 'Video2PPT',
      locale: locale,
      alternateLocale: locale === 'zh' ? 'en' : 'zh',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/open-graph-image.png`,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`${baseUrl}/open-graph-image.png`],
      creator: '@video2ppt',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Add Google Search Console verification when available
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code',
    },
    category: 'technology',
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // 验证语言参数
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // 获取消息
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Add JSON-LD structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Video2PPT",
              "description": locale === 'zh' 
                ? "免费的在线视频转PPT工具，支持本地视频、在线视频和实时录屏"
                : "Free online tool to convert videos to PowerPoint presentations from local files, online videos, or screen recordings",
              "url": `https://video2ppt.com/${locale}`,
              "applicationCategory": "Multimedia",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Video2PPT Team"
              },
              "inLanguage": [locale],
              "potentialAction": {
                "@type": "UseAction",
                "target": `https://video2ppt.com/${locale}`
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          {children}
          <Footer />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
} 