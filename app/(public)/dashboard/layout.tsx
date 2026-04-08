'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Building2, MessageSquare, UserPlus, Calendar, HelpCircle, Settings, ArrowLeft, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
  { href: '/dashboard/contacts', icon: Users, label: 'Contacts', exact: false },
  { href: '/dashboard/listings', icon: Building2, label: 'Listings', exact: false },
  { href: '/dashboard/leads', icon: UserPlus, label: 'Leads', exact: false },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar', exact: false },
  { href: '/dashboard/communications', icon: MessageSquare, label: 'Messages', exact: false },
  { href: '/dashboard/activity', icon: Activity, label: 'Activity', exact: false },
  { href: '/dashboard/help', icon: HelpCircle, label: 'Help', exact: false },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', exact: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isOverview = pathname === '/dashboard'

  // Find current sub-page for mobile back header
  const currentItem = navItems.find(({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href) && !exact
  )

  return (
    <div className="container-wide py-6">
      {/* Desktop: always show tab bar */}
      <nav className="hidden md:flex items-center gap-1 border-b border-neutral-800 pb-px mb-6">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 py-2.5 px-4 text-sm font-medium transition-colors rounded-t-lg -mb-px border-b-2 shrink-0',
                isActive
                  ? 'border-primary-400 text-primary-300 bg-primary-900/20'
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile sub-page: back button + page title */}
      {!isOverview && currentItem && (
        <div className="md:hidden flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 text-white">
            <currentItem.icon className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium">{currentItem.label}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl">{children}</div>
    </div>
  )
}
