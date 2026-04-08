'use client';

import { useActionState, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Phone, Mail, CheckCircle, Home, TrendingUp, Palette } from 'lucide-react';
import { submitLead } from './actions';
import { companyInfo } from '@/data/agents';

type FormState = {
  error?: Record<string, string[]>;
  success?: boolean;
} | null;

async function formAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return await submitLead(formData);
}

const inputClass =
  'w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';

export default function ContactPage() {
  const [state, action, isPending] = useActionState(formAction, null);
  const [wantsBuying, setWantsBuying] = useState(false);
  const [wantsSelling, setWantsSelling] = useState(false);
  const [wantsDesign, setWantsDesign] = useState(false);

  if (state?.success) {
    return (
      <div className="py-12">
        <section className="container-narrow">
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-primary-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
            <p className="text-lg text-neutral-400 max-w-md mx-auto">
              We&apos;ve received your information and a member of our team will be in touch soon.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="py-12">
      <section className="container-narrow max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-sm text-neutral-400 italic max-w-xl mx-auto">
            Let us know how we can help.
          </p>
        </div>

        <Card>
          <CardHeader>
            <p className="text-sm text-neutral-400">Select all that apply</p>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-6">

              <input type="hidden" name="wants_buying" value={wantsBuying ? 'true' : ''} />
              <input type="hidden" name="wants_selling" value={wantsSelling ? 'true' : ''} />
              <input type="hidden" name="wants_design" value={wantsDesign ? 'true' : ''} />

              <div className="grid grid-cols-3 gap-3">
                <ServiceToggle
                  active={wantsBuying}
                  onClick={() => setWantsBuying((v) => !v)}
                  icon={<Home className="w-5 h-5" />}
                  label="Buy"
                />
                <ServiceToggle
                  active={wantsSelling}
                  onClick={() => setWantsSelling((v) => !v)}
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Sell"
                />
                <ServiceToggle
                  active={wantsDesign}
                  onClick={() => setWantsDesign((v) => !v)}
                  icon={<Palette className="w-5 h-5" />}
                  label="Design"
                />
              </div>

              {/* Buyer preferences */}
              {wantsBuying && (
                <div className="space-y-4 rounded-lg border border-neutral-700 bg-neutral-800/50 p-5">
                  <p className="text-sm font-medium text-primary-300">
                    Additional details <span className="text-neutral-600">(optional)</span>
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bedrooms_min" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Min Bedrooms
                      </label>
                      <input id="bedrooms_min" name="bedrooms_min" type="number" min="0" className={inputClass} placeholder="3" />
                    </div>
                    <div>
                      <label htmlFor="bathrooms_min" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Min Bathrooms
                      </label>
                      <input id="bathrooms_min" name="bathrooms_min" type="number" min="0" step="0.5" className={inputClass} placeholder="2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Budget
                      </label>
                      <input id="budget" name="budget" type="number" min="0" className={inputClass} placeholder="500000" />
                    </div>
                    <div>
                      <label htmlFor="preferred_zipcode" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Preferred Zip
                      </label>
                      <input id="preferred_zipcode" name="preferred_zipcode" type="text" className={inputClass} placeholder="95023" />
                    </div>
                    <div>
                      <label htmlFor="search_radius_miles" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Radius (mi)
                      </label>
                      <input id="search_radius_miles" name="search_radius_miles" type="number" min="1" className={inputClass} placeholder="15" />
                    </div>
                  </div>
                </div>
              )}

              {/* Seller details */}
              {wantsSelling && (
                <div className="space-y-4 rounded-lg border border-neutral-700 bg-neutral-800/50 p-5">
                  <p className="text-sm font-medium text-primary-300">
                    Additional details <span className="text-neutral-600">(optional)</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="property_zipcode" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Property Zip Code
                      </label>
                      <input id="property_zipcode" name="property_zipcode" type="text" className={inputClass} placeholder="95023" />
                    </div>
                    <div>
                      <label htmlFor="estimated_value" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Estimated Value
                      </label>
                      <input
                        id="estimated_value"
                        name={!wantsBuying ? 'budget' : undefined}
                        type="number"
                        min="0"
                        className={inputClass}
                        placeholder="650000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Design details */}
              {wantsDesign && (
                <div className="space-y-4 rounded-lg border border-neutral-700 bg-neutral-800/50 p-5">
                  <p className="text-sm font-medium text-primary-300">
                    Additional details <span className="text-neutral-600">(optional)</span>
                  </p>
                  <p className="text-sm text-neutral-400">What type of design services are you interested in?</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Staging for sale',
                      'Pre-purchase assessment',
                      'New construction design',
                      'Renovation / value-add',
                    ].map((opt) => (
                      <label key={opt} className="flex items-center gap-2.5 rounded-lg border border-neutral-600 bg-neutral-700/50 px-3 py-2.5 cursor-pointer hover:border-neutral-500 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-900/30">
                        <input
                          type="checkbox"
                          name="design_services"
                          value={opt}
                          className="accent-primary-500 w-4 h-4"
                        />
                        <span className="text-sm text-neutral-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Anything else we should know?
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Timeline, must-haves, areas of interest..."
                />
              </div>

              {/* Contact info */}
              <div className="border-t border-neutral-700 pt-6">
                <h3 className="text-lg font-medium text-white mb-1">Your Information</h3>
                <p className="text-sm text-neutral-500 mb-4">
                  Name and at least one way to reach you.
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Full Name <span className="text-primary-400">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="John Doe"
                />
                <FieldError errors={state?.error} field="name" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={inputClass}
                    placeholder="(831) 555-0123"
                  />
                  <FieldError errors={state?.error} field="phone" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={inputClass}
                    placeholder="john@example.com"
                  />
                  <FieldError errors={state?.error} field="email" />
                </div>
              </div>

              <p className="text-xs text-neutral-500 -mt-2">
                <span className="text-primary-400">*</span> At least one of phone or email is required.
              </p>

              {/* Form-level error */}
              {state?.error?._form && (
                <p className="text-sm text-red-400">{state.error._form[0]}</p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Get in Touch'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick contact info */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-neutral-400">
          <a href={`tel:${companyInfo.phone}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors">
            <Phone className="w-4 h-4" />
            {companyInfo.phone}
          </a>
          <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors">
            <Mail className="w-4 h-4" />
            {companyInfo.email}
          </a>
        </div>
      </section>
    </div>
  );
}

function ServiceToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-lg px-2 py-3 sm:px-4 sm:py-4 sm:gap-1.5 text-center transition-colors border ${
        active
          ? 'bg-primary-900/50 border-primary-500 text-primary-300'
          : 'bg-neutral-700 border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-500'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  if (!errors?.[field]) return null;
  return <p className="text-sm text-red-400 mt-1">{errors[field][0]}</p>;
}
