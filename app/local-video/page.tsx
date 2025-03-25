'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
// 注意：客户端需要安装和导入pptxgenjs库
// yarn add pptxgenjs
import pptxgen from 'pptxgenjs'

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
      if (file.type.startsWith('video/')) {
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
      URL.revokeObjectURL(videoUrl)
    }
    
    const newVideoUrl = URL.createObjectURL(file)
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
      URL.revokeObjectURL(videoUrl)
      setVideoUrl('')
    }
    setScreenshots([])
    setPreviewScreenshots([])
    setExtractionProgress(0)
  }

  // 计算图像差异
  const calculateImageDifference = (imgData1: ImageData, imgData2: ImageData) => {
    let sumOfSquares = 0
    const length = imgData1.data.length

    for (let i = 0; i < length; i += 4) {
      const r1 = imgData1.data[i]
      const g1 = imgData1.data[i + 1]
      const b1 = imgData1.data[i + 2]
      const luminance1 = 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1

      const r2 = imgData2.data[i]
      const g2 = imgData2.data[i + 1]
      const b2 = imgData2.data[i + 2]
      const luminance2 = 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2

      const diff = luminance1 - luminance2
      sumOfSquares += diff * diff
    }

    const avgSquareDiff = sumOfSquares / (length / 4)
    return Math.sqrt(avgSquareDiff)
  }
  
  // 开始提取PPT
  const handleExtractPPT = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedFile) return
    
    setIsExtracting(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) {
      setIsExtracting(false)
      return
    }
    
    // 设置画布尺寸与视频相同
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const captureInterval = 3 // 捕获间隔（秒）
    const differenceThreshold = 30 // 差异阈值
    const maxScreenshots = 256 // 最大截图数
    
    let currentTime = 0
    const totalDuration = video.duration
    let previousImageData: ImageData | null = null
    const newScreenshots: Blob[] = []
    const newPreviewUrls: string[] = []
    let noNewScreenshotCount = 0
    
    const captureFrame = () => {
      return new Promise<void>((resolve) => {
        video.currentTime = currentTime
        
        video.onseeked = () => {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height)
          
          if (previousImageData) {
            const difference = calculateImageDifference(previousImageData, currentImageData)
            
            if (difference > differenceThreshold) {
              canvas.toBlob((blob) => {
                if (blob) {
                  newScreenshots.push(blob)
                  
                  const url = URL.createObjectURL(blob)
                  newPreviewUrls.push(url)
                  
                  // 更新预览，保持最多显示5张
                  setPreviewScreenshots(prevUrls => {
                    const updatedUrls = [...prevUrls, url].slice(-5)
                    return updatedUrls
                  })
                }
                noNewScreenshotCount = 0
                resolve()
              }, 'image/jpeg', 0.95)
            } else {
              noNewScreenshotCount++
              resolve()
            }
          } else {
            canvas.toBlob((blob) => {
              if (blob) {
                newScreenshots.push(blob)
                
                const url = URL.createObjectURL(blob)
                newPreviewUrls.push(url)
                
                setPreviewScreenshots(prevUrls => [url])
              }
              resolve()
            }, 'image/jpeg', 0.95)
          }
          
          previousImageData = currentImageData
        }
      })
    }
    
    const processVideo = async () => {
      while (currentTime <= totalDuration && noNewScreenshotCount < 10) {
        await captureFrame()
        currentTime += captureInterval
        setExtractionProgress(Math.min((currentTime / totalDuration) * 100, 100))
        
        if (newScreenshots.length >= maxScreenshots) {
          break
        }
      }
      
      setScreenshots(newScreenshots)
      setIsExtracting(false)
    }
    
    // 播放视频一段时间确保元数据已加载
    video.play()
    setTimeout(() => {
      video.pause()
      processVideo()
    }, 500)
  }
  
  // 创建并下载PPT
  const handleDownloadPPT = async () => {
    if (screenshots.length === 0) return
    
    setIsProcessing(true)
    
    try {
      const pptx = new pptxgen()
      
      // 选择要添加到PPT的截图
      const screenshotsToUse = screenshots.length <= 256 
        ? screenshots 
        : screenshots.slice(0, 256) // 取前256张
      
      // 为每张截图创建幻灯片
      for (let i = 0; i < screenshotsToUse.length; i++) {
        const slide = pptx.addSlide()
        
        // 将截图转换为base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(screenshotsToUse[i])
        })
        
        // 添加图片到幻灯片
        slide.addImage({
          data: base64,
          x: 0,
          y: 0,
          w: '100%',
          h: '100%'
        })
      }
      
      // 生成时间戳文件名
      const now = new Date()
      const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`
      const fileName = `Video2PPT_${timestamp}.pptx`
      
      // 写入并下载文件
      await pptx.writeFile({ fileName })
      
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
      previewScreenshots.forEach(url => URL.revokeObjectURL(url))
      
      // 释放视频URL
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [previewScreenshots, videoUrl])

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          <span className="bg-secondary px-3 py-1 border-3 border-black inline-block transform rotate-1">本地视频</span>
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
                <p>文件大小: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
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
              <p className="text-sm text-center mt-2">共提取 {screenshots.length} 张幻灯片</p>
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