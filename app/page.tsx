import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero 部分 */}
      <section className="py-16 md:py-20 lg:py-28 bg-light relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full -translate-y-1/2 translate-x-1/2 border-3 border-black"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary rounded-full translate-y-1/2 -translate-x-1/2 border-3 border-black"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
                <span className="bg-primary text-light px-3 py-1 border-3 border-black mr-2 inline-block transform rotate-2">Video</span>
                <span className="bg-accent text-light px-3 py-1 border-3 border-black inline-block transform -rotate-2">2PPT</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                将<span className="bg-secondary px-2 border-3 border-black">任意视频</span>智能转换为精美PPT
              </h2>
              <p className="text-lg mb-8">
                无论是本地视频、在线课程还是实时录屏，Video2PPT都能快速提取关键内容，生成专业幻灯片。适合会议记录、学习笔记、课程总结等多种场景。<a href="https://github.com/Wangxs404/video2ppt" target="_blank" rel="noopener noreferrer"><br/>100%开源 https://github.com/Wangxs404/video2ppt</a>
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/screen-recording" className="btn bg-primary text-light text-center">
                  立即开始
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-white border-3 border-black shadow-brutal-lg overflow-hidden">
                <img 
                  src="/hero.png" 
                  alt="Video2PPT功能展示" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-accent text-light px-3 py-1 border-3 border-black transform rotate-3">
                  高效转换
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-secondary border-3 border-black p-4 shadow-brutal transform rotate-3">
                <p className="font-bold">100% 免费使用</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特点部分 */}
      <section id="features" className="py-16 md:py-20 bg-accent border-y-3 border-black">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center text-light">
            <span className="bg-light text-dark px-3 py-1 border-3 border-black inline-block transform -rotate-1">强大功能</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="card bg-light transform hover:rotate-1">
              <div className="bg-primary text-light w-16 h-16 rounded-full border-3 border-black flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">支持多种来源</h3>
              <p>本地视频、在线视频链接、YouTube、Bilibili等平台，一键导入，快速处理。</p>
            </div>
            
            <div className="card bg-light transform hover:-rotate-1">
              <div className="bg-secondary text-dark w-16 h-16 rounded-full border-3 border-black flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">实时录屏提取</h3>
              <p>边开会边录制，自动识别屏幕内容，提取关键信息，高效记录会议要点。</p>
            </div>
            
            <div className="card bg-light transform hover:rotate-1">
              <div className="bg-accent text-light w-16 h-16 rounded-full border-3 border-black flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">智能内容提取</h3>
              <p>自动识别视频中的文字、图表、重点内容，生成结构化PPT，省时省力。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 使用方法 */}
      <section id="how-it-works" className="py-16 md:py-20 bg-light">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">
            <span className="bg-primary text-light px-3 py-1 border-3 border-black inline-block transform rotate-1">使用方法</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 mt-12">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-secondary border-3 border-black flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">上传或提供视频</h3>
              <p>上传本地视频文件，或提供在线视频链接，也可以选择直接录制屏幕。</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-secondary border-3 border-black flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">智能处理分析</h3>
              <p>我们的AI系统自动分析视频内容，识别关键信息，提取重要画面和文字。</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-secondary border-3 border-black flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">下载PPT文件</h3>
              <p>几分钟内完成处理，生成专业PPT文件，可直接下载使用或进一步编辑。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 使用场景 */}
      <section id="use-cases" className="py-16 md:py-20 bg-secondary border-y-3 border-black">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">
            <span className="bg-dark text-light px-3 py-1 border-3 border-black inline-block transform -rotate-1">适用场景</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="card bg-light transform hover:rotate-1">
              <h3 className="text-xl font-bold mb-4">在线会议记录</h3>
              <p>实时录制在线会议，自动生成会议纪要PPT，让团队协作更高效。</p>
            </div>
            
            <div className="card bg-light transform hover:-rotate-1">
              <h3 className="text-xl font-bold mb-4">课程学习笔记</h3>
              <p>将在线课程视频转换为结构化学习笔记，提高学习效率。</p>
            </div>
            
            <div className="card bg-light transform hover:rotate-1">
              <h3 className="text-xl font-bold mb-4">研讨会内容提取</h3>
              <p>参加线上研讨会，自动提取关键内容，生成精华摘要。</p>
            </div>
            
            <div className="card bg-light transform hover:-rotate-1">
              <h3 className="text-xl font-bold mb-4">教学视频转PPT</h3>
              <p>将教学视频转换为课件，方便教师备课和学生复习。</p>
            </div>
            
            <div className="card bg-light transform hover:rotate-1">
              <h3 className="text-xl font-bold mb-4">演讲内容整理</h3>
              <p>将演讲视频转换为PPT，提炼演讲要点，便于后续分享。</p>
            </div>
            
            <div className="card bg-light transform hover:-rotate-1">
              <h3 className="text-xl font-bold mb-4">教程知识提取</h3>
              <p>从视频教程中提取关键知识点，生成学习资料。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA部分 */}
      <section id="cta" className="py-16 md:py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title text-light">
            <span className="bg-light text-dark px-3 py-1 border-3 border-black inline-block">免费开始使用</span>
          </h2>
          <p className="text-light text-xl mb-8 max-w-2xl mx-auto">
            无需注册，无需付费，立即体验Video2PPT的强大功能，提升你的工作和学习效率！
          </p>
          
          <div className="card bg-light max-w-xl mx-auto p-8 transform hover:rotate-1">
            <div className="space-y-4">
            <div>
                <Link 
                  href="/screen-recording" 
                  className="btn bg-accent text-light w-full"
                >
                  开始录屏
                </Link>
              </div>
              
              <p className="text-center font-bold">- 或者 -</p>
              <div>
                <Link 
                  href="/local-video" 
                  className="btn bg-secondary block text-center"
                >
                  上传本地视频
                </Link>
              </div>
              <p className="text-center font-bold">- 或者 -</p>
              <div>
                <Link 
                  href="/online-video" 
                  className="brutal-input block py-3 text-center hover:bg-primary/10 transition-colors"
                >
                  输入视频链接（YouTube, Bilibili等）
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-8 border-t-3 border-black bg-light">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-xl font-black mb-4 md:mb-0 flex items-center">
              <span className="bg-primary text-light px-3 py-1 border-3 border-black mr-2">Video</span>
              <span className="bg-accent text-light px-3 py-1 border-3 border-black">2PPT</span>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/Wangxs404/video2ppt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="border-3 border-black p-2 bg-primary text-light shadow-brutal transform hover:-rotate-3 hover:shadow-brutal-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
            <div className="text-center md:text-right">
              <p>© {new Date().getFullYear()} Video2PPT. 所有权利保留.</p>
              <p>完全免费，永久使用。</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
} 