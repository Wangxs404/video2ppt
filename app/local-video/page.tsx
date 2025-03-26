'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
// 导入抽离的工具函数
import { calculateImageDifference, extractFramesFromVideo, setupVideoCanvas } from '../utils/videoProcessing'
import { createAndDownloadPPT } from '../utils/pptGeneration'
import { isVideoFile, createFileObjectURL, revokeFileObjectURL, formatFileSize } from '../utils/fileHandling'

export default function LocalVideoPage() {
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isExtracting, setIsExtracting] = useState<boolean>(false)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [screenshots, setScreenshots] = useState<Blob[]>([])
  const [previewScreenshots, setPreviewScreenshots] = useState<string[]>([])
  const [extractionProgress, setExtractionProgress] = useState<number>(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // 处理拖拽事件
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // 处理文件拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (isVideoFile(file)) {
        handleVideoSelect(file)
      }
    }
  }

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleVideoSelect(e.target.files[0])
    }
  }
  
  // 处理视频选择
  const handleVideoSelect = (file: File) => {
    setSelectedFile(file)
    
    // 释放之前的URL
    if (videoUrl) {
      revokeFileObjectURL(videoUrl)
    }
    
    const newVideoUrl = createFileObjectURL(file)
    setVideoUrl(newVideoUrl)
    
    // 清除之前的截图
    setScreenshots([])
    setPreviewScreenshots([])
    setExtractionProgress(0)
  }

  // 清除已选择的文件
  const handleClearFile = () => {
    setSelectedFile(null)
    if (videoUrl) {
      revokeFileObjectURL(videoUrl)
      setVideoUrl('')
    }
    setScreenshots([])
    setPreviewScreenshots([])
    setExtractionProgress(0)
  }
  
  // 开始提取PPT
  const handleExtractPPT = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedFile) return
    
    setIsExtracting(true)
    
    const options = {
      captureInterval: 3, // 捕获间隔（秒）
      differenceThreshold: 30, // 差异阈值
      maxScreenshots: 256 // 最大截图数
    }
    
    const callbacks = {
      onProgress: (progress: number) => {
        setExtractionProgress(progress)
      },
      onFrameCaptured: (blob: Blob, url: string) => {
        // 更新预览，保持最多显示5张
        setPreviewScreenshots(prevUrls => {
          const updatedUrls = [...prevUrls, url].slice(-5)
          return updatedUrls
        })
        
        // 同时更新screenshots状态，使PPT数量动态更新
        setScreenshots(prev => [...prev, blob])
      },
      onComplete: (newScreenshots: Blob[]) => {
        // 由于我们已经在每帧更新了screenshots，这里不需要再设置
        // 只需标记提取过程已完成
        setIsExtracting(false)
      }
    }
    
    try {
      await extractFramesFromVideo(
        videoRef.current,
        canvasRef.current,
        options,
        callbacks
      )
    } catch (error) {
      console.error('提取帧错误:', error)
      setIsExtracting(false)
    }
  }
  
  // 创建并下载PPT
  const handleDownloadPPT = async () => {
    if (screenshots.length === 0) return
    
    setIsProcessing(true)
    
    try {
      await createAndDownloadPPT(screenshots)
    } catch (error) {
      console.error('PPT生成错误:', error)
    } finally {
      setIsProcessing(false)
    }
  }
  
  // 清理资源
  useEffect(() => {
    return () => {
      // 释放截图URL
      previewScreenshots.forEach(url => revokeFileObjectURL(url))
      
      // 释放视频URL
      if (videoUrl) {
        revokeFileObjectURL(videoUrl)
      }
    }
  }, [previewScreenshots, videoUrl])

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          <span className="bg-accent text-light px-3 py-1 border-3 border-black inline-block transform rotate-1">本地视频</span>
          <span className="text-2xl ml-3">转PPT</span>
        </h1>

        <div className="card bg-light mb-8">
          <h2 className="text-2xl font-bold mb-4">上传视频文件</h2>
          <p className="mb-6">支持MP4, AVI, MOV, WMV等常见视频格式，单个文件大小限制100MB。</p>
          
          {/* 文件上传区域 */}
          <div 
            className={`border-3 border-dashed border-black bg-white p-8 mb-6 text-center ${dragActive ? 'bg-secondary/20' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="bg-primary text-light inline-block px-4 py-2 border-3 border-black">
                  已选择视频文件: {selectedFile.name}
                </div>
                <p>文件大小: {formatFileSize(selectedFile.size)}</p>
                <button 
                  onClick={handleClearFile}
                  className="btn bg-accent text-light mt-4"
                >
                  重新选择
                </button>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg mb-4">将视频文件拖放到这里</p>
                <p className="text-gray-500 mb-4">- 或者 -</p>
                <label className="btn bg-primary text-light cursor-pointer">
                  选择视频文件
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                </label>
              </>
            )}
          </div>
          
          {/* 视频预览 */}
          {videoUrl && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">视频预览</h3>
              <div className="relative border-3 border-black">
                <video 
                  ref={videoRef} 
                  src={videoUrl} 
                  controls 
                  className="w-full h-auto"
                  preload="metadata"
                ></video>
              </div>
            </div>
          )}
          
          {/* 处理按钮 */}
          {selectedFile && !isExtracting && screenshots.length === 0 && (
            <button 
              onClick={handleExtractPPT}
              className="btn bg-primary text-light w-full text-xl py-4 transform hover:rotate-1"
            >
              开始提取PPT
            </button>
          )}
          
          {/* 提取中状态 */}
          {isExtracting && (
            <div className="space-y-4">
              <div className="w-full h-6 bg-white border-3 border-black overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${extractionProgress}%` }}
                ></div>
              </div>
              <p className="text-center font-bold">正在提取PPT ({extractionProgress.toFixed(0)}%)...</p>
            </div>
          )}
          
          {/* 隐藏的画布用于处理视频帧 */}
          <canvas ref={canvasRef} className="hidden"></canvas>
          
          {/* 截图预览 */}
          {previewScreenshots.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3">截图预览</h3>
              <div className="flex overflow-x-auto gap-3 p-2 border-3 border-black bg-white">
                {previewScreenshots.map((url, index) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`截图 ${index + 1}`} 
                    className="h-24 border-2 border-black shadow-brutal"
                  />
                ))}
              </div>
              <p className="text-sm text-center mt-2">
                {isExtracting 
                  ? `正在提取幻灯片，已获取 ${screenshots.length} 张` 
                  : `共提取 ${screenshots.length} 张幻灯片`
                }
              </p>
            </div>
          )}
          
          {/* 下载按钮 */}
          {screenshots.length > 0 && !isExtracting && (
            <button 
              onClick={handleDownloadPPT}
              disabled={isProcessing}
              className={`btn bg-accent text-light w-full text-xl py-4 mt-6 transform hover:rotate-1 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成PPT中...
                </span>
              ) : '下载PPT文件'}
            </button>
          )}
        </div>

        <div className="card bg-light">
          <h2 className="text-2xl font-bold mb-4">本地视频转PPT的优势</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="bg-primary text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>无需上传到服务器</strong> - 所有处理在你的设备上完成，保护隐私</p>
            </li>
            <li className="flex items-start">
              <div className="bg-secondary w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>支持高清视频</strong> - 准确提取视频中的文字、图表和重要内容</p>
            </li>
            <li className="flex items-start">
              <div className="bg-accent text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>快速处理</strong> - 几分钟内完成转换，节省大量手动整理时间</p>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
} 