'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

export default function Footer() {
  const t = useTranslations('Footer')
  const locale = useLocale()

  return (
    <footer className="py-8 border-t-3 border-black bg-light">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-xl font-black mb-4 md:mb-0 flex items-center">
            <span className="bg-primary text-light px-3 py-1 border-3 border-black mr-2">Video</span>
            <span className="bg-accent text-light px-3 py-1 border-3 border-black">2PPT</span>
          </div>
         
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link 
              href={`/${locale}/privacy`}
              className="font-bold px-3 py-2 border-3 border-black bg-white text-black shadow-brutal hover:shadow-brutal-lg hover:translate-y-[-2px] transition-all active:translate-y-[2px] active:shadow-none"
            >
              {t('privacy')}
            </Link>
            
            <div className="text-center md:text-right">
              <p className="font-medium">{t('copyright', { year: new Date().getFullYear() })}</p>
              <p className="text-gray-600">{t('description')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 