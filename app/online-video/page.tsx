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
  
  // 推荐的下载工具
  const downloadTools = [
    { name: 'VGO', url: 'https://vgo.pub/', desc: '简洁易用的在线下载器' },
    { name: 'yt-dlp', url: 'https://github.com/yt-dlp/yt-dlp', desc: '强大的命令行下载工具' },
    { name: 'Cobalt', url: 'https://cobalt.tools/', desc: '高质量视频下载API服务' },
    { name: '小纸条', url: 'https://downloader.caorushizi.cn/', desc: '简体中文界面的视频下载器' }
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

  // 模拟提交 - 这里我们只做验证，不再嵌入iframe
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

        {/* <div className="card bg-light mb-8">
          <h2 className="text-2xl font-bold mb-4">输入视频链接</h2>
          <p className="mb-6">支持YouTube、Bilibili等主流视频平台，输入视频网址验证有效性。</p>
          
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
              {isProcessing ? '处理中...' : '验证链接'}
            </button>
          </form>
        </div> */}

        {/* 说明区域 */}
        <div className="card bg-light mb-8 border-3 border-black">
          <div className="bg-secondary px-4 py-2 -mt-3 -mx-3 mb-4 border-b-3 border-black inline-block transform rotate-1">
            <h2 className="text-2xl font-bold">⚠️ 需要下载视频</h2>
          </div>
          
          <div className="p-3 bg-white border-3 border-black mb-4">
            <p className="font-bold mb-2">由于视频平台的内容保护机制，我们无法直接从嵌入式播放器中提取帧画面。</p>
            <p>要创建视频PPT，请按照以下步骤操作：</p>
            
            <ol className="list-decimal ml-6 my-4 space-y-2">
              <li><span className="font-bold">下载视频</span> - 使用下方推荐的工具下载您的视频</li>
              <li><span className="font-bold">保存到设备</span> - 将视频文件保存到您的计算机</li>
              <li><span className="font-bold">使用本地视频功能</span> - 上传已下载的视频以生成PPT</li>
            </ol>
          </div>
          
          <Link 
            href="/local-video" 
            className="btn bg-primary text-light w-full text-xl py-4 mb-4"
          >
            前往本地视频转换
          </Link>
        </div>

        {/* 推荐下载工具 */}
        <div className="card bg-light mb-8">
          <h2 className="text-2xl font-bold mb-4">推荐的视频下载工具</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downloadTools.map((tool, index) => (
              <a 
                key={index}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer" 
                className="border-3 border-black p-4 bg-white shadow-brutal transform hover:-rotate-1 hover:shadow-brutal-lg transition-all hover:bg-accent hover:text-light"
              >
                <div className="flex items-center mb-2">
                  <div className="bg-accent text-light w-10 h-10 flex items-center justify-center text-xl border-3 border-black mr-3">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-lg">{tool.name}</h3>
                </div>
                <p>{tool.desc}</p>
              </a>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 border-3 border-black">
            <p className="text-sm text-gray-700">
              <strong>注意：</strong> 请确保您在下载和使用视频时遵守相关版权法规。仅将视频用于个人学习和非商业用途。本工具不存储或提供任何视频内容。
            </p>
          </div>
        </div>

        {/* 支持的视频平台 */}
        {/* <div className="card bg-light mb-8">
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
        </div> */}
      </div>
    </main>
  )
} 