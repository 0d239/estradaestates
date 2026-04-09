'use client'

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DivisionTabs } from '@/components/ui/DivisionTabs';
import { DesignShowcase } from '@/components/ui/DesignShowcase';
import { realtyServices, designServices } from '@/data/services';
import { cn } from '@/lib/utils';
import { Search, HardHat, Wrench, Tag } from 'lucide-react';
import type { RealtyService, DesignServiceCategory } from '@/data/services';
import type { LucideIcon } from 'lucide-react';

const DESIGN_ICONS: { icon: LucideIcon; label: string }[] = [
  { icon: Search, label: 'Pre-Purchase' },
  { icon: HardHat, label: 'New Build' },
  { icon: Wrench, label: 'Rehab' },
  { icon: Tag, label: 'Sell / Lease' },
];

function ServiceSection({
  badge,
  title,
  subtitle,
  children,
}: {
  badge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-narrow mb-20">
      <div className="text-center mb-10">
        <Badge className="mb-4">{badge}</Badge>
        <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
        <p className="text-neutral-400 max-w-xl mx-auto">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function RealtyServiceCard({ service }: { service: RealtyService }) {
  const Icon = service.icon;
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="w-10 h-10 rounded-lg bg-primary-900/50 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
        <p className="text-sm text-neutral-400 mb-4">{service.description}</p>
        <ul className="space-y-2">
          {service.details.map((detail) => (
            <li key={detail} className="flex items-start gap-2 text-sm text-neutral-400">
              <span className="w-1 h-1 bg-primary-400 rounded-full mt-2 shrink-0"></span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DesignServiceTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const cat = designServices[activeTab];

  return (
    <div>
      {/* Icon tab bar */}
      <div className="flex rounded-xl bg-neutral-900 border border-neutral-800 p-1 mb-4">
        {DESIGN_ICONS.map((item, i) => {
          const Icon = item.icon;
          const isActive = activeTab === i;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveTab(i)}
              className={cn(
                'flex-1 flex items-center justify-center py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-500 hover:text-neutral-300',
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Category header */}
      <div className="mb-3 text-center">
        <p className="text-sm font-semibold text-white">{cat.title}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{cat.description}</p>
      </div>

      {/* Services list */}
      <div className="flex flex-col gap-2">
        {cat.services.map((service) => (
          <div
            key={service.name}
            className="p-3 bg-neutral-900 border border-neutral-800 rounded-md"
          >
            <p className="text-xs font-medium text-white mb-0.5">{service.name}</p>
            <p className="text-xs text-neutral-500">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="py-12">
      <DivisionTabs>
        {(active) =>
          active === 'brokerage' ? (
            <section className="container-narrow mb-20">
              <div className="text-center mb-10">
                <Badge className="mb-4">Real Estate</Badge>
                <h1 className="text-4xl font-bold text-white">Buy, Sell &amp; Finance</h1>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {realtyServices.map((service) => (
                  <RealtyServiceCard key={service.title} service={service} />
                ))}
              </div>
            </section>
          ) : (
            <section className="container-wide mb-20">
              {/* Contextual header */}
              <div className="text-center mb-10">
                <Badge className="mb-4">Interior Design</Badge>
                <h1 className="text-4xl font-bold text-white">Design &amp; Staging</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                <DesignShowcase />
                <DesignServiceTabs />
              </div>
            </section>
          )
        }
      </DivisionTabs>
    </div>
  );
}
