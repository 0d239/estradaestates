'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { companyInfo } from '@/data/agents'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { session } = useAuth();

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
            <NavItem href="/resources">Resources</NavItem>
            <NavItem href="/listings">Listings</NavItem>
          </nav>

          <div className="flex items-center gap-4">
            {session && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
            )}
            <a
              href={`tel:${companyInfo.phone}`}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{companyInfo.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

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
  );
}
