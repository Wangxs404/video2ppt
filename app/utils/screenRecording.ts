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
    mimeType: 'video/webm;codecs=vp9,opus',
    videoBitsPerSecond: 3000000,
    audioBitsPerSecond: 128000
  }
  
  try {
    // 详细分析流中的音频轨道
    const audioTracks = stream.getAudioTracks();
    console.log('MediaRecorder初始化 - 音频轨道数量:', audioTracks.length);
    
    // 测试是否能获取到音频数据
    if (audioTracks.length > 0) {
      console.log('检测到音频轨道，进行音轨分析');
      
      // 打印每个音轨的详细信息
      audioTracks.forEach((track, index) => {
        const settings = track.getSettings();
        console.log(`音轨 ${index+1} 信息:`, {
          id: track.id,
          label: track.label || '无标签',
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          kind: track.kind,
          // 尝试获取更详细的音轨设置
          settings: {
            channelCount: settings.channelCount,
            deviceId: settings.deviceId ? '已设置' : '未设置',
            groupId: settings.groupId ? '已设置' : '未设置',
            autoGainControl: settings.autoGainControl,
            echoCancellation: settings.echoCancellation,
            noiseSuppression: settings.noiseSuppression,
            sampleRate: settings.sampleRate,
            sampleSize: settings.sampleSize
          }
        });
        
        // 确保所有音轨都被启用
        if (!track.enabled) {
          console.log(`音轨 ${index+1} 未启用，正在启用...`);
          track.enabled = true;
        }
      });
      
      // 检查音轨标签是否包含麦克风相关字符串
      const hasMicTrack = audioTracks.some(track => 
        track.label.toLowerCase().includes('mic') || 
        track.label.toLowerCase().includes('麦克风')
      );
      
      if (hasMicTrack) {
        console.log('检测到麦克风音轨');
      } else {
        console.log('未检测到明确的麦克风音轨');
      }
    } else {
      console.warn('警告: 没有检测到音频轨道，录制将没有声音');
    }
    
    console.log('MediaRecorder初始化 - 视频轨道数量:', stream.getVideoTracks().length);
    
    // 创建并检查MediaRecorder支持的MIME类型
    let finalOptions = recorderOptions;
    
    // 尝试多种音频编码组合，优先使用opus音频编码
    const mimeOptions = [
      'video/webm;codecs=vp8,opus', // 更常用的vp8优先，兼容性更好
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=vp8,pcm',
      'video/webm;codecs=vp9,pcm',
      'video/mp4;codecs=h264,aac',
      'video/webm'
    ];
    
    console.log('浏览器支持的MIME类型检查:');
    mimeOptions.forEach(mime => {
      console.log(`${mime}: ${MediaRecorder.isTypeSupported(mime) ? '支持' : '不支持'}`);
    });
    
    // 查找最佳支持的MIME类型
    const bestMime = mimeOptions.find(mime => MediaRecorder.isTypeSupported(mime));
    
    if (bestMime) {
      finalOptions = { 
        ...recorderOptions, 
        mimeType: bestMime
      };
      console.log(`使用最佳支持的MIME类型: ${bestMime}`);
    } else {
      console.warn('未找到支持的编码器类型，使用浏览器默认编码器');
      finalOptions = { 
        videoBitsPerSecond: 3000000,
        audioBitsPerSecond: 192000, // 提高音频比特率
        mimeType: ''
      };
    }
    
    // 音频轨道存在时，确保设置足够高的音频比特率
    if (audioTracks.length > 0) {
      finalOptions.audioBitsPerSecond = Math.max(finalOptions.audioBitsPerSecond || 0, 192000);
      console.log(`设置音频比特率为: ${finalOptions.audioBitsPerSecond}bps`);
    }
    
    console.log('最终使用的MediaRecorder选项:', finalOptions);
    
    // 创建MediaRecorder实例
    const mediaRecorder = new MediaRecorder(stream, finalOptions);
    mediaRecorderRef.current = mediaRecorder;
    
    // 注册更多事件以获取更多诊断信息
    mediaRecorder.onstart = () => console.log('MediaRecorder: 录制开始');
    mediaRecorder.onpause = () => console.log('MediaRecorder: 录制暂停');
    mediaRecorder.onresume = () => console.log('MediaRecorder: 录制恢复');
    mediaRecorder.onerror = (event) => console.error('MediaRecorder错误:', event);
    
    // 录制事件处理
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
        console.log(`录制数据块 - 大小: ${(event.data.size / 1024 / 1024).toFixed(2)}MB, 类型: ${event.data.type}`);
        
        // 额外调试信息 - 检查数据块中是否包含音频
        if (audioTracks.length > 0 && event.data.size < 10000) {
          console.warn('数据块大小异常小，可能没有包含音频数据');
        }
      } else {
        console.warn('录制的数据块大小为0');
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