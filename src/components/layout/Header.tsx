'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Phone, LogIn, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { companyInfo } from '@/data/agents'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { session, signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <header className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-50">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/hills.svg" alt="Estrada Estates" className="h-9 w-auto logo-glow" />
          </Link>

          <nav className="flex flex-1 items-center justify-center gap-1">
            <NavItem href="/">Team</NavItem>
            <NavItem href="/services">Services</NavItem>
            <NavItem href="/listings">Listings</NavItem>
            <NavItem href="/contact">Contact</NavItem>
            {session && <NavItem href="/dashboard">Dash</NavItem>}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${companyInfo.phone}`}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{companyInfo.phone}</span>
            </a>
            {session ? (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-neutral-200 transition-colors px-3 h-9 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-neutral-900 transition-colors px-3 h-9 text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-900/50 text-primary-300'
          : 'text-neutral-300 hover:text-white hover:bg-neutral-700'
      )}
    >
      {children}
    </Link>
  )
}
