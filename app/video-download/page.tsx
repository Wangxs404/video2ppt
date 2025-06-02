'use client';

import { useState, useRef, useEffect } from 'react';
import { processLocalVideo, LocalVideoProcessingOptions, LocalVideoProcessingCallbacks } from '../utils/localVideoProcessing';
import { createAndDownloadPPT } from '../utils/pptGeneration';
import { VideoDurationInfo } from '../utils/videoDurationUtils';

const DEBUG_ENABLED = false; // 新增 DEBUG_ENABLED 定义

// Fly.io部署的API基础URL
const API_BASE_URL = 'https://video-backend-flyio.fly.dev';

// 新增：创建虚拟文件对象用于格式检测
const createVirtualFileFromUrl = (videoUrl: string, fileName?: string): File => {
  // 从 URL 或文件名推断格式
  const url = new URL(videoUrl);
  const pathname = url.pathname;
  const extension = pathname.split('.').pop()?.toLowerCase() || 'mp4';
  const name = fileName || `downloaded_video.${extension}`;
  
  // 创建一个空的 Blob 作为占位符
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

export default function VideoDownloadPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [healthChecking, setHealthChecking] = useState(false);
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState('');
  const [healthInfo, setHealthInfo] = useState<any>(null);

  // 新增状态
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const [isGeneratingPpt, setIsGeneratingPpt] = useState(false);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 新增本地化相关状态
  const [localVideoBlob, setLocalVideoBlob] = useState<Blob | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [videoReady, setVideoReady] = useState(false);

  // 新增状态，参考 local-video/page.tsx
  const [preprocessProgress, setPreprocessProgress] = useState<number>(0);
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [durationInfo, setDurationInfo] = useState<VideoDurationInfo | null>(null);
  const [isPreprocessing, setIsPreprocessing] = useState<boolean>(false);
  const isPreprocessingRef = useRef<boolean>(false);

  // 同步 isPreprocessing 状态到 ref
  useEffect(() => {
    isPreprocessingRef.current = isPreprocessing;
  }, [isPreprocessing]);

  // 清理本地视频资源
  useEffect(() => {
    return () => {
      if (localVideoUrl) {
        URL.revokeObjectURL(localVideoUrl);
      }
    };
  }, [localVideoUrl]);

  // 健康检查
  const checkHealth = async () => {
    setHealthChecking(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      
      if (response.ok) {
        setHealthInfo(data);
      } else {
        setError(`健康检查失败: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError('无法连接到API服务，请检查网络连接');
    } finally {
      setHealthChecking(false);
    }
  };

  // 获取视频信息
  const getVideoInfo = async () => {
    if (!videoUrl.trim()) {
      setError('请输入视频URL');
      return;
    }

    setInfoLoading(true);
    setError('');
    setVideoInfo(null);
    setVideoSrc(null);
    setExtractedFrames([]);
    // 清理本地化状态
    setVideoReady(false);
    setLocalVideoBlob(null);
    if (localVideoUrl) {
      URL.revokeObjectURL(localVideoUrl);
      setLocalVideoUrl(null);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data: VideoInfo = await response.json();

      if (data.success) {
        setVideoInfo(data);
      } else {
        setError(data.error || data.message || '获取视频信息失败');
      }

    } catch (err) {
      setError('网络错误或服务器错误');
    } finally {
      setInfoLoading(false);
    }
  };

  // 新增：下载视频到本地
  const downloadVideoToLocal = async (videoUrl: string): Promise<Blob> => {
    const response = await fetch(videoUrl);
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
        setDownloadProgress(progress);
      }
    }

    const blob = new Blob(chunks, { type: 'video/mp4' });
    return blob;
  };

  // 新增：准备本地视频
  const prepareLocalVideo = async () => {
    if (!videoSrc) return;

    setIsDownloadingVideo(true);
    setDownloadProgress(0);
    setVideoReady(false);
    setError('');

    try {
      // 下载视频到本地
      const blob = await downloadVideoToLocal(videoSrc);
      setLocalVideoBlob(blob);

      // 创建本地URL
      if (localVideoUrl) {
        URL.revokeObjectURL(localVideoUrl);
      }
      const newLocalUrl = URL.createObjectURL(blob);
      setLocalVideoUrl(newLocalUrl);
      setVideoReady(true);

      console.log(`✅ 视频已下载到本地，大小: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
    } catch (err: any) {
      setError(`视频本地化失败: ${err.message || '未知错误'}`);
    } finally {
      setIsDownloadingVideo(false);
    }
  };

  // 下载视频
  const handleDownload = async () => {
    if (!videoUrl.trim()) {
      setError('请输入视频URL');
      return;
    }

    setLoading(true);
    setError('');
    setDownloadResult(null);

    try {
      const response = await fetch('/api/download-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data: DownloadResult = await response.json();

      if (response.ok && data.success) {
        setDownloadResult(data);
        if (data.downloadUrl) {
          const fullUrl = data.downloadUrl.startsWith('/api/file')
            ? `${API_BASE_URL}${data.downloadUrl}`
            : data.downloadUrl;
          setVideoSrc(fullUrl);
          setExtractedFrames([]);
          // 重置本地化状态
          setVideoReady(false);
          setLocalVideoBlob(null);
          if (localVideoUrl) {
            URL.revokeObjectURL(localVideoUrl);
            setLocalVideoUrl(null);
          }
        }
      } else {
        let errorMsg = `HTTP ${response.status}: ${response.statusText} (来自 Fly.io 云端服务)\n`;
        if (data.error) {
          errorMsg += `错误: ${data.error}\n`;
        }
        if (data.message) {
          errorMsg += `消息: ${data.message}\n`;
        }
        if (data.logs && data.logs.length > 0) {
          errorMsg += `\n详细日志:\n${data.logs.join('\n')}`;
        }
        setError(errorMsg);
      }
    } catch (err: any) {
      setError(`调用 Fly.io 云端服务时网络错误: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 新增：提取视频帧（优化版本）
  const handleExtractFrames = async () => {
    if (!videoPlayerRef.current || !canvasRef.current) {
      setError('视频播放器或Canvas未加载');
      return;
    }

    if (!videoReady || !localVideoUrl) {
      setError('请先将视频下载到本地');
      return;
    }

    setIsExtractingFrames(true);
    setIsPreprocessing(true);
    isPreprocessingRef.current = true;
    setError('');
    setExtractedFrames([]); 
    setPreprocessProgress(0);
    setExtractionProgress(0);
    setDurationInfo(null);

    try {
      // 创建虚拟文件对象用于格式检测和优化
      const virtualFile = createVirtualFileFromUrl(videoSrc!, downloadResult?.fileName);
      
      // 使用高效的配置参数
      const options: LocalVideoProcessingOptions = {
        captureInterval: 3, // 3秒间隔，避免过于密集
        maxScreenshots: 50, // 适中的截图数量
        file: virtualFile // 传递文件信息用于智能优化
      };

      const callbacks: LocalVideoProcessingCallbacks = {
        onProgress: (progress: number) => {
          if (isPreprocessingRef.current) {
            setPreprocessProgress(progress);
            // 当预处理进度达到100%时，切换到提取阶段
            if (progress >= 100) {
              setIsPreprocessing(false);
              isPreprocessingRef.current = false;
              setExtractionProgress(0);
            }
          } else {
            setExtractionProgress(progress);
          }
          if (DEBUG_ENABLED) console.log(`处理进度: ${progress}%`);
        },
        onFrameCaptured: (blob: Blob, url: string) => {
          // 确保预处理状态已结束
          if (isPreprocessingRef.current) {
            setIsPreprocessing(false);
            isPreprocessingRef.current = false;
          }
          setExtractedFrames((prevFrames) => [...prevFrames, url]);
        },
        onComplete: (screenshots: Blob[]) => {
          if (DEBUG_ENABLED) console.log('所有帧提取完毕', screenshots);
          setIsExtractingFrames(false);
          setIsPreprocessing(false);
          isPreprocessingRef.current = false;
          setExtractionProgress(100);
        },
        onDurationDetected: (detectedDurationInfo: VideoDurationInfo) => {
          setDurationInfo(detectedDurationInfo);
          if (DEBUG_ENABLED) console.log('视频时长检测信息:', detectedDurationInfo);
        }
      };

      await processLocalVideo(
        videoPlayerRef.current,
        canvasRef.current,
        options,
        callbacks
      );
    } catch (err: any) {
      setError(`提取帧失败: ${err.message || '未知错误'}`);
      setIsExtractingFrames(false);
      setIsPreprocessing(false);
      isPreprocessingRef.current = false;
    }
  };

  // 新增：生成并下载PPT
  const handleGeneratePpt = async () => {
    if (extractedFrames.length === 0) {
      setError('没有提取到帧，无法生成PPT');
      return;
    }
    setIsGeneratingPpt(true);
    setError('');
    try {
      // 将base64字符串转换为Blob对象
      const frameBlobs = await Promise.all(
        extractedFrames.map(async (base64String) => {
          const res = await fetch(base64String);
          return res.blob();
        })
      );
      // 假设 createAndDownloadPPT 接受Blob数组作为参数
      await createAndDownloadPPT(frameBlobs);
    } catch (err: any) {
      setError(`生成PPT失败: ${err.message || '未知错误'}`);
    } finally {
      setIsGeneratingPpt(false);
    }
  };

  // 下载文件到本地
  const handleDownloadFile = () => {
    if (downloadResult?.downloadUrl) {
      const fullUrl = downloadResult.downloadUrl.startsWith('/api/file')
        ? `${API_BASE_URL}${downloadResult.downloadUrl}`
        : downloadResult.downloadUrl;
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🎬 云端视频下载工具
        </h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-600">基于 Fly.io 云服务 • 支持B站、YouTube、抖音等平台</p>
          <p className="text-sm text-blue-600 mt-1">🌐 {API_BASE_URL}</p>
        </div>

        <div className="space-y-6">
          
          {/* 服务状态检查 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-blue-900 font-semibold text-lg">🔧 API服务状态</h3>
              <button
                onClick={checkHealth}
                disabled={healthChecking}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  healthChecking 
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {healthChecking ? '检查中...' : '检查服务状态'}
              </button>
            </div>
            
            {healthInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="text-green-700 font-medium">✅ 服务正常运行</p>
                  <p className="text-gray-700">🕒 运行时间: {Math.round(healthInfo.uptime / 60)}分钟</p>
                  <p className="text-gray-700">🏷️ 版本: {healthInfo.lux_version}</p>
                  <p className="text-gray-700">💻 平台: {healthInfo.platform} {healthInfo.arch}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700">🔧 Lux工具: {healthInfo.checks.lux_binary ? '✅' : '❌'}</p>
                  <p className="text-gray-700">📁 存储目录: {healthInfo.checks.downloads_directory ? '✅' : '❌'}</p>
                  <p className="text-gray-700">🧠 内存使用: {healthInfo.memory.used}MB / {healthInfo.memory.total}MB</p>
                </div>
              </div>
            )}
          </div>

          {/* 输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              📺 视频链接
            </label>
            <div className="relative">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="请输入B站、YouTube、抖音等视频链接..."
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg pr-20"
                disabled={loading || infoLoading}
              />
              <button
                onClick={getVideoInfo}
                disabled={infoLoading || !videoUrl.trim()}
                className={`absolute right-2 top-2 bottom-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  infoLoading || !videoUrl.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {infoLoading ? '📊' : '📋 信息'}
              </button>
            </div>
          </div>

          {/* 视频信息显示 */}
          {videoInfo && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-green-800 font-semibold text-lg mb-4">
                📹 视频信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {videoInfo.title && (
                  <div>
                    <span className="text-gray-600 font-medium">标题:</span>
                    <p className="text-gray-800 mt-1">{videoInfo.title}</p>
                  </div>
                )}
                {videoInfo.site && (
                  <div>
                    <span className="text-gray-600 font-medium">网站:</span>
                    <p className="text-gray-800 mt-1">{videoInfo.site}</p>
                  </div>
                )}
                {videoInfo.duration && (
                  <div>
                    <span className="text-gray-600 font-medium">时长:</span>
                    <p className="text-gray-800 mt-1">{videoInfo.duration}</p>
                  </div>
                )}
                {videoInfo.size && (
                  <div>
                    <span className="text-gray-600 font-medium">大小:</span>
                    <p className="text-gray-800 mt-1">{videoInfo.size}</p>
                  </div>
                )}
              </div>
              {videoInfo.quality && videoInfo.quality.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-600 font-medium">可用质量:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {videoInfo.quality.map((q, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 下载按钮 */}
          <button
            onClick={handleDownload}
            disabled={loading || !videoUrl.trim()}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all transform ${ 
              loading || !videoUrl.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
            }`}
          >
            {loading ? '⏳ 云端下载中...' : '📥 开始云端下载'}
          </button>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <span className="text-red-500 text-xl">❌</span>
                <div className="flex-1">
                  <div className="text-red-700 font-medium mb-2">错误信息:</div>
                  <pre className="text-red-600 text-sm whitespace-pre-wrap font-mono bg-red-100 p-3 rounded-lg overflow-x-auto">
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* 下载成功结果 */}
          {downloadResult && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 rounded-xl p-6">
              <h3 className="text-green-800 font-semibold text-lg mb-4">
                ✅ 云端下载完成！
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600 font-medium">文件名:</span>
                  <p className="text-gray-800 mt-1 break-all">{downloadResult.fileName}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">文件大小:</span>
                  <p className="text-gray-800 mt-1">
                    {downloadResult.fileSize ? `${Math.round(downloadResult.fileSize / 1024 / 1024)} MB` : '未知'}
                  </p>
                </div>
                {downloadResult.downloadId && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600 font-medium">下载ID:</span>
                    <p className="text-gray-800 mt-1 font-mono text-xs">{downloadResult.downloadId}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleDownloadFile}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
              >
                📥 下载文件到本地
              </button>
            </div>
          )}

          {/* 新增：视频播放器、帧提取和PPT生成区域 */}
          {videoSrc && (
            <div className="my-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">🖼️ 视频处理与PPT生成</h3>
              
              {/* 隐藏的Canvas元素用于帧提取 */}
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

              <video 
                ref={videoPlayerRef} 
                src={localVideoUrl || videoSrc} 
                controls 
                className="w-full rounded-lg shadow-md mb-6"
                crossOrigin="anonymous"
                preload="metadata" // 预加载元数据
                onLoadedMetadata={() => {
                  if (DEBUG_ENABLED) console.log('视频元数据已加载，时长:', videoPlayerRef.current?.duration);
                }}
                onCanPlayThrough={() => {
                  if (DEBUG_ENABLED) console.log('视频可以流畅播放');
                }}
              >
                您的浏览器不支持Video标签。
              </video>

              {/* 新增：视频本地化区域 */}
              {!videoReady && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h4 className="text-lg font-medium text-yellow-800 mb-3">
                    🚀 性能优化：将视频下载到本地
                  </h4>
                  <p className="text-yellow-700 text-sm mb-4">
                    为了获得最佳处理速度，建议先将视频完全下载到本地，这样可以避免网络延迟影响帧提取效率。
                  </p>
                  
                  {!isDownloadingVideo ? (
                    <button
                      onClick={prepareLocalVideo}
                      className="w-full py-3 px-6 rounded-xl font-semibold text-white text-lg transition-all bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                    >
                      📥 下载视频到本地 (推荐)
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-300 text-center text-xs text-white font-medium leading-4"
                          style={{ width: `${downloadProgress}%` }}
                        >
                          {downloadProgress.toFixed(0)}%
                        </div>
                      </div>
                      <p className="text-center font-medium text-orange-700">
                        正在下载视频到本地... ({downloadProgress.toFixed(1)}%)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 视频就绪提示 */}
              {videoReady && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 text-lg">✅</span>
                    <div>
                      <p className="text-green-800 font-medium">视频已准备就绪</p>
                      <p className="text-green-700 text-sm">
                        本地大小: {localVideoBlob ? (localVideoBlob.size / 1024 / 1024).toFixed(2) : '0'}MB，可以开始高速处理
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 新增：处理参数调整 */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">⚙️ 处理参数 (可选调整)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="text-blue-700">提取间隔: 3秒</label>
                    <p className="text-blue-600 text-xs">智能采样，提高效率</p>
                  </div>
                  <div>
                    <label className="text-blue-700">最大帧数: 50张</label>
                    <p className="text-blue-600 text-xs">适中的PPT页数</p>
                  </div>
                  <div>
                    <label className="text-blue-700">处理模式: 增强</label>
                    <p className="text-blue-600 text-xs">使用智能差异检测</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleExtractFrames}
                  disabled={isExtractingFrames || !videoReady}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-white text-lg transition-all ${
                    isExtractingFrames || !videoReady
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {!videoReady 
                    ? '⚠️ 请先下载视频到本地'
                    : isExtractingFrames 
                      ? (isPreprocessing ? `⏳ 预处理中... (${preprocessProgress.toFixed(0)}%)` : `🖼️ 提取帧中... (${extractionProgress.toFixed(0)}%)`)
                      : '🎞️ 开始高速提取视频帧'}
                </button>

                {/* 新增：处理中状态显示 */}
                {isExtractingFrames && (
                  <div className="space-y-2 my-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden border border-blue-300 shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-in-out text-center text-xs text-white font-medium leading-6"
                        style={{ width: isPreprocessing ? `${preprocessProgress}%` : `${extractionProgress}%` }}
                      >
                        {isPreprocessing ? `${preprocessProgress.toFixed(0)}%` : `${extractionProgress.toFixed(0)}%`}
                      </div>
                    </div>
                    <p className="text-center font-medium text-blue-700">
                      {isPreprocessing 
                        ? `视频预处理中... (${preprocessProgress.toFixed(0)}%)` 
                        : `正在提取帧 (${extractionProgress.toFixed(0)}%)...`}
                    </p>
                    {durationInfo && (
                      <p className="text-center text-sm text-blue-600">
                        视频时长: {durationInfo.duration.toFixed(1)}s (检测方式: {durationInfo.method})
                      </p>
                    )}
                  </div>
                )}

                {extractedFrames.length > 0 && (
                  <div className="p-4 bg-white border border-gray-200 rounded-xl">
                    <h4 className="text-lg font-medium text-gray-700 mb-3">🏞️ 提取的帧 ({extractedFrames.length} 帧)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-2 rounded-md bg-gray-100">
                      {extractedFrames.map((frame, index) => (
                        <img 
                          key={index} 
                          src={frame} 
                          alt={`帧 ${index + 1}`} 
                          className="w-full h-auto object-cover rounded shadow-sm border border-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {extractedFrames.length > 0 && (
                  <button
                    onClick={handleGeneratePpt}
                    disabled={isGeneratingPpt || extractedFrames.length === 0}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white text-lg transition-all ${
                      isGeneratingPpt || extractedFrames.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isGeneratingPpt ? '⚙️ 生成PPT中...' : '📄 生成并下载PPT'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-gray-800 font-semibold text-lg mb-4">
              📖 使用说明
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <p>• 🎯 支持 B站、YouTube、抖音等主流平台</p>
                <p>• ☁️ 基于 Fly.io 云端服务，稳定快速</p>
                <p>• 🔍 可先获取视频信息再决定是否下载</p>
                <p>• 🚀 本地化处理，提升10倍处理速度</p>
              </div>
              <div className="space-y-2">
                <p>• 🌐 确保网络连接正常</p>
                <p>• ⏱️ 建议先下载到本地再处理</p>
                <p>• 💾 本地处理避免网络延迟</p>
                <p>• 🔐 某些内容可能需要登录权限</p>
              </div>
            </div>
            
            {/* 新增性能提示 */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-blue-800 font-medium mb-2">⚡ 性能优化提示</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• 📥 <strong>本地下载</strong>：先下载视频可避免网络延迟，提升处理速度</p>
                <p>• 🎯 <strong>智能采样</strong>：使用3秒间隔和智能差异检测算法</p>
                <p>• 🧠 <strong>增强算法</strong>：自动检测视频格式并采用最优处理策略</p>
                <p>• 💾 <strong>内存优化</strong>：处理完成后自动清理临时文件</p>
              </div>
            </div>
          </div>

          {/* 支持的网站示例 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-purple-800 font-semibold text-lg mb-4">
              🌍 支持的网站示例
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {['哔哩哔哩', 'YouTube', '抖音', '快手', '微博', '优酷', '腾讯视频', 'Twitter'].map((site) => (
                <div key={site} className="bg-white p-3 rounded-lg text-center border border-purple-100">
                  {site}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 