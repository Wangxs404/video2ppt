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
 * 从视频中截取当前帧并检查是否需要保存
 * @param options 截图选项
 * @returns 是否保存了新截图
 */
export const captureAndFilterScreenshot = (
  options: {
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    lastImageDataRef: React.MutableRefObject<ImageData | null>,
    diffThreshold: number,
    onScreenshotCaptured: (screenshotUrl: string) => void,
    onStatsUpdate: () => void
  }
): boolean => {
  const { 
    videoRef, 
    canvasRef, 
    lastImageDataRef, 
    diffThreshold,
    onScreenshotCaptured,
    onStatsUpdate
  } = options
  
  if (!videoRef.current || !canvasRef.current) return false
  
  const video = videoRef.current
  const canvas = canvasRef.current
  const context = canvas.getContext('2d')
  
  if (!context) return false
  
  // 设置画布尺寸与视频相同
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  // 绘制当前视频帧到画布
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  // 更新总截图计数
  onStatsUpdate()
  
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
    
    // 调用回调函数通知外部保存截图
    onScreenshotCaptured(screenshot)
    
    console.log('保存新截图')
    return true
  } else {
    console.log(`跳过相似截图 (差异度: ${difference.toFixed(2)}，小于阈值: ${diffThreshold})`)
    return false
  }
}

/**
 * 更新画布显示特定索引的截图
 * @param options 画布显示选项
 */
export const updateCanvasWithScreenshot = (
  options: {
    canvasRef: React.RefObject<HTMLCanvasElement>,
    screenshotUrl: string
  }
): void => {
  const { canvasRef, screenshotUrl } = options
  
  if (!canvasRef.current) return
  
  const canvas = canvasRef.current
  const context = canvas.getContext('2d')
  
  if (!context) return
  
  const img = new Image()
  img.src = screenshotUrl
  img.onload = () => {
    // 设置画布尺寸与图片相同
    canvas.width = img.width
    canvas.height = img.height
    
    // 绘制图片到画布
    context.drawImage(img, 0, 0)
  }
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

/**
 * 使用ffmpeg.wasm将WebM格式视频转换为MP4格式
 * @param webmBlob WebM格式的视频Blob对象
 * @param options 可选配置项
 * @param callbacks 回调函数
 * @returns Promise包含转换后的MP4 Blob对象
 */
export const convertWebmToMp4 = async (
  webmBlob: Blob,
  options: {
    quality?: 'low' | 'medium' | 'high';
    showLogs?: boolean;
  } = { quality: 'medium', showLogs: false },
  callbacks?: {
    onProgress?: (progress: number) => void;
    onLog?: (message: string) => void;
  }
): Promise<Blob> => {
  // 动态导入ffmpeg模块，这样不会增加初始加载时间
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { fetchFile, toBlobURL } = await import('@ffmpeg/util');
  
  // 创建FFmpeg实例
  const ffmpeg = new FFmpeg();
  
  // 设置日志回调
  if (options.showLogs || callbacks?.onLog) {
    ffmpeg.on('log', ({ message }: { message: string }) => {
      console.log('[FFmpeg]', message);
      if (callbacks?.onLog) {
        callbacks.onLog(message);
      }
    });
  }
  
  // 设置进度回调
  if (callbacks?.onProgress) {
    ffmpeg.on('progress', ({ progress }: { progress: number }) => {
      if (callbacks.onProgress) {
        callbacks.onProgress(progress);
      }
    });
  }
  
  try {
    // 加载ffmpeg核心
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    // 写入WebM文件到ffmpeg的虚拟文件系统
    await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
    
    // 根据质量设置转换参数
    let crf = '23'; // 默认中等质量
    let preset = 'medium';
    
    switch (options.quality) {
      case 'low':
        crf = '28';
        preset = 'veryfast';
        break;
      case 'high':
        crf = '18';
        preset = 'slow';
        break;
    }
    
    // 执行转换命令
    await ffmpeg.exec([
      '-i', 'input.webm',
      '-c:v', 'libx264',  // 视频编码器
      '-c:a', 'aac',      // 音频编码器
      '-b:a', '128k',     // 音频比特率
      '-preset', preset,  // 编码速度预设
      '-crf', crf,        // 视频质量参数 (较低的值 = 更高的质量)
      '-pix_fmt', 'yuv420p', // 像素格式，确保兼容性
      'output.mp4'
    ]);
    
    // 读取输出文件
    const data = await ffmpeg.readFile('output.mp4');
    
    // 创建MP4 Blob对象
    // 处理可能的类型差异
    if (typeof data === 'string') {
      // 如果是字符串（可能是base64），转换为Uint8Array
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes], { type: 'video/mp4' });
    } else if (data instanceof Uint8Array) {
      // 直接使用Uint8Array
      return new Blob([data], { type: 'video/mp4' });
    } else {
      // 安全地尝试转换为Uint8Array
      try {
        // 首先尝试将数据视为ArrayBuffer
        const uint8Array = new Uint8Array(data as ArrayBuffer);
        return new Blob([uint8Array], { type: 'video/mp4' });
      } catch (e) {
        console.error('无法处理输出数据类型:', e);
        throw new Error('转换成功但无法处理输出格式');
      }
    }
  } catch (error) {
    console.error('视频转换失败:', error);
    throw new Error(`视频转换失败: ${error}`);
  } finally {
    // 尝试终止FFmpeg实例以释放资源
    try {
      await ffmpeg.terminate();
    } catch (e) {
      console.warn('FFmpeg实例终止失败:', e);
    }
  }
}; 