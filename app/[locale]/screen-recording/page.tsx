'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { calculateImageDifference, captureAndFilterScreenshot, updateCanvasWithScreenshot, convertWebmToMp4 } from '../../utils/videoProcessing'
import { createAndDownloadPPT } from '../../utils/pptGeneration'
import { formatTime, startRecording } from '../../utils/screenRecording'
import { 
  navigateToPreviousScreenshot, 
  navigateToNextScreenshot, 
  navigateToLatestScreenshot,
  resetScreenshotNavigation
} from '../../utils/screenshotNavigation'

export default function ScreenRecordingPage() {
  const t = useTranslations('ScreenRecording')
  
  // 录制状态
  const [recordingState, setRecordingState] = useState<'idle' | 'ready' | 'recording' | 'paused' | 'processing' | 'converting'>('idle')
  const [recordingTime, setRecordingTime] = useState<number>(0)
  
  // 视频录制相关
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 优化计时器逻辑的引用
  const recordingStartTimeRef = useRef<number>(0)
  const totalRecordedTimeRef = useRef<number>(0)
  const isPausedRef = useRef<boolean>(false)
  const lastUpdateTimeRef = useRef<number>(0)
  
  // 视频输出
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [mp4Url, setMp4Url] = useState<string>('')
  const [conversionProgress, setConversionProgress] = useState<number>(0)
  const [isConverting, setIsConverting] = useState<boolean>(false)
  
  // 截图相关状态
  const [screenshots, setScreenshots] = useState<string[]>([])
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState<number>(-1)
  const [screenshotStats, setScreenshotStats] = useState({ total: 0, saved: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastScreenshotTimeRef = useRef<number>(0)
  const lastImageDataRef = useRef<ImageData | null>(null)
  const diffThreshold = 30 // 图像差异阈值

  // 截图函数
  const captureScreenshot = () => {
    captureAndFilterScreenshot({
      videoRef,
      canvasRef,
      lastImageDataRef,
      diffThreshold,
      onScreenshotCaptured: (screenshot) => {
        setScreenshots(prev => [...prev, screenshot])
        setCurrentScreenshotIndex(prev => prev + 1)
        setScreenshotStats(prev => ({ ...prev, saved: prev.saved + 1 }))
      },
      onStatsUpdate: () => {
        setScreenshotStats(prev => ({ ...prev, total: prev.total + 1 }))
      }
    })
  }

  // 处理截图导航
  const handlePreviousScreenshot = () => {
    navigateToPreviousScreenshot(currentScreenshotIndex, setCurrentScreenshotIndex)
  }

  const handleNextScreenshot = () => {
    navigateToNextScreenshot(currentScreenshotIndex, screenshots.length - 1, setCurrentScreenshotIndex)
  }

  const handleLatestScreenshot = () => {
    navigateToLatestScreenshot(screenshots.length - 1, setCurrentScreenshotIndex)
  }

  // 开始录制准备
  const handleStartPrepare = async () => {
    try {
      // 请求屏幕共享，包含系统音频
      const displayMediaOptions = {
        video: {
          cursor: "always",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } as any,
        audio: true, // 录制系统音频
        selfBrowserSurface: "include" // 允许录制当前标签页
      };
      
      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      
      console.log('屏幕捕获 - 音频轨道数量:', stream.getAudioTracks().length, '视频轨道数量:', stream.getVideoTracks().length);
      
      if (stream.getAudioTracks().length > 0) {
        stream.getAudioTracks().forEach(track => {
          console.log('系统音频轨道信息:', {
            id: track.id,
            label: track.label,
            enabled: track.enabled,
            muted: track.muted
          });
        });
      }
      
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // 避免回声，不影响录制
      }
      
      // 重置截图数组、索引和最后一帧图像数据
      resetScreenshotNavigation({
        setScreenshots,
        setCurrentIndex: setCurrentScreenshotIndex,
        setStats: setScreenshotStats,
        lastImageDataRef
      });
      lastScreenshotTimeRef.current = Date.now();
      
      // 开始录制
      handleStartRecording(stream);
    } catch (err) {
      console.error('无法获取屏幕共享权限:', err);
      // 根据错误类型提供更具体的指导
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          alert('录制被取消。请重新点击"开始录制"，并在弹出的对话框中选择"整个屏幕"或您想录制的显示器。');
        } else if (err.name === 'NotFoundError') {
          alert('未找到可录制的屏幕。请确保您的设备支持屏幕录制功能。');
        } else {
          alert('屏幕录制失败。请重新尝试，并在弹出的对话框中选择"整个屏幕"选项。');
        }
      } else {
        alert('屏幕录制失败。请重新尝试，并在弹出的对话框中选择"整个屏幕"选项。');
      }
    }
  }

  // 提取开始录制逻辑为单独函数
  const handleStartRecording = (stream: MediaStream) => {
    startRecording(stream, {
      mediaRecorderRef,
      recordedChunksRef,
      setRecordingTime,
      totalRecordedTimeRef,
      recordingStartTimeRef,
      lastUpdateTimeRef,
      isPausedRef,
      lastScreenshotTimeRef,
      captureScreenshot,
      onRecordingStateChange: setRecordingState,
      onError: (error: Error) => alert(error.message)
    })
  }

  // 暂停/恢复录制
  const handlePauseRecording = () => {
    if (!mediaRecorderRef.current) return
    
    if (recordingState === 'recording') {
      mediaRecorderRef.current.pause()
      
      // 更新暂停时的时间记录
      isPausedRef.current = true
      const currentTime = Date.now()
      const elapsedSinceStart = (currentTime - recordingStartTimeRef.current) / 1000
      totalRecordedTimeRef.current += elapsedSinceStart
      
      setRecordingState('paused')
    } else if (recordingState === 'paused') {
      mediaRecorderRef.current.resume()
      
      // 更新继续录制的记录
      isPausedRef.current = false
      recordingStartTimeRef.current = Date.now() // 重新设置起始时间点
      
      setRecordingState('recording')
    }
  }

  // 停止录制
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recordingState !== 'idle') {
      // 先计算并更新最终时间
      if (recordingState === 'recording') {
        const currentTime = Date.now()
        const elapsedSinceStart = (currentTime - recordingStartTimeRef.current) / 1000
        const finalTime = Math.floor(totalRecordedTimeRef.current + elapsedSinceStart)
        setRecordingTime(finalTime)
      }
      
      mediaRecorderRef.current.stop()
      
      // 停止所有计时器 (虽然我们现在使用requestAnimationFrame，不需要清除interval)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      // 停止所有媒体轨道
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
      
      setRecordingState('processing')
    }
  }
  
  // 完成录制处理
  const finishRecording = () => {
    if (recordedChunksRef.current.length > 0) {
      // 检查录制的数据块
      console.log(`录制完成 - 共有 ${recordedChunksRef.current.length} 个数据块`);
      
      // 计算总数据大小
      const totalSize = recordedChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
      console.log(`总数据大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
      
      // 尝试自动检测最佳编码器
      let mimeType = 'video/webm';
      
      // 检查第一个数据块的类型，如果存在
      if (recordedChunksRef.current[0]?.type) {
        mimeType = recordedChunksRef.current[0].type;
        console.log(`使用数据块原始MIME类型: ${mimeType}`);
      } else {
        // 如果没有类型，使用包含音频编解码器的默认设置（因为始终录制系统音频）
        mimeType = 'video/webm; codecs="vp8,opus"';
        console.log(`未检测到数据块类型，使用默认MIME类型: ${mimeType}`);
      }
      
      // 确保MIME类型包含音频编解码器（因为始终录制系统音频）
      if (!mimeType.includes('opus')) {
        console.log('MIME类型不包含音频编解码器，尝试添加');
        if (mimeType.includes('codecs')) {
          // 已有编解码器声明，尝试添加音频编解码器
          if (mimeType.includes('vp8') && !mimeType.includes('opus')) {
            mimeType = 'video/webm; codecs="vp8,opus"';
          } else if (mimeType.includes('vp9') && !mimeType.includes('opus')) {
            mimeType = 'video/webm; codecs="vp9,opus"';
          }
        } else {
          // 没有编解码器声明，添加完整声明
          mimeType = 'video/webm; codecs="vp8,opus"';
        }
        console.log(`修正后的MIME类型: ${mimeType}`);
      }
      
      // 创建Blob
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // 记录Blob信息以便调试
      console.log(`视频生成完成:
        - 大小: ${(blob.size / 1024 / 1024).toFixed(2)}MB
        - 类型: ${blob.type}
        - 数据块数: ${recordedChunksRef.current.length}
        - 第一块大小: ${recordedChunksRef.current[0] ? (recordedChunksRef.current[0].size / 1024).toFixed(2) + 'KB' : '无'}
      `);
      
      // 验证生成的Blob
      if (blob.size < 1000) {
        console.error('警告: 生成的视频文件异常小，可能没有正确录制');
      }
      
      setVideoBlob(blob);
      setVideoUrl(url);
      
      // 清理视频预览
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      console.error('没有录制到任何数据');
      alert('录制失败，未捕获到任何数据');
    }
    
    // 确保当前截图索引指向最新截图
    if (screenshots.length > 0) {
      setCurrentScreenshotIndex(screenshots.length - 1);
    }
    
    setRecordingState('idle');
  }
  
  // 转换视频为MP4格式
  const handleConvertToMp4 = async () => {
    if (!videoBlob) return
    
    try {
      setIsConverting(true)
      setConversionProgress(0)
      
      // 转换为MP4
      const mp4Blob = await convertWebmToMp4(
        videoBlob,
        { quality: 'medium', showLogs: true },
        { 
          onProgress: (progress) => {
            setConversionProgress(Math.floor(progress * 100))
          }
        }
      )
      
      // 创建URL并设置
      const mp4URL = URL.createObjectURL(mp4Blob)
      setMp4Url(mp4URL)
      
      // 下载MP4文件
      const a = document.createElement('a')
      a.href = mp4URL
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      a.download = `screen-recording-${timestamp}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error('转换视频失败:', error)
      alert('转换为MP4格式失败，请重试或选择WebM格式下载')
    } finally {
      setIsConverting(false)
    }
  }
  
  // 下载原始WebM视频
  const handleDownloadWebM = () => {
    if (!videoBlob) return
    
    const a = document.createElement('a')
    a.href = videoUrl
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    a.download = `screen-recording-${timestamp}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  
  // 下载PPT处理函数
  const handleDownloadPPT = async () => {
    if (screenshots.length === 0) return
    
    try {
      // 将base64字符串转换为Blob对象
      const screenshotBlobs = await Promise.all(
        screenshots.map(async (dataUrl) => {
          const response = await fetch(dataUrl)
          return await response.blob()
        })
      )
      
      // 调用PPT生成和下载函数
      await createAndDownloadPPT(screenshotBlobs)
    } catch (error) {
      console.error('生成PPT失败:', error)
      alert('生成PPT失败，请重试')
    }
  }
  
  // 清理资源
  useEffect(() => {
    return () => {
      // 停止所有计时器
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // 停止媒体流
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
      
      // 释放所有Blob URLs
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
      
      if (mp4Url) {
        URL.revokeObjectURL(mp4Url)
      }
    }
  }, [mediaStream, videoUrl, mp4Url])

  // 更新画布显示
  useEffect(() => {
    if (currentScreenshotIndex >= 0 && currentScreenshotIndex < screenshots.length) {
      updateCanvasWithScreenshot({
        canvasRef,
        screenshotUrl: screenshots[currentScreenshotIndex]
      })
    }
  }, [currentScreenshotIndex, screenshots])

  // 设置finishRecording为mediaRecorder的onstop回调
  useEffect(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = finishRecording
    }
  }, [mediaRecorderRef.current])

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          <span className=" bg-secondary text-black px-3 py-1 border-3 border-black inline-block transform rotate-1">{t('title')}</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-light">
            <h2 className="text-2xl font-bold mb-4">{t('screenRecording')}</h2>
            <p className="mb-6">
              {t('description')}
            </p>
            
            {/* 录制预览区域 */}
            <div className="border-3 border-black bg-dark aspect-video mb-6 relative overflow-hidden">
              {/* 视频预览 */}
              <video 
                ref={videoRef}
                autoPlay 
                muted
                playsInline
                className={`w-full h-full object-contain ${recordingState === 'idle' ? 'hidden' : ''}`}
              ></video>
              
              {recordingState === 'idle' && !videoUrl ? (
                <div className="absolute inset-0 flex items-center justify-center flex-col text-light">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xl font-bold">{t('readyToRecord')}</p>
                  <p className="text-gray-400 mt-2">{t('selectFullScreen')}</p>
                </div>
              ) : recordingState === 'recording' || recordingState === 'paused' ? (
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${recordingState === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                  <div className="bg-black bg-opacity-50 px-3 py-1 text-white font-bold rounded-md">
                    {formatTime(recordingTime)}
                  </div>
                </div>
              ) : videoUrl ? (
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full h-full"
                ></video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-light">
                  <svg className="animate-spin -ml-1 mr-3 h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('processing')}</span>
                </div>
              )}
            </div>
            
            {/* 录制控制按钮 */}
            <div className="flex flex-wrap gap-4">
              {recordingState === 'idle' && !videoUrl && (
                <button 
                  onClick={handleStartPrepare}
                  className="btn bg-primary text-light flex-1"
                >
                  {t('startRecording')}
                </button>
              )}
              
              {(recordingState === 'recording' || recordingState === 'paused') && (
                <>
                  <button 
                    onClick={handlePauseRecording}
                    className="btn bg-primary text-light flex-1"
                  >
                    {recordingState === 'recording' ? t('pause') : t('continue')}
                  </button>
                  <button 
                    onClick={handleStopRecording}
                    className="btn bg-accent text-light flex-1"
                  >
                    {t('stopRecording')}
                  </button>
                </>
              )}
              
              {videoUrl && recordingState === 'idle' && (
                <>
                  <div className="w-full flex flex-col gap-3">
                    <div className="flex flex-row gap-2 w-full">
                      <button 
                        onClick={handleDownloadWebM}
                        className="btn bg-accent text-light w-1/2"
                      >
                        {t('downloadWebM')}
                      </button>
                      <button 
                        onClick={handleConvertToMp4}
                        disabled={isConverting}
                        className={`btn ${isConverting ? 'bg-gray-400' : 'bg-primary'} text-light w-1/2 relative overflow-hidden`}
                      >
                        {isConverting ? (
                          <>
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t('converting')}
                            </span>
                            {/* 进度条 */}
                            <div className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: `${conversionProgress}%` }}></div>
                          </>
                        ) : (
                          t('downloadMP4')
                        )}
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        // 清理并重置
                        if (videoUrl) {
                          URL.revokeObjectURL(videoUrl)
                        }
                        if (mp4Url) {
                          URL.revokeObjectURL(mp4Url)
                        }
                        setVideoBlob(null)
                        setVideoUrl('')
                        setMp4Url('')
                      }}
                      className="btn bg-light w-full"
                      disabled={isConverting}
                    >
                      {t('reRecord')}
                    </button>
                  </div>
                </>
              )}
              
              {recordingState === 'processing' && (
                <div className="w-full text-center py-4">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-bold">{t('processingPlease')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PPT预览区域 */}
          <div className="card bg-light">
            <h2 className="text-2xl font-bold mb-4">{t('pptPreview')}</h2>
            <p className="mb-6">
              {t('pptDescription')}
            </p>
            
            {/* PPT预览画布区域 */}
            <div className="border-3 border-black bg-dark aspect-video mb-6 relative overflow-hidden">
              {/* 画布预览 */}
              <canvas 
                ref={canvasRef}
                className="w-full h-full object-contain"
              ></canvas>
              
              {screenshots.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center flex-col text-light">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-xl font-bold">{t('noPptGenerated')}</p>
                  <p className="text-gray-400 mt-2">{t('recordToView')}</p>
                </div>
              )}
            </div>
            
            {/* PPT控制选项 */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={true}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 border-3 border-black peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:border-3 after:border-black after:h-5 after:w-5 after:transition-all peer-checked:bg-accent relative"></div>
                  <span className="ml-3 font-bold">{t('autoExtract')}</span>
                </label>
              </div>
              
              <div className="font-bold">
                {t('currentPage')}: <span>{currentScreenshotIndex + 1}</span> / <span>{screenshots.length}</span>
              </div>
            </div>
            
            {/* PPT控制按钮 */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handlePreviousScreenshot}
                disabled={currentScreenshotIndex <= 0 || screenshots.length === 0}
                className={`btn flex-1 ${currentScreenshotIndex <= 0 || screenshots.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-light'}`}
              >
                {t('previousPage')}
              </button>
              <button 
                onClick={handleNextScreenshot}
                disabled={currentScreenshotIndex >= screenshots.length - 1 || screenshots.length === 0}
                className={`btn flex-1 ${currentScreenshotIndex >= screenshots.length - 1 || screenshots.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-accent text-light'}`}
              >
                {t('nextPage')}
              </button>
              
              {/* 录制过程中显示回到最新按钮，录制结束后显示下载PPT按钮 */}
              {recordingState === 'recording' || recordingState === 'paused' ? (
                <button 
                  onClick={handleLatestScreenshot}
                  disabled={currentScreenshotIndex >= screenshots.length - 1 || screenshots.length === 0}
                  className={`btn flex-1 ${currentScreenshotIndex >= screenshots.length - 1 || screenshots.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-light'}`}
                >
                  {t('backToLatest')}
                </button>
              ) : (
                <button 
                  onClick={handleDownloadPPT}
                  disabled={screenshots.length === 0}
                  className={`btn flex-1 ${screenshots.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-accent text-light'}`}
                >
                  {t('downloadPPT')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-light mt-8">
          <h2 className="text-2xl font-bold mb-4">{t('features.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="bg-primary text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p>{t('features.fullScreen')}</p>
            </div>
            <div className="flex items-start">
              <div className="bg-secondary w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p>{t('features.systemAudio')}</p>
            </div>
            <div className="flex items-start">
              <div className="bg-accent text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p>{t('features.recordControl')}</p>
            </div>
            <div className="flex items-start">
              <div className="bg-primary text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p>{t('features.multiFormat')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 