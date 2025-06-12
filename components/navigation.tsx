'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { locales } from '../i18n'

function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function handleLanguageChange(newLocale: string) {
    // 构建新的路径
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <div className="flex items-center space-x-2">
      {locales.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`px-3 py-1 text-sm font-bold border-2 border-black transition-all ${
            locale === lang
              ? 'bg-primary text-white shadow-brutal'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default function Navigation() {
  const t = useTranslations('Nav')
  const locale = useLocale()

  return (
    <nav className="border-b-3 border-black bg-light">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={`/${locale}`} className="text-2xl font-black flex items-center">
          <span className="bg-primary text-light px-3 py-1 border-3 border-black mr-2">Video</span>
          <span className="bg-accent text-light px-3 py-1 border-3 border-black">2PPT</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-4">
            <Link 
              href={`/${locale}/screen-recording`}
              className="font-bold px-3 py-2 border-3 border-black bg-secondary shadow-brutal transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none">
              {t('screenRecording')}
            </Link>
            <Link 
              href={`/${locale}/local-video`}
              className="font-bold px-3 py-2 border-3 border-black bg-accent shadow-brutal text-light transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none">
              {t('localVideo')}
            </Link>
            <Link 
              href={`/${locale}/online-video`}
              className="font-bold px-3 py-2 border-3 border-black bg-primary text-light shadow-brutal transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none">
              {t('onlineVideo')}
            </Link>
          </div>
          
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  )
} 