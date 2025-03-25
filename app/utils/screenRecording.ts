/**
 * 格式化录制时间
 * @param seconds 秒数
 * @returns 格式化后的时间字符串 (MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 开始录制
 * @param stream 媒体流
 * @param options 配置项
 */
export const startRecording = (
  stream: MediaStream,
  options: {
    mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
    recordedChunksRef: React.MutableRefObject<Blob[]>,
    setRecordingTime: React.Dispatch<React.SetStateAction<number>>,
    totalRecordedTimeRef: React.MutableRefObject<number>,
    recordingStartTimeRef: React.MutableRefObject<number>,
    lastUpdateTimeRef: React.MutableRefObject<number>,
    isPausedRef: React.MutableRefObject<boolean>,
    lastScreenshotTimeRef: React.MutableRefObject<number>,
    captureScreenshot: () => void,
    onRecordingStateChange: (state: 'recording' | 'paused' | 'idle' | 'ready' | 'processing') => void,
    onError: (error: Error) => void
  }
) => {
  const { 
    mediaRecorderRef, 
    recordedChunksRef, 
    setRecordingTime, 
    totalRecordedTimeRef,
    recordingStartTimeRef,
    lastUpdateTimeRef,
    isPausedRef,
    lastScreenshotTimeRef,
    captureScreenshot,
    onRecordingStateChange,
    onError
  } = options
  
  // 重置状态
  recordedChunksRef.current = []
  setRecordingTime(0)
  totalRecordedTimeRef.current = 0
  recordingStartTimeRef.current = Date.now()
  lastUpdateTimeRef.current = Date.now()
  isPausedRef.current = false
  
  // 设置录制选项
  const recorderOptions = { 
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 3000000 // 3Mbps
  }
  
  try {
    const mediaRecorder = new MediaRecorder(stream, recorderOptions)
    mediaRecorderRef.current = mediaRecorder
    
    // 录制事件处理
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }
    
    mediaRecorder.onstop = () => {
      onRecordingStateChange('processing')
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
    
    onRecordingStateChange('recording')
  } catch (err) {
    console.error('录制初始化失败:', err)
    onError(err instanceof Error ? err : new Error('录制失败，请尝试不同的设置或浏览器'))
  }
} 