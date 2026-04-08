'use client';

import { useState } from 'react';
import { Home, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Division } from '@/data/agents';

const divisions = [
  { key: 'brokerage' as const, label: 'Brokerage', icon: Home },
  { key: 'design' as const, label: 'Design', icon: Palette },
];

export function DivisionTabs({
  children,
  defaultDivision = 'brokerage',
}: {
  children: (active: Division) => React.ReactNode;
  defaultDivision?: Division;
}) {
  const [active, setActive] = useState<Division>(defaultDivision);

  return (
    <div>
      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-full bg-neutral-900 p-1 border border-neutral-800">
          {divisions.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={cn(
                'relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
                active === key
                  ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
                  : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
      {children(active)}
    </div>
  );
}
