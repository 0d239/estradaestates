import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { team, companyInfo } from '@/data/agents'

const DISPLAY: Record<string, { first: string; last: string }> = {
  'henry-estrada': { first: 'Henry', last: 'Estrada' },
  'sophia-estrada': { first: 'Sophia', last: 'Estrada' },
}

export const dynamic = 'force-static'

export function generateStaticParams() {
  return Object.keys(DISPLAY).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const person = team.find((m) => m.id === slug)
  const display = DISPLAY[slug]
  if (!person || !display) return {}
  const full = `${display.first} ${display.last}`
  return {
    title: `${full} — ${companyInfo.name}`,
    description: `${person.title} · ${person.license ?? ''}`.trim(),
  }
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const person = team.find((m) => m.id === slug)
  const display = DISPLAY[slug]
  if (!person || !display) notFound()

  const telHref = `tel:+1${person.phone.replace(/\D/g, '')}`

  return (
    <main className="min-h-dvh bg-black text-neutral-200 flex items-center justify-center px-6 py-16">
      <article className="w-full max-w-sm">
        <p className="text-primary-400 text-[11px] tracking-[0.35em] uppercase">
          {companyInfo.name}
        </p>

        <h1 className="font-display mt-8 text-5xl leading-[0.95] text-white">
          {display.first}
          <span className="block text-primary-300">{display.last}</span>
        </h1>

        <p className="mt-4 text-neutral-400 normal-case">{person.title}</p>
        {person.license && (
          <p className="mt-1 text-xs tracking-[0.2em] text-neutral-500 uppercase">
            {person.license}
          </p>
        )}

        <div className="mt-10 h-px bg-gradient-to-r from-primary-500/70 via-primary-500/20 to-transparent" />

        <div className="mt-6">
          <a
            href={telHref}
            className="group flex items-baseline justify-between py-4 border-b border-neutral-800"
          >
            <span className="text-neutral-500 text-[10px] uppercase tracking-[0.25em]">
              Call
            </span>
            <span className="text-white group-hover:text-primary-300 group-active:text-primary-300 transition normal-case">
              {person.phone}
            </span>
          </a>

          <a
            href={`mailto:${person.email}`}
            className="group flex items-baseline justify-between py-4 border-b border-neutral-800 gap-4"
          >
            <span className="text-neutral-500 text-[10px] uppercase tracking-[0.25em] shrink-0">
              Email
            </span>
            <span className="text-white group-hover:text-primary-300 group-active:text-primary-300 transition normal-case text-right break-all">
              {person.email}
            </span>
          </a>

          <div className="flex items-baseline justify-between py-4 border-b border-neutral-800">
            <span className="text-neutral-500 text-[10px] uppercase tracking-[0.25em]">
              Office
            </span>
            <span className="text-white normal-case text-right">
              {companyInfo.city}, {companyInfo.state}
            </span>
          </div>
        </div>

        <p className="mt-10 text-[10px] leading-relaxed text-neutral-600 normal-case">
          {companyInfo.legalNote}
        </p>
      </article>
    </main>
  )
}
