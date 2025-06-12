import { MetadataRoute } from 'next'
import { locales } from '@/i18n'

const baseUrl = 'https://video2ppt.com'

// Define all routes for the application
const routes = [
  '',              // Home page
  '/local-video',  // Local video processing
  '/online-video', // Online video processing
  '/screen-recording', // Screen recording
]

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = []

  // Generate URLs for each locale and route combination
  for (const locale of locales) {
    for (const route of routes) {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.8, // Home page has highest priority
      })
    }
  }

  // Add root redirects (these will redirect to default locale)
  sitemap.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  })

  return sitemap
} 