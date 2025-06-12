import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Video2PPT - Knowledge Snapshots, Wisdom Preserved',
    short_name: 'Video2PPT',
    description: 'Free online tool to convert videos to PowerPoint presentations',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32',
        type: 'image/x-icon',
      },
    ],
    categories: ['productivity', 'utilities', 'education'],
    lang: 'en',
    dir: 'ltr',
    orientation: 'portrait-primary',
    scope: '/',
    screenshots: [
      {
        src: '/hero.png',
        sizes: '1920x1080',
        type: 'image/png',
      },
    ],
  }
} 