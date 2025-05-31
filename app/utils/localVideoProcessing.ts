/**
 * 本地视频处理相关函数
 * 专门用于处理本地上传的视频文件，包括预处理和提取算法
 */

/**
 * 硬编码配置参数 - 控制控制台调试信息输出
 * 设置为 true 开启详细的调试输出，false 关闭（默认）
 */
const DEBUG_ENABLED = false

import { calculateImageDifference, setupVideoCanvas } from './videoProcessing'
import { 
  detectVideoDuration, 
  isValidNumber, 
  getProcessingRecommendation,
  VideoDurationInfo 
} from './videoDurationUtils'

/**
 * 本地视频处理配置接口
 */
export interface LocalVideoProcessingOptions {
  captureInterval: number      // 捕获间隔（秒）
  maxScreenshots: number       // 最大截图数
  preProcessInterval?: number  // 预处理间隔（秒）
  file?: File                  // 视频文件，用于格式检测
}

/**
 * 本地视频处理回调接口
 */
export interface LocalVideoProcessingCallbacks {
  onProgress: (progress: number) => void
  onFrameCaptured: (blob: Blob, url: string) => void
  onComplete: (screenshots: Blob[]) => void
  onDurationDetected?: (durationInfo: VideoDurationInfo) => void // 新增时长检测回调
}

/**
 * 增强的预处理：使用新的时长检测工具计算差异度平均值
 * @param video HTML视频元素
 * @param canvas HTML画布元素
 * @param file 视频文件（用于格式检测）
 * @param onProgress 进度回调函数
 * @param onDurationDetected 时长检测完成回调
 * @returns Promise包含差异度平均值
 */
export const preprocessVideoEnhanced = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  file?: File,
  onProgress?: (progress: number) => void,
  onDurationDetected?: (durationInfo: VideoDurationInfo) => void
): Promise<number> => {
  if (DEBUG_ENABLED) console.log('🚀 开始增强预处理，使用新时长检测算法...')
  
  const context = canvas.getContext('2d')
  if (!context) throw new Error('无法获取canvas context')
  
  setupVideoCanvas(video, canvas)
  
  // 使用新的时长检测工具
  const durationInfo = await detectVideoDuration(video, file)
  
  // 通知时长检测结果
  if (onDurationDetected) {
    onDurationDetected(durationInfo)
  }
  
  if (durationInfo.duration === 0) {
    if (DEBUG_ENABLED) console.warn('⚠️ 无法检测视频时长，使用默认阈值')
    if (onProgress) onProgress(100)
    return 30
  }
  
  const totalDuration = durationInfo.duration
  const format = file ? file.name.toLowerCase().split('.').pop() || 'unknown' : 'unknown'
  
  // 获取处理建议
  const recommendation = getProcessingRecommendation(format, durationInfo)
  
  if (DEBUG_ENABLED) {
    console.log(`📺 检测结果: ${totalDuration.toFixed(1)}秒 (${(totalDuration / 60).toFixed(1)}分钟)`)
    console.log(`📊 检测方法: ${durationInfo.method}, 置信度: ${(durationInfo.confidence * 100).toFixed(0)}%`)
    console.log(`📋 处理策略: ${recommendation.sampleStrategy}`)
    if (recommendation.notes.length > 0) {
      console.log(`📝 建议: ${recommendation.notes.join(', ')}`)
    }
  }
  
  // 如果建议不进行预处理，直接返回保守阈值
  if (!recommendation.shouldPreprocess) {
    if (DEBUG_ENABLED) console.log('📊 根据建议跳过预处理，使用保守阈值: 25')
    if (onProgress) onProgress(100)
    return 25
  }
  
  // 根据建议设置采样参数
  let sampleCount: number
  let preProcessInterval: number
  
  if (recommendation.sampleStrategy === 'fixed-interval') {
    // 固定间隔策略
    sampleCount = recommendation.maxSamples
    preProcessInterval = recommendation.recommendedInterval
    if (DEBUG_ENABLED) console.log(`📊 使用固定间隔策略: ${preProcessInterval}秒间隔，${sampleCount}个样本`)
  } else if (recommendation.sampleStrategy === 'adaptive') {
    // 自适应策略
    sampleCount = recommendation.maxSamples
    preProcessInterval = totalDuration / sampleCount
    if (DEBUG_ENABLED) console.log(`📊 使用自适应策略: ${preProcessInterval.toFixed(2)}秒间隔，${sampleCount}个样本`)
  } else {
    // 基于时间的策略（默认）
    if (totalDuration < 600) { // 小于10分钟
      sampleCount = 20
      if (DEBUG_ENABLED) console.log('📊 视频时长 < 10分钟，使用20份均分采样')
    } else if (totalDuration < 1800) { // 10-30分钟
      sampleCount = 50
      if (DEBUG_ENABLED) console.log('📊 视频时长 10-30分钟，使用50份均分采样')
    } else if (totalDuration < 3600) { // 30-60分钟
      sampleCount = 100
      if (DEBUG_ENABLED) console.log('📊 视频时长 30-60分钟，使用100份均分采样')
    } else { // 大于60分钟
      sampleCount = 150
      if (DEBUG_ENABLED) console.log('📊 视频时长 > 60分钟，使用150份均分采样')
    }
    
    preProcessInterval = totalDuration / sampleCount
  }
  
  if (!isValidNumber(preProcessInterval) || preProcessInterval <= 0) {
    console.error('预处理间隔计算错误:', preProcessInterval)
    if (onProgress) onProgress(100)
    return 30
  }
  
  if (DEBUG_ENABLED) console.log(`📊 最终采样参数: ${preProcessInterval.toFixed(2)}秒间隔，预计采样 ${sampleCount} 个点`)
  
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
   * 安全的预处理跳转函数 - 加强版
   */
  const seekToTimePreprocess = (time: number): Promise<boolean> => {
    return new Promise((resolve) => {
      // 验证时间值
      if (!isValidNumber(time) || time < 0 || time > totalDuration) {
        if (DEBUG_ENABLED) console.warn(`⚠️ 无效的时间点: ${time}`)
        resolve(false)
        return
      }
      
      const timeoutId = setTimeout(() => {
        if (DEBUG_ENABLED) console.warn(`⚠️ 预处理跳转超时，时间点: ${time.toFixed(1)}s`)
        resolve(false)
      }, 3000)
      
      const onSeeked = () => {
        clearTimeout(timeoutId)
        video.removeEventListener('seeked', onSeeked)
        video.removeEventListener('error', onError)
        resolve(true)
      }
      
      const onError = () => {
        clearTimeout(timeoutId)
        video.removeEventListener('seeked', onSeeked)
        video.removeEventListener('error', onError)
        if (DEBUG_ENABLED) console.warn(`⚠️ 预处理跳转出错，时间点: ${time.toFixed(1)}s`)
        resolve(false)
      }
      
      try {
        video.addEventListener('seeked', onSeeked)
        video.addEventListener('error', onError)
        video.currentTime = time
      } catch (error) {
        clearTimeout(timeoutId)
        video.removeEventListener('seeked', onSeeked)
        video.removeEventListener('error', onError)
        if (DEBUG_ENABLED) console.warn(`⚠️ 设置时间点失败: ${time}`, error)
        resolve(false)
      }
    })
  }
  
  const capturePreProcessFrame = async (time: number): Promise<void> => {
    const seekSuccess = await seekToTimePreprocess(time)
    
    if (!seekSuccess) {
      skipCount++
      if (DEBUG_ENABLED) console.log(`⏭️ 预处理跳过时间点 ${time.toFixed(1)}s`)
      return
    }
    
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      if (previousImageData) {
        const difference = calculateImageDifference(previousImageData, currentImageData)
        if (isValidNumber(difference)) {
          differences.push(difference)
          if (DEBUG_ENABLED) console.log(`⏱️ 时间点 ${time.toFixed(1)}s: 差异度 = ${difference.toFixed(2)}`)
        }
      }
      
      previousImageData = currentImageData
    } catch (error) {
      if (DEBUG_ENABLED) console.warn(`⚠️ 预处理时间点 ${time.toFixed(1)}s 出错:`, error)
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
    // 按计算的间隔采样
    let frameIndex = 0
    while (frameIndex < sampleCount) {
      const time = frameIndex * preProcessInterval
      
      if (!isValidNumber(time) || time > totalDuration) {
        break
      }
      
      await capturePreProcessFrame(time)
      frameIndex++
      
      // 如果跳过太多，停止预处理（调整阈值）
      const skipThreshold = format === 'webm' ? 0.6 : 0.4 // webm格式更宽松
      if (skipCount > sampleCount * skipThreshold) {
        if (DEBUG_ENABLED) console.warn(`⚠️ 预处理跳过过多(${skipCount}/${sampleCount})，使用默认阈值`)
        break
      }
    }
    
    // 确保进度达到100%
    if (onProgress) {
      onProgress(100)
    }
    
    if (differences.length === 0) {
      if (DEBUG_ENABLED) console.log(`📊 预处理完成！使用默认阈值: 30`)
      return 30
    }
    
    // 如果样本太少，适当降低阈值
    if (differences.length < 3) {
      if (DEBUG_ENABLED) console.log(`📊 预处理样本较少(${differences.length}个)，使用保守阈值: 20`)
      return 20
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
    
    // 根据视频格式和置信度调整阈值范围
    let minThreshold = 10
    let maxThreshold = 60
    
    if (format === 'webm' && durationInfo.confidence < 0.8) {
      // WebM格式且置信度较低时，使用更宽松的阈值
      minThreshold = 8
      maxThreshold = 50
      if (DEBUG_ENABLED) console.log('📊 WebM格式低置信度，使用宽松阈值范围')
    }
    
    finalThreshold = Math.max(minThreshold, Math.min(finalThreshold, maxThreshold))
    
    if (DEBUG_ENABLED) {
      console.log(`📊 预处理完成！`)
      console.log(`📊 预期采样 ${sampleCount} 个点，实际采样 ${differences.length} 个点，跳过 ${skipCount} 个点`)
      console.log(`📊 采样间隔: ${preProcessInterval.toFixed(2)}秒`)
      console.log(`📊 差异度统计:`)
      console.log(`📊   最小值: ${minDiff.toFixed(2)}`)
      console.log(`📊   最大值: ${maxDiff.toFixed(2)}`)
      console.log(`📊   中位数: ${medianDiff.toFixed(2)}`)
      console.log(`📊   平均值: ${averageDiff.toFixed(2)}`)
      console.log(`📊   修剪平均值: ${trimmedAverage.toFixed(2)}`)
      console.log(`📊 最终阈值: ${finalThreshold.toFixed(2)} (范围: ${minThreshold}-${maxThreshold})`)
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
 * @returns Promise<boolean> 是否跳转成功
 */
export const seekToTimeWithRetry = (
  video: HTMLVideoElement,
  time: number,
  totalDuration: number,
  maxRetries: number = 3
): Promise<boolean> => {
  return new Promise((resolve) => {
    let attempts = 0
    
    const attemptSeek = () => {
      attempts++
      if (DEBUG_ENABLED) console.log(`🎯 跳转到时间点 ${time.toFixed(1)}s (尝试 ${attempts}/${maxRetries})`)
      
      const timeoutId = setTimeout(() => {
        if (DEBUG_ENABLED) console.warn(`⚠️ 第${attempts}次跳转超时，时间点: ${time.toFixed(1)}s`)
        
        if (attempts < maxRetries) {
          // 重试前稍微调整时间点，避免死循环
          const adjustedTime = time + (Math.random() - 0.5) * 0.1
          video.currentTime = Math.max(0, Math.min(adjustedTime, totalDuration))
          setTimeout(attemptSeek, 100)
        } else {
          if (DEBUG_ENABLED) console.error(`❌ 跳转失败，跳过时间点: ${time.toFixed(1)}s`)
          resolve(false)
        }
      }, 3000) // 减少超时时间到3秒
      
      const onSeeked = () => {
        clearTimeout(timeoutId)
        video.removeEventListener('seeked', onSeeked)
        if (DEBUG_ENABLED) console.log(`✅ 成功跳转到时间点 ${time.toFixed(1)}s`)
        resolve(true)
      }
      
      video.addEventListener('seeked', onSeeked)
      video.currentTime = time
    }
    
    attemptSeek()
  })
}

/**
 * 处理视频并提取有意义的帧作为PPT幻灯片（增强版两步算法）
 * @param video HTML视频元素
 * @param canvas HTML画布元素
 * @param options 提取选项
 * @param callbacks 回调函数
 */
export const extractFramesFromVideoEnhanced = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  options: {
    captureInterval: number,
    maxScreenshots: number,
    file?: File
  },
  callbacks: {
    onProgress: (progress: number) => void,
    onFrameCaptured: (blob: Blob, url: string) => void,
    onComplete: (screenshots: Blob[]) => void,
    onDurationDetected?: (durationInfo: VideoDurationInfo) => void
  }
): Promise<void> => {
  if (DEBUG_ENABLED) console.log('🎬 开始增强版两步提取算法')
  
  // 步骤1：使用增强预处理，计算差异度阈值
  const dynamicThreshold = await preprocessVideoEnhanced(
    video, 
    canvas, 
    options.file, 
    callbacks.onProgress,
    callbacks.onDurationDetected
  )
  
  if (DEBUG_ENABLED) console.log(`\n🔄 开始正式提取，使用阈值: ${dynamicThreshold.toFixed(2)}`)
  
  const { captureInterval, maxScreenshots } = options
  const { onProgress, onFrameCaptured, onComplete } = callbacks
  
  const context = canvas.getContext('2d')
  if (!context) return
  
  setupVideoCanvas(video, canvas)
  
  // 重新检测时长用于提取阶段
  const durationInfo = await detectVideoDuration(video, options.file)
  const totalDuration = durationInfo.duration > 0 ? durationInfo.duration : video.duration
  
  if (!isValidNumber(totalDuration) || totalDuration <= 0) {
    console.error('无法获取有效的视频时长进行提取')
    onComplete([])
    return
  }
  
  let currentTime = 0
  let previousImageData: ImageData | null = null
  const newScreenshots: Blob[] = []
  let frameCount = 0
  let savedFrameCount = 0
  let skipCount = 0 // 跳过的帧数
  
  const captureFrame = async (): Promise<void> => {
    const seekSuccess = await seekToTimeWithRetry(video, currentTime, totalDuration, 3)
    
    if (!seekSuccess) {
      skipCount++
      if (DEBUG_ENABLED) console.log(`⏭️ 跳过无法访问的时间点 ${currentTime.toFixed(1)}s`)
      return
    }
    
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      frameCount++
      
      if (previousImageData) {
        const difference = calculateImageDifference(previousImageData, currentImageData)
        if (DEBUG_ENABLED) console.log(`🎯 时间点 ${currentTime.toFixed(1)}s: 差异度 = ${difference.toFixed(2)}, 阈值 = ${dynamicThreshold.toFixed(2)}`)
        
        if (difference >= dynamicThreshold) {
          await new Promise<void>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) {
                newScreenshots.push(blob)
                savedFrameCount++
                
                const url = URL.createObjectURL(blob)
                onFrameCaptured(blob, url)
                
                if (DEBUG_ENABLED) console.log(`✅ 保存第 ${savedFrameCount} 张截图 (差异度: ${difference.toFixed(2)} >= ${dynamicThreshold.toFixed(2)})`)
              }
              resolve()
            }, 'image/jpeg', 0.95)
          })
        } else {
          if (DEBUG_ENABLED) console.log(`❌ 跳过截图 (差异度: ${difference.toFixed(2)} < ${dynamicThreshold.toFixed(2)})`)
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
              
              if (DEBUG_ENABLED) console.log(`✅ 保存第一张截图`)
            }
            resolve()
          }, 'image/jpeg', 0.95)
        })
      }
      
      previousImageData = currentImageData
      
    } catch (error) {
      if (DEBUG_ENABLED) console.error(`❌ 处理时间点 ${currentTime.toFixed(1)}s 时出错:`, error)
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
        if (DEBUG_ENABLED) console.log(`📄 达到最大截图数量限制: ${maxScreenshots}`)
        break
      }
      
      // 添加进度检查，防止无限循环
      if (currentTime > totalDuration + captureInterval) {
        if (DEBUG_ENABLED) console.log(`📄 达到视频结束时间，停止提取`)
        break
      }
      
      // 如果连续跳过太多帧，可能视频有问题
      if (skipCount > frameCount * 0.5 && frameCount > 10) {
        if (DEBUG_ENABLED) console.warn(`⚠️ 跳过帧数过多，可能视频文件有问题`)
        break
      }
    }
    
    if (DEBUG_ENABLED) {
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
  return await extractFramesFromVideoEnhanced(video, canvas, options, callbacks)
}

/**
 * 原始预处理函数（向后兼容）
 * @param video HTML视频元素
 * @param canvas HTML画布元素
 * @param onProgress 进度回调函数
 * @returns Promise包含差异度平均值
 */
export const preprocessVideo = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  onProgress?: (progress: number) => void
): Promise<number> => {
  return await preprocessVideoEnhanced(video, canvas, undefined, onProgress)
}

/**
 * 原始提取函数（向后兼容）
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
    maxScreenshots: number
  },
  callbacks: {
    onProgress: (progress: number) => void,
    onFrameCaptured: (blob: Blob, url: string) => void,
    onComplete: (screenshots: Blob[]) => void
  }
): Promise<void> => {
  return await extractFramesFromVideoEnhanced(video, canvas, options, callbacks)
} 