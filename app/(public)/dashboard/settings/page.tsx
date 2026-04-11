'use client'

import { useState } from 'react'
import { Lock, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardPageHeader } from '../layout'

export default function SettingsPage() {
  const { profile } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
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
      setStatus({ type: 'success', message: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setLoading(false)
  }

  return (
    <div>
      <DashboardPageHeader
        icon={Settings}
        label="Settings"
        description={`Manage your account${profile ? `, ${profile.name.split(' ')[0]}` : ''}.`}
      />

      <div className="max-w-2xl space-y-6">
        {/* Change Password */}
        <section className="bg-neutral-800/40 border border-neutral-700/50 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Change Password</h2>
              <p className="text-sm text-neutral-500">Update your login password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-neutral-300 mb-1.5">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Re-enter new password"
              />
            </div>

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
        </section>
      </div>
    </div>
  )
}
