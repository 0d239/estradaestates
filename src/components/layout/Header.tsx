'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Phone, LogIn, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { companyInfo } from '@/data/agents'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu'

export function Header() {
  const { session, profile, signOut } = useAuth()
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
            <span className="text-2xl font-bold text-white font-serif hidden">
              Estrada Estates
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavItem href="/">Team</NavItem>
            <NavItem href="/services">Services</NavItem>
            <NavItem href="/listings">Listings</NavItem>
            <NavItem href="/contact">Contact</NavItem>
            {session && <NavItem href="/dashboard">Dash</NavItem>}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${companyInfo.phone}`}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{companyInfo.phone}</span>
            </a>

            {session ? (
              <DropdownMenu
                trigger={
                  <div className="flex items-center gap-2 rounded-full border border-neutral-600 bg-neutral-700/50 hover:bg-neutral-700 transition-colors pl-3 pr-1.5 py-1 cursor-pointer">
                    <span className="text-sm font-medium text-neutral-200 hidden sm:block">
                      {profile?.name?.split(' ')[0] ?? 'Account'}
                    </span>
                    {profile?.image_url ? (
                      <img
                        src={profile.image_url}
                        alt={profile.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary-400" />
                      </div>
                    )}
                  </div>
                }
              >
                {profile && (
                  <>
                    <DropdownMenuLabel>
                      <p className="text-sm font-medium text-white">{profile.name}</p>
                      <p className="text-xs text-neutral-500">{profile.title}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-primary-500 hover:bg-primary-400 text-neutral-900 transition-colors w-9 h-9"
                aria-label="Team Login"
              >
                <LogIn className="w-4 h-4" />
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
