'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

export default function OnlineVideoPage() {
  const t = useTranslations('OnlineVideo')
  const locale = useLocale()
  
  const [videoUrl, setVideoUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoUrl.trim()) return
    
    setIsProcessing(true)
    // 这里将来会添加在线视频处理逻辑
    console.log('Processing online video:', videoUrl)
    
    setTimeout(() => {
      setIsProcessing(false)
      alert(t('comingSoon'))
    }, 2000)
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          <span className="bg-primary text-light px-3 py-1 border-3 border-black inline-block transform rotate-1">{t('title')}</span>
        </h1>

        <div className="card bg-light mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
          <p className="mb-6">{t('description')}</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="video-url" className="block text-lg font-bold mb-3">
                {t('videoLink')}
              </label>
              <input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder={t('linkPlaceholder')}
                className="w-full px-4 py-3 border-3 border-black text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isProcessing}
              />
            </div>
            
            <button
              type="submit"
              disabled={!videoUrl.trim() || isProcessing}
              className={`btn w-full text-xl py-4 transform hover:rotate-1 ${
                !videoUrl.trim() || isProcessing 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-primary text-light'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('processing')}
                </span>
              ) : (
                t('startConvert')
              )}
            </button>
          </form>
        </div>

        <div className="card bg-light">
          <h2 className="text-2xl font-bold mb-4">{t('supportedPlatforms')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-4 border-2 border-black">
              <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">YT</span>
              </div>
              <div>
                <h3 className="font-bold">{t('youtube.name')}</h3>
                <p className="text-sm text-gray-600">{t('youtube.description')}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 border-2 border-black">
              <div className="bg-pink-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">B</span>
              </div>
              <div>
                <h3 className="font-bold">{t('bilibili.name')}</h3>
                <p className="text-sm text-gray-600">{t('bilibili.description')}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 border-2 border-black">
              <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">V</span>
              </div>
              <div>
                <h3 className="font-bold">{t('vimeo.name')}</h3>
                <p className="text-sm text-gray-600">{t('vimeo.description')}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 border-2 border-black">
              <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">+</span>
              </div>
              <div>
                <h3 className="font-bold">{t('more.name')}</h3>
                <p className="text-sm text-gray-600">{t('more.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 