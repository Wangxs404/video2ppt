'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ScreenRecordingPage() {
  const [recordingState, setRecordingState] = useState<'idle' | 'ready' | 'recording' | 'paused'>('idle')
  const [recordingTime, setRecordingTime] = useState<number>(0)
  const [recordingOptions, setRecordingOptions] = useState({
    withAudio: true,
    captureArea: 'screen', // 'screen', 'window', 'tab'
  })

  // 格式化录制时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 切换音频选项
  const handleToggleAudio = () => {
    setRecordingOptions({
      ...recordingOptions,
      withAudio: !recordingOptions.withAudio,
    })
  }

  // 设置捕获区域
  const handleSetCaptureArea = (area: 'screen' | 'window' | 'tab') => {
    setRecordingOptions({
      ...recordingOptions,
      captureArea: area,
    })
  }

  // 开始录制准备
  const handleStartPrepare = () => {
    setRecordingState('ready')
    // 在实际应用中，这里会请求屏幕捕获权限
  }

  // 开始录制
  const handleStartRecording = () => {
    setRecordingState('recording')
    setRecordingTime(0)
    
    // 模拟计时器
    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
    
    // 存储定时器ID到window对象，便于清除
    window.recordingTimer = timer
  }

  // 暂停录制
  const handlePauseRecording = () => {
    if (recordingState === 'recording') {
      setRecordingState('paused')
      clearInterval(window.recordingTimer)
    } else if (recordingState === 'paused') {
      setRecordingState('recording')
      
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      window.recordingTimer = timer
    }
  }

  // 停止录制
  const handleStopRecording = () => {
    setRecordingState('idle')
    clearInterval(window.recordingTimer)
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          <span className="bg-accent text-light px-3 py-1 border-3 border-black inline-block transform rotate-1">实时录屏</span>
          <span className="text-2xl ml-3">转PPT</span>
        </h1>

        <div className="card bg-light mb-8">
          <h2 className="text-2xl font-bold mb-4">屏幕录制</h2>
          <p className="mb-6">
            在录制过程中，我们会自动分析屏幕内容，提取关键帧并生成PPT幻灯片。
            适合会议记录、演示文稿整理等场景。
          </p>
          
          {/* 录制预览区域 */}
          <div className="border-3 border-black bg-dark aspect-video mb-6 relative overflow-hidden">
            {recordingState === 'idle' ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-light">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-xl font-bold">准备好开始录制了吗？</p>
                <p className="text-gray-400 mt-2">点击下方按钮选择录制内容</p>
              </div>
            ) : recordingState === 'ready' ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-light">
                <p className="text-xl font-bold">请选择要录制的内容</p>
                <div className="flex mt-4 space-x-4">
                  <button 
                    onClick={() => handleSetCaptureArea('screen')}
                    className={`px-4 py-2 border-3 border-black font-bold ${recordingOptions.captureArea === 'screen' ? 'bg-primary' : 'bg-gray-600'}`}
                  >
                    整个屏幕
                  </button>
                  <button 
                    onClick={() => handleSetCaptureArea('window')}
                    className={`px-4 py-2 border-3 border-black font-bold ${recordingOptions.captureArea === 'window' ? 'bg-primary' : 'bg-gray-600'}`}
                  >
                    应用窗口
                  </button>
                  <button 
                    onClick={() => handleSetCaptureArea('tab')}
                    className={`px-4 py-2 border-3 border-black font-bold ${recordingOptions.captureArea === 'tab' ? 'bg-primary' : 'bg-gray-600'}`}
                  >
                    浏览器标签
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="bg-accent text-light px-4 py-2 border-3 border-black inline-block font-bold text-3xl">
                  {formatTime(recordingTime)}
                </div>
                {recordingState === 'paused' && (
                  <div className="bg-primary text-light px-4 py-2 border-3 border-black inline-block font-bold mt-4">
                    已暂停
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 录制选项 */}
          <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={recordingOptions.withAudio} 
                  onChange={handleToggleAudio}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 border-3 border-black peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:border-3 after:border-black after:h-5 after:w-5 after:transition-all peer-checked:bg-accent relative"></div>
                <span className="ml-3 font-bold">包含麦克风声音</span>
              </label>
            </div>
            
            <div className="font-bold">
              捕获区域: {recordingOptions.captureArea === 'screen' ? '整个屏幕' : recordingOptions.captureArea === 'window' ? '应用窗口' : '浏览器标签'}
            </div>
          </div>
          
          {/* 录制控制按钮 */}
          <div className="flex flex-wrap gap-4">
            {recordingState === 'idle' && (
              <button 
                onClick={handleStartPrepare}
                className="btn bg-primary text-light flex-1"
              >
                开始录制
              </button>
            )}
            
            {recordingState === 'ready' && (
              <>
                <button 
                  onClick={handleStartRecording}
                  className="btn bg-accent text-light flex-1"
                >
                  开始录制
                </button>
                <button 
                  onClick={() => setRecordingState('idle')}
                  className="btn bg-light flex-1"
                >
                  取消
                </button>
              </>
            )}
            
            {(recordingState === 'recording' || recordingState === 'paused') && (
              <>
                <button 
                  onClick={handlePauseRecording}
                  className="btn bg-primary text-light flex-1"
                >
                  {recordingState === 'recording' ? '暂停' : '继续'}
                </button>
                <button 
                  onClick={handleStopRecording}
                  className="btn bg-accent text-light flex-1"
                >
                  结束并生成PPT
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card bg-light">
          <h2 className="text-2xl font-bold mb-4">实时录屏转PPT的优势</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="bg-primary text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>实时提取</strong> - 同步录制和分析，无需等待视频处理完成</p>
            </li>
            <li className="flex items-start">
              <div className="bg-secondary w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>会议记录</strong> - 自动记录会议内容，无需手动整理笔记</p>
            </li>
            <li className="flex items-start">
              <div className="bg-accent text-light w-8 h-8 flex items-center justify-center border-3 border-black mr-3 flex-shrink-0">✓</div>
              <p><strong>智能识别</strong> - 自动识别幻灯片切换，提取关键信息</p>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}

// 扩展window对象类型，添加recordingTimer属性
declare global {
  interface Window {
    recordingTimer: NodeJS.Timeout;
  }
} 