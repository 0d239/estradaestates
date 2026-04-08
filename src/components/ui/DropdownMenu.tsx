'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
}

export function DropdownMenu({ trigger, children, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="focus:outline-none"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={cn(
            'absolute top-full mt-2 w-56 rounded-lg border border-neutral-700 bg-neutral-800 shadow-xl py-1 z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function DropdownMenuItem({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuLink({
  children,
  className,
  href,
}: {
  children: React.ReactNode
  className?: string
  href: string
}) {
  return (
    <a
      href={href}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors',
        className
      )}
    >
      {children}
    </a>
  )
}

export function DropdownMenuSeparator() {
  return <div className="my-1 border-t border-neutral-700" />
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-2">
      {children}
    </div>
  )
}
