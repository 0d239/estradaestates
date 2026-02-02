import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { MortgageCalculator } from '../components/MortgageCalculator';

const listingLinks = [
  {
    title: 'My Hilltop Realty',
    description: "Henry Estrada's listings and agent profile",
    url: 'https://www.myhilltoprealty.com',
  },
  {
    title: 'Homes.com',
    description: "Henry Estrada's agent page and current listings",
    url: 'https://www.homes.com/real-estate-agents/enrique-henry-estrada/39rj47e/',
  },
  {
    title: 'Zillow',
    description: "Henry Estrada's Zillow profile and listings",
    url: 'https://www.zillow.com/profile/estradasold2',
  },
];

export function Resources() {
  return (
    <div className="py-12">
      <section className="container-narrow">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Resources</h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Helpful tools and links for your home search journey.
          </p>
        </div>

        <div className="space-y-8">
          {/* Listing Links */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Listings</h2>
              <p className="text-sm text-neutral-400 mt-1">
                View current Estrada listings and agent profiles
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-700">
                {listingLinks.map((link) => (
                  <a
                    key={link.title}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-6 py-4 hover:bg-neutral-700 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-white">{link.title}</h3>
                      <p className="text-sm text-neutral-400 mt-0.5">{link.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-500" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mortgage Calculator */}
          <MortgageCalculator />
        </div>
      </section>
    </div>
  );
}
