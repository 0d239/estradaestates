'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { session, signIn } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  if (session) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await signIn(username, password);
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Mobile: minimal, no card chrome */}
        <div className="md:hidden text-center mb-8">
          <h1 className="text-xl font-semibold text-white">Admin Login</h1>
          <p className="text-sm text-neutral-400 mt-1">Access the dashboard</p>
        </div>

        <div className="md:hidden">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
              required
            />
            <Button type="submit" variant="primary" className="w-full !py-3 !rounded-xl text-base" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </div>

        {/* Desktop: full card treatment */}
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <LogIn className="w-6 h-6 text-primary-400" />
                <h1 className="text-2xl font-bold text-white">Admin Login</h1>
              </div>
              <p className="text-sm text-neutral-400 mt-1">
                Access the dashboard
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                  {submitting ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
