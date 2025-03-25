'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function OnlineVideoPage() {
  const [url, setUrl] = useState<string>('')
  const [isUrlValid, setIsUrlValid] = useState<boolean | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  // 支持的视频平台
  const supportedPlatforms = [
    { name: 'YouTube', icon: '🎬', color: 'bg-red-500' },
    { name: 'Bilibili', icon: '📺', color: 'bg-blue-400' },
    { name: 'Vimeo', icon: '🎥', color: 'bg-teal-500' },
    { name: '腾讯视频', icon: '📱', color: 'bg-green-500' },
    { name: '爱奇艺', icon: '🎞️', color: 'bg-purple-500' },
    { name: '优酷', icon: '📽️', color: 'bg-yellow-500' },
  ]

  // 处理URL输入
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value
    setUrl(inputUrl)
    
    // 简单验证URL是否有效
    if (inputUrl.trim() === '') {
      setIsUrlValid(null)
    } else if (
      inputUrl.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|bilibili\.com|vimeo\.com|v\.qq\.com|iqiyi\.com|youku\.com)\/.*$/i)
    ) {
      setIsUrlValid(true)
    } else {
      setIsUrlValid(false)
    }
  }

  // 模拟提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isUrlValid) {
      setIsProcessing(true)
      // 这里仅做UI演示，实际不实现功能
      setTimeout(() => {
        setIsProcessing(false)
      }, 2000)
    }
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          <span className="bg-primary text-light px-3 py-1 border-3 border-black inline-block transform rotate-1">在线视频</span>
          <span className="text-2xl ml-3">转PPT</span>
        </h1>

        <div className="card bg-light mb-8">
          <h2 className="text-2xl font-bold mb-4">输入视频链接</h2>
          <p className="mb-6">支持YouTube、Bilibili等主流视频平台，输入视频网址即可开始转换。</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block mb-2 font-bold">视频网址</label>
              <input 
                id="videoUrl"
                type="text" 
                value={url}
                onChange={handleUrlChange}
                placeholder="https://www.youtube.com/watch?v=..." 
                className={`brutal-input ${isUrlValid === false ? 'border-red-500' : ''}`}
              />
              {isUrlValid === false && (
                <p className="text-red-500 mt-2">请输入有效的视频链接</p>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={!isUrlValid || isProcessing}
              className={`btn bg-accent text-light w-full text-xl py-4 transform hover:rotate-1 ${(!isUrlValid || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? '处理中...' : '开始转换为PPT'}
            </button>
          </form>
        </div>

        <div className="card bg-light mb-8">
          <h2 className="text-2xl font-bold mb-4">支持的视频平台</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {supportedPlatforms.map((platform, index) => (
              <div 
                key={index} 
                className="border-3 border-black p-4 bg-white shadow-brutal transform hover:-rotate-1 hover:shadow-brutal-lg transition-all"
              >
                <div className={`${platform.color} text-light w-10 h-10 flex items-center justify-center text-xl border-3 border-black mb-2`}>
                  {platform.icon}
                </div>
                <p className="font-bold">{platform.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-light">
          <h2 className="text-2xl font-bold mb-4">在线视频转PPT的优势</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="bg-primary text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>无需下载视频</strong> - 直接处理在线视频内容，节省空间和时间</p>
            </li>
            <li className="flex items-start">
              <div className="bg-secondary w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>支持多平台</strong> - 覆盖国内外主流视频网站，满足不同需求</p>
            </li>
            <li className="flex items-start">
              <div className="bg-accent text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>快速分享</strong> - 直接分享链接即可帮助他人也获取相同PPT</p>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
} 