'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { calculateImageDifference } from '../utils/videoProcessing'
import { createAndDownloadPPT } from '../utils/pptGeneration'

export default function ScreenRecordingPage() {
  // 录制状态
  const [recordingState, setRecordingState] = useState<'idle' | 'ready' | 'recording' | 'paused' | 'processing'>('idle')
  const [recordingTime, setRecordingTime] = useState<number>(0)
  const [recordingOptions, setRecordingOptions] = useState({
    withAudio: true,
    captureArea: 'screen' as 'screen' | 'window' | 'tab',
  })
  
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
  
  // 截图相关状态
  const [screenshots, setScreenshots] = useState<string[]>([])
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState<number>(-1)
  const [screenshotStats, setScreenshotStats] = useState({ total: 0, saved: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastScreenshotTimeRef = useRef<number>(0)
  const lastImageDataRef = useRef<ImageData | null>(null)
  const diffThreshold = 30 // 图像差异阈值
  
  // 格式化录制时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 切换音频选项
  const handleToggleAudio = () => {
    setRecordingOptions({
      ...recordingOptions,
      withAudio: !recordingOptions.withAudio,
    })
  }

  // 设置捕获区域
  const handleSetCaptureArea = (area: 'screen' | 'window' | 'tab') => {
    setRecordingOptions({
      ...recordingOptions,
      captureArea: area,
    })
  }

  // 开始录制准备
  const handleStartPrepare = async () => {
    try {
      // 请求屏幕共享
      const displayMediaOptions = {
        video: {
          cursor: "always"
        } as any,
        audio: recordingOptions.withAudio
      };
      
      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
      
      // 直接从获取的媒体流开始录制，无需二次选择
      if (recordingOptions.withAudio) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const tracks = [...stream.getTracks(), ...audioStream.getTracks()]
          const combinedStream = new MediaStream(tracks)
          setMediaStream(combinedStream)
          
          if (videoRef.current) {
            videoRef.current.srcObject = combinedStream
          }
        } catch (audioErr) {
          console.error('无法获取麦克风访问权限:', audioErr)
          setMediaStream(stream)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        }
      } else {
        setMediaStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }
      
      // 重置截图数组、索引和最后一帧图像数据
      setScreenshots([])
      setCurrentScreenshotIndex(-1)
      setScreenshotStats({ total: 0, saved: 0 })
      lastImageDataRef.current = null
      lastScreenshotTimeRef.current = Date.now()
      
      // 获取到媒体流后，直接开始录制而不是进入ready状态
      startRecording(stream)
    } catch (err) {
      console.error('无法获取屏幕共享权限:', err)
      alert('屏幕录制需要您的授权，请允许屏幕共享')
    }
  }

  // 截图函数
  const captureScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    // 设置画布尺寸与视频相同
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // 绘制当前视频帧到画布
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // 更新总截图计数
    setScreenshotStats(prev => ({ ...prev, total: prev.total + 1 }))
    
    // 获取当前帧的图像数据
    const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // 检查是否需要保存这一帧（如果是第一帧或者与上一帧差异较大）
    let shouldSave = false
    let difference = 0
    
    if (!lastImageDataRef.current) {
      // 第一帧总是保存
      shouldSave = true
    } else {
      // 计算与上一帧的差异
      difference = calculateImageDifference(lastImageDataRef.current, currentImageData)
      console.log(`图像差异度: ${difference.toFixed(2)}`)
      
      // 差异大于阈值才保存
      shouldSave = difference > diffThreshold
    }
    
    // 更新最后一帧的图像数据，无论是否保存
    lastImageDataRef.current = currentImageData
    
    if (shouldSave) {
      // 将画布内容转换为base64图片
      const screenshot = canvas.toDataURL('image/jpeg', 0.8)
      
      // 更新截图数组
      setScreenshots(prev => [...prev, screenshot])
      // 自动切换到最新截图
      setCurrentScreenshotIndex(prev => prev + 1)
      // 更新保存的截图计数
      setScreenshotStats(prev => ({ ...prev, saved: prev.saved + 1 }))
      
      console.log('保存新截图')
    } else {
      console.log(`跳过相似截图 (差异度: ${difference.toFixed(2)}，小于阈值: ${diffThreshold})`)
    }
  }

  // 处理截图导航
  const handlePreviousScreenshot = () => {
    if (currentScreenshotIndex > 0) {
      setCurrentScreenshotIndex(prev => prev - 1)
    }
  }

  const handleNextScreenshot = () => {
    if (currentScreenshotIndex < screenshots.length - 1) {
      setCurrentScreenshotIndex(prev => prev + 1)
    }
  }

  const handleLatestScreenshot = () => {
    setCurrentScreenshotIndex(screenshots.length - 1)
  }

  // 提取开始录制逻辑为单独函数
  const startRecording = (stream: MediaStream) => {
    // 重置状态
    recordedChunksRef.current = []
    setRecordingTime(0)
    totalRecordedTimeRef.current = 0
    recordingStartTimeRef.current = Date.now()
    lastUpdateTimeRef.current = Date.now()
    isPausedRef.current = false
    
    // 设置录制选项
    const options = { 
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 3000000 // 3Mbps
    }
    
    try {
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      
      // 录制事件处理
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        finishRecording()
      }
      
      // 开始录制
      mediaRecorder.start(1000)
      
      // 使用 requestAnimationFrame 替代 setInterval 提高精度
      const updateTimer = () => {
        if (!isPausedRef.current) {
          const currentTime = Date.now()
          
          // 检查是否需要截图（每3秒）
          if (currentTime - lastScreenshotTimeRef.current >= 3000) {
            captureScreenshot()
            lastScreenshotTimeRef.current = currentTime
          }
          
          // 只有当超过50ms才更新，减少不必要的状态更新
          if (currentTime - lastUpdateTimeRef.current >= 50) {
            const elapsedSinceStart = (currentTime - recordingStartTimeRef.current) / 1000
            const totalTime = Math.floor(totalRecordedTimeRef.current + elapsedSinceStart)
            setRecordingTime(totalTime)
            lastUpdateTimeRef.current = currentTime
          }
        }
        
        // 只有在录制或暂停状态下继续更新
        if (mediaRecorderRef.current && 
            (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
          requestAnimationFrame(updateTimer)
        }
      }
      
      // 启动基于帧动画的计时器
      requestAnimationFrame(updateTimer)
      
      setRecordingState('recording')
    } catch (err) {
      console.error('录制初始化失败:', err)
      alert('录制失败，请尝试不同的设置或浏览器')
    }
  }

  // 保留原函数但不再直接使用它，而是通过startRecording间接调用
  const handleStartRecording = () => {
    if (!mediaStream) return
    startRecording(mediaStream)
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
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      
      setVideoBlob(blob)
      setVideoUrl(url)
      
      // 清理视频预览
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
    
    // 确保当前截图索引指向最新截图
    if (screenshots.length > 0) {
      setCurrentScreenshotIndex(screenshots.length - 1)
    }
    
    setRecordingState('idle')
  }
  
  // 下载录制的视频
  const handleDownloadVideo = () => {
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
    }
  }, [mediaStream, videoUrl])

  // 更新画布显示
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    if (currentScreenshotIndex >= 0 && currentScreenshotIndex < screenshots.length) {
      const img = new Image()
      img.src = screenshots[currentScreenshotIndex]
      img.onload = () => {
        // 设置画布尺寸与图片相同
        canvas.width = img.width
        canvas.height = img.height
        
        // 绘制图片到画布
        context.drawImage(img, 0, 0)
      }
    }
  }, [currentScreenshotIndex, screenshots])

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          <span className="bg-accent text-light px-3 py-1 border-3 border-black inline-block transform rotate-1">实时录屏</span>
          <span className="text-2xl ml-3">转PPT</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-light">
            <h2 className="text-2xl font-bold mb-4">屏幕录制</h2>
            <p className="mb-6">
              录制您的屏幕内容，可以捕获整个屏幕、应用窗口或浏览器标签页。
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
                  <p className="text-xl font-bold">准备好开始录制了吗？</p>
                  <p className="text-gray-400 mt-2">点击下方按钮选择录制内容</p>
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
                  <span>处理中...</span>
                </div>
              )}
            </div>
            
            {/* 录制选项 - 始终显示麦克风设置 */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={recordingOptions.withAudio} 
                    onChange={handleToggleAudio}
                    disabled={recordingState !== 'idle' && recordingState !== 'ready'}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 bg-gray-200 border-3 border-black peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:border-3 after:border-black after:h-5 after:w-5 after:transition-all peer-checked:bg-accent relative ${recordingState !== 'idle' && recordingState !== 'ready' ? 'opacity-70' : ''}`}></div>
                  <span className="ml-3 font-bold">包含麦克风声音</span>
                </label>
              </div>
              
              {(recordingState === 'idle' || recordingState === 'ready') && !videoUrl && (
                <div className="font-bold">
                  捕获区域: {recordingOptions.captureArea === 'screen' ? '整个屏幕' : recordingOptions.captureArea === 'window' ? '应用窗口' : '浏览器标签'}
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
                  开始录制
                </button>
              )}
              
              {(recordingState === 'recording' || recordingState === 'paused') && (
                <>
                  <button 
                    onClick={handlePauseRecording}
                    className="btn bg-primary text-light flex-1"
                  >
                    {recordingState === 'recording' ? '暂停' : '继续'}
                  </button>
                  <button 
                    onClick={handleStopRecording}
                    className="btn bg-accent text-light flex-1"
                  >
                    结束录制
                  </button>
                </>
              )}
              
              {videoUrl && recordingState === 'idle' && (
                <>
                  <button 
                    onClick={handleDownloadVideo}
                    className="btn bg-accent text-light flex-1"
                  >
                    下载视频
                  </button>
                  <button 
                    onClick={() => {
                      // 清理并重置
                      if (videoUrl) {
                        URL.revokeObjectURL(videoUrl)
                      }
                      setVideoBlob(null)
                      setVideoUrl('')
                    }}
                    className="btn bg-light flex-1"
                  >
                    重新录制
                  </button>
                </>
              )}
              
              {recordingState === 'processing' && (
                <div className="w-full text-center py-4">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-bold">处理中，请稍候...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PPT预览区域 */}
          <div className="card bg-light">
            <h2 className="text-2xl font-bold mb-4">PPT预览</h2>
            <p className="mb-6">
              查看从录制视频中自动生成的PPT幻灯片，可以翻阅页面或回到最新内容。
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
                  <p className="text-xl font-bold">尚未生成PPT</p>
                  <p className="text-gray-400 mt-2">录制并处理视频后查看幻灯片</p>
                </div>
              )}
              
              {screenshots.length > 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-3 py-1 text-white font-bold rounded-md">
                  第 {currentScreenshotIndex + 1} / {screenshots.length} 页
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
                  <span className="ml-3 font-bold">自动提取</span>
                </label>
                {recordingState !== 'idle' && (
                  <div className="text-sm font-medium">
                    过滤统计: 保存了 {screenshotStats.saved}/{screenshotStats.total} 张截图
                  </div>
                )}
              </div>
              
              <div className="font-bold">
                当前页: <span>{currentScreenshotIndex + 1}</span> / <span>{screenshots.length}</span>
              </div>
            </div>
            
            {/* PPT控制按钮 */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handlePreviousScreenshot}
                disabled={currentScreenshotIndex <= 0 || screenshots.length === 0}
                className={`btn flex-1 ${currentScreenshotIndex <= 0 || screenshots.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-light'}`}
              >
                上一页
              </button>
              <button 
                onClick={handleNextScreenshot}
                disabled={currentScreenshotIndex >= screenshots.length - 1 || screenshots.length === 0}
                className={`btn flex-1 ${currentScreenshotIndex >= screenshots.length - 1 || screenshots.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-accent text-light'}`}
              >
                下一页
              </button>
              
              {/* 录制过程中显示回到最新按钮，录制结束后显示下载PPT按钮 */}
              {recordingState === 'recording' || recordingState === 'paused' ? (
                <button 
                  onClick={handleLatestScreenshot}
                  disabled={currentScreenshotIndex >= screenshots.length - 1 || screenshots.length === 0}
                  className={`btn flex-1 ${currentScreenshotIndex >= screenshots.length - 1 || screenshots.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-light'}`}
                >
                  回到最新
                </button>
              ) : (
                <button 
                  onClick={handleDownloadPPT}
                  disabled={screenshots.length === 0}
                  className={`btn flex-1 ${screenshots.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-accent text-light'}`}
                >
                  下载PPT
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-light mt-8">
          <h2 className="text-2xl font-bold mb-4">屏幕录制功能说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="bg-primary text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>多种录制模式</strong> - 支持录制整个屏幕、单个应用窗口或浏览器标签页</p>
            </div>
            <div className="flex items-start">
              <div className="bg-secondary w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>音频捕获</strong> - 可选择是否包含麦克风声音</p>
            </div>
            <div className="flex items-start">
              <div className="bg-accent text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>录制控制</strong> - 提供暂停/继续功能，灵活控制录制过程</p>
            </div>
            <div className="flex items-start">
              <div className="bg-primary text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>视频下载</strong> - 录制完成后可立即下载高质量WebM格式视频</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 