'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, Pencil, Rss, PenLine } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ListingForm } from '@/components/dashboard/ListingForm'
import type { Listing, ListingStatus, ListingSource } from '@/lib/database.types'

export default function DashboardListingsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<ListingStatus | ''>('')
  const [sourceFilter, setSourceFilter] = useState<ListingSource | ''>('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Listings</h1>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Listing
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search listings..."
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
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
          <option value="off_market">Off Market</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as ListingSource | '')}
          className="px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Sources</option>
          <option value="manual">Manual</option>
          <option value="idx">IDX</option>
        </select>
      </div>

      {/* Listing form modal */}
      {showForm && (
        <ListingForm listing={editingListing} onClose={handleCloseForm} />
      )}

      {/* Listings table */}
      {isLoading ? (
        <div className="text-center text-neutral-400 py-12">Loading listings...</div>
      ) : !filtered?.length ? (
        <div className="text-center text-neutral-400 py-12">
          No listings found. Add your first listing to get started.
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Address</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Beds/Baths</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">MLS #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Source</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filtered.map((listing) => (
                <tr key={listing.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white">{listing.address}</p>
                    <p className="text-xs text-neutral-500">
                      {[listing.city, listing.state, listing.zip].filter(Boolean).join(', ')}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        statusColors[listing.status]
                      }`}
                    >
                      {listing.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-300 hidden md:table-cell">
                    {listing.price ? `$${listing.price.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-400 hidden md:table-cell">
                    {listing.bedrooms ?? '—'} / {listing.bathrooms ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-400 hidden lg:table-cell">
                    {listing.mls_number || '—'}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                      {listing.source === 'idx' ? (
                        <><Rss className="w-3 h-3" /> IDX</>
                      ) : (
                        <><PenLine className="w-3 h-3" /> Manual</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {listing.source === 'manual' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(listing)}
                          className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this listing?')) {
                              deleteMutation.mutate(listing.id)
                            }
                          }}
                          className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
      )}
    </div>
  )
}
