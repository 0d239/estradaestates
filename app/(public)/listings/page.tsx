'use client'

import { useQuery } from '@tanstack/react-query';
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Building2,
  CircleDot,
  Clock,
  CheckCircle2,
  Home,
  DollarSign,
  ArrowUpDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import type { Listing, ListingStatus } from '@/lib/database.types';

// --- Filter chip primitive ---

function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
        active
          ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
          : 'bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700/80 hover:text-neutral-200',
        className
      )}
    >
      {children}
    </button>
  );
}

// --- Filter group (vertical) ---

function FilterGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {children}
      </div>
    </div>
  );
}

// --- Price ranges ---

const PRICE_RANGES = [
  { label: 'Under $500K', min: 0, max: 500_000 },
  { label: '$500K – $750K', min: 500_000, max: 750_000 },
  { label: '$750K – $1M', min: 750_000, max: 1_000_000 },
  { label: '$1M+', min: 1_000_000, max: Infinity },
] as const;

// --- Sort options ---

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'largest';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'largest', label: 'Largest' },
];

// --- Status config ---

const STATUS_CONFIG: {
  value: ListingStatus | '';
  label: string;
  icon: React.ElementType;
}[] = [
  { value: '', label: 'All', icon: Home },
  { value: 'active', label: 'Active', icon: CircleDot },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'sold', label: 'Sold', icon: CheckCircle2 },
];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5] as const;

// --- Main page ---

export default function ListingsPage() {
  const [statusFilter, setStatusFilter] = useState<ListingStatus | ''>('active');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [bedroomFilter, setBedroomFilter] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>('newest');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .is('idx_removed_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Listing[];
    },
  });

  // Derive available cities from data
  const cities = useMemo(() => {
    if (!listings) return [];
    const citySet = new Set(
      listings.map((l) => l.city).filter((c): c is string => !!c)
    );
    return Array.from(citySet).sort();
  }, [listings]);

  // Count active filters
  const activeFilterCount = [
    statusFilter !== 'active' && statusFilter !== '',
    cityFilter,
    bedroomFilter,
    priceRange !== null,
  ].filter(Boolean).length;

  // Apply filters
  const filtered = useMemo(() => {
    if (!listings) return [];

    let result = listings.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (cityFilter && l.city !== cityFilter) return false;
      if (bedroomFilter !== null) {
        if (bedroomFilter === 5) {
          if ((l.bedrooms ?? 0) < 5) return false;
        } else {
          if (l.bedrooms !== bedroomFilter) return false;
        }
      }
      if (priceRange !== null) {
        const range = PRICE_RANGES[priceRange];
        const price = l.price ?? 0;
        if (price < range.min || price >= range.max) return false;
      }
      return true;
    });

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price_asc':
          return (a.price ?? 0) - (b.price ?? 0);
        case 'price_desc':
          return (b.price ?? 0) - (a.price ?? 0);
        case 'largest':
          return (b.sqft ?? 0) - (a.sqft ?? 0);
      }
    });

    return result;
  }, [listings, statusFilter, cityFilter, bedroomFilter, priceRange, sort]);

  function clearAll() {
    setStatusFilter('active');
    setCityFilter('');
    setBedroomFilter(null);
    setPriceRange(null);
    setSort('newest');
  }

  const [showFilters, setShowFilters] = useState(false);
  const listingsTopRef = useRef<HTMLDivElement>(null);

  const openFilters = useCallback(() => {
    listingsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShowFilters(true);
  }, []);

  // Lock body scroll when mobile filter panel is open
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showFilters]);

  return (
    <div className="py-12">
      <div ref={listingsTopRef} className="scroll-mt-16" />
      <section className="container-wide">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4">San Benito County &amp; Beyond</Badge>
          <h1 className="text-4xl font-bold text-white">Property Listings</h1>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters — always visible on lg+, toggleable on mobile */}
          {/* Mobile centered modal filters */}
          <div
            className={cn(
              'fixed inset-0 z-[60] bg-black/40 backdrop-blur-xl transition-opacity lg:hidden flex flex-col',
              showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={() => setShowFilters(false)}
          >
            <div
              className="flex-1 flex flex-col px-6 pt-14 pb-8 overflow-y-auto overscroll-contain"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h2>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs text-neutral-400 hover:text-primary-400 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <FilterContent
                  statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                  cityFilter={cityFilter} setCityFilter={setCityFilter}
                  cities={cities}
                  bedroomFilter={bedroomFilter} setBedroomFilter={setBedroomFilter}
                  priceRange={priceRange} setPriceRange={setPriceRange}
                  sort={sort} setSort={setSort}
                />
              </div>
            </div>
          </div>

          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="border border-neutral-800 rounded-2xl p-5 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-neutral-500 hover:text-primary-400 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-5">
                <FilterContent
                  statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                  cityFilter={cityFilter} setCityFilter={setCityFilter}
                  cities={cities}
                  bedroomFilter={bedroomFilter} setBedroomFilter={setBedroomFilter}
                  priceRange={priceRange} setPriceRange={setPriceRange}
                  sort={sort} setSort={setSort}
                />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter button + results count */}
            <div className="flex items-center justify-center lg:justify-between mb-6">
              <button
                type="button"
                onClick={openFilters}
                className="lg:hidden relative w-11 h-11 rounded-full bg-primary-600 text-white shadow-md shadow-primary-600/30 flex items-center justify-center active:scale-95 transition-transform"
              >
                <SlidersHorizontal className="w-4.5 h-4.5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary-700 text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {!isLoading && filtered && (
                <div className="hidden lg:flex items-center gap-2 text-sm text-neutral-500">
                  <span>
                    {filtered.length} {filtered.length === 1 ? 'property' : 'properties'}
                    {activeFilterCount > 0 && ' matching'}
                  </span>
                </div>
              )}
            </div>

            {/* Listings grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-neutral-800" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-neutral-800 rounded w-1/2" />
                      <div className="h-4 bg-neutral-800 rounded w-3/4" />
                      <div className="h-3 bg-neutral-800 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !filtered?.length ? (
              <div className="text-center py-20">
                <Building2 className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-400 text-lg mb-2">No properties found</p>
                <p className="text-neutral-500 text-sm mb-6">Try adjusting your filters to see more results.</p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-full text-sm font-medium transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

// --- Shared filter content ---

function FilterContent({
  statusFilter, setStatusFilter,
  cityFilter, setCityFilter,
  cities,
  bedroomFilter, setBedroomFilter,
  priceRange, setPriceRange,
  sort, setSort,
}: {
  statusFilter: ListingStatus | '';
  setStatusFilter: (v: ListingStatus | '') => void;
  cityFilter: string;
  setCityFilter: (v: string) => void;
  cities: string[];
  bedroomFilter: number | null;
  setBedroomFilter: (v: number | null) => void;
  priceRange: number | null;
  setPriceRange: (v: number | null) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;
}) {
  return (
    <>
      <FilterGroup label="Status" icon={CircleDot}>
        {STATUS_CONFIG.map(({ value, label, icon: StatusIcon }) => (
          <Chip key={value} active={statusFilter === value} onClick={() => setStatusFilter(value)}>
            <StatusIcon className="w-3.5 h-3.5" />
            {label}
          </Chip>
        ))}
      </FilterGroup>

      {cities.length > 0 && (
        <FilterGroup label="City" icon={MapPin}>
          <Chip active={cityFilter === ''} onClick={() => setCityFilter('')}>All</Chip>
          {cities.map((city) => (
            <Chip key={city} active={cityFilter === city} onClick={() => setCityFilter(city)}>
              {city}
            </Chip>
          ))}
        </FilterGroup>
      )}

      <FilterGroup label="Beds" icon={Bed}>
        <Chip active={bedroomFilter === null} onClick={() => setBedroomFilter(null)}>Any</Chip>
        {BEDROOM_OPTIONS.map((n) => (
          <Chip key={n} active={bedroomFilter === n} onClick={() => setBedroomFilter(bedroomFilter === n ? null : n)}>
            {n === 5 ? '5+' : String(n)}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="Price" icon={DollarSign}>
        <Chip active={priceRange === null} onClick={() => setPriceRange(null)}>Any</Chip>
        {PRICE_RANGES.map((range, i) => (
          <Chip key={range.label} active={priceRange === i} onClick={() => setPriceRange(priceRange === i ? null : i)}>
            {range.label}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="Sort" icon={ArrowUpDown}>
        {SORT_OPTIONS.map(({ key, label }) => (
          <Chip key={key} active={sort === key} onClick={() => setSort(key)}>{label}</Chip>
        ))}
      </FilterGroup>
    </>
  );
}

// --- Listing card ---

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
