'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { MapPin, Building2, Bed, Bath, Maximize, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/lib/database.types'

type Category = 'sold' | 'listed' | 'active'

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'sold', label: 'Just Sold' },
  { key: 'listed', label: 'Just Listed' },
  { key: 'active', label: 'Active Listings' },
]

const CYCLE_MS = 5000
const MAX_PER_CATEGORY = 6

function categorize(listings: Listing[]): Record<Category, Listing[]> {
  const now = Date.now()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000

  const sold = listings
    .filter((l) => l.status === 'sold')
    .slice(0, MAX_PER_CATEGORY)

  const listed = listings
    .filter(
      (l) =>
        l.status === 'active' &&
        now - new Date(l.created_at).getTime() < thirtyDays,
    )
    .slice(0, MAX_PER_CATEGORY)

  const active = listings
    .filter((l) => l.status === 'active')
    .slice(0, MAX_PER_CATEGORY)

  return { sold, listed, active }
}

function ListingCard({ listing, fading }: { listing: Listing; fading: boolean }) {
  const photo = listing.photos?.[0]
  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        'block bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden hover:border-neutral-600 transition-all duration-300 group',
        fading ? 'opacity-0 scale-[0.97]' : 'opacity-100 scale-100',
      )}
    >
      <div className="aspect-[4/3] bg-neutral-900 relative overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={listing.address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-700">
            <Building2 className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-primary-600/90 text-white text-xs font-semibold rounded-full capitalize">
            {listing.status}
          </span>
        </div>
      </div>
      <div className="p-5">
        {listing.price && (
          <p className="text-2xl font-bold text-white mb-1">
            ${listing.price.toLocaleString()}
          </p>
        )}
        <p className="text-sm text-neutral-300 flex items-center gap-1.5 mb-3">
          <MapPin className="w-4 h-4 shrink-0" />
          {listing.address}
          {listing.city && `, ${listing.city}`}
          {listing.state && `, ${listing.state}`}
        </p>
        <div className="flex items-center gap-4 text-sm text-neutral-400">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" /> {listing.bedrooms} bd
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" /> {listing.bathrooms} ba
            </span>
          )}
          {listing.sqft != null && (
            <span className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4" />{' '}
              {listing.sqft.toLocaleString()} sqft
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function FeaturedListings() {
  const { data: listings } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .is('idx_removed_at', null)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as Listing[]
    },
  })

  const groups = listings ? categorize(listings) : null

  const availableCategories = groups
    ? CATEGORIES.filter((c) => groups[c.key].length > 0)
    : []

  // Category cycling
  const [catIdx, setCatIdx] = useState(0)
  const [catFading, setCatFading] = useState(false)

  // Listing cycling within category
  const [listingIdx, setListingIdx] = useState(0)
  const [listingFading, setListingFading] = useState(false)

  const pausedRef = useRef(false)

  const safeCatIdx = catIdx % Math.max(availableCategories.length, 1)
  const current = availableCategories[safeCatIdx]
  const currentListings = current && groups ? groups[current.key] : []
  const safeListingIdx = listingIdx % Math.max(currentListings.length, 1)
  const activeListing = currentListings[safeListingIdx]

  // Transition to a specific listing
  const goToListing = useCallback(
    (next: number) => {
      if (currentListings.length < 2) return
      setListingFading(true)
      setTimeout(() => {
        setListingIdx(next % currentListings.length)
        setListingFading(false)
      }, 300)
    },
    [currentListings.length],
  )

  // Transition to a specific category
  const goToCategory = useCallback(
    (next: number) => {
      if (availableCategories.length < 1) return
      setCatFading(true)
      setListingFading(true)
      setTimeout(() => {
        setCatIdx(next % availableCategories.length)
        setListingIdx(0)
        setCatFading(false)
        setListingFading(false)
      }, 300)
    },
    [availableCategories.length],
  )

  const nextListing = useCallback(() => {
    goToListing(safeListingIdx + 1)
  }, [goToListing, safeListingIdx])

  const prevListing = useCallback(() => {
    goToListing(
      (safeListingIdx - 1 + currentListings.length) % currentListings.length,
    )
  }, [goToListing, safeListingIdx, currentListings.length])

  // Auto-advance: cycle through listings, then move to next category
  useEffect(() => {
    if (currentListings.length === 0) return

    const timer = setInterval(() => {
      if (pausedRef.current) return

      if (safeListingIdx < currentListings.length - 1) {
        // Next listing in current category
        goToListing(safeListingIdx + 1)
      } else if (availableCategories.length > 1) {
        // Move to next category
        goToCategory(safeCatIdx + 1)
      } else {
        // Only one category — loop listings
        goToListing(0)
      }
    }, CYCLE_MS)

    return () => clearInterval(timer)
  }, [
    safeListingIdx,
    currentListings.length,
    safeCatIdx,
    availableCategories.length,
    goToListing,
    goToCategory,
  ])

  const onPointerEnter = () => { pausedRef.current = true }
  const onPointerLeave = () => { pausedRef.current = false }

  if (!groups || availableCategories.length === 0) return null

  return (
    <section className="container-narrow mb-24 reveal-fade">
      {/* Category label */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {availableCategories.length > 1 && (
          <button
            type="button"
            onClick={() =>
              goToCategory(
                (safeCatIdx - 1 + availableCategories.length) %
                  availableCategories.length,
              )
            }
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div className="relative h-7 overflow-hidden">
          <span
            className={cn(
              'inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-primary-600 text-white transition-all duration-300',
              catFading
                ? 'opacity-0 translate-y-2'
                : 'opacity-100 translate-y-0',
            )}
          >
            {current?.label}
          </span>
        </div>

        {availableCategories.length > 1 && (
          <button
            type="button"
            onClick={() => goToCategory(safeCatIdx + 1)}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category dots */}
      {availableCategories.length > 1 && (
        <div className="flex justify-center gap-1.5 mb-5">
          {availableCategories.map((cat, i) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => goToCategory(i)}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all duration-300',
                i === safeCatIdx
                  ? 'w-4 bg-primary-400'
                  : 'bg-neutral-700 hover:bg-neutral-500',
              )}
            />
          ))}
        </div>
      )}

      {/* Desktop: 3-column grid, Mobile: single card carousel */}
      {currentListings.length > 0 && (
        <div
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onTouchStart={onPointerEnter}
          onTouchEnd={onPointerLeave}
        >
          {/* Desktop grid — show up to 3 */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {currentListings.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} fading={catFading} />
            ))}
          </div>

          {/* Mobile single card carousel */}
          <div className="md:hidden max-w-lg mx-auto">
            <ListingCard listing={activeListing!} fading={listingFading} />

            {currentListings.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={prevListing}
                  className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-1.5">
                  {currentListings.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToListing(i)}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-all duration-300',
                        i === safeListingIdx
                          ? 'w-3 bg-neutral-300'
                          : 'bg-neutral-700 hover:bg-neutral-500',
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={nextListing}
                  className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View all link */}
      <div className="text-center mt-6">
        <Link
          href="/listings"
          className="text-sm text-neutral-500 hover:text-primary-400 transition-colors"
        >
          View all listings &rarr;
        </Link>
      </div>
    </section>
  )
}
