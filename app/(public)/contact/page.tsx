'use client';

import { useActionState, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Phone, Mail, CheckCircle } from 'lucide-react';
import { submitLead } from './actions';
import { companyInfo } from '@/data/agents';

type FormState = {
  error?: Record<string, string[]>;
  success?: boolean;
} | null;

type Interest = 'buying' | 'selling' | 'both';

async function formAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return await submitLead(formData);
}

export default function ContactPage() {
  const [state, action, isPending] = useActionState(formAction, null);
  const [interest, setInterest] = useState<Interest>('buying');

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
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Looking to buy or sell in San Benito County? Fill out the form below and
            we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Your Information</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Name and at least one way to reach you are required.
            </p>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Full Name <span className="text-primary-400">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John Doe"
                />
                <FieldError errors={state?.error} field="name" />
              </div>

              {/* Contact info row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                  <FieldError errors={state?.error} field="email" />
                </div>
              </div>

              <p className="text-xs text-neutral-500 -mt-2">
                <span className="text-primary-400">*</span> At least one of phone or email is required.
              </p>

              {/* Interest toggle */}
              <div className="border-t border-neutral-700 pt-6">
                <h3 className="text-lg font-medium text-white mb-1">I&apos;m interested in...</h3>
                <p className="text-sm text-neutral-500 mb-4">This helps us connect you with the right agent.</p>
              </div>

              <input type="hidden" name="interest" value={interest} />
              <div className="flex gap-2">
                {(['buying', 'selling', 'both'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setInterest(opt)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                      interest === opt
                        ? 'bg-primary-900/50 border-primary-500 text-primary-300'
                        : 'bg-neutral-700 border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-500'
                    }`}
                  >
                    {opt === 'both' ? 'Buying & Selling' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>

              {/* Buyer preferences */}
              {(interest === 'buying' || interest === 'both') && (
                <>
                  <div className="pt-2">
                    <p className="text-sm font-medium text-neutral-400 mb-3">
                      Buyer preferences <span className="text-neutral-600">(optional)</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bedrooms_min" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Min Bedrooms
                      </label>
                      <input
                        id="bedrooms_min"
                        name="bedrooms_min"
                        type="number"
                        min="0"
                        className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label htmlFor="bathrooms_min" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Min Bathrooms
                      </label>
                      <input
                        id="bathrooms_min"
                        name="bathrooms_min"
                        type="number"
                        min="0"
                        step="0.5"
                        className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Budget
                      </label>
                      <input
                        id="budget"
                        name="budget"
                        type="number"
                        min="0"
                        className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="500000"
                      />
                    </div>
                    <div>
                      <label htmlFor="preferred_zipcode" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Preferred Zip
                      </label>
                      <input
                        id="preferred_zipcode"
                        name="preferred_zipcode"
                        type="text"
                        className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="95023"
                      />
                    </div>
                    <div>
                      <label htmlFor="search_radius_miles" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Radius (mi)
                      </label>
                      <input
                        id="search_radius_miles"
                        name="search_radius_miles"
                        type="number"
                        min="1"
                        className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="15"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Seller info */}
              {(interest === 'selling' || interest === 'both') && (
                <>
                  <div className="pt-2">
                    <p className="text-sm font-medium text-neutral-400 mb-3">
                      Seller details <span className="text-neutral-600">(optional)</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="property_zipcode" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Property Zip Code
                      </label>
                      <input
                        id="property_zipcode"
                        name="property_zipcode"
                        type="text"
                        className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="95023"
                      />
                    </div>
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        {interest === 'both' ? 'Asking Price' : 'Estimated Value'}
                      </label>
                      <input
                        id={interest === 'both' ? 'seller_budget' : 'budget'}
                        name={interest === 'selling' ? 'budget' : undefined}
                        type="number"
                        min="0"
                        className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="650000"
                      />
                    </div>
                  </div>
                </>
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
                  className="w-full rounded-lg bg-neutral-700 border border-neutral-600 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Timeline, must-haves, areas of interest..."
                />
              </div>

              {/* Form-level error */}
              {state?.error?._form && (
                <p className="text-sm text-red-400">{state.error._form[0]}</p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit'}
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

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  if (!errors?.[field]) return null;
  return <p className="text-sm text-red-400 mt-1">{errors[field][0]}</p>;
}
