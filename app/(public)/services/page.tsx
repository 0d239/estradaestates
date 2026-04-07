'use client'

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { realtyServices, designServices } from '@/data/services';
import type { RealtyService, DesignServiceCategory } from '@/data/services';

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

function DesignCategoryCard({ category }: { category: DesignServiceCategory }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[3/2] bg-neutral-900">
        <img
          src={category.image}
          alt={category.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-white mb-1">{category.title}</h3>
        <p className="text-sm text-neutral-400 mb-4">{category.description}</p>
        <ul className="space-y-3">
          {category.services.map((service) => (
            <li key={service.name}>
              <span className="text-sm font-medium text-white">{service.name}</span>
              <span className="text-sm text-neutral-500"> — {service.description}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function ServicesPage() {
  return (
    <div className="py-12">
      {/* Real Estate */}
      <ServiceSection
        badge="Real Estate"
        title="Buy, Sell & Finance"
        subtitle="From first showing to closing day — expert guidance at every step."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {realtyServices.map((service) => (
            <RealtyServiceCard key={service.title} service={service} />
          ))}
        </div>
      </ServiceSection>

      {/* Design & Property Value Strategy */}
      <ServiceSection
        badge="Design"
        title="Design & Staging"
        subtitle="Award-winning interior design that maximizes property value — led by Laura Velasco."
      >
        <div className="grid sm:grid-cols-2 gap-6">
          {designServices.map((category) => (
            <DesignCategoryCard key={category.title} category={category} />
          ))}
        </div>
      </ServiceSection>
    </div>
  );
}
