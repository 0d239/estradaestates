import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { companyInfo } from '../../data/agents';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-white mb-4">{companyInfo.name}</h3>
            <p className="text-sm text-neutral-400 mb-4">{companyInfo.tagline}</p>
            <div className="flex gap-3">
              <a
                href={companyInfo.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={companyInfo.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-neutral-500" />
                <span>
                  {companyInfo.address}<br />
                  {companyInfo.city}, {companyInfo.state} {companyInfo.zip}
                </span>
              </li>
              <li>
                <a href={`tel:${companyInfo.phone}`} className="flex items-center gap-3 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-neutral-500" />
                  <span>{companyInfo.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-3 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <span>{companyInfo.email}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">MLS Coverage</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              {companyInfo.mlsAffiliations.map((mls) => (
                <li key={mls}>{mls}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} {companyInfo.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
