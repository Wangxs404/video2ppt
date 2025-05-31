/**
 * 视频时长检测和预处理工具函数
 * 专门处理webm等格式的视频时长问题
 */

/**
 * 硬编码配置参数 - 控制控制台调试信息输出
 * 设置为 true 开启详细的调试输出，false 关闭（默认）
 */
const DEBUG_ENABLED = false

/**
 * 视频时长检测结果接口
 */
export interface VideoDurationInfo {
  duration: number          // 检测到的时长（秒）
  method: string           // 检测方法
  confidence: number       // 置信度 (0-1)
  isEstimated: boolean     // 是否为估算值
  warnings: string[]       // 警告信息
}

/**
 * 验证数值是否有效
 * @param value 要验证的数值
 * @returns boolean 是否为有效的有限数字
 */
export const isValidNumber = (value: number): boolean => {
  return typeof value === 'number' && isFinite(value) && !isNaN(value) && value >= 0
}

/**
 * 等待视频元数据完全加载
 * @param video HTML视频元素
 * @param timeout 超时时间（毫秒）
 * @returns Promise<boolean> 是否成功加载
 */
export const waitForVideoMetadata = (video: HTMLVideoElement, timeout: number = 10000): Promise<boolean> => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      if (DEBUG_ENABLED) console.warn('⏰ 视频元数据加载超时')
      resolve(false)
    }, timeout)
    
    const checkMetadata = () => {
      if (video.duration && isValidNumber(video.duration) && video.duration > 0) {
        clearTimeout(timeoutId)
        video.removeEventListener('loadedmetadata', checkMetadata)
        video.removeEventListener('durationchange', checkMetadata)
        resolve(true)
      }
    }
    
    // 如果已经有有效的时长，直接返回
    if (video.duration && isValidNumber(video.duration) && video.duration > 0) {
      clearTimeout(timeoutId)
      resolve(true)
      return
    }
    
    // 监听元数据加载事件
    video.addEventListener('loadedmetadata', checkMetadata)
    video.addEventListener('durationchange', checkMetadata)
    
    // 尝试加载元数据
    if (video.readyState < 1) {
      video.load()
    }
  })
}

/**
 * 尝试seek到指定时间点
 * @param video HTML视频元素
 * @param time 目标时间点（秒）
 * @param timeout 超时时间（毫秒）
 * @returns Promise<boolean> 是否成功
 */
const trySeekTo = (video: HTMLVideoElement, time: number, timeout: number = 2000): Promise<boolean> => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      resolve(false)
    }, timeout)
    
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
      resolve(false)
    }
  })
}

/**
 * 通过seek操作估算视频时长
 * @param video HTML视频元素
 * @returns Promise<number> 估算的时长（秒）
 */
export const seekEstimateDuration = async (
  video: HTMLVideoElement
): Promise<number> => {
  const originalTime = video.currentTime
  let estimatedDuration = 0
  
  try {
    if (DEBUG_ENABLED) console.log('🔍 开始seek估算视频时长...')
    
    // 尝试跳转到一个大数值来估算时长
    const success = await trySeekTo(video, 999999, 3000)
    
    if (success && isValidNumber(video.currentTime) && video.currentTime > 0) {
      estimatedDuration = video.currentTime
      if (DEBUG_ENABLED) console.log(`📊 seek估算结果: ${estimatedDuration.toFixed(1)}秒`)
    } else {
      if (DEBUG_ENABLED) console.warn('⚠️ seek估算失败')
    }
    
    // 恢复原始时间
    await trySeekTo(video, originalTime, 2000)
    
  } catch (error) {
    if (DEBUG_ENABLED) console.error('❌ seek估算出错:', error)
    // 尝试恢复原始时间
    try {
      video.currentTime = originalTime
    } catch (restoreError) {
      if (DEBUG_ENABLED) console.warn('⚠️ 无法恢复原始播放时间')
    }
  }
  
  return estimatedDuration
}

/**
 * 激进的seek估算策略 - 尝试多个数值
 * @param video HTML视频元素
 * @returns Promise<number> 估算的时长（秒）
 */
export const aggressiveSeekEstimate = async (
  video: HTMLVideoElement
): Promise<number> => {
  const originalTime = video.currentTime
  let bestEstimate = 0
  
  // 测试数值列表：从大到小
  const testValues = [999999, 86400, 36000, 18000, 7200, 3600, 1800, 600] // 24小时到10分钟
  
  try {
    if (DEBUG_ENABLED) console.log('🚀 开始激进seek估算策略...')
    
    for (let i = 0; i < testValues.length; i++) {
      const testValue = testValues[i]
      if (DEBUG_ENABLED) console.log(`🔍 测试seek到: ${testValue}秒 (${(testValue / 3600).toFixed(1)}小时)`)
      
      const success = await trySeekTo(video, testValue, 2000)
      
      if (success && isValidNumber(video.currentTime) && video.currentTime > 0) {
        bestEstimate = Math.max(bestEstimate, video.currentTime)
        if (DEBUG_ENABLED) console.log(`✅ 成功seek到: ${video.currentTime.toFixed(1)}秒`)
        
        // 如果成功seek到了预期的时间点附近，说明视频更长，继续测试
        if (Math.abs(video.currentTime - testValue) < 10) {
          continue
        } else {
          // 如果seek的时间明显小于测试值，说明找到了真实时长
          if (DEBUG_ENABLED) console.log(`🎯 找到时长边界: ${video.currentTime.toFixed(1)}秒`)
          break
        }
      } else {
        if (DEBUG_ENABLED) console.log(`❌ 无法seek到: ${testValue}秒`)
      }
    }
    
    // 恢复原始时间
    await trySeekTo(video, originalTime, 2000)
    
    if (DEBUG_ENABLED && bestEstimate > 0) {
      console.log(`📊 激进seek估算结果: ${bestEstimate.toFixed(1)}秒`)
    }
    
  } catch (error) {
    if (DEBUG_ENABLED) console.error('❌ 激进seek估算出错:', error)
    // 尝试恢复原始时间
    try {
      video.currentTime = originalTime
    } catch (restoreError) {
      if (DEBUG_ENABLED) console.warn('⚠️ 无法恢复原始播放时间')
    }
  }
  
  return bestEstimate
}

/**
 * 二分查找法精确估算时长
 * @param video HTML视频元素
 * @param roughEstimate 粗略估算值，用于设定搜索范围
 * @returns Promise<number> 精确估算的时长（秒）
 */
export const binarySearchDuration = async (
  video: HTMLVideoElement, 
  roughEstimate: number = 7200
): Promise<number> => {
  const originalTime = video.currentTime
  let low = 0
  let high = roughEstimate + 60 // 加一分钟缓冲
  let lastValidTime = 0
  const maxIterations = 20
  
  if (DEBUG_ENABLED) console.log(`🔍 开始二分查找，搜索范围: 0 - ${high.toFixed(1)}秒`)
  
  try {
    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2
      
      if (DEBUG_ENABLED) console.log(`🔍 第${i + 1}次查找: 测试时间点 ${mid.toFixed(1)}秒`)
      
      const canSeek = await trySeekTo(video, mid, 1500)
      
      if (canSeek && Math.abs(video.currentTime - mid) < 1) {
        // 可以精确seek到这个时间点
        lastValidTime = Math.max(lastValidTime, video.currentTime)
        low = mid
        if (DEBUG_ENABLED) console.log(`✅ 可访问时间点: ${video.currentTime.toFixed(1)}秒`)
      } else {
        // 无法seek到这个时间点，说明超出了时长
        high = mid
        if (DEBUG_ENABLED) console.log(`❌ 无法访问时间点: ${mid.toFixed(1)}秒`)
      }
      
      if (high - low < 0.5) {
        if (DEBUG_ENABLED) console.log(`🎯 精度满足要求，停止查找`)
        break
      }
    }
    
    // 恢复原始时间
    await trySeekTo(video, originalTime, 2000)
    
  } catch (error) {
    if (DEBUG_ENABLED) console.error('❌ 二分查找出错:', error)
    // 尝试恢复原始时间
    try {
      video.currentTime = originalTime
    } catch (restoreError) {
      if (DEBUG_ENABLED) console.warn('⚠️ 无法恢复原始播放时间')
    }
  }
  
  if (DEBUG_ENABLED && lastValidTime > 0) {
    console.log(`📊 二分查找结果: ${lastValidTime.toFixed(1)}秒`)
  }
  
  return lastValidTime
}

/**
 * 通过buffered属性获取时长信息
 * @param video HTML视频元素
 * @returns number 缓冲区时长（秒）
 */
export const getBufferedDuration = (video: HTMLVideoElement): number => {
  try {
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1)
      if (isValidNumber(bufferedEnd) && bufferedEnd > 0) {
        if (DEBUG_ENABLED) console.log(`📊 缓冲区时长: ${bufferedEnd.toFixed(1)}秒`)
        return bufferedEnd
      }
    }
  } catch (error) {
    if (DEBUG_ENABLED) console.warn('⚠️ 无法获取缓冲区信息:', error)
  }
  return 0
}

/**
 * 检测视频格式
 * @param file 视频文件或视频元素
 * @returns string 视频格式
 */
export const detectVideoFormat = (file: File): string => {
  const fileName = file.name.toLowerCase()
  const mimeType = file.type.toLowerCase()
  
  if (fileName.endsWith('.webm') || mimeType.includes('webm')) {
    return 'webm'
  } else if (fileName.endsWith('.mp4') || mimeType.includes('mp4')) {
    return 'mp4'
  } else if (fileName.endsWith('.avi') || mimeType.includes('avi')) {
    return 'avi'
  } else if (fileName.endsWith('.mov') || mimeType.includes('mov')) {
    return 'mov'
  } else if (fileName.endsWith('.wmv') || mimeType.includes('wmv')) {
    return 'wmv'
  }
  
  return 'unknown'
}

/**
 * 综合检测视频时长（主要函数）- 跳过元数据加载，直接使用seek和二分法
 * @param video HTML视频元素
 * @param file 视频文件（可选，用于格式检测）
 * @returns Promise<VideoDurationInfo> 时长检测结果
 */
export const detectVideoDuration = async (
  video: HTMLVideoElement,
  file?: File
): Promise<VideoDurationInfo> => {
  const format = file ? detectVideoFormat(file) : 'unknown'
  const warnings: string[] = []
  const results: Array<{ method: string; value: number; confidence: number }> = []
  
  if (DEBUG_ENABLED) {
    console.log('🚀 开始综合视频时长检测（跳过元数据加载）...')
    if (file) console.log(`📺 视频格式: ${format}`)
  }
  
  // 跳过元数据加载，直接使用seek方法
  if (DEBUG_ENABLED) console.log('⏭️ 跳过元数据加载，直接使用seek估算')
  
  // 方法1: seek估算（作为主要方法）
  const seekDuration = await seekEstimateDuration(video)
  if (seekDuration > 0) {
    results.push({
      method: 'seek',
      value: seekDuration,
      confidence: format === 'webm' ? 0.8 : 0.9 // 提高seek方法的置信度
    })
    if (DEBUG_ENABLED) console.log(`✅ seek估算时长: ${seekDuration.toFixed(1)}秒`)
  } else {
    warnings.push('seek估算失败')
    if (DEBUG_ENABLED) console.warn('⚠️ seek估算失败')
  }
  
  // 方法2: 二分查找精确估算（对所有格式都尝试，如果seek成功的话）
  if (seekDuration > 0) {
    const binaryDuration = await binarySearchDuration(video, seekDuration)
    if (binaryDuration > 0) {
      results.push({
        method: 'binary',
        value: binaryDuration,
        confidence: 0.95 // 二分查找置信度最高
      })
      if (DEBUG_ENABLED) console.log(`✅ 二分查找时长: ${binaryDuration.toFixed(1)}秒`)
    } else {
      warnings.push('二分查找失败')
      if (DEBUG_ENABLED) console.warn('⚠️ 二分查找失败')
    }
  }
  
  // 方法3: 缓冲区检测（作为辅助参考）
  const bufferedDuration = getBufferedDuration(video)
  if (bufferedDuration > 0) {
    results.push({
      method: 'buffered',
      value: bufferedDuration,
      confidence: 0.6 // 缓冲区信息通常不完整
    })
    if (DEBUG_ENABLED) console.log(`✅ 缓冲区时长: ${bufferedDuration.toFixed(1)}秒`)
  }
  
  // 方法4: 如果前面的方法都失败了，尝试更激进的seek策略
  if (results.length === 0) {
    if (DEBUG_ENABLED) console.log('🔄 所有基础方法失败，尝试激进seek策略...')
    
    const aggressiveResult = await aggressiveSeekEstimate(video)
    if (aggressiveResult > 0) {
      results.push({
        method: 'aggressive-seek',
        value: aggressiveResult,
        confidence: 0.7
      })
      if (DEBUG_ENABLED) console.log(`✅ 激进seek估算: ${aggressiveResult.toFixed(1)}秒`)
    }
  }
  
  // 选择最优结果
  let finalDuration = 0
  let finalMethod = 'failed'
  let finalConfidence = 0
  let isEstimated = true
  
  if (results.length === 0) {
    warnings.push('所有检测方法都失败')
    return {
      duration: 0,
      method: 'failed',
      confidence: 0,
      isEstimated: true,
      warnings
    }
  }
  
  if (results.length === 1) {
    // 只有一个结果
    const result = results[0]
    finalDuration = result.value
    finalMethod = result.method
    finalConfidence = result.confidence
    isEstimated = true // 所有方法都是估算
  } else {
    // 多个结果，选择最可信的
    
    // 优先选择二分查找结果（置信度最高）
    const binaryResult = results.find(r => r.method === 'binary')
    if (binaryResult) {
      finalDuration = binaryResult.value
      finalMethod = binaryResult.method
      finalConfidence = binaryResult.confidence
      isEstimated = true
    } else {
      // 计算加权平均值
      const totalWeight = results.reduce((sum, r) => sum + r.confidence, 0)
      const weightedSum = results.reduce((sum, r) => sum + r.value * r.confidence, 0)
      const weightedAverage = weightedSum / totalWeight
      
      // 过滤异常值（偏差超过15%的结果，比原来更严格）
      const reasonable = results.filter(r => {
        const deviation = Math.abs(r.value - weightedAverage) / weightedAverage
        return deviation < 0.15
      })
      
      if (reasonable.length > 0) {
        // 选择置信度最高的合理结果
        const bestResult = reasonable.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        )
        
        finalDuration = bestResult.value
        finalMethod = bestResult.method
        finalConfidence = bestResult.confidence
        isEstimated = true
      } else {
        // 如果没有合理的结果，选择置信度最高的
        const bestResult = results.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        )
        
        finalDuration = bestResult.value
        finalMethod = bestResult.method
        finalConfidence = bestResult.confidence * 0.7 // 降低置信度更多
        isEstimated = true
        warnings.push('检测结果差异较大，置信度大幅降低')
      }
    }
  }
  
  if (DEBUG_ENABLED) {
    console.log(`📊 检测结果汇总:`)
    results.forEach(r => {
      console.log(`  ${r.method}: ${r.value.toFixed(1)}秒 (置信度: ${(r.confidence * 100).toFixed(0)}%)`)
    })
    console.log(`🎯 最终选择: ${finalMethod} = ${finalDuration.toFixed(1)}秒 (置信度: ${(finalConfidence * 100).toFixed(0)}%)`)
    if (warnings.length > 0) {
      console.log(`⚠️ 警告:`, warnings)
    }
  }
  
  return {
    duration: finalDuration,
    method: finalMethod,
    confidence: finalConfidence,
    isEstimated,
    warnings
  }
}

/**
 * 为特定格式提供建议的处理策略
 * @param format 视频格式
 * @param durationInfo 时长检测结果
 * @returns 处理建议
 */
export const getProcessingRecommendation = (
  format: string, 
  durationInfo: VideoDurationInfo
): {
  shouldPreprocess: boolean
  sampleStrategy: 'time-based' | 'fixed-interval' | 'adaptive'
  recommendedInterval: number
  maxSamples: number
  notes: string[]
} => {
  const notes: string[] = []
  
  if (durationInfo.duration === 0) {
    notes.push('无法检测视频时长，建议使用固定间隔采样')
    return {
      shouldPreprocess: false,
      sampleStrategy: 'fixed-interval',
      recommendedInterval: 10,
      maxSamples: 50,
      notes
    }
  }
  
  // 由于不使用元数据加载，所有检测都是估算，需要更谨慎的策略
  if (durationInfo.confidence < 0.7) {
    notes.push('时长检测置信度较低，建议使用保守的自适应采样')
    return {
      shouldPreprocess: true,
      sampleStrategy: 'adaptive',
      recommendedInterval: Math.max(5, durationInfo.duration / 50), // 更保守的间隔
      maxSamples: Math.min(80, Math.max(15, Math.floor(durationInfo.duration / 15))), // 更少的样本
      notes
    }
  }
  
  // WebM格式特殊处理
  if (format === 'webm') {
    notes.push('WebM格式使用seek估算，采用自适应采样策略')
    return {
      shouldPreprocess: true,
      sampleStrategy: 'adaptive',
      recommendedInterval: Math.max(4, durationInfo.duration / 80),
      maxSamples: Math.min(100, Math.max(20, Math.floor(durationInfo.duration / 12))),
      notes
    }
  }
  
  // 根据检测方法调整策略
  if (durationInfo.method === 'binary') {
    notes.push('使用二分查找检测，置信度较高，使用标准策略')
  } else if (durationInfo.method === 'seek') {
    notes.push('使用seek检测，采用适中策略')
  } else if (durationInfo.method === 'aggressive-seek') {
    notes.push('使用激进seek检测，采用保守策略')
  }
  
  // 正常情况下的建议（基于seek/二分法检测）
  const duration = durationInfo.duration
  let interval: number
  let maxSamples: number
  
  // 由于是估算值，采用稍微保守的参数
  if (duration < 600) { // < 10分钟
    interval = 4 // 从3增加到4
    maxSamples = 25 // 从30减少到25
  } else if (duration < 1800) { // 10-30分钟
    interval = 6 // 从5增加到6
    maxSamples = 50 // 从60减少到50
  } else if (duration < 3600) { // 30-60分钟
    interval = 10 // 从8增加到10
    maxSamples = 80 // 从100减少到80
  } else { // > 60分钟
    interval = 15 // 从12增加到15
    maxSamples = 120 // 从150减少到120
  }
  
  // 根据置信度进一步调整
  if (durationInfo.confidence < 0.8) {
    interval = Math.ceil(interval * 1.2) // 增加间隔
    maxSamples = Math.floor(maxSamples * 0.8) // 减少样本数
    notes.push('因置信度较低，采用更保守的采样参数')
  }
  
  return {
    shouldPreprocess: true,
    sampleStrategy: 'time-based',
    recommendedInterval: interval,
    maxSamples,
    notes
  }
} 