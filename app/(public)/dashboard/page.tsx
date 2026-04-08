'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Settings, X, Lock, HelpCircle, UserPlus, Building2, ArrowRightLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { navItems } from './layout'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const gridItems = navItems.filter((item) => !item.exact && item.href !== '/dashboard/settings' && item.href !== '/dashboard/help')

  return (
    <div>
      {/* Desktop view */}
      <div className="hidden md:block">
        <div className="flex items-center gap-5 mb-8">
          {profile?.image_url ? (
            <img
              src={profile.image_url}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary-500/30 avatar-glow"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center avatar-glow">
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
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-500/30 shrink-0 avatar-glow"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center shrink-0 avatar-glow">
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
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setHelpOpen(true)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
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

        {/* Settings modal — frosted glass */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setSettingsOpen(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-sm bg-neutral-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-primary-400" />
                  <h2 className="text-base font-semibold text-white">Change Password</h2>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <PasswordForm onSuccess={() => setSettingsOpen(false)} />
            </div>
          </div>
        )}

        {/* Help modal — frosted glass */}
        {helpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setHelpOpen(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-sm max-h-[80vh] overflow-y-auto bg-neutral-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-primary-400" />
                  <h2 className="text-base font-semibold text-white">Help</h2>
                </div>
                <button
                  onClick={() => setHelpOpen(false)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <HelpContent />
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

function HelpContent() {
  return (
    <div className="space-y-5 text-sm text-neutral-300">
      {/* Leads */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <UserPlus className="w-4 h-4 text-primary-400" />
          <h3 className="font-semibold text-white">Leads</h3>
        </div>
        <p>
          When someone fills out the contact form, they appear here as a lead. Check regularly and reach out.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-primary-400" />
            <p className="text-xs font-semibold text-white">Converting a Lead</p>
          </div>
          <ul className="text-xs space-y-1 list-disc pl-4 text-neutral-400">
            <li><strong className="text-neutral-200">Contact</strong> — moves them into your CRM</li>
            <li><strong className="text-neutral-200">Listing</strong> — creates a listing from their property info</li>
            <li><strong className="text-neutral-200">Both</strong> — contact linked to the listing</li>
          </ul>
        </div>
      </div>

      {/* Listings */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-primary-400" />
          <h3 className="font-semibold text-white">Listings</h3>
        </div>
        <ul className="space-y-1 list-disc pl-4">
          <li><strong className="text-white">IDX</strong> — synced automatically from MLS</li>
          <li><strong className="text-white">Manual</strong> — added by you, keep the status current</li>
        </ul>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-2">
          <p className="text-xs font-semibold text-white mb-1.5">Status Lifecycle</p>
          <ul className="text-xs space-y-0.5 list-disc pl-4 text-neutral-400">
            <li><strong className="text-neutral-200">Active</strong> — on market</li>
            <li><strong className="text-neutral-200">Pending</strong> — under contract</li>
            <li><strong className="text-neutral-200">Sold</strong> — closed</li>
            <li><strong className="text-neutral-200">Off Market</strong> — pulled</li>
          </ul>
        </div>
      </div>
    </div>
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
