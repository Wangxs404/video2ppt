import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

interface PrivacyPageProps {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: PrivacyPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Privacy' })
  
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `https://video2ppt.com/${locale}/privacy`,
      languages: {
        'zh': 'https://video2ppt.com/zh/privacy',
        'en': 'https://video2ppt.com/en/privacy',
      },
    },
  }
}

function PrivacySection({ 
  title, 
  content, 
  items, 
  note 
}: { 
  title: string
  content: string
  items?: string[]
  note?: string
}) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-4 border-black pb-2">
        {title}
      </h2>
      <p className="text-gray-700 mb-4 leading-relaxed">
        {content}
      </p>
      {items && items.length > 0 && (
        <ul className="space-y-3 ml-4">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      )}
      {note && (
        <p className="text-sm text-gray-600 mt-4 italic border-l-4 border-gray-300 pl-4">
          {note}
        </p>
      )}
    </section>
  )
}

export default function PrivacyPage() {
  const t = useTranslations('Privacy')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4 text-gray-900 border-8 border-black bg-yellow-300 px-8 py-4 transform -rotate-1 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mt-8 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="mt-4 inline-block bg-gray-100 px-4 py-2 border-2 border-black font-mono text-sm">
            {t('lastUpdated')}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <PrivacySection
            title={t('introduction.title')}
            content={t('introduction.content')}
          />

          <PrivacySection
            title={t('dataCollection.title')}
            content={t('dataCollection.content')}
            items={t.raw('dataCollection.items') as string[]}
          />

          <PrivacySection
            title={t('dataUsage.title')}
            content={t('dataUsage.content')}
            items={t.raw('dataUsage.items') as string[]}
          />

          <PrivacySection
            title={t('dataStorage.title')}
            content={t('dataStorage.content')}
            items={t.raw('dataStorage.items') as string[]}
          />

          <PrivacySection
            title={t('thirdParty.title')}
            content={t('thirdParty.content')}
            items={t.raw('thirdParty.items') as string[]}
            note={t('thirdParty.note')}
          />

          <PrivacySection
            title={t('userRights.title')}
            content={t('userRights.content')}
            items={t.raw('userRights.items') as string[]}
          />

          <PrivacySection
            title={t('dataRetention.title')}
            content={t('dataRetention.content')}
            items={t.raw('dataRetention.items') as string[]}
          />

          <PrivacySection
            title={t('updates.title')}
            content={t('updates.content')}
          />

          <PrivacySection
            title={t('contact.title')}
            content={t('contact.content')}
          />

          <div className="mt-16 p-6 bg-gray-50 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-center text-gray-600 font-mono">
              {t('contact.email')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 