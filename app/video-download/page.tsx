'use client';

import { useState } from 'react';

// Fly.io部署的API基础URL
const API_BASE_URL = 'https://video-backend-flyio.fly.dev';

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
  const [downloadMode, setDownloadMode] = useState<'fly' | 'local'>('fly');

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

  // 下载视频
  const handleDownload = async () => {
    if (!videoUrl.trim()) {
      setError('请输入视频URL');
      return;
    }

    setLoading(true);
    setError('');
    setDownloadResult(null);

    const endpoint = downloadMode === 'fly' ? '/api/download-video' : '/api/download-local';
    const apiDisplayName = downloadMode === 'fly' ? 'Fly.io 云端服务' : '本地服务';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data: DownloadResult = await response.json();

      if (response.ok && data.success) {
        setDownloadResult(data);
      } else {
        let errorMsg = `HTTP ${response.status}: ${response.statusText} (来自 ${apiDisplayName})\n`;
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
      setError(`调用 ${apiDisplayName} 时网络错误: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 下载文件到本地
  const handleDownloadFile = () => {
    if (downloadResult?.downloadUrl) {
      const fullUrl = downloadMode === 'fly' && downloadResult.downloadUrl.startsWith('/api/file')
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

          {/* 下载模式选择器 */}
          <div className="bg-gray-100 p-4 rounded-xl">
            <h3 className="text-gray-800 font-semibold text-lg mb-3">下载模式选择</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setDownloadMode('fly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all w-full ${ 
                  downloadMode === 'fly' 
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-300'
                }`}
              >
                🚀 云端下载 (Fly.io)
              </button>
              <button
                onClick={() => setDownloadMode('local')}
                className={`px-6 py-3 rounded-lg font-medium transition-all w-full ${ 
                  downloadMode === 'local' 
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-green-700 hover:bg-green-50 border border-green-300'
                }`}
              >
                💻 本地下载 (lux.exe)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {downloadMode === 'fly' 
                ? '使用已部署的Fly.io云服务进行下载，稳定快速。'
                : '直接使用您本地环境的lux.exe进行下载，适合测试或特定网络环境。确保bin目录下有lux.exe。'}
            </p>
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
                : downloadMode === 'fly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
            }`}
          >
            {loading ? `⏳ ${downloadMode === 'fly' ? '云端' : '本地'}下载中...` : `📥 ${downloadMode === 'fly' ? '开始云端下载' : '开始本地下载'}`}
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
            <div className={`bg-gradient-to-r ${downloadMode === 'fly' ? 'from-green-50 to-emerald-50 border-green-200' : 'from-sky-50 to-cyan-50 border-sky-200'} rounded-xl p-6`}>
              <h3 className={`${downloadMode === 'fly' ? 'text-green-800' : 'text-sky-800'} font-semibold text-lg mb-4`}>
                ✅ {downloadMode === 'fly' ? '云端' : '本地'}下载完成！
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
                {downloadResult.downloadId && downloadMode === 'fly' && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600 font-medium">下载ID (Fly.io):</span>
                    <p className="text-gray-800 mt-1 font-mono text-xs">{downloadResult.downloadId}</p>
                  </div>
                )}
                {downloadResult.filePath && downloadMode === 'local' && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600 font-medium">文件路径 (本地):</span>
                    <p className="text-gray-800 mt-1 font-mono text-xs">{downloadResult.filePath}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleDownloadFile}
                className={`w-full px-6 py-3 ${downloadMode === 'fly' ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'} text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg`}
              >
                📥 下载文件到本地
              </button>
            </div>
          )}

          {/* 下载中提示 */}
          {loading && (
            <div className={`bg-gradient-to-r ${downloadMode === 'fly' ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-gray-50 to-slate-50 border-gray-200'} rounded-xl p-6`}>
              <div className="flex items-center space-x-4">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${downloadMode === 'fly' ? 'border-blue-600' : 'border-gray-600'}`}></div>
                <div>
                  <div className={`${downloadMode === 'fly' ? 'text-blue-800' : 'text-gray-800'} font-medium`}>正在{downloadMode === 'fly' ? '云端' : '本地'}处理视频下载...</div>
                  <div className={`${downloadMode === 'fly' ? 'text-blue-600' : 'text-gray-600'} text-sm mt-1`}>
                    {downloadMode === 'fly' ? '使用 Fly.io 服务，请耐心等待' : '使用本地 Lux 工具下载，请耐心等待'}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-blue-600 bg-blue-100 p-3 rounded-lg">
                💡 提示: 下载时间取决于视频大小和网络速度。如果长时间无响应，可能需要登录验证或网络问题。
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
                <p>• ☁️ 基于云端服务，无需本地工具</p>
                <p>• 🔍 可先获取视频信息再决定是否下载</p>
              </div>
              <div className="space-y-2">
                <p>• 🌐 确保网络连接正常</p>
                <p>• ⏱️ 大文件下载可能需要较长时间</p>
                <p>• 🔐 某些内容可能需要登录权限</p>
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