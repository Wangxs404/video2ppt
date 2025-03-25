'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OnlineVideoPage() {
  const [url, setUrl] = useState<string>('')
  const [isUrlValid, setIsUrlValid] = useState<boolean | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [videoId, setVideoId] = useState<string>('')
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false)
  const [videoSource, setVideoSource] = useState<'youtube' | 'bilibili' | ''>('')

  // 支持的视频平台
  const supportedPlatforms = [
    { name: 'YouTube', icon: '🎬', color: 'bg-red-500' },
    { name: 'Bilibili', icon: '📺', color: 'bg-blue-400' },
    { name: 'Coming Soon...', icon: '🎥', color: 'bg-teal-500' },
  ]

  // 从YouTube URL中提取视频ID
  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : null
  }

  // 从Bilibili URL中提取视频ID
  const extractBilibiliVideoId = (url: string): { type: 'bv' | 'av', id: string } | null => {
    // BV格式，例如：https://www.bilibili.com/video/BV1xx411c7mD
    const bvRegExp = /\/video\/(BV[a-zA-Z0-9]+)/
    const bvMatch = url.match(bvRegExp)
    if (bvMatch && bvMatch[1]) {
      return { type: 'bv', id: bvMatch[1] }
    }
    
    // AV格式，例如：https://www.bilibili.com/video/av170001
    const avRegExp = /\/video\/av(\d+)/
    const avMatch = url.match(avRegExp)
    if (avMatch && avMatch[1]) {
      return { type: 'av', id: avMatch[1] }
    }
    
    return null
  }

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
      
      // 尝试提取YouTube视频ID
      const extractedYouTubeId = extractYouTubeVideoId(url)
      if (extractedYouTubeId) {
        setVideoId(extractedYouTubeId)
        setVideoSource('youtube')
        setIsVideoLoaded(true)
        setIsProcessing(false)
        return
      }
      
      // 尝试提取Bilibili视频ID
      const extractedBilibiliId = extractBilibiliVideoId(url)
      if (extractedBilibiliId) {
        setVideoId(extractedBilibiliId.type === 'bv' 
          ? `bvid=${extractedBilibiliId.id}`
          : `aid=${extractedBilibiliId.id}`
        )
        setVideoSource('bilibili')
        setIsVideoLoaded(true)
        setIsProcessing(false)
        return
      }
      
      // 不支持的链接类型
      alert('目前仅支持YouTube和Bilibili链接，请输入有效的视频链接')
      setIsProcessing(false)
    }
  }

  // 获取视频iframe的URL
  const getVideoEmbedUrl = (): string => {
    if (!videoId) return ''
    
    if (videoSource === 'youtube') {
      return `https://www.youtube.com/embed/${videoId}`
    } else if (videoSource === 'bilibili') {
      return `https://player.bilibili.com/player.html?${videoId}&page=1&high_quality=1&danmaku=0`
    }
    
    return ''
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
                placeholder="https://www.youtube.com/watch?v=... 或 https://www.bilibili.com/video/BV..." 
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
              {isProcessing ? '处理中...' : '加载视频'}
            </button>
          </form>
        </div>

        {/* 视频播放区域 */}
        <div className="card bg-light mb-8">
          <h2 className="text-2xl font-bold mb-4">视频预览</h2>
          <div className="border-3 border-black bg-dark aspect-video mb-6 relative overflow-hidden">
            {isVideoLoaded && videoId ? (
              <iframe 
                src={getVideoEmbedUrl()}
                className="w-full h-full" 
                title="Video Player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-light">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-xl font-bold">尚未加载视频</p>
                <p className="text-gray-400 mt-2">在上方输入YouTube或Bilibili视频链接</p>
              </div>
            )}
          </div>
          
          {isVideoLoaded && videoId && (
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => alert('此功能尚未实现')}
                className="btn bg-primary text-light flex-1"
              >
                分析视频
              </button>
              <button 
                onClick={() => alert('此功能尚未实现')}
                className="btn bg-accent text-light flex-1"
              >
                生成PPT
              </button>
            </div>
          )}
          
          {isVideoLoaded && videoSource && (
            <div className="mt-4 text-center text-sm text-gray-600">
              当前加载: <strong>{videoSource === 'youtube' ? 'YouTube' : 'Bilibili'}</strong> 视频
            </div>
          )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="bg-primary text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>无需下载视频</strong> - 直接处理在线视频内容，节省空间和时间</p>
            </div>
            <div className="flex items-start">
              <div className="bg-secondary w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>支持多平台</strong> - 覆盖国内外主流视频网站，满足不同需求</p>
            </div>
            <div className="flex items-start">
              <div className="bg-accent text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>快速分享</strong> - 直接分享链接即可帮助他人也获取相同PPT</p>
            </div>
            <div className="flex items-start">
              <div className="bg-primary text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>智能提取</strong> - 自动分析关键帧和内容，生成高质量幻灯片</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 