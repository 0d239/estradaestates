import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const CARD_HOSTS: Record<string, string> = {
  'sophia.estradaestates.com': 'sophia-estrada',
  'henry.estradaestates.com': 'henry-estrada',
  'laura.estradaestates.com': 'laura-velasco',
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase()
  const slug = CARD_HOSTS[host]
  if (slug) {
    const url = request.nextUrl.clone()
    url.pathname = `/card/${slug}`
    return NextResponse.rewrite(url)
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
