'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, Pencil, Rss, PenLine, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ListingForm } from '@/components/dashboard/ListingForm'
import type { Listing, ListingStatus, ListingSource } from '@/lib/database.types'

const PAGE_SIZE = 15

export default function DashboardListingsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<ListingStatus | ''>('')
  const [sourceFilter, setSourceFilter] = useState<ListingSource | ''>('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [page, setPage] = useState(0)

  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings', 'dashboard', statusFilter, sourceFilter],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }
      if (sourceFilter) {
        query = query.eq('source', sourceFilter)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Listing[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('listings').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })

  const filtered = listings?.filter((l) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      l.address.toLowerCase().includes(term) ||
      l.city?.toLowerCase().includes(term) ||
      l.zip?.includes(term) ||
      l.mls_number?.includes(term)
    )
  })

  // Reset page when filters change
  const total = filtered?.length ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages - 1, 0))
  const paginated = filtered?.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  function handleEdit(listing: Listing) {
    setEditingListing(listing)
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingListing(null)
  }

  const statusColors: Record<ListingStatus, string> = {
    active: 'bg-emerald-900/50 text-emerald-300',
    pending: 'bg-amber-900/50 text-amber-300',
    sold: 'bg-primary-900/50 text-primary-300',
    off_market: 'bg-neutral-700 text-neutral-300',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Listings</h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        <FilterPill active={statusFilter === ''} onClick={() => { setStatusFilter(''); setPage(0) }}>All</FilterPill>
        <FilterPill active={statusFilter === 'active'} onClick={() => { setStatusFilter('active'); setPage(0) }}>Active</FilterPill>
        <FilterPill active={statusFilter === 'pending'} onClick={() => { setStatusFilter('pending'); setPage(0) }}>Pending</FilterPill>
        <FilterPill active={statusFilter === 'sold'} onClick={() => { setStatusFilter('sold'); setPage(0) }}>Sold</FilterPill>
        <FilterPill active={statusFilter === 'off_market'} onClick={() => { setStatusFilter('off_market'); setPage(0) }}>Off Market</FilterPill>
        <span className="w-px h-5 bg-neutral-700 mx-1 hidden sm:block" />
        <FilterPill active={sourceFilter === ''} onClick={() => { setSourceFilter(''); setPage(0) }}>Any Source</FilterPill>
        <FilterPill active={sourceFilter === 'manual'} onClick={() => { setSourceFilter('manual'); setPage(0) }}>Manual</FilterPill>
        <FilterPill active={sourceFilter === 'idx'} onClick={() => { setSourceFilter('idx'); setPage(0) }}>IDX</FilterPill>
      </div>

      {/* Listing form modal */}
      {showForm && (
        <ListingForm listing={editingListing} onClose={handleCloseForm} />
      )}

      {/* Listings table */}
      {isLoading ? (
        <div className="text-center text-neutral-400 py-12">Loading listings...</div>
      ) : !paginated?.length ? (
        <div className="text-center text-neutral-400 py-12">
          No listings found. Add your first listing to get started.
        </div>
      ) : (
        <>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Address</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Price</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Beds/Baths</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">MLS #</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Source</th>
                  <th className="text-right px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {paginated.map((listing) => (
                  <tr key={listing.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-3 sm:px-4 py-3">
                      <p className="text-sm font-medium text-white">{listing.address}</p>
                      <p className="text-xs text-neutral-500">
                        {[listing.city, listing.state, listing.zip].filter(Boolean).join(', ')}
                      </p>
                      {/* Show price on mobile under address */}
                      <p className="text-xs text-neutral-400 mt-0.5 md:hidden">
                        {listing.price ? `$${listing.price.toLocaleString()}` : ''}
                        {listing.price && (listing.bedrooms || listing.bathrooms) ? ' · ' : ''}
                        {(listing.bedrooms || listing.bathrooms) ? `${listing.bedrooms ?? '—'}bd / ${listing.bathrooms ?? '—'}ba` : ''}
                      </p>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                          statusColors[listing.status]
                        }`}
                      >
                        {listing.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-neutral-300 hidden md:table-cell">
                      {listing.price ? `$${listing.price.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-neutral-400 hidden md:table-cell">
                      {listing.bedrooms ?? '—'} / {listing.bathrooms ?? '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-neutral-400 hidden lg:table-cell">
                      {listing.mls_number || '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                        {listing.source === 'idx' ? (
                          <><Rss className="w-3 h-3" /> IDX</>
                        ) : (
                          <><PenLine className="w-3 h-3" /> Manual</>
                        )}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      {listing.source === 'manual' ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(listing)}
                            className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this listing?')) {
                                deleteMutation.mutate(listing.id)
                              }
                            }}
                            className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-600">Synced</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-neutral-500">
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={safePage === 0}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-neutral-400 px-2">{safePage + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={safePage >= totalPages - 1}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-primary-900/50 text-primary-300'
          : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
      }`}
    >
      {children}
    </button>
  )
}
