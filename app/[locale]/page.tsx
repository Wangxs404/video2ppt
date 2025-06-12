import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

export default function Home() {
  const t = useTranslations('HomePage')
  const locale = useLocale()

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
                {t('title')}
              </h2>
              <p className="text-lg mb-8">
                {t('subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href={`/${locale}/screen-recording`} className="btn bg-primary text-light text-center">
                  {t('getStarted')}
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-white border-3 border-black shadow-brutal-lg overflow-hidden">
                <img 
                  src="/hero.png" 
                  alt={t('heroAlt')} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-accent text-light px-3 py-1 border-3 border-black transform rotate-3">
                  {t('efficientConversion')}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-secondary border-3 border-black p-4 shadow-brutal transform rotate-3">
                <p className="font-bold">{t('freeToUse')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特点部分 */}
      <section id="features" className="py-16 md:py-20 bg-accent border-y-3 border-black">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center text-light">
            <span className="bg-light text-dark px-3 py-1 border-3 border-black inline-block transform -rotate-1">{t('features.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="card bg-light transform hover:rotate-1">
              <div className="bg-primary text-light w-16 h-16 rounded-full border-3 border-black flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('features.multiSource.title')}</h3>
              <p>{t('features.multiSource.description')}</p>
            </div>
            
            <div className="card bg-light transform hover:-rotate-1">
              <div className="bg-secondary text-dark w-16 h-16 rounded-full border-3 border-black flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('features.realTimeRecording.title')}</h3>
              <p>{t('features.realTimeRecording.description')}</p>
            </div>
            
            <div className="card bg-light transform hover:rotate-1">
              <div className="bg-accent text-light w-16 h-16 rounded-full border-3 border-black flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('features.smartExtraction.title')}</h3>
              <p>{t('features.smartExtraction.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 使用方法 */}
      <section id="how-it-works" className="py-16 md:py-20 bg-light">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">
            <span className="bg-primary text-light px-3 py-1 border-3 border-black inline-block transform rotate-1">{t('howItWorks.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 mt-12">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-secondary border-3 border-black flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{t('howItWorks.step1.title')}</h3>
              <p>{t('howItWorks.step1.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-secondary border-3 border-black flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{t('howItWorks.step2.title')}</h3>
              <p>{t('howItWorks.step2.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-secondary border-3 border-black flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{t('howItWorks.step3.title')}</h3>
              <p>{t('howItWorks.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 使用场景 */}
      <section id="use-cases" className="py-16 md:py-20 bg-secondary border-y-3 border-black">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">
            <span className="bg-dark text-light px-3 py-1 border-3 border-black inline-block transform -rotate-1">{t('useCases.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="card bg-light transform hover:rotate-1">
              <h3 className="text-xl font-bold mb-4">{t('useCases.meetingRecords.title')}</h3>
              <p>{t('useCases.meetingRecords.description')}</p>
            </div>
            
            <div className="card bg-light transform hover:-rotate-1">
              <h3 className="text-xl font-bold mb-4">{t('useCases.studyNotes.title')}</h3>
              <p>{t('useCases.studyNotes.description')}</p>
            </div>
            
            <div className="card bg-light transform hover:rotate-1">
              <h3 className="text-xl font-bold mb-4">{t('useCases.seminarContent.title')}</h3>
              <p>{t('useCases.seminarContent.description')}</p>
            </div>
            
            <div className="card bg-light transform hover:-rotate-1">
              <h3 className="text-xl font-bold mb-4">{t('useCases.teachingVideos.title')}</h3>
              <p>{t('useCases.teachingVideos.description')}</p>
            </div>
            
            <div className="card bg-light transform hover:rotate-1">
              <h3 className="text-xl font-bold mb-4">{t('useCases.speechContent.title')}</h3>
              <p>{t('useCases.speechContent.description')}</p>
            </div>
            
            <div className="card bg-light transform hover:-rotate-1">
              <h3 className="text-xl font-bold mb-4">{t('useCases.tutorialKnowledge.title')}</h3>
              <p>{t('useCases.tutorialKnowledge.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA部分 */}
      <section id="cta" className="py-16 md:py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title text-light">
            <span className="bg-light text-dark px-3 py-1 border-3 border-black inline-block">{t('cta.title')}</span>
          </h2>
          <p className="text-light text-xl mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          
          <div className="card bg-light max-w-xl mx-auto p-8 transform hover:rotate-1">
            <div className="space-y-4">
            <div>
                <Link 
                  href={`/${locale}/screen-recording`}
                  className="btn bg-accent text-light w-full"
                >
                  {t('cta.startRecording')}
                </Link>
              </div>
              
              <p className="text-center font-bold">{t('cta.or')}</p>
              <div>
                <Link 
                  href={`/${locale}/local-video`}
                  className="btn bg-secondary block text-center"
                >
                  {t('cta.uploadLocal')}
                </Link>
              </div>
              <p className="text-center font-bold">{t('cta.or')}</p>
              <div>
                <Link 
                  href={`/${locale}/online-video`}
                  className="btn bg-primary text-light block text-center"
                >
                  {t('cta.onlineVideo')}
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