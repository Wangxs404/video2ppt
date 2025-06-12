import { NextResponse } from 'next/server'

const baseUrl = 'https://video2ppt.com'

const routes = [
  '',
  '/local-video',
  '/online-video', 
  '/screen-recording',
]

export async function GET() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes.map(route => `  <url>
    <loc>${baseUrl}/en${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${route}" />
    <xhtml:link rel="alternate" hreflang="zh" href="${baseUrl}/zh${route}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/zh${route}" />
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
} 