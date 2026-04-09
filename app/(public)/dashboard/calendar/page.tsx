'use client'

import { useState } from 'react'
import { ExternalLink, Calendar } from 'lucide-react'
import { DashboardPageHeader } from '../layout'

const EMBED_BASE = 'https://calendar.google.com/calendar/embed'

// Dark theme colors matching the site's brand palette
const EMBED_PARAMS = new URLSearchParams({
  // Background & chrome
  bgcolor: '0a0a0a',      // near-black to blend with bg-black
  color: 'D97706',        // primary-600 gold for event accents
  // UI options
  showTitle: '0',
  showNav: '1',
  showDate: '1',
  showPrint: '0',
  showTabs: '1',
  showCalendars: '0',
  showTz: '1',
  mode: 'WEEK',
})

export default function CalendarPage() {
  const [calendarId, setCalendarId] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const embedUrl = activeId
    ? `${EMBED_BASE}?src=${encodeURIComponent(activeId)}&${EMBED_PARAMS.toString()}`
    : null

  function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = calendarId.trim()
    if (trimmed) {
      setActiveId(trimmed)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        icon={Calendar}
        label="Calendar"
        description="View your Google Calendar schedule. Sign in to Google separately within the embed."
        action={activeId ? (
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <span className="hidden md:inline">Open in Google Calendar</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : undefined}
      />

      {!activeId ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Connect Your Google Calendar</h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto">
            Enter your Google Calendar ID to embed your schedule. You can find this in{' '}
            <a
              href="https://support.google.com/calendar/answer/37083"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 underline"
            >
              Google Calendar Settings
            </a>{' '}
            under &ldquo;Integrate calendar.&rdquo; For your primary calendar, this is usually your Gmail address.
          </p>
          <form onSubmit={handleConnect} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg mx-auto mt-4">
            <input
              type="text"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              placeholder="you@gmail.com or calendar ID"
              className="flex-1 rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Connect
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 truncate max-w-xs">{activeId}</span>
            <button
              onClick={() => { setActiveId(null); setCalendarId('') }}
              className="text-xs text-neutral-500 hover:text-neutral-300 underline transition-colors"
            >
              Change calendar
            </button>
          </div>
          <div className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-900/50">
            <iframe
              src={embedUrl!}
              className="w-full border-0 h-[60vh] sm:h-[calc(100vh-280px)] min-h-[400px] sm:min-h-[500px]"
              title="Google Calendar"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>
      )}
    </div>
  )
}
