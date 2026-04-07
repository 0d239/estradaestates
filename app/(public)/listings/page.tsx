'use client'

import { useQuery } from '@tanstack/react-query';
import { Search, Bed, Bath, Maximize, MapPin, Building2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Listing, ListingStatus } from '@/lib/database.types';

export default function ListingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | ''>('active');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings', 'public', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Listing[];
    },
  });

  const filtered = listings?.filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      l.address.toLowerCase().includes(term) ||
      l.city?.toLowerCase().includes(term) ||
      l.zip?.includes(term)
    );
  });

  return (
    <div className="py-12">
      <section className="container-wide">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Property Listings</h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Browse our current listings in San Benito County and beyond.
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by address, city, or zip..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ListingStatus | '')}
            className="px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="">All</option>
          </select>
        </div>

        {/* Listings grid */}
        {isLoading ? (
          <div className="text-center text-neutral-400 py-12">Loading listings...</div>
        ) : !filtered?.length ? (
          <div className="text-center text-neutral-400 py-12">
            No listings found. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const photoUrl = listing.photos?.[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors group"
    >
      {/* Photo */}
      <div className="aspect-[4/3] bg-neutral-800 relative overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={listing.address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <Building2 className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-primary-600/90 text-white text-xs font-semibold rounded-full capitalize">
            {listing.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        {listing.price && (
          <p className="text-xl font-bold text-white mb-1">
            ${listing.price.toLocaleString()}
          </p>
        )}
        <p className="text-sm text-neutral-300 flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {listing.address}
          {listing.city && `, ${listing.city}`}
          {listing.state && `, ${listing.state}`}
        </p>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" /> {listing.bedrooms} bd
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" /> {listing.bathrooms} ba
            </span>
          )}
          {listing.sqft != null && (
            <span className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5" /> {listing.sqft.toLocaleString()} sqft
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
