'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Settings, X, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { navItems } from './layout'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const gridItems = navItems.filter((item) => !item.exact && item.href !== '/dashboard/settings')

  return (
    <div>
      {/* Desktop view */}
      <div className="hidden md:block">
        <div className="flex items-center gap-5 mb-8">
          {profile?.image_url ? (
            <img
              src={profile.image_url}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary-500/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center">
              <User className="w-7 h-7 text-primary-400" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back{profile ? `, ${profile.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-neutral-400 mt-1">
              Here&apos;s an overview of your activity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 max-w-lg">
          <StatCard label="Contacts" value="—" />
          <StatCard label="Active Listings" value="—" />
        </div>
      </div>

      {/* Mobile view — icon launcher */}
      <div className="md:hidden">
        {/* Top row: avatar + welcome + settings */}
        <div className="flex items-center gap-3 mb-6">
          {profile?.image_url ? (
            <img
              src={profile.image_url}
              alt={profile.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-500/30 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-white">
              Welcome{profile ? `, ${profile.name.split(' ')[0]}` : ''}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              <span className="text-neutral-300 font-medium">—</span> contacts · <span className="text-neutral-300 font-medium">—</span> listings
            </p>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors shrink-0"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Icon grid */}
        <div className="grid grid-cols-2 gap-3">
          {gridItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 p-6 text-neutral-400 hover:text-primary-300 hover:border-primary-500/30 hover:bg-primary-900/10 transition-colors"
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>

        {/* Settings modal */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSettingsOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div
              className="relative w-full max-w-lg bg-neutral-900 border-t border-neutral-700 rounded-t-2xl p-6 pb-8 animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-primary-400" />
                  <h2 className="text-base font-semibold text-white">Change Password</h2>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <PasswordForm onSuccess={() => setSettingsOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)

    if (newPassword.length < 8) {
      setStatus({ type: 'error', message: 'New password must be at least 8 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setStatus({ type: 'error', message: error.message })
    } else {
      setStatus({ type: 'success', message: 'Password updated.' })
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => onSuccess?.(), 1000)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        minLength={8}
        placeholder="New password (min. 8 chars)"
        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={8}
        placeholder="Confirm new password"
        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {status && (
        <p className={`text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {status.message}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary-500 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 text-sm transition-colors"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <p className="text-sm text-neutral-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}
