'use client'

import { useQuery } from '@tanstack/react-query';
import { getListingTags } from '@/lib/utils';
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
  const [statusFilters, setStatusFilters] = useState<Set<ListingStatus>>(new Set(['active']));
  const [cityFilters, setCityFilters] = useState<Set<string>>(new Set());
  const [bedroomFilters, setBedroomFilters] = useState<Set<number>>(new Set());
  const [priceRanges, setPriceRanges] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<SortKey>('newest');

  const toggleInSet = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

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

  // Count active filters (status defaults to 'active' so only count if changed)
  const activeFilterCount = [
    !(statusFilters.size === 1 && statusFilters.has('active')),
    cityFilters.size > 0,
    bedroomFilters.size > 0,
    priceRanges.size > 0,
  ].filter(Boolean).length;

  // Apply filters
  const filtered = useMemo(() => {
    if (!listings) return [];

    let result = listings.filter((l) => {
      if (statusFilters.size > 0 && !statusFilters.has(l.status as ListingStatus)) return false;
      if (cityFilters.size > 0 && !cityFilters.has(l.city ?? '')) return false;
      if (bedroomFilters.size > 0) {
        const beds = l.bedrooms ?? 0;
        const matches = Array.from(bedroomFilters).some((b) =>
          b === 5 ? beds >= 5 : beds === b
        );
        if (!matches) return false;
      }
      if (priceRanges.size > 0) {
        const price = l.price ?? 0;
        const matches = Array.from(priceRanges).some((i) => {
          const range = PRICE_RANGES[i];
          return price >= range.min && price < range.max;
        });
        if (!matches) return false;
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
  }, [listings, statusFilters, cityFilters, bedroomFilters, priceRanges, sort]);

  function clearAll() {
    setStatusFilters(new Set(['active']));
    setCityFilters(new Set());
    setBedroomFilters(new Set());
    setPriceRanges(new Set());
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
          {/* Mobile modal filters */}
          <MobileFilters
            open={showFilters}
            onClose={() => setShowFilters(false)}
            activeFilterCount={activeFilterCount}
            onClear={clearAll}
            resultCount={filtered?.length ?? 0}
            statusFilters={statusFilters} toggleStatus={(v) => toggleInSet(setStatusFilters, v)} clearStatuses={() => setStatusFilters(new Set())}
            cityFilters={cityFilters} toggleCity={(v) => toggleInSet(setCityFilters, v)} clearCities={() => setCityFilters(new Set())}
            cities={cities}
            bedroomFilters={bedroomFilters} toggleBedroom={(v) => toggleInSet(setBedroomFilters, v)} clearBedrooms={() => setBedroomFilters(new Set())}
            priceRanges={priceRanges} togglePriceRange={(v) => toggleInSet(setPriceRanges, v)} clearPriceRanges={() => setPriceRanges(new Set())}
            sort={sort} setSort={setSort}
          />

          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-black/70 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 sticky top-20">
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
                  statusFilters={statusFilters} toggleStatus={(v) => toggleInSet(setStatusFilters, v)} clearStatuses={() => setStatusFilters(new Set())}
                  cityFilters={cityFilters} toggleCity={(v) => toggleInSet(setCityFilters, v)} clearCities={() => setCityFilters(new Set())}
                  cities={cities}
                  bedroomFilters={bedroomFilters} toggleBedroom={(v) => toggleInSet(setBedroomFilters, v)} clearBedrooms={() => setBedroomFilters(new Set())}
                  priceRanges={priceRanges} togglePriceRange={(v) => toggleInSet(setPriceRanges, v)} clearPriceRanges={() => setPriceRanges(new Set())}
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
                  <div key={i} className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl overflow-hidden animate-pulse">
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

// --- Mobile accordion filter modal ---

type FilterSection = 'status' | 'city' | 'beds' | 'price' | 'sort';

interface MultiFilterProps {
  statusFilters: Set<ListingStatus>;
  toggleStatus: (v: ListingStatus) => void;
  clearStatuses: () => void;
  cityFilters: Set<string>;
  toggleCity: (v: string) => void;
  clearCities: () => void;
  cities: string[];
  bedroomFilters: Set<number>;
  toggleBedroom: (v: number) => void;
  clearBedrooms: () => void;
  priceRanges: Set<number>;
  togglePriceRange: (v: number) => void;
  clearPriceRanges: () => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;
}

function summarizeFilter(
  section: FilterSection,
  props: MultiFilterProps
): string {
  switch (section) {
    case 'status': {
      if (props.statusFilters.size === 0) return 'All';
      return STATUS_CONFIG
        .filter((s) => s.value && props.statusFilters.has(s.value as ListingStatus))
        .map((s) => s.label)
        .join(', ') || 'All';
    }
    case 'city':
      return props.cityFilters.size === 0
        ? 'All'
        : Array.from(props.cityFilters).join(', ');
    case 'beds':
      return props.bedroomFilters.size === 0
        ? 'Any'
        : Array.from(props.bedroomFilters)
            .sort()
            .map((n) => (n === 5 ? '5+' : String(n)))
            .join(', ');
    case 'price':
      return props.priceRanges.size === 0
        ? 'Any'
        : Array.from(props.priceRanges)
            .sort()
            .map((i) => PRICE_RANGES[i].label)
            .join(', ');
    case 'sort':
      return SORT_OPTIONS.find((o) => o.key === props.sort)?.label ?? '';
  }
}

const FILTER_SECTIONS: { key: FilterSection; label: string; icon: React.ElementType }[] = [
  { key: 'status', label: 'Status', icon: CircleDot },
  { key: 'city', label: 'City', icon: MapPin },
  { key: 'beds', label: 'Beds', icon: Bed },
  { key: 'price', label: 'Price', icon: DollarSign },
  { key: 'sort', label: 'Sort', icon: ArrowUpDown },
];

function MobileFilterAccordionRow({
  label,
  icon: Icon,
  expanded,
  onToggle,
  onClear,
  hasSelection,
  summary,
  children,
}: {
  label: string;
  icon: React.ElementType;
  expanded: boolean;
  onToggle: () => void;
  onClear?: () => void;
  hasSelection: boolean;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
          expanded ? 'bg-neutral-800/60' : 'hover:bg-neutral-800/30'
        )}
      >
        <Icon className="w-4 h-4 text-neutral-500 shrink-0" />
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="ml-auto text-xs text-neutral-500 truncate max-w-[50%] text-right">
          {summary}
        </span>
        <svg
          className={cn(
            'w-4 h-4 text-neutral-500 shrink-0 transition-transform',
            expanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all',
          expanded ? 'max-h-48 opacity-100 mt-2 mb-1' : 'max-h-0 opacity-0'
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 px-4">
          {children}
          {hasSelection && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="ml-auto text-[11px] text-neutral-500 hover:text-primary-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function sectionHasSelection(section: FilterSection, props: MultiFilterProps): boolean {
  switch (section) {
    case 'status': return props.statusFilters.size > 0;
    case 'city': return props.cityFilters.size > 0;
    case 'beds': return props.bedroomFilters.size > 0;
    case 'price': return props.priceRanges.size > 0;
    case 'sort': return false; // sort always has a value, no "clear"
  }
}

function sectionClear(section: FilterSection, props: MultiFilterProps) {
  switch (section) {
    case 'status': return props.clearStatuses;
    case 'city': return props.clearCities;
    case 'beds': return props.clearBedrooms;
    case 'price': return props.clearPriceRanges;
    case 'sort': return undefined;
  }
}

function MobileFilters({
  open, onClose, activeFilterCount, onClear, resultCount,
  ...filterProps
}: {
  open: boolean;
  onClose: () => void;
  activeFilterCount: number;
  onClear: () => void;
  resultCount: number;
} & MultiFilterProps) {
  const [expanded, setExpanded] = useState<FilterSection | null>(null);

  const toggle = (section: FilterSection) =>
    setExpanded((prev) => (prev === section ? null : section));

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] bg-black/40 backdrop-blur-xl transition-opacity lg:hidden flex items-center justify-center',
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'text-xs transition-colors w-16',
              activeFilterCount > 0
                ? 'text-neutral-400 hover:text-primary-400'
                : 'invisible'
            )}
          >
            Clear all
          </button>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </h2>
          <div className="w-16 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Accordion sections */}
        <div className="space-y-1">
          {FILTER_SECTIONS.map(({ key, label, icon }) => (
            <MobileFilterAccordionRow
              key={key}
              label={label}
              icon={icon}
              expanded={expanded === key}
              onToggle={() => toggle(key)}
              summary={summarizeFilter(key, filterProps)}
              hasSelection={sectionHasSelection(key, filterProps)}
              onClear={sectionClear(key, filterProps)}
            >
              {key === 'status' && (
                <>
                  <Chip active={filterProps.statusFilters.size === 0} onClick={filterProps.clearStatuses}>All</Chip>
                  {STATUS_CONFIG.filter((s) => s.value).map(({ value, label: l, icon: StatusIcon }) => (
                    <Chip key={value} active={filterProps.statusFilters.has(value as ListingStatus)} onClick={() => filterProps.toggleStatus(value as ListingStatus)}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {l}
                    </Chip>
                  ))}
                </>
              )}

              {key === 'city' && (
                <>
                  <Chip active={filterProps.cityFilters.size === 0} onClick={filterProps.clearCities}>All</Chip>
                  {filterProps.cities.map((city) => (
                    <Chip key={city} active={filterProps.cityFilters.has(city)} onClick={() => filterProps.toggleCity(city)}>
                      {city}
                    </Chip>
                  ))}
                </>
              )}

              {key === 'beds' && (
                <>
                  <Chip active={filterProps.bedroomFilters.size === 0} onClick={filterProps.clearBedrooms}>Any</Chip>
                  {BEDROOM_OPTIONS.map((n) => (
                    <Chip key={n} active={filterProps.bedroomFilters.has(n)} onClick={() => filterProps.toggleBedroom(n)}>
                      {n === 5 ? '5+' : String(n)}
                    </Chip>
                  ))}
                </>
              )}

              {key === 'price' && (
                <>
                  <Chip active={filterProps.priceRanges.size === 0} onClick={filterProps.clearPriceRanges}>Any</Chip>
                  {PRICE_RANGES.map((range, i) => (
                    <Chip key={range.label} active={filterProps.priceRanges.has(i)} onClick={() => filterProps.togglePriceRange(i)}>
                      {range.label}
                    </Chip>
                  ))}
                </>
              )}

              {key === 'sort' && SORT_OPTIONS.map(({ key: k, label: l }) => (
                <Chip key={k} active={filterProps.sort === k} onClick={() => filterProps.setSort(k)}>{l}</Chip>
              ))}
            </MobileFilterAccordionRow>
          ))}
        </div>

        {/* Results button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 active:scale-[0.98] transition-all"
        >
          Show {resultCount} {resultCount === 1 ? 'property' : 'properties'}
        </button>
      </div>
    </div>
  );
}

// --- Shared filter content (desktop sidebar) ---

function FilterContent({
  statusFilters, toggleStatus, clearStatuses,
  cityFilters, toggleCity, clearCities,
  cities,
  bedroomFilters, toggleBedroom, clearBedrooms,
  priceRanges, togglePriceRange, clearPriceRanges,
  sort, setSort,
}: MultiFilterProps) {
  return (
    <>
      <FilterGroup label="Status" icon={CircleDot}>
        <Chip active={statusFilters.size === 0} onClick={clearStatuses}>
          <Home className="w-3.5 h-3.5" />
          All
        </Chip>
        {STATUS_CONFIG.filter((s) => s.value).map(({ value, label, icon: StatusIcon }) => (
          <Chip key={value} active={statusFilters.has(value as ListingStatus)} onClick={() => toggleStatus(value as ListingStatus)}>
            <StatusIcon className="w-3.5 h-3.5" />
            {label}
          </Chip>
        ))}
      </FilterGroup>

      {cities.length > 0 && (
        <FilterGroup label="City" icon={MapPin}>
          <Chip active={cityFilters.size === 0} onClick={clearCities}>All</Chip>
          {cities.map((city) => (
            <Chip key={city} active={cityFilters.has(city)} onClick={() => toggleCity(city)}>
              {city}
            </Chip>
          ))}
        </FilterGroup>
      )}

      <FilterGroup label="Beds" icon={Bed}>
        <Chip active={bedroomFilters.size === 0} onClick={clearBedrooms}>Any</Chip>
        {BEDROOM_OPTIONS.map((n) => (
          <Chip key={n} active={bedroomFilters.has(n)} onClick={() => toggleBedroom(n)}>
            {n === 5 ? '5+' : String(n)}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="Price" icon={DollarSign}>
        <Chip active={priceRanges.size === 0} onClick={clearPriceRanges}>Any</Chip>
        {PRICE_RANGES.map((range, i) => (
          <Chip key={range.label} active={priceRanges.has(i)} onClick={() => togglePriceRange(i)}>
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
      className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors group"
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
        <div className="flex flex-wrap gap-1.5 mt-3">
          {getListingTags(listing).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-neutral-800 text-neutral-400 text-[10px] font-medium rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
