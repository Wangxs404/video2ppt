/**
 * 本地视频处理相关函数
 * 专门用于处理本地上传的视频文件，包括预处理和提取算法
 */

import { calculateImageDifference, setupVideoCanvas } from './videoProcessing'

/**
 * 本地视频处理配置接口
 */
export interface LocalVideoProcessingOptions {
  captureInterval: number      // 捕获间隔（秒）
  maxScreenshots: number       // 最大截图数
  preProcessInterval?: number  // 预处理间隔（秒）
  debug?: boolean              // 是否打印调试信息，默认false
}

/**
 * 本地视频处理回调接口
 */
export interface LocalVideoProcessingCallbacks {
  onProgress: (progress: number) => void
  onFrameCaptured: (blob: Blob, url: string) => void
  onComplete: (screenshots: Blob[]) => void
}

/**
 * 预处理：计算视频中相邻帧的差异度平均值作为阈值
 * @param video HTML视频元素
 * @param canvas HTML画布元素
 * @param debug 是否打印调试信息
 * @param onProgress 进度回调函数
 * @returns Promise包含差异度平均值
 */
export const preprocessVideo = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  debug: boolean = false,
  onProgress?: (progress: number) => void
): Promise<number> => {
  if (debug) console.log('🚀 开始预处理，计算差异度平均值...')
  
  const context = canvas.getContext('2d')
  if (!context) throw new Error('无法获取canvas context')
  
  setupVideoCanvas(video, canvas)
  
  const totalDuration = video.duration
  if (debug) console.log(`📺 视频总时长: ${totalDuration.toFixed(1)}秒 (${(totalDuration / 60).toFixed(1)}分钟)`)
  
  // 根据视频时长动态计算预处理间隔
  let sampleCount: number
  let preProcessInterval: number
  
  if (totalDuration < 600) { // 小于10分钟
    sampleCount = 20
    if (debug) console.log('📊 视频时长 < 10分钟，使用20份均分采样')
  } else if (totalDuration < 1800) { // 10-30分钟
    sampleCount = 50
    if (debug) console.log('📊 视频时长 10-30分钟，使用50份均分采样')
  } else if (totalDuration < 3600) { // 30-60分钟
    sampleCount = 100
    if (debug) console.log('📊 视频时长 30-60分钟，使用100份均分采样')
  } else { // 大于60分钟
    sampleCount = 150
    if (debug) console.log('📊 视频时长 > 60分钟，使用150份均分采样')
  }
  
  preProcessInterval = totalDuration / sampleCount
  if (debug) console.log(`📊 计算预处理间隔: ${preProcessInterval.toFixed(2)}秒，预计采样 ${sampleCount} 个点`)
  
  let currentTime = 0
  let previousImageData: ImageData | null = null
  const differences: number[] = []
  let skipCount = 0
  let processedCount = 0
  
  // 播放视频一段时间确保元数据已加载
  video.play()
  await new Promise(resolve => setTimeout(resolve, 500))
  video.pause()
  
  /**
   * 安全的预处理跳转函数
   */
  const seekToTimePreprocess = (time: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        if (debug) console.warn(`⚠️ 预处理跳转超时，时间点: ${time.toFixed(1)}s`)
        resolve(false)
      }, 2000) // 预处理使用更短的超时时间
      
      const onSeeked = () => {
        clearTimeout(timeoutId)
        video.removeEventListener('seeked', onSeeked)
        resolve(true)
      }
      
      video.addEventListener('seeked', onSeeked)
      video.currentTime = time
    })
  }
  
  const capturePreProcessFrame = async (time: number): Promise<void> => {
    const seekSuccess = await seekToTimePreprocess(time)
    
    if (!seekSuccess) {
      skipCount++
      if (debug) console.log(`⏭️ 预处理跳过时间点 ${time.toFixed(1)}s`)
      return
    }
    
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      if (previousImageData) {
        const difference = calculateImageDifference(previousImageData, currentImageData)
        differences.push(difference)
        if (debug) console.log(`⏱️ 时间点 ${time.toFixed(1)}s: 差异度 = ${difference.toFixed(2)}`)
      }
      
      previousImageData = currentImageData
    } catch (error) {
      if (debug) console.warn(`⚠️ 预处理时间点 ${time.toFixed(1)}s 出错:`, error)
      skipCount++
    }
    
    // 更新处理计数和进度
    processedCount++
    if (onProgress) {
      const progress = Math.min((processedCount / sampleCount) * 100, 100)
      onProgress(progress)
    }
  }
  
  try {
    // 按动态计算的间隔采样
    while (currentTime <= totalDuration) {
      await capturePreProcessFrame(currentTime)
      currentTime += preProcessInterval
      
      // 如果跳过太多，停止预处理
      if (skipCount > sampleCount * 0.3) { // 跳过超过30%就停止
        if (debug) console.warn('⚠️ 预处理跳过过多，使用默认阈值')
        break
      }
    }
    
    // 确保进度达到100%
    if (onProgress) {
      onProgress(100)
    }
    
    if (differences.length === 0) {
      if (debug) console.log(`📊 预处理完成！使用默认阈值: 30`)
      return 30
    }
    
    // 如果样本太少，适当降低阈值
    if (differences.length < 3) {
      if (debug) console.log(`📊 预处理样本较少(${differences.length}个)，使用保守阈值: 25`)
      return 25
    }
    
    // 排序差异度数组
    const sortedDifferences = [...differences].sort((a, b) => a - b)
    
    // 计算统计值
    const minDiff = sortedDifferences[0]
    const maxDiff = sortedDifferences[sortedDifferences.length - 1]
    const medianDiff = sortedDifferences[Math.floor(sortedDifferences.length / 2)]
    const averageDiff = differences.reduce((sum, diff) => sum + diff, 0) / differences.length
    
    // 去除极值后计算平均值（去除最高和最低的20%）
    const trimStart = Math.floor(differences.length * 0.2)
    const trimEnd = Math.ceil(differences.length * 0.8)
    const trimmedDifferences = sortedDifferences.slice(trimStart, trimEnd)
    const trimmedAverage = trimmedDifferences.length > 0 
      ? trimmedDifferences.reduce((sum, diff) => sum + diff, 0) / trimmedDifferences.length 
      : averageDiff
    
    // 选择更合理的阈值：使用中位数和修剪平均值的较小者，并确保不会太高
    let finalThreshold = Math.min(medianDiff, trimmedAverage)
    
    // 设置合理的阈值范围
    finalThreshold = Math.max(10, Math.min(finalThreshold, 60))
    
    if (debug) {
      console.log(`📊 预处理完成！`)
      console.log(`📊 预期采样 ${sampleCount} 个点，实际采样 ${differences.length} 个点，跳过 ${skipCount} 个点`)
      console.log(`📊 采样间隔: ${preProcessInterval.toFixed(2)}秒`)
      console.log(`📊 差异度统计:`)
      console.log(`📊   最小值: ${minDiff.toFixed(2)}`)
      console.log(`📊   最大值: ${maxDiff.toFixed(2)}`)
      console.log(`📊   中位数: ${medianDiff.toFixed(2)}`)
      console.log(`📊   平均值: ${averageDiff.toFixed(2)}`)
      console.log(`📊   修剪平均值: ${trimmedAverage.toFixed(2)}`)
      console.log(`📊 最终阈值: ${finalThreshold.toFixed(2)}`)
    }
    
    return finalThreshold
    
  } catch (error) {
    console.error('预处理错误:', error)
    return 30 // 返回默认阈值
  }
}

/**
 * 安全的视频跳转函数，支持重试
 * @param video HTML视频元素
 * @param time 目标时间点（秒）
 * @param totalDuration 视频总时长
 * @param maxRetries 最大重试次数
 * @param debug 是否打印调试信息
 * @returns Promise<boolean> 是否跳转成功
 */
export const seekToTimeWithRetry = (
  video: HTMLVideoElement,
  time: number,
  totalDuration: number,
  maxRetries: number = 3,
  debug: boolean = false
): Promise<boolean> => {
  return new Promise((resolve) => {
    let attempts = 0
    
    const attemptSeek = () => {
      attempts++
      if (debug) console.log(`🎯 跳转到时间点 ${time.toFixed(1)}s (尝试 ${attempts}/${maxRetries})`)
      
      const timeoutId = setTimeout(() => {
        if (debug) console.warn(`⚠️ 第${attempts}次跳转超时，时间点: ${time.toFixed(1)}s`)
        
        if (attempts < maxRetries) {
          // 重试前稍微调整时间点，避免死循环
          const adjustedTime = time + (Math.random() - 0.5) * 0.1
          video.currentTime = Math.max(0, Math.min(adjustedTime, totalDuration))
          setTimeout(attemptSeek, 100)
        } else {
          if (debug) console.error(`❌ 跳转失败，跳过时间点: ${time.toFixed(1)}s`)
          resolve(false)
        }
      }, 3000) // 减少超时时间到3秒
      
      const onSeeked = () => {
        clearTimeout(timeoutId)
        video.removeEventListener('seeked', onSeeked)
        if (debug) console.log(`✅ 成功跳转到时间点 ${time.toFixed(1)}s`)
        resolve(true)
      }
      
      video.addEventListener('seeked', onSeeked)
      video.currentTime = time
    }
    
    attemptSeek()
  })
}

/**
 * 处理视频并提取有意义的帧作为PPT幻灯片（新的两步算法）
 * @param video HTML视频元素
 * @param canvas HTML画布元素
 * @param options 提取选项
 * @param callbacks 回调函数
 */
export const extractFramesFromVideoNew = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  options: {
    captureInterval: number,
    maxScreenshots: number,
    debug?: boolean
  },
  callbacks: {
    onProgress: (progress: number) => void,
    onFrameCaptured: (blob: Blob, url: string) => void,
    onComplete: (screenshots: Blob[]) => void
  }
): Promise<void> => {
  const debug = options.debug || false
  
  if (debug) console.log('🎬 开始新的两步提取算法')
  
  // 步骤1：预处理，计算差异度阈值
  const dynamicThreshold = await preprocessVideo(video, canvas, debug, callbacks.onProgress)
  
  if (debug) console.log(`\n🔄 开始正式提取，使用阈值: ${dynamicThreshold.toFixed(2)}`)
  
  const { captureInterval, maxScreenshots } = options
  const { onProgress, onFrameCaptured, onComplete } = callbacks
  
  const context = canvas.getContext('2d')
  if (!context) return
  
  setupVideoCanvas(video, canvas)
  
  let currentTime = 0
  const totalDuration = video.duration
  let previousImageData: ImageData | null = null
  const newScreenshots: Blob[] = []
  let frameCount = 0
  let savedFrameCount = 0
  let skipCount = 0 // 跳过的帧数
  
  const captureFrame = async (): Promise<void> => {
    const seekSuccess = await seekToTimeWithRetry(video, currentTime, totalDuration, 3, debug)
    
    if (!seekSuccess) {
      skipCount++
      if (debug) console.log(`⏭️ 跳过无法访问的时间点 ${currentTime.toFixed(1)}s`)
      return
    }
    
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      frameCount++
      
      if (previousImageData) {
        const difference = calculateImageDifference(previousImageData, currentImageData)
        if (debug) console.log(`🎯 时间点 ${currentTime.toFixed(1)}s: 差异度 = ${difference.toFixed(2)}, 阈值 = ${dynamicThreshold.toFixed(2)}`)
        
        if (difference >= dynamicThreshold) {
          await new Promise<void>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) {
                newScreenshots.push(blob)
                savedFrameCount++
                
                const url = URL.createObjectURL(blob)
                onFrameCaptured(blob, url)
                
                if (debug) console.log(`✅ 保存第 ${savedFrameCount} 张截图 (差异度: ${difference.toFixed(2)} >= ${dynamicThreshold.toFixed(2)})`)
              }
              resolve()
            }, 'image/jpeg', 0.95)
          })
        } else {
          if (debug) console.log(`❌ 跳过截图 (差异度: ${difference.toFixed(2)} < ${dynamicThreshold.toFixed(2)})`)
        }
      } else {
        // 第一帧总是保存
        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              newScreenshots.push(blob)
              savedFrameCount++
              
              const url = URL.createObjectURL(blob)
              onFrameCaptured(blob, url)
              
              if (debug) console.log(`✅ 保存第一张截图`)
            }
            resolve()
          }, 'image/jpeg', 0.95)
        })
      }
      
      previousImageData = currentImageData
      
    } catch (error) {
      if (debug) console.error(`❌ 处理时间点 ${currentTime.toFixed(1)}s 时出错:`, error)
      skipCount++
    }
  }
  
  // 播放视频一段时间确保元数据已加载
  video.play()
  await new Promise(resolve => setTimeout(resolve, 500))
  video.pause()
  
  try {
    while (currentTime <= totalDuration) {
      await captureFrame()
      currentTime += captureInterval
      
      const progress = Math.min((currentTime / totalDuration) * 100, 100)
      onProgress(progress)
      
      if (newScreenshots.length >= maxScreenshots) {
        if (debug) console.log(`📄 达到最大截图数量限制: ${maxScreenshots}`)
        break
      }
      
      // 添加进度检查，防止无限循环
      if (currentTime > totalDuration + captureInterval) {
        if (debug) console.log(`📄 达到视频结束时间，停止提取`)
        break
      }
      
      // 如果连续跳过太多帧，可能视频有问题
      if (skipCount > frameCount * 0.5 && frameCount > 10) {
        if (debug) console.warn(`⚠️ 跳过帧数过多，可能视频文件有问题`)
        break
      }
    }
    
    if (debug) {
      console.log(`\n🎉 提取完成！`)
      console.log(`📊 总共尝试了 ${frameCount + skipCount} 个时间点`)
      console.log(`📊 成功处理了 ${frameCount} 个时间点`)
      console.log(`📊 跳过了 ${skipCount} 个有问题的时间点`)
      console.log(`📊 保存了 ${savedFrameCount} 张有效截图`)
      console.log(`📊 截图保留率: ${frameCount > 0 ? ((savedFrameCount / frameCount) * 100).toFixed(1) : 0}%`)
    }
    
  } catch (error) {
    console.error('提取视频帧错误:', error)
  } finally {
    onComplete(newScreenshots)
  }
}

/**
 * 本地视频处理的主要入口函数
 * @param video HTML视频元素
 * @param canvas HTML画布元素
 * @param options 处理选项
 * @param callbacks 回调函数
 */
export const processLocalVideo = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  options: LocalVideoProcessingOptions,
  callbacks: LocalVideoProcessingCallbacks
): Promise<void> => {
  return await extractFramesFromVideoNew(video, canvas, options, callbacks)
} 