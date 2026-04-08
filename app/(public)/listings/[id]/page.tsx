'use client'

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Bed, Bath, Maximize, MapPin, Calendar, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getListingTags } from '@/lib/utils';
import type { Listing, Profile } from '@/lib/database.types';

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
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        {/* Photo gallery */}
        {listing.photos?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {listing.photos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${listing.address} photo ${i + 1}`}
                className="w-full rounded-xl object-cover aspect-[4/3]"
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2">
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
              <span className="px-3 py-1 bg-primary-600/90 text-white text-sm font-semibold rounded-full capitalize">
                {listing.status}
              </span>
            </div>

            <div className="flex items-center gap-6 text-neutral-300 mb-4">
              {listing.bedrooms != null && (
                <span className="flex items-center gap-2">
                  <Bed className="w-5 h-5" /> {listing.bedrooms} Beds
                </span>
              )}
              {listing.bathrooms != null && (
                <span className="flex items-center gap-2">
                  <Bath className="w-5 h-5" /> {listing.bathrooms} Baths
                </span>
              )}
              {listing.sqft != null && (
                <span className="flex items-center gap-2">
                  <Maximize className="w-5 h-5" /> {listing.sqft.toLocaleString()} sqft
                </span>
              )}
              {listing.year_built && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Built {listing.year_built}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {getListingTags(listing).map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {listing.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">About This Property</h2>
                <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Property details */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
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

          {/* Sidebar — agent contact */}
          <div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">
                {agent ? 'Listed By' : 'Contact Us'}
              </h3>
              {agent ? (
                <div>
                  {agent.image_url && (
                    <img
                      src={agent.image_url}
                      alt={agent.name}
                      className="w-16 h-16 rounded-full object-cover mb-3"
                    />
                  )}
                  <p className="text-white font-medium">{agent.name}</p>
                  {agent.title && (
                    <p className="text-sm text-neutral-400">{agent.title}</p>
                  )}
                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone}`}
                      className="block mt-3 text-sm text-primary-400 hover:text-primary-300"
                    >
                      {agent.phone}
                    </a>
                  )}
                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}`}
                      className="block mt-1 text-sm text-primary-400 hover:text-primary-300"
                    >
                      {agent.email}
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-neutral-400 text-sm">
                  Interested in this property? Contact Estrada Estates Realty Group.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
