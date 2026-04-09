'use client'

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useActionState } from 'react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Bed, Bath, Maximize, MapPin, Calendar, Hash, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getListingTags } from '@/lib/utils';
import { submitListingInquiry } from '../actions';
import type { Listing, Profile } from '@/lib/database.types';
import AgentNotes from '@/components/AgentNotes';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Listing;
    },
    enabled: !!id,
  });

  // Fetch all listings for prev/next navigation
  const { data: allListings } = useQuery({
    queryKey: ['listings', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('id, address, city, price, photos, status')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Pick<Listing, 'id' | 'address' | 'city' | 'price' | 'photos' | 'status'>[];
    },
  });

  const { prev, next } = useMemo(() => {
    if (!allListings || !id) return { prev: null, next: null };
    const idx = allListings.findIndex((l) => l.id === id);
    if (idx === -1) return { prev: null, next: null };
    return {
      prev: idx > 0 ? allListings[idx - 1] : null,
      next: idx < allListings.length - 1 ? allListings[idx + 1] : null,
    };
  }, [allListings, id]);

  const { data: agent } = useQuery({
    queryKey: ['profile', listing?.listed_by],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', listing!.listed_by!)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!listing?.listed_by,
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center text-neutral-400">Loading listing...</div>
    );
  }

  if (!listing) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-400 mb-4">Listing not found.</p>
        <Link href="/listings" className="text-primary-400 hover:text-primary-300">
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container-wide">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All listings
          </Link>
          <div className="flex items-center gap-2">
            {prev ? (
              <Link
                href={`/listings/${prev.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 bg-neutral-900 border border-neutral-800 rounded-lg cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" /> Prev
              </span>
            )}
            {next ? (
              <Link
                href={`/listings/${next.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 bg-neutral-900 border border-neutral-800 rounded-lg cursor-not-allowed">
                Next <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>

        {/* Photo + Price/Details side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Photo */}
          <div>
            {listing.photos?.length > 0 && (
              <img
                src={listing.photos[0]}
                alt={`${listing.address} photo 1`}
                className="w-full rounded-xl object-cover aspect-[4/3]"
              />
            )}
            {listing.photos?.length > 1 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {listing.photos.slice(1).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${listing.address} photo ${i + 2}`}
                    className="w-full rounded-lg object-cover aspect-[4/3]"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Price, address, description */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                {listing.price && (
                  <p className="text-3xl font-bold text-white mb-1">
                    ${listing.price.toLocaleString()}
                  </p>
                )}
                <p className="text-lg text-neutral-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {listing.address}
                  {listing.city && `, ${listing.city}`}
                  {listing.state && `, ${listing.state}`}
                  {listing.zip && ` ${listing.zip}`}
                </p>
              </div>
              <span className="px-3 py-1 bg-primary-600/90 text-white text-sm font-semibold rounded-full capitalize shrink-0">
                {listing.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {getListingTags(listing).map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-3">
                {listing.bedrooms != null && (
                  <DetailItem label="Bedrooms" value={`${listing.bedrooms}`} icon={<Bed className="w-3.5 h-3.5" />} />
                )}
                {listing.bathrooms != null && (
                  <DetailItem label="Bathrooms" value={`${listing.bathrooms}`} icon={<Bath className="w-3.5 h-3.5" />} />
                )}
                {listing.sqft != null && (
                  <DetailItem label="Sq Ft" value={listing.sqft.toLocaleString()} icon={<Maximize className="w-3.5 h-3.5" />} />
                )}
                {listing.year_built && (
                  <DetailItem label="Year Built" value={`${listing.year_built}`} icon={<Calendar className="w-3.5 h-3.5" />} />
                )}
                {listing.lot_size && (
                  <DetailItem label="Lot Size" value={listing.lot_size} />
                )}
                {listing.mls_number && (
                  <DetailItem label="MLS #" value={listing.mls_number} icon={<Hash className="w-3.5 h-3.5" />} />
                )}
                <DetailItem label="State" value={listing.state} />
                {listing.zip && <DetailItem label="ZIP" value={listing.zip} />}
              </div>
            </div>
          </div>
        </div>

        {/* About + Inquiry Form side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* About this property */}
          {listing.description ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h2 className="text-xl font-semibold text-white mb-3">About This Property</h2>
              <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          ) : (
            <div />
          )}

          {/* Inquiry form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {agent && (
              <div className="flex items-center gap-3 p-5 border-b border-neutral-800">
                {agent.image_url && (
                  <img
                    src={agent.image_url}
                    alt={agent.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{agent.name}</p>
                  {agent.title && (
                    <p className="text-xs text-neutral-400 truncate">{agent.title}</p>
                  )}
                </div>
              </div>
            )}
            <SidebarInquiryForm listing={listing} />
          </div>
        </div>

        {/* Public agent notes — "A word from..." */}
        <div className="mt-8">
          <AgentNotes listingId={id!} />
        </div>

        {/* More listings — collapsible */}
        <MoreListings allListings={allListings} currentId={id!} />
      </div>
    </div>
  );
}

function MoreListings({ allListings, currentId }: { allListings?: Pick<Listing, 'id' | 'address' | 'city' | 'price' | 'photos' | 'status'>[]; currentId: string }) {
  const [open, setOpen] = useState(false);

  if (!allListings || allListings.length <= 1) return null;

  const others = allListings.filter((l) => l.id !== currentId).slice(0, 8);

  return (
    <div className="mt-12">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary-600 text-primary-400 hover:bg-primary-600/10 transition-colors text-sm font-medium"
      >
        <span className={`transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-current">
            <path d="M8 3v10M3 8h10" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        Browse More Listings
      </button>

      {open && (
        <div className="flex gap-4 overflow-x-auto pb-4 mt-4 -mx-2 px-2 scrollbar-thin">
          {others.map((l) => (
            <Link
              key={l.id}
              href={`/listings/${l.id}`}
              className="shrink-0 w-56 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-primary-700 transition-colors group"
            >
              {l.photos?.[0] ? (
                <img
                  src={l.photos[0]}
                  alt={l.address}
                  className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
                  No photo
                </div>
              )}
              <div className="p-3">
                {l.price && (
                  <p className="text-sm font-bold text-white">${l.price.toLocaleString()}</p>
                )}
                <p className="text-xs text-neutral-400 truncate">
                  {l.address}{l.city && `, ${l.city}`}
                </p>
                <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full capitalize bg-neutral-800 text-neutral-300">
                  {l.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarInquiryForm({ listing }: { listing: Listing }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: Record<string, string[]>; success?: boolean }, formData: FormData) => {
      return await submitListingInquiry(formData);
    },
    {} as { error?: Record<string, string[]>; success?: boolean }
  );

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle className="w-10 h-10 text-primary-500 mb-3" />
        <p className="text-base font-semibold text-white mb-1">Inquiry sent!</p>
        <p className="text-sm text-neutral-400">We&apos;ll be in touch about this property soon.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="p-5 flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-white">Interested in this property?</h3>
      <p className="text-sm text-neutral-400 -mt-1">Fill out the form and we&apos;ll get back to you.</p>

      <input type="hidden" name="listing_id" value={listing.id} />

      <div>
        <label htmlFor="inquiry-name" className="block text-xs font-medium text-neutral-400 mb-1">
          Full Name *
        </label>
        <input
          id="inquiry-name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500 transition-colors"
        />
        {state.error?.name && <p className="text-xs text-red-400 mt-1">{state.error.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="inquiry-phone" className="block text-xs font-medium text-neutral-400 mb-1">
          Phone
        </label>
        <input
          id="inquiry-phone"
          name="phone"
          type="tel"
          placeholder="(555) 555-5555"
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500 transition-colors"
        />
        {state.error?.phone && <p className="text-xs text-red-400 mt-1">{state.error.phone[0]}</p>}
      </div>

      <div>
        <label htmlFor="inquiry-email" className="block text-xs font-medium text-neutral-400 mb-1">
          Email
        </label>
        <input
          id="inquiry-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500 transition-colors"
        />
        {state.error?.email && <p className="text-xs text-red-400 mt-1">{state.error.email[0]}</p>}
      </div>

      <p className="text-[11px] text-neutral-500">Phone or email required so we can reach you.</p>

      {state.error?._form && (
        <p className="text-xs text-red-400">{state.error._form[0]}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Inquiry'
        )}
      </button>
    </form>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-3 bg-neutral-800/50 rounded-lg">
      <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm text-white flex items-center gap-1">
        {icon}
        {value}
      </p>
    </div>
  );
}
