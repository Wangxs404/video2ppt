'use client'

import { useEffect } from 'react'

export function TallyFeedback() {
  useEffect(() => {
    // Ensure the Tally widget script is loaded
    const script = document.createElement('script')
    script.src = 'https://tally.so/widgets/embed.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <button
      data-tally-open="wLBKbG"
      data-tally-emoji-text="👋"
      data-tally-emoji-animation="wave"
      className="fixed bottom-8 right-8 z-50 bg-primary text-light px-6 py-3 font-bold border-3 border-black shadow-brutal transition-transform hover:translate-y-[-2px] hover:translate-x-[2px] hover:shadow-brutal-lg active:translate-y-[2px] active:translate-x-[-2px] active:shadow-none flex items-center gap-2"
    >
      <span className="text-xl">👋</span>
      Feedback
    </button>
  )
} 