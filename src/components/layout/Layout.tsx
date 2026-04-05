import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Panning hills background */}
      <div className="fixed inset-0 panning-bg opacity-20 pointer-events-none" />
      <Header />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  );
}
