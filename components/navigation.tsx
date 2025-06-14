'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { locales } from '../i18n'

function LanguageSwitcher({ isMobile = false }: { isMobile?: boolean }) {
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
    <div className={`flex items-center ${isMobile ? 'justify-center space-x-3' : 'space-x-2'}`}>
      {locales.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`px-3 py-2 text-sm font-bold border-3 border-black transition-all ${
            locale === lang
              ? 'bg-primary text-white shadow-brutal'
              : 'bg-white text-black hover:bg-gray-100 hover:shadow-brutal'
          } ${isMobile ? 'min-w-[60px]' : ''}`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden flex flex-col justify-center items-center w-8 h-8 bg-secondary border-3 border-black shadow-brutal transition-all hover:shadow-brutal-lg active:shadow-none"
      aria-label="Toggle menu"
    >
      <span className={`w-5 h-0.5 bg-black transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : ''}`} />
      <span className={`w-5 h-0.5 bg-black transition-all duration-300 my-1 ${isOpen ? 'opacity-0' : ''}`} />
      <span className={`w-5 h-0.5 bg-black transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`} />
    </button>
  )
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('Nav')
  const locale = useLocale()

  if (!isOpen) return null

  return (
    <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div 
        className="absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-light border-l-3 border-black shadow-brutal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Close Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={onClose}
              className="w-8 h-8 bg-primary text-white border-3 border-black shadow-brutal font-bold text-lg hover:shadow-brutal-lg active:shadow-none"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4 mb-8">
            <Link 
              href={`/${locale}/screen-recording`}
              onClick={onClose}
              className="block w-full font-bold px-4 py-3 border-3 border-black bg-secondary shadow-brutal transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none text-center">
              {t('screenRecording')}
            </Link>
            <Link 
              href={`/${locale}/local-video`}
              onClick={onClose}
              className="block w-full font-bold px-4 py-3 border-3 border-black bg-accent shadow-brutal text-light transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none text-center">
              {t('localVideo')}
            </Link>
            <Link 
              href={`/${locale}/online-video`}
              onClick={onClose}
              className="block w-full font-bold px-4 py-3 border-3 border-black bg-primary text-light shadow-brutal transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none text-center">
              {t('onlineVideo')}
            </Link>
          </div>

          {/* Language Switcher */}
          <div className="border-t-3 border-black pt-6">
            <p className="text-sm font-bold mb-4 text-center">语言 / Language</p>
            <LanguageSwitcher isMobile={true} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Navigation() {
  const t = useTranslations('Nav')
  const locale = useLocale()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="border-b-3 border-black bg-light sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href={`/${locale}`} className="text-xl md:text-2xl font-black flex items-center">
            <span className="bg-primary text-light px-2 md:px-3 py-1 border-3 border-black mr-1 md:mr-2 text-sm md:text-base">Video</span>
            <span className="bg-accent text-light px-2 md:px-3 py-1 border-3 border-black text-sm md:text-base">2PPT</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-3 lg:space-x-4">
              <Link 
                href={`/${locale}/screen-recording`}
                className="font-bold px-3 py-2 border-3 border-black bg-secondary shadow-brutal transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none text-sm lg:text-base whitespace-nowrap">
                {t('screenRecording')}
              </Link>
              <Link 
                href={`/${locale}/local-video`}
                className="font-bold px-3 py-2 border-3 border-black bg-accent shadow-brutal text-light transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none text-sm lg:text-base whitespace-nowrap">
                {t('localVideo')}
              </Link>
              <Link 
                href={`/${locale}/online-video`}
                className="font-bold px-3 py-2 border-3 border-black bg-primary text-light shadow-brutal transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none text-sm lg:text-base whitespace-nowrap">
                {t('onlineVideo')}
              </Link>
            </div>
            
            <LanguageSwitcher />
          </div>

          {/* Mobile Hamburger Button */}
          <HamburgerButton 
            isOpen={isMobileMenuOpen} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          />
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  )
} 