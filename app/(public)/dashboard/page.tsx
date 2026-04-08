'use client'

import { User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { profile } = useAuth()

  return (
    <div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Contacts" value="—" />
        <StatCard label="Active Listings" value="—" />
        <StatCard label="Messages Sent" value="—" />
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
