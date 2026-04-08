'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Phone, LogIn, LogOut, Menu, X, LayoutDashboard, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { companyInfo } from '@/data/agents'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { session, signOut, profile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isDashboardHome = pathname === '/dashboard'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  const headerRef = useRef<HTMLElement>(null)

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close mobile nav on click outside
  useEffect(() => {
    if (!mobileOpen) return
    function handleClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobileOpen])

  // Close avatar dropdown on click outside
  useEffect(() => {
    if (!avatarOpen) return
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [avatarOpen])

  // Close avatar dropdown on route change
  useEffect(() => {
    setAvatarOpen(false)
  }, [pathname])

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <>
    <header ref={headerRef} className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-50">
      <div className="container-wide">
        <div className="relative flex items-center justify-between h-16">
          {/* Mobile hamburger (left side) */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors w-9 h-9"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop: logo on the left */}
          <Link href="/" className="hidden md:flex items-center gap-2.5">
            <img src="/hills.svg" alt="Estrada Estates" className="h-9 w-auto logo-glow" />
          </Link>

          {/* Mobile: centered logo */}
          <Link href="/" className="md:hidden absolute left-1/2 -translate-x-1/2">
            <img src="/hills.svg" alt="Estrada Estates" className="h-9 w-auto logo-glow" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
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
              <div ref={avatarRef} className="relative">
                {/* Mobile: dashboard home — just logout icon */}
                {isDashboardHome && (
                  <button
                    onClick={handleSignOut}
                    className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                )}

                {/* Mobile: all other pages — avatar with icon-only dropdown */}
                {!isDashboardHome && (
                  <div className="md:hidden">
                    <button
                      onClick={() => setAvatarOpen((prev) => !prev)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-primary-500/40 hover:border-primary-400 transition-colors overflow-hidden"
                    >
                      {profile?.image_url ? (
                        <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-primary-400" />
                      )}
                    </button>
                    {avatarOpen && (
                      <div className="absolute right-0 top-full mt-2 flex bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg overflow-hidden z-50">
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center justify-center w-11 h-11 text-primary-400 hover:bg-neutral-700/50 transition-colors"
                          aria-label="Dashboard"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="inline-flex items-center justify-center w-11 h-11 text-neutral-300 hover:bg-neutral-700/50 transition-colors border-l border-neutral-700"
                          aria-label="Logout"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Desktop: avatar with labeled dropdown */}
                <div className="hidden md:block">
                  <button
                    onClick={() => setAvatarOpen((prev) => !prev)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-primary-500/40 hover:border-primary-400 transition-colors overflow-hidden"
                  >
                    {profile?.image_url ? (
                      <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-primary-400" />
                    )}
                  </button>
                  {avatarOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg overflow-hidden z-50">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-primary-400 hover:bg-neutral-700/50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-700/50 transition-colors border-t border-neutral-700"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white transition-colors px-3 h-9 text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dropdown bands */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out grid',
          mobileOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <nav className="border-t border-neutral-700">
            <MobileNavItem href="/">Team</MobileNavItem>
            <MobileNavItem href="/services">Services</MobileNavItem>
            <MobileNavItem href="/listings">Listings</MobileNavItem>
            <MobileNavItem href="/contact">Contact</MobileNavItem>
            {session && <MobileNavItem href="/dashboard">Dashboard</MobileNavItem>}
          </nav>
          <div className="border-t border-neutral-700 px-4 py-3">
            <a
              href={`tel:${companyInfo.phone}`}
              className="flex items-center justify-center gap-2 text-sm font-medium text-primary-400"
            >
              <Phone className="w-4 h-4" />
              <span>{companyInfo.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </header>

    {/* Calligraphy strip — static, below header */}
    <div className="flex justify-center py-2 bg-white/10 border-b border-white/10 backdrop-blur-md">
      <img
        src="/company_caligraphy.png"
        alt="Estrada Estates Realty Group"
        className="h-8 md:h-10 w-auto"
      />
    </div>
    </>
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

function MobileNavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        'block w-full px-6 py-3.5 text-sm font-medium text-center border-b border-neutral-700/50 transition-colors',
        isActive
          ? 'bg-primary-900/30 text-primary-300'
          : 'text-neutral-300 hover:bg-neutral-700/50 hover:text-white'
      )}
    >
      {children}
    </Link>
  )
}
