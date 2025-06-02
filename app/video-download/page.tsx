'use client';

import { useState, useRef, useEffect } from 'react';
import { processLocalVideo, LocalVideoProcessingOptions, LocalVideoProcessingCallbacks } from '../utils/localVideoProcessing';
import { generatePptBlob } from '../utils/pptGeneration';
import { VideoDurationInfo } from '../utils/videoDurationUtils';

const DEBUG_ENABLED = false;

// Fly.io部署的API基础URL
const API_BASE_URL = 'https://video-backend-flyio.fly.dev';

// 创建虚拟文件对象用于格式检测
const createVirtualFileFromUrl = (videoUrl: string, fileName?: string): File => {
  const url = new URL(videoUrl);
  const pathname = url.pathname;
  const extension = pathname.split('.').pop()?.toLowerCase() || 'mp4';
  const name = fileName || `downloaded_video.${extension}`;
  
  const blob = new Blob([], { type: `video/${extension}` });
  return new File([blob], name, { type: `video/${extension}` });
};

interface VideoInfo {
  success: boolean;
  message: string;
  title?: string;
  site?: string;
  duration?: string;
  quality?: string[];
  size?: string;
  error?: string;
  logs?: string[];
}

interface DownloadResult {
  success: boolean;
  message: string;
  downloadId?: string;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
  filePath?: string;
  error?: string;
  logs?: string[];
}

// 处理状态枚举
enum ProcessState {
  IDLE = 'idle',
  FETCHING_INFO = 'fetching_info',
  DOWNLOADING = 'downloading',
  LOCALIZING = 'localizing',
  LOADING_METADATA = 'loading_metadata',
  PREPROCESSING = 'preprocessing',
  EXTRACTING = 'extracting',
  GENERATING_PPT = 'generating_ppt',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export default function VideoDownloadPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [processState, setProcessState] = useState<ProcessState>(ProcessState.IDLE);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [localVideoBlob, setLocalVideoBlob] = useState<Blob | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [durationInfo, setDurationInfo] = useState<VideoDurationInfo | null>(null);

  // 新增服务状态相关
  const [serviceStatus, setServiceStatus] = useState<'unknown' | 'healthy' | 'error'>('unknown');
  const [isCheckingService, setIsCheckingService] = useState(false);

  // 新增：用于存储生成的PPT数据
  const [pptData, setPptData] = useState<{ pptBlob: Blob | null, fileName: string | null }>({ pptBlob: null, fileName: null });

  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 更新处理步骤配置以包含 LOADING_METADATA
  const steps = [
    { name: '获取视频信息', icon: '🔍' },    // 0
    { name: '下载视频', icon: '📥' },        // 1
    { name: '本地化处理', icon: '💾' },    // 2
    { name: '加载视频数据', icon: '⏳' },  // 3 (新增)
    { name: '视频预处理', icon: '⚙️' },    // 4
    { name: '提取关键帧', icon: '🖼️' },    // 5
    { name: '生成PPT', icon: '📄' }         // 6
  ];

  // 清理资源
  useEffect(() => {
    // 页面加载时检查服务状态
    checkServiceHealth();
    
    return () => {
      if (localVideoUrl) {
        URL.revokeObjectURL(localVideoUrl);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // 检查服务健康状态
  const checkServiceHealth = async () => {
    setIsCheckingService(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setServiceStatus('healthy');
      } else {
        setServiceStatus('error');
      }
    } catch (error) {
      console.warn('服务健康检查失败:', error);
      setServiceStatus('error');
    } finally {
      setIsCheckingService(false);
    }
  };

  // 自动重试逻辑
  const withRetry = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    timeout: number = 20000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        
        // 创建带超时的Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          retryTimeoutRef.current = setTimeout(() => {
            reject(new Error(`操作超时 (${timeout/1000}秒)`));
          }, timeout);
        });

        const result = await Promise.race([operation(), timeoutPromise]);
        
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
        
        return result;
      } catch (error: any) {
        console.warn(`尝试 ${attempt}/${maxRetries} 失败:`, error.message);
        
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
    }

        if (attempt === maxRetries) {
          // 在最后一次重试失败时，提供更详细的错误信息
          let errorMessage = `操作失败，已重试 ${maxRetries} 次: ${error.message}`;
          
          if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
            errorMessage += '\n\n可能的原因：\n• Fly.io 后端服务暂时不可用\n• 视频链接格式不支持\n• 服务器正在维护\n\n建议：\n• 检查视频链接是否正确\n• 稍后重试\n• 尝试使用其他视频链接';
          } else if (error.message.includes('fetch')) {
            errorMessage += '\n\n网络连接问题，请检查：\n• 网络连接是否正常\n• 防火墙设置\n• 代理配置';
          }
          
          throw new Error(errorMessage);
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error('重试逻辑错误');
  };

  // 获取视频信息
  const fetchVideoInfo = async (): Promise<VideoInfo> => {
      const response = await fetch(`${API_BASE_URL}/api/info`, {
        method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      const data: VideoInfo = await response.json();
    if (!data.success) {
      throw new Error(data.error || data.message || '获取视频信息失败');
      }
    return data;
  };

  // 下载视频
  const downloadVideo = async (): Promise<DownloadResult> => {
    const response = await fetch('/api/download-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl }),
    });

    const data: DownloadResult = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return data;
  };

  // 本地化视频
  const localizeVideo = async (downloadUrl: string): Promise<Blob> => {
    const fullUrl = downloadUrl.startsWith('/api/file')
      ? `${API_BASE_URL}${downloadUrl}`
      : downloadUrl;

    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    if (!response.body) {
      throw new Error('无法获取响应流');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let downloaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      downloaded += value.length;
      
      if (total > 0) {
        const progress = (downloaded / total) * 100;
        setProgress(progress);
      }
    }

    return new Blob(chunks, { type: 'video/mp4' });
  };

  // 新增：加载视频元数据辅助函数
  const loadVideoMetadata = (videoElement: HTMLVideoElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!videoElement) {
        reject(new Error("Video element not available for metadata loading."));
        return;
      }
      // Check if metadata is already loaded
      if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
        if (DEBUG_ENABLED) console.log('Video metadata already available upon loadVideoMetadata call.', { duration: videoElement.duration });
        resolve();
        return;
      }

      const handleMetadataLoaded = () => {
        videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
        videoElement.removeEventListener('error', handleError);
        if (DEBUG_ENABLED) console.log('Video metadata loaded successfully via event.', { duration: videoElement.duration });
        resolve();
      };

      const handleError = (event: Event) => {
        videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
        videoElement.removeEventListener('error', handleError);
        console.error("Error loading video in loadVideoMetadata:", event, videoElement.error);
        let errorMsg = "视频加载失败";
        if (videoElement.error) {
          switch (videoElement.error.code) {
            case MediaError.MEDIA_ERR_ABORTED: errorMsg += "：用户中止。"; break;
            case MediaError.MEDIA_ERR_NETWORK: errorMsg += "：网络错误。"; break;
            case MediaError.MEDIA_ERR_DECODE: errorMsg += "：解码错误。"; break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: errorMsg += "：格式不支持。"; break;
            default: errorMsg += "：未知错误。";
          }
        }
        reject(new Error(errorMsg));
      };

      videoElement.addEventListener('loadedmetadata', handleMetadataLoaded);
      videoElement.addEventListener('error', handleError);
      
      // If src is set and load() hasn't been called or needs to be re-triggered for a new src
      // videoElement.load(); // Calling load() might be necessary if src was just changed by React
      // However, since the video element with a key re-mounts, it should auto-load.
      // If issues persist, uncommenting videoElement.load() here could be a fallback.
      if (DEBUG_ENABLED) console.log('loadVideoMetadata: Event listeners attached. Waiting for metadata.', { src: videoElement.src, readyState: videoElement.readyState });
    });
  };

  // 处理视频帧提取
  const extractFrames = async (): Promise<string[]> => {
    if (
      !videoPlayerRef.current || 
      !canvasRef.current || 
      !videoPlayerRef.current.src || 
      videoPlayerRef.current.readyState < HTMLMediaElement.HAVE_METADATA // 确保元数据已加载
    ) {
      console.error('extractFrames pre-condition failed:', {
        videoPlayer: !!videoPlayerRef.current,
        canvas: !!canvasRef.current,
        videoSrc: videoPlayerRef.current?.src,
        readyState: videoPlayerRef.current?.readyState
      });
      throw new Error('视频播放器未就绪或视频源无效');
    }

    const virtualFile = createVirtualFileFromUrl(videoUrl, downloadResult?.fileName);
    const frames: string[] = [];

    const options: LocalVideoProcessingOptions = {
      captureInterval: 3,
      maxScreenshots: 50,
      file: virtualFile
    };

    return new Promise((resolve, reject) => {
      const callbacks: LocalVideoProcessingCallbacks = {
        onProgress: (progress: number) => {
          setProgress(progress);
        },
        onFrameCaptured: (blob: Blob, url: string) => {
          frames.push(url);
        },
        onComplete: (screenshots: Blob[]) => {
          resolve(frames);
        },
        onDurationDetected: (detectedDurationInfo: VideoDurationInfo) => {
          setDurationInfo(detectedDurationInfo);
        }
      };

      processLocalVideo(
        videoPlayerRef.current!,
        canvasRef.current!,
        options,
        callbacks
      ).catch(reject);
    });
  };

  // 生成PPT
  const generatePPT = async (frames: string[]): Promise<void> => {
    const frameBlobs = await Promise.all(
      frames.map(async (base64String) => {
        const res = await fetch(base64String);
        return res.blob();
      })
    );
    await generatePptBlob(frameBlobs);
  };

  // 主处理函数
  const handleStartExtraction = async () => {
    if (!videoUrl.trim()) {
      setError('请输入视频URL');
      return;
    }
    if (serviceStatus === 'error') {
      setError('后端服务异常，请稍后重试或检查服务状态。');
      return;
    }

    // 重置状态，准备开始新的处理流程
    setError('');
    setRetryCount(0);
    setExtractedFrames([]);
    setProgress(0);
    setVideoInfo(null);
    setDownloadResult(null);
    if (localVideoUrl) {
      URL.revokeObjectURL(localVideoUrl);
      setLocalVideoUrl(null);
    }
    setLocalVideoBlob(null);
    setDurationInfo(null);

    setProcessState(ProcessState.FETCHING_INFO);
    setCurrentStep(0); // 开始于"获取视频信息"

    // 注意：后续步骤将由useEffect根据processState驱动
    // 这里不直接在try/catch中包含所有步骤，而是让useEffect处理每个阶段的异步操作和错误
  };

  // 核心useEffect，用于驱动处理流程的各个阶段
  useEffect(() => {
    const executeStep = async () => {
      try {
        if (processState === ProcessState.FETCHING_INFO) {
          if (DEBUG_ENABLED) console.log('useEffect: Handling FETCHING_INFO');
          const info = await withRetry(() => fetchVideoInfo());
          setVideoInfo(info);
          setProcessState(ProcessState.DOWNLOADING);
          setCurrentStep(1); // -> 下载视频
        } else if (processState === ProcessState.DOWNLOADING) {
          if (DEBUG_ENABLED) console.log('useEffect: Handling DOWNLOADING');
          const result = await withRetry(() => downloadVideo());
          setDownloadResult(result);
          if (!result.downloadUrl) throw new Error('下载URL无效');
          setProcessState(ProcessState.LOCALIZING);
          setCurrentStep(2); // -> 本地化处理
        } else if (processState === ProcessState.LOCALIZING) {
          if (DEBUG_ENABLED) console.log('useEffect: Handling LOCALIZING');
          if (!downloadResult?.downloadUrl) throw new Error('无法本地化：下载结果或URL无效');
          const blob = await withRetry(() => localizeVideo(downloadResult.downloadUrl!));
          setLocalVideoBlob(blob);
          if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
          const newLocalUrl = URL.createObjectURL(blob);
          setLocalVideoUrl(newLocalUrl);
          setProcessState(ProcessState.LOADING_METADATA);
          setCurrentStep(3); // -> 加载视频数据
        } else if (processState === ProcessState.LOADING_METADATA) {
          if (DEBUG_ENABLED) console.log('useEffect: Handling LOADING_METADATA');
          if (!localVideoUrl || !videoPlayerRef.current) {
            throw new Error('视频播放器未准备好加载元数据。');
          }
          await new Promise(resolve => setTimeout(resolve, 50)); 
          if (videoPlayerRef.current.src !== localVideoUrl && DEBUG_ENABLED) {
             console.warn('videoPlayerRef.current.src does not match localVideoUrl.', {currentSrc: videoPlayerRef.current.src, expectedSrc: localVideoUrl});
          }
          await withRetry(() => loadVideoMetadata(videoPlayerRef.current!));
          setProcessState(ProcessState.PREPROCESSING);
          setCurrentStep(4); // -> 视频预处理
        } else if (processState === ProcessState.PREPROCESSING) {
          if (DEBUG_ENABLED) console.log('useEffect: Handling PREPROCESSING');
          setProgress(0);
          await new Promise(resolve => setTimeout(resolve, 500)); 
          setProcessState(ProcessState.EXTRACTING);
          setCurrentStep(5); // -> 提取关键帧
        } else if (processState === ProcessState.EXTRACTING) {
          if (DEBUG_ENABLED) console.log('useEffect: Handling EXTRACTING');
          if (!videoPlayerRef.current) throw new Error('视频播放器在提取帧时不可用。');
          const frames = await withRetry(() => extractFrames());
          setExtractedFrames(frames);
          setProcessState(ProcessState.GENERATING_PPT);
          setCurrentStep(6); // -> 生成PPT
        } else if (processState === ProcessState.GENERATING_PPT) {
          if (DEBUG_ENABLED) console.log('useEffect: Handling GENERATING_PPT');
          if (extractedFrames.length === 0) throw new Error('没有帧可用于生成PPT。');
          setProgress(0); 

          const frameBlobs = await Promise.all(
            extractedFrames.map(async (base64String) => {
              const res = await fetch(base64String);
              if (!res.ok) throw new Error(`无法获取帧数据: ${res.statusText}`);
              return res.blob();
            })
          );
          
          if (DEBUG_ENABLED) console.log(`Converted ${frameBlobs.length} frames to Blobs.`);

          // 确保调用的是 generatePptBlob 并正确解构
          const result = await withRetry(() => generatePptBlob(frameBlobs));
          setPptData({ pptBlob: result.pptBlob, fileName: result.fileName }); 

          setProcessState(ProcessState.COMPLETED);
          setProgress(100);
          setCurrentStep(steps.length); 
      }
      } catch (error: any) {
        console.error(`处理阶段 ${processState} 失败:`, error);
        setError(error.message || `在 ${processState} 阶段发生未知错误`);
        setProcessState(ProcessState.ERROR);
      }
    };

    if (processState !== ProcessState.IDLE && 
        processState !== ProcessState.COMPLETED && 
        processState !== ProcessState.ERROR) {
      executeStep();
    }
  }, [processState, localVideoUrl, downloadResult]); 

  // Helper to update step names if needed, or adjust currentStep mapping for new LOADING_METADATA
  // For now, assuming steps array maps well enough or setCurrentStep is managed carefully.
  // Steps array would be: 0:Info, 1:Download, 2:Localize, 3:LoadMeta, 4:Preproc, 5:Extract, 6:GenPPT
  // Ensure setCurrentStep uses the correct indices.

  // 重置状态
  const handleReset = () => {
    setProcessState(ProcessState.IDLE);
    setCurrentStep(0);
    setProgress(0);
    setError('');
    setRetryCount(0);
    setVideoInfo(null);
    setDownloadResult(null);
    setExtractedFrames([]);
    setDurationInfo(null);
    setPptData({ pptBlob: null, fileName: null });
    
    if (localVideoUrl) {
      URL.revokeObjectURL(localVideoUrl);
      setLocalVideoUrl(null);
    }
    setLocalVideoBlob(null);
  };

  const isProcessing = processState !== ProcessState.IDLE && processState !== ProcessState.COMPLETED && processState !== ProcessState.ERROR;

  // 辅助函数：触发Blob下载
  const triggerBlobDownload = (blob: Blob | null, fileName: string | null) => {
    if (!blob || !fileName) {
      setError('无法下载：文件数据或文件名缺失。');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Canvas 保持隐藏 */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      
      {/* 容器用于主要内容区，方便布局视频播放器 */}
      <div className="container mx-auto px-4 py-12">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-800">视频转PPT</h1>
          <p className="text-lg text-gray-600">
            一键智能提取，快速生成专业PPT
          </p>
        </div>

        {/* 主交互卡片区域 */}
        <div className="max-w-3xl mx-auto">
          {/* 服务状态指示器 */}
          <div className={`mb-6 p-4 rounded-lg border ${
            serviceStatus === 'healthy' 
              ? 'bg-green-50 border-green-300 text-green-700' 
              : serviceStatus === 'error' 
                ? 'bg-red-50 border-red-300 text-red-700' 
                : 'bg-gray-100 border-gray-300 text-gray-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  serviceStatus === 'healthy' 
                    ? 'bg-green-500' 
                    : serviceStatus === 'error' 
                      ? 'bg-red-500' 
                      : 'bg-gray-400'
                }`}></div>
                <span className="font-semibold text-sm">
                  {isCheckingService 
                    ? '正在检查服务状态...' 
                    : serviceStatus === 'healthy' 
                      ? 'Fly.io 云服务正常' 
                      : serviceStatus === 'error' 
                        ? 'Fly.io 云服务异常' 
                        : '未知服务状态'}
                </span>
              </div>
              <button
                onClick={checkServiceHealth}
                disabled={isCheckingService}
                className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium transition-colors ${
                  isCheckingService 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isCheckingService ? '检查中...' : '重新检查'}
              </button>
            </div>
            
            {serviceStatus === 'error' && (
              <div className="mt-3 p-3 bg-white border border-red-200 rounded-md">
                <h4 className="font-semibold text-sm mb-1 text-red-800">服务异常说明：</h4>
                <div className="text-xs text-red-700 space-y-1">
                  <p>• Fly.io 后端服务可能暂时不可用。</p>
                  <p>• 建议稍后重试或使用其他功能。</p>
                  <p>• 您也可以尝试 <a href="/local-video" className="text-blue-600 hover:underline font-medium">本地视频处理</a> 功能。</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            
            {/* URL输入区域 - visible unless COMPLETED */}
            { processState !== ProcessState.COMPLETED && (
              <div className="mb-6">
                <label htmlFor="videoUrlInput" className="block text-sm font-medium text-gray-700 mb-2">
                  视频链接
            </label>
            <div className="relative">
              <input
                    id="videoUrlInput"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="支持B站、YouTube、抖音等常见视频平台..."
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    disabled={processState !== ProcessState.IDLE} // Only enabled when IDLE
                  />
                  {videoUrl && (processState === ProcessState.IDLE) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        onClick={() => setVideoUrl('')}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="清除链接"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* "开始提取" 按钮 - 仅在 IDLE 状态显示 */}
            { processState === ProcessState.IDLE && (
              <div className="mt-6 mb-8">
              <button
                  onClick={handleStartExtraction}
                  disabled={!videoUrl.trim() || serviceStatus === 'error'}
                  className={`w-full py-3 px-6 text-base font-semibold rounded-lg shadow-md transition-all ${
                    !videoUrl.trim() || serviceStatus === 'error'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                  <span className="mr-2">🚀</span>
                  {serviceStatus === 'error' 
                    ? '服务异常，暂时无法使用' 
                    : !videoUrl.trim() 
                      ? '请输入视频链接' 
                      : '开始一键提取PPT'}
              </button>
            </div>
            )}

            {/* 视频播放器：当 localVideoUrl 有效且 (正在处理中 或 已完成) */}
            {localVideoUrl && (isProcessing || processState === ProcessState.COMPLETED) && (
              <div className="mb-6 rounded-lg overflow-hidden shadow-md border border-gray-200">
                <video 
                  ref={videoPlayerRef} 
                  src={localVideoUrl} 
                  className="w-full h-auto"
                  controls 
                  crossOrigin="anonymous" 
                  preload="metadata"
                  onLoadedData={() => DEBUG_ENABLED && console.log('Video data loaded via onLoadedData event.')}
                  onError={(e) => console.error('Video element direct error:', e)}
                  key={localVideoUrl}
                >
                  您的浏览器不支持Video标签。
                </video>
          </div>
            )}

            {/* 处理进度区域 - visible if isProcessing */}
            {isProcessing && (
              <div className="mb-6 p-4 md:p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
                   处理中...
              </h3>
                
                {/* 进度条 */}
                <div className="w-full h-3 bg-gray-200 rounded-full mb-2 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  >
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 mb-3">{progress.toFixed(0)}%</p>

                {/* 当前状态文本 */}
                <p className="text-center text-sm text-indigo-700 font-medium">
                  {steps[currentStep]?.icon} {steps[currentStep]?.name}
                  {retryCount > 1 && (
                    <span className="ml-2 text-xs text-orange-600 font-normal">(重试 {retryCount}/3)</span>
                  )}
                </p>

                {/* 视频信息 (若有) */}
                {videoInfo && error === '' && (currentStep >=0 && currentStep < 3) && ( // Show during info, download, localize
                  <div className="mt-4 p-3 bg-white rounded-md border border-gray-200 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      {videoInfo.title && (
                        <div><strong>标题:</strong> {videoInfo.title.length > 30 ? videoInfo.title.substring(0,27) + '...' : videoInfo.title}</div>
                )}
                {videoInfo.site && (
                        <div><strong>平台:</strong> {videoInfo.site}</div>
                )}
                {videoInfo.duration && (
                        <div><strong>时长:</strong> {videoInfo.duration}</div>
                      )}
                  </div>
                  </div>
                )}
              </div>
            )}

            {/* 提取结果预览 - visible if frames exist and (late processing or completed) */}
            {extractedFrames.length > 0 && (processState === ProcessState.EXTRACTING || processState === ProcessState.GENERATING_PPT || processState === ProcessState.COMPLETED) && (
              <div className="mb-6 p-4 md:p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  <span className="mr-2">🖼️</span>
                  提取结果 ({extractedFrames.length} 帧)
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto p-1">
                  {extractedFrames.map((frame, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={frame} 
                        alt={`帧 ${index + 1}`} 
                        className="w-full h-auto object-cover border border-gray-300 rounded-md shadow-sm transition-transform group-hover:scale-105"
                      />
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded-sm">
                        {index + 1}
                      </div>
                    </div>
                    ))}
                  </div>
            </div>
          )}

            {/* 错误信息 - visible if ERROR state and error message exists */}
            {processState === ProcessState.ERROR && error && (
              <div className="mb-6 p-4 md:p-6 bg-red-50 border border-red-300 rounded-lg text-red-700">
              <div className="flex items-start space-x-3">
                  <span className="text-xl mt-1">❌</span>
                <div className="flex-1">
                    <h3 className="font-semibold text-md mb-1 text-red-800">处理失败</h3>
                    <pre className="text-xs bg-white p-3 border border-red-200 rounded-md overflow-x-auto text-red-600 whitespace-pre-wrap break-all">
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          )}

            {/* 成功与下载区域 - visible if COMPLETED state */}
            {processState === ProcessState.COMPLETED && (
              <div className="mb-6 p-4 md:p-6 bg-green-50 border border-green-300 rounded-lg text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-semibold text-green-800 mb-4">处理完成，PPT已生成！</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => triggerBlobDownload(localVideoBlob, downloadResult?.fileName || 'downloaded_video.mp4')}
                    disabled={!localVideoBlob}
                    className={`w-full py-2.5 px-5 text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      !localVideoBlob
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500'
                    }`}
                  >
                    <span className="mr-1.5">🎬</span> 下载处理后的视频
                  </button>
                  <button
                    onClick={() => triggerBlobDownload(pptData.pptBlob, pptData.fileName)}
                    disabled={!pptData.pptBlob}
                    className={`w-full py-2.5 px-5 text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      !pptData.pptBlob
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500'
                    }`}
                  >
                    <span className="mr-1.5">📄</span> 下载PPT文档
                  </button>
                </div>
              </div>
            )}

            {/* 操作按钮 - "Reset/Retry" or "Processing..." indicator */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              { (processState === ProcessState.COMPLETED || processState === ProcessState.ERROR) && (
              <button
                  onClick={handleReset}
                  className={`w-full py-3 px-6 text-base font-semibold rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    processState === ProcessState.COMPLETED 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-400' 
                  }`}
                >
                  <span className="mr-2">🔄</span>
                  {processState === ProcessState.COMPLETED ? '处理新视频' : '清空并重试'}
              </button>
          )}

              { isProcessing && ( // This covers the "Processing..." state
                 <div className="w-full py-3 px-6 text-base font-semibold rounded-lg bg-gray-100 text-gray-500 text-center border border-gray-300">
                    <span className="mr-2 inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      处理中...
                    </span>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* 特性说明 */}
        <div className="mt-16 max-w-5xl mx-auto">
           <h2 className="text-2xl font-semibold text-gray-700 text-center mb-8">产品特性</h2>
          <div className="grid md:grid-cols-3 gap-6">
          {/* 当服务异常时，显示备用方案 */}
          {serviceStatus === 'error' && (
            <div className="md:col-span-3 mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                <span className="mr-2 text-xl">💡</span>
                后端服务异常：备用解决方案
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-1">🎬 本地视频处理</h4>
                  <p className="text-sm text-gray-600 mb-3">上传本地视频文件，直接在浏览器中处理，保护隐私。</p>
                  <a 
                    href="/local-video" 
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    立即使用
                  </a>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-1">📹 实时录屏 (敬请期待)</h4>
                  <p className="text-sm text-gray-600 mb-3">直接录制屏幕内容，实时生成PPT。</p>
                  <a 
                    href="#" // Placeholder for screen-recording page
                    className="inline-block bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    敬请期待
                  </a>
                </div>
              </div>
            </div>
          )}

          {[
            { icon: '🚀', title: '一键式操作', desc: '输入视频链接，一键完成所有处理步骤，无需繁琐操作。' },
            { icon: '🔄', title: '智能重试', desc: '内置自动重试机制，从容应对网络波动，确保处理成功率。' },
            { icon: '⚡', title: '高速处理', desc: '优化后端服务与前端协同，关键步骤本地化，大幅提升处理速度。' }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
} 