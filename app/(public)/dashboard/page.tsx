'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { profile } = useAuth()

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">
        Welcome back{profile ? `, ${profile.name.split(' ')[0]}` : ''}
      </h1>
      <p className="text-neutral-400 mb-8">
        Here&apos;s an overview of your activity.
      </p>

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
