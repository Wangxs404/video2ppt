'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
// 从分离的模块导入
import { calculateImageDifference, setupVideoCanvas } from '../../utils/videoProcessing'
import { processLocalVideo, LocalVideoProcessingOptions, LocalVideoProcessingCallbacks } from '../../utils/localVideoProcessing'
import { VideoDurationInfo, detectVideoFormat } from '../../utils/videoDurationUtils'
import { generatePptBlob } from '../../utils/pptGeneration'
import { isVideoFile, createFileObjectURL, revokeFileObjectURL, formatFileSize } from '../../utils/fileHandling'

export default function LocalVideoPage() {
  const t = useTranslations('LocalVideo')
  
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isExtracting, setIsExtracting] = useState<boolean>(false)
  const [isPreprocessing, setIsPreprocessing] = useState<boolean>(false)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [screenshots, setScreenshots] = useState<Blob[]>([])
  const [previewScreenshots, setPreviewScreenshots] = useState<string[]>([])
  const [extractionProgress, setExtractionProgress] = useState<number>(0)
  const [preprocessProgress, setPreprocessProgress] = useState<number>(0)
  const [durationInfo, setDurationInfo] = useState<VideoDurationInfo | null>(null)
  const [videoFormat, setVideoFormat] = useState<string>('')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewUrlsRef = useRef<string[]>([])
  const videoUrlRef = useRef<string>('')
  const isPreprocessingRef = useRef<boolean>(false)
  
  // 同步状态到 ref
  useEffect(() => {
    previewUrlsRef.current = previewScreenshots
  }, [previewScreenshots])
  
  useEffect(() => {
    videoUrlRef.current = videoUrl
  }, [videoUrl])

  useEffect(() => {
    isPreprocessingRef.current = isPreprocessing
  }, [isPreprocessing])

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
    
    // 检测视频格式
    const format = detectVideoFormat(file)
    setVideoFormat(format)
    
    // 释放之前的URL
    if (videoUrl) {
      revokeFileObjectURL(videoUrl)
    }
    
    // 清理之前的截图URL
    previewScreenshots.forEach(url => revokeFileObjectURL(url))
    
    const newVideoUrl = createFileObjectURL(file)
    setVideoUrl(newVideoUrl)
    
    // 清除之前的截图和状态
    setScreenshots([])
    setPreviewScreenshots([])
    setExtractionProgress(0)
    setPreprocessProgress(0)
    setDurationInfo(null)
    
    // 给出格式提示
    if (format === 'webm') {
      console.log('🎬 检测到WebM格式视频，将使用增强的时长检测算法')
    }
  }

  // 清除已选择的文件
  const handleClearFile = () => {
    setSelectedFile(null)
    setIsExtracting(false)
    setIsPreprocessing(false)
    isPreprocessingRef.current = false
    setExtractionProgress(0)
    setPreprocessProgress(0)
    
    if (videoUrl) {
      revokeFileObjectURL(videoUrl)
      setVideoUrl('')
    }
    
    // 清理所有截图URL
    previewScreenshots.forEach(url => revokeFileObjectURL(url))
    setScreenshots([])
    setPreviewScreenshots([])
  }
  
  // 开始提取PPT
  const handleExtractPPT = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedFile) return
    
    setIsExtracting(true)
    setIsPreprocessing(true)
    isPreprocessingRef.current = true
    setExtractionProgress(0)
    setPreprocessProgress(0)
    
    // 清除之前的截图URL
    previewScreenshots.forEach(url => revokeFileObjectURL(url))
    setPreviewScreenshots([])
    setScreenshots([])
    
    const options: LocalVideoProcessingOptions = {
      captureInterval: 3, // 捕获间隔（秒）
      maxScreenshots: 256, // 最大截图数
      // debug: true, // 启用调试输出以便观察webm处理过程
      file: selectedFile // 传递文件信息用于格式检测
    }
    
    const callbacks: LocalVideoProcessingCallbacks = {
      onProgress: (progress: number) => {
        if (isPreprocessingRef.current) {
          // 预处理阶段更新预处理进度
          setPreprocessProgress(progress)
          // 当预处理进度达到100%时，切换到提取阶段
          if (progress >= 100) {
            setIsPreprocessing(false)
            isPreprocessingRef.current = false
            setExtractionProgress(0)
          }
        } else {
          // 正式提取阶段更新提取进度
          setExtractionProgress(progress)
        }
      },
      onFrameCaptured: (blob: Blob, url: string) => {
        // 确保预处理状态已结束
        if (isPreprocessingRef.current) {
          setIsPreprocessing(false)
          isPreprocessingRef.current = false
        }
        
        // 添加新的预览截图，不限制数量
        setPreviewScreenshots(prevUrls => [...prevUrls, url])
        
        // 同时更新screenshots状态，使PPT数量动态更新
        setScreenshots(prev => [...prev, blob])
      },
      onComplete: (newScreenshots: Blob[]) => {
        // 标记所有处理已完成
        setIsPreprocessing(false)
        isPreprocessingRef.current = false
        setIsExtracting(false)
      },
      onDurationDetected: (detectedDurationInfo: VideoDurationInfo) => {
        // 保存时长检测结果
        setDurationInfo(detectedDurationInfo)
        console.log('📊 时长检测完成:', detectedDurationInfo)
      }
    }
    
    try {
      await processLocalVideo(
        videoRef.current,
        canvasRef.current,
        options,
        callbacks
      )
    } catch (error) {
      console.error('提取帧错误:', error)
      setIsPreprocessing(false)
      isPreprocessingRef.current = false
      setIsExtracting(false)
    }
  }
  
  // 创建并下载PPT
  const handleDownloadPPT = async () => {
    if (screenshots.length === 0) return
    
    setIsProcessing(true)
    
    try {
      // 调用新的函数并获取Blob和文件名
      const { pptBlob, fileName } = await generatePptBlob(screenshots)
      // 手动触发下载 (后续会添加triggerBlobDownload辅助函数)
      if (pptBlob && fileName) {
        const url = URL.createObjectURL(pptBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PPT生成或下载错误:', error)
      // 可以考虑在这里设置一个错误状态给用户反馈
    } finally {
      setIsProcessing(false)
    }
  }
  
  // 清理资源
  useEffect(() => {
    return () => {
      // 释放截图URL
      previewUrlsRef.current.forEach(url => {
        try {
          revokeFileObjectURL(url)
        } catch (error) {
          console.warn('清理截图URL时出错:', error)
        }
      })
      
      // 释放视频URL
      if (videoUrlRef.current) {
        try {
          revokeFileObjectURL(videoUrlRef.current)
        } catch (error) {
          console.warn('清理视频URL时出错:', error)
        }
      }
    }
  }, []) // 移除依赖，只在组件卸载时清理

  return (
    <>
      <style jsx>{`
        .scrollbar-visible::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-visible::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .scrollbar-visible::-webkit-scrollbar-thumb {
          background: #000000;
          border-radius: 4px;
          border: 1px solid #ffffff;
        }
        .scrollbar-visible::-webkit-scrollbar-thumb:hover {
          background: #333333;
        }
      `}</style>
      
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          <span className="bg-accent text-light px-3 py-1 border-3 border-black inline-block transform rotate-1">本地视频</span>
          <span className="text-2xl ml-3">转PPT</span>
        </h1>

        <div className="card bg-light mb-8">
          {!selectedFile && (
            <>
              <h2 className="text-2xl font-bold mb-4">{t('uploadVideo')}</h2>
              <p className="mb-6">{t('support')}</p>
              <p className="mb-6 text-sm text-gray-600">
                <strong>🚀 快速检测：</strong> {t('quickDetection')}
              </p>
            </>
          )}
          
          {/* 文件上传区域 */}
          {!selectedFile && (
            <div 
              className={`border-3 border-dashed border-black bg-white p-8 mb-6 text-center ${dragActive ? 'bg-secondary/20' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg mb-4">{t('dragDrop')}</p>
              <p className="text-gray-500 mb-4">- 或者 -</p>
              <label className="btn bg-primary text-light cursor-pointer">
                {t('chooseVideo')}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="video/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
          
          
          
          {/* 视频预览 */}
          {videoUrl && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">{t('videoPreview')}</h3>
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
            <div className="space-y-4">
              <button 
                onClick={handleExtractPPT}
                className="btn bg-primary text-light w-full text-xl py-4 transform hover:rotate-1"
              >
                {t('startExtract')}
                {videoFormat === 'webm' && <span className="ml-2 text-sm">(增强模式)</span>}
              </button>
              <button 
                onClick={handleClearFile}
                className="btn bg-accent text-light w-full py-2 text-sm transform hover:rotate-1"
              >
                {t('chooseAnotherVideo')}
              </button>
            </div>
          )}
          
          {/* 提取中状态 */}
          {isExtracting && (
            <div className="space-y-4">
              <div className="w-full h-6 bg-white border-3 border-black overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: isPreprocessing ? `${preprocessProgress}%` : `${extractionProgress}%` }}
                ></div>
              </div>
              <p className="text-center font-bold">
                {isPreprocessing 
                  ? `${t('preprocessing')} (${preprocessProgress.toFixed(0)}%)` 
                  : `${t('extracting')} (${extractionProgress.toFixed(0)}%)...`
                }
              </p>
              {videoFormat === 'webm' && isPreprocessing && (
                <p className="text-center text-sm text-gray-600">
                  {t('webmEnhanced')}
                </p>
              )}
            </div>
          )}
          
          {/* 隐藏的画布用于处理视频帧 */}
          <canvas ref={canvasRef} className="hidden"></canvas>
          
          {/* PPT预览 */}
          {previewScreenshots.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3">{t('pptPreview')}</h3>
              <div className="relative">
                <div 
                  className="flex overflow-x-auto gap-3 p-4 border-3 border-black bg-white scrollbar-visible"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#000000 #ffffff'
                  }}
                >
                  {previewScreenshots.map((url, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 relative group"
                    >
                      <img 
                        src={url} 
                        alt={`PPT幻灯片 ${index + 1}`} 
                        className="h-32 w-auto border-2 border-black shadow-brutal transition-transform hover:scale-105"
                        style={{ minWidth: '120px' }}
                      />
                      <div className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 py-0.5 rounded opacity-75">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                {previewScreenshots.length > 4 && (
                  <div className="flex justify-center mt-2 text-sm text-gray-600">
                    <span>{t('dragToSeeMore')}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-center mt-2">
                {isExtracting 
                  ? `${t('extracting')} ${screenshots.length} ${t('slides')}` 
                  : `${t('totalSlides')} ${screenshots.length}`
                }
                {durationInfo && !isExtracting && (
                  <span className="ml-2 text-gray-500">
                    ({durationInfo.method} {t('detection')})
                  </span>
                )}
              </p>
            </div>
          )}
          
          {/* 下载按钮 */}
          {screenshots.length > 0 && !isExtracting && (
            <div className="space-y-4">
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
                    {t('generatingPPT')}...
                  </span>
                ) : t('downloadPPT')}
              </button>
              <button 
                onClick={handleClearFile}
                className="btn bg-secondary text-black w-full py-2 text-sm transform hover:rotate-1"
                disabled={isProcessing}
              >
                {t('chooseAnotherVideo')}
              </button>
            </div>
          )}
        </div>

        <div className="card bg-light">
          <h2 className="text-2xl font-bold mb-4">{t('advantages')}</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="bg-primary text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>{t('noServer')}</strong> - {t('privacy')}</p>
            </li>
            <li className="flex items-start">
              <div className="bg-secondary w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>{t('highQuality')}</strong> - {t('accurate')}</p>
            </li>
            <li className="flex items-start">
              <div className="bg-accent text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>{t('quickProcessing')}</strong> - {t('saveTime')}</p>
            </li>
            <li className="flex items-start">
              <div className="bg-yellow-400 w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">⚡</div>
              <p><strong>{t('quickDetectionAlgorithm')}</strong> - {t('ssimImprove')}</p>
            </li>
          </ul>
        </div>

        {/* More Features Section */}
        <div className="card bg-light mt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">探索更多功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              href="/online-video"
              className="group p-6 border-3 border-black bg-white hover:bg-primary hover:text-light transition-all duration-200 transform hover:rotate-1"
            >
              <div className="flex items-center mb-4">
                <div className="bg-primary group-hover:bg-light group-hover:text-black text-light w-12 h-12 rounded-full flex items-center justify-center mr-4 border-3 border-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">在线视频转PPT</h3>
              </div>
              <p className="text-gray-600 group-hover:text-light">
                从YouTube、Bilibili等平台直接转换视频为PPT，支持多种在线视频源
              </p>
            </Link>
            
            <Link 
              href="/screen-recording"
              className="group p-6 border-3 border-black bg-white hover:bg-secondary transition-all duration-200 transform hover:rotate-1"
            >
              <div className="flex items-center mb-4">
                <div className="bg-secondary group-hover:bg-light group-hover:text-black w-12 h-12 rounded-full flex items-center justify-center mr-4 border-3 border-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">屏幕录制转PPT</h3>
              </div>
              <p className="text-gray-600 group-hover:text-black">
                直接录制屏幕内容并实时生成PPT，支持暂停继续和多格式导出
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
    </>
  )
} 