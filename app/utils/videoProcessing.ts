/**
 * 计算两个ImageData对象之间的差异
 * @param imgData1 第一个ImageData对象
 * @param imgData2 第二个ImageData对象
 * @returns 差异值，数值越大表示差异越大
 */
export const calculateImageDifference = (imgData1: ImageData, imgData2: ImageData): number => {
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

/**
 * 从视频中提取帧
 * @param video HTML视频元素
 * @param canvas HTML画布元素
 * @param currentTime 当前时间点（秒）
 * @returns Promise包含画布的Blob对象
 */
export const captureVideoFrame = (
  video: HTMLVideoElement, 
  canvas: HTMLCanvasElement, 
  currentTime: number
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    video.currentTime = currentTime
    
    video.onseeked = () => {
      const context = canvas.getContext('2d')
      if (!context) {
        resolve(null)
        return
      }
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.95)
    }
  })
}

/**
 * 设置视频和画布尺寸
 * @param video HTML视频元素
 * @param canvas HTML画布元素
 */
export const setupVideoCanvas = (video: HTMLVideoElement, canvas: HTMLCanvasElement): void => {
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
}

/**
 * 处理视频并提取有意义的帧作为PPT幻灯片
 * @param video HTML视频元素
 * @param canvas HTML画布元素
 * @param options 提取选项
 * @param callbacks 回调函数
 */
export const extractFramesFromVideo = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  options: {
    captureInterval: number,
    differenceThreshold: number,
    maxScreenshots: number
  },
  callbacks: {
    onProgress: (progress: number) => void,
    onFrameCaptured: (blob: Blob, url: string) => void,
    onComplete: (screenshots: Blob[]) => void
  }
): Promise<void> => {
  const { captureInterval, differenceThreshold, maxScreenshots } = options
  const { onProgress, onFrameCaptured, onComplete } = callbacks
  
  const context = canvas.getContext('2d')
  if (!context) return
  
  setupVideoCanvas(video, canvas)
  
  let currentTime = 0
  const totalDuration = video.duration
  let previousImageData: ImageData | null = null
  const newScreenshots: Blob[] = []
  let noNewScreenshotCount = 0
  
  const captureFrame = async (): Promise<void> => {
    video.currentTime = currentTime
    
    return new Promise<void>((resolve) => {
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
                onFrameCaptured(blob, url)
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
              onFrameCaptured(blob, url)
            }
            resolve()
          }, 'image/jpeg', 0.95)
        }
        
        previousImageData = currentImageData
      }
    })
  }
  
  // 播放视频一段时间确保元数据已加载
  video.play()
  await new Promise(resolve => setTimeout(resolve, 500))
  video.pause()
  
  try {
    while (currentTime <= totalDuration && noNewScreenshotCount < 10) {
      await captureFrame()
      currentTime += captureInterval
      onProgress(Math.min((currentTime / totalDuration) * 100, 100))
      
      if (newScreenshots.length >= maxScreenshots) {
        break
      }
    }
  } catch (error) {
    console.error('提取视频帧错误:', error)
  } finally {
    onComplete(newScreenshots)
  }
} 