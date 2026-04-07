'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Building2, MessageSquare, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/dashboard/contacts', icon: Users, label: 'Contacts', exact: false },
  { href: '/dashboard/listings', icon: Building2, label: 'Listings', exact: false },
  { href: '/dashboard/communications', icon: MessageSquare, label: 'Messages', exact: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-800">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/hills.svg" alt="Estrada Estates" className="h-8 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, icon: Icon, label, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-900/50 text-primary-300'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-neutral-800">
          {profile && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-white truncate">{profile.name}</p>
              <p className="text-xs text-neutral-500 truncate">{profile.title}</p>
            </div>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-black overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
