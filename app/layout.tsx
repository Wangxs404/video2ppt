import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Video2PPT - 将视频转换为PPT的免费工具',
  description: '将任意来源的视频转换为PPT，包括本地、在线视频，录屏。支持录屏的同时提取PPT，完全免费！',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {/* 导航栏 */}
        <nav className="border-b-3 border-black bg-light">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-black flex items-center">
              <span className="bg-primary text-light px-3 py-1 border-3 border-black mr-2">Video</span>
              <span className="bg-accent text-light px-3 py-1 border-3 border-black">2PPT</span>
            </Link>
            <div className="flex space-x-4">
              <Link 
                href="/screen-recording" 
                className="font-bold px-3 py-2 border-3 border-black  bg-secondary shadow-brutal transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none">
                实时录屏
              </Link>
              <Link 
                href="/local-video" 
                className="font-bold px-3 py-2 border-3 border-black  bg-accent shadow-brutal  text-light transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none">
                本地视频
              </Link>
              <Link 
                href="/online-video" 
                className="font-bold px-3 py-2 border-3 border-black bg-primary text-light shadow-brutal transition-transform hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-y-[2px] active:shadow-none">
                在线视频
              </Link>
            </div>
          </div>
        </nav>
        {children}
        
        {/* 添加 Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  )
} 