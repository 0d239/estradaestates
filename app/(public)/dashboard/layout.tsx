'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Building2, MessageSquare, UserPlus, Calendar, HelpCircle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
  { href: '/dashboard/contacts', icon: Users, label: 'Contacts', exact: false },
  { href: '/dashboard/listings', icon: Building2, label: 'Listings', exact: false },
  { href: '/dashboard/leads', icon: UserPlus, label: 'Leads', exact: false },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar', exact: false },
  { href: '/dashboard/communications', icon: MessageSquare, label: 'Messages', exact: false },
  { href: '/dashboard/help', icon: HelpCircle, label: 'Help', exact: false },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', exact: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="container-wide py-6">
      {/* Tab bar */}
      <nav className="flex items-center gap-1 border-b border-neutral-800 pb-px mb-6">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg -mb-px border-b-2',
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

      {/* Content */}
      <div className="max-w-7xl">{children}</div>
    </div>
  )
}
