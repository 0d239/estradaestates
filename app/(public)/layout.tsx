import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Panning hills background */}
      <div className="fixed inset-0 panning-bg opacity-30 pointer-events-none" />
      <Header />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  )
}
