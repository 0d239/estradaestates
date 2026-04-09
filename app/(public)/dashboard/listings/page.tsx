'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, Pencil, Rss, PenLine, ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal, UserPlus, X, Check, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getListingTags } from '@/lib/utils'
import { logActivity } from '@/lib/activity-log'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { DashboardPageHeader } from '../layout'
import { ListingForm } from '@/components/dashboard/ListingForm'
import { DeleteConfirmModal } from '@/components/dashboard/DeleteConfirmModal'
import type { Listing, ListingStatus, ListingSource, Profile, ListingAssignment } from '@/lib/database.types'

const PAGE_SIZE = 15

export default function DashboardListingsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<ListingStatus | ''>('')
  const [sourceFilter, setSourceFilter] = useState<ListingSource | ''>('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [assigningListing, setAssigningListing] = useState<Listing | null>(null)
  const [page, setPage] = useState(0)
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [idxWarning, setIdxWarning] = useState(false)

  useEffect(() => {
    if (!idxWarning) return
    const t = setTimeout(() => setIdxWarning(false), 4000)
    return () => clearTimeout(t)
  }, [idxWarning])

  // Fetch all team profiles for assignment
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Profile[]
    },
  })

  // Fetch all assignments
  const { data: assignments } = useQuery({
    queryKey: ['listing_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listing_assignments')
        .select('*')
      if (error) throw error
      return data as ListingAssignment[]
    },
  })

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
      const listing = listings?.find((l) => l.id === id)
      const { error } = await supabase.from('listings').delete().eq('id', id)
      if (error) throw error

      await logActivity({
        actorId: user?.id ?? null,
        action: 'listing_deleted',
        entityType: 'listing',
        entityId: id,
        metadata: { address: listing?.address, status: listing?.status },
      })
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
      <DashboardPageHeader
        icon={Building2}
        label="Listings"
        action={
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        }
      />

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

      {/* Collapsible filters */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {(statusFilter || sourceFilter) && (
            <span className="w-4.5 h-4.5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {(statusFilter ? 1 : 0) + (sourceFilter ? 1 : 0)}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-all ${filtersOpen ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mr-1">Status</span>
              <FilterPill active={statusFilter === ''} onClick={() => { setStatusFilter(''); setPage(0) }}>All</FilterPill>
              <FilterPill active={statusFilter === 'active'} onClick={() => { setStatusFilter('active'); setPage(0) }}>Active</FilterPill>
              <FilterPill active={statusFilter === 'pending'} onClick={() => { setStatusFilter('pending'); setPage(0) }}>Pending</FilterPill>
              <FilterPill active={statusFilter === 'sold'} onClick={() => { setStatusFilter('sold'); setPage(0) }}>Sold</FilterPill>
              <FilterPill active={statusFilter === 'off_market'} onClick={() => { setStatusFilter('off_market'); setPage(0) }}>Off Market</FilterPill>
              {statusFilter && (
                <button type="button" onClick={() => { setStatusFilter(''); setPage(0) }} className="text-[11px] text-neutral-500 hover:text-primary-400 transition-colors ml-1">Clear</button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mr-1">Source</span>
              <FilterPill active={sourceFilter === ''} onClick={() => { setSourceFilter(''); setPage(0) }}>Any</FilterPill>
              <FilterPill active={sourceFilter === 'manual'} onClick={() => { setSourceFilter('manual'); setPage(0) }}>Manual</FilterPill>
              <FilterPill active={sourceFilter === 'idx'} onClick={() => { setSourceFilter('idx'); setPage(0) }}>IDX</FilterPill>
              {sourceFilter && (
                <button type="button" onClick={() => { setSourceFilter(''); setPage(0) }} className="text-[11px] text-neutral-500 hover:text-primary-400 transition-colors ml-1">Clear</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listing form modal */}
      {showForm && (
        <ListingForm listing={editingListing} onClose={handleCloseForm} />
      )}

      {/* Delete confirmation modal */}
      {deletingListing && (
        <DeleteConfirmModal
          label="Listing"
          confirmText={deletingListing.address}
          isPending={deleteMutation.isPending}
          onConfirm={() => {
            deleteMutation.mutate(deletingListing.id, {
              onSuccess: () => setDeletingListing(null),
            })
          }}
          onClose={() => setDeletingListing(null)}
        />
      )}

      {/* Assignment modal */}
      {assigningListing && (
        <AssignmentModal
          listing={assigningListing}
          profiles={profiles ?? []}
          assignments={assignments?.filter((a) => a.listing_id === assigningListing.id) ?? []}
          actorId={user?.id ?? null}
          onClose={() => setAssigningListing(null)}
        />
      )}

      {/* IDX warning toast */}
      {idxWarning && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 shadow-lg">
            <Rss className="w-4 h-4 text-primary-400 shrink-0" />
            <p className="text-sm text-neutral-200">IDX-synced listings can&apos;t be deleted here — manage them from your MLS.</p>
            <button onClick={() => setIdxWarning(false)} className="text-neutral-500 hover:text-white transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
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
          {/* Mobile card list */}
          <div className="md:hidden space-y-2">
            {paginated.map((listing) => (
              <div key={listing.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{listing.address}</p>
                    <p className="text-xs text-neutral-500 truncate">
                      {[listing.city, listing.state, listing.zip].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                      statusColors[listing.status]
                    }`}
                  >
                    {listing.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-400 mb-2">
                  {listing.price && (
                    <span className="font-medium text-neutral-200">${listing.price.toLocaleString()}</span>
                  )}
                  {listing.bedrooms != null && <span>{listing.bedrooms}bd</span>}
                  {listing.bathrooms != null && <span>{listing.bathrooms}ba</span>}
                  {listing.sqft != null && <span>{listing.sqft.toLocaleString()} sqft</span>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AgentBadges
                      listingId={listing.id}
                      assignments={assignments}
                      profiles={profiles}
                      onAssign={() => setAssigningListing(listing)}
                    />
                    {listing.source === 'idx' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                        <Rss className="w-3 h-3" /> IDX
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {listing.source === 'manual' && (
                      <button
                        onClick={() => handleEdit(listing)}
                        className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => listing.source === 'manual' ? setDeletingListing(listing) : setIdxWarning(true)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Address</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Agents</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Beds/Baths</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">MLS #</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Source</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {paginated.map((listing) => (
                  <tr key={listing.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{listing.address}</p>
                      <p className="text-xs text-neutral-500">
                        {[listing.city, listing.state, listing.zip].filter(Boolean).join(', ')}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getListingTags(listing).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 bg-neutral-800 text-neutral-500 text-[10px] rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
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
                    <td className="px-4 py-3">
                      <AgentBadges
                        listingId={listing.id}
                        assignments={assignments}
                        profiles={profiles}
                        onAssign={() => setAssigningListing(listing)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-300">
                      {listing.price ? `$${listing.price.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400">
                      {listing.bedrooms ?? '—'} / {listing.bathrooms ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400 hidden lg:table-cell">
                      {listing.mls_number || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                        {listing.source === 'idx' ? (
                          <><Rss className="w-3 h-3" /> IDX</>
                        ) : (
                          <><PenLine className="w-3 h-3" /> Manual</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {listing.source === 'manual' && (
                          <button
                            onClick={() => handleEdit(listing)}
                            className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => listing.source === 'manual' ? setDeletingListing(listing) : setIdxWarning(true)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm md:flex-row-reverse">
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

function AgentBadges({
  listingId,
  assignments,
  profiles,
  onAssign,
}: {
  listingId: string
  assignments: ListingAssignment[] | undefined
  profiles: Profile[] | undefined
  onAssign: () => void
}) {
  const assigned = assignments?.filter((a) => a.listing_id === listingId) ?? []
  const assignedProfiles = assigned
    .map((a) => profiles?.find((p) => p.id === a.profile_id))
    .filter(Boolean) as Profile[]

  return (
    <button
      onClick={onAssign}
      className="flex items-center gap-1 group"
    >
      {assignedProfiles.length > 0 ? (
        <div className="flex -space-x-1.5">
          {assignedProfiles.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="w-6 h-6 rounded-full bg-primary-900/50 border border-neutral-700 flex items-center justify-center text-[10px] font-medium text-primary-300 overflow-hidden"
              title={p.name}
            >
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
              )}
            </div>
          ))}
          {assignedProfiles.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] text-neutral-400">
              +{assignedProfiles.length - 3}
            </div>
          )}
        </div>
      ) : (
        <span className="text-xs text-neutral-600 group-hover:text-neutral-400 transition-colors">
          <UserPlus className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
  )
}

function AssignmentModal({
  listing,
  profiles,
  assignments,
  actorId,
  onClose,
}: {
  listing: Listing
  profiles: Profile[]
  assignments: ListingAssignment[]
  actorId: string | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const assignMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('listing_assignments')
        .insert({ listing_id: listing.id, profile_id: profileId, assigned_by: actorId })
      if (error) throw error

      const profile = profiles.find((p) => p.id === profileId)
      await logActivity({
        actorId,
        action: 'listing_assigned',
        entityType: 'listing',
        entityId: listing.id,
        metadata: {
          address: listing.address,
          assigned_profile_id: profileId,
          assigned_profile_name: profile?.name,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing_assignments'] })
    },
  })

  const unassignMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('listing_assignments')
        .delete()
        .eq('listing_id', listing.id)
        .eq('profile_id', profileId)
      if (error) throw error

      const profile = profiles.find((p) => p.id === profileId)
      await logActivity({
        actorId,
        action: 'listing_unassigned',
        entityType: 'listing',
        entityId: listing.id,
        metadata: {
          address: listing.address,
          unassigned_profile_id: profileId,
          unassigned_profile_name: profile?.name,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing_assignments'] })
    },
  })

  const assignedIds = new Set(assignments.map((a) => a.profile_id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-sm m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-white">Assign Agents</h2>
            <p className="text-xs text-neutral-500 mt-0.5 truncate">{listing.address}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-2">
          {profiles.map((profile) => {
            const isAssigned = assignedIds.has(profile.id)
            const isPending = assignMutation.isPending || unassignMutation.isPending
            return (
              <button
                key={profile.id}
                disabled={isPending}
                onClick={() => {
                  if (isAssigned) {
                    unassignMutation.mutate(profile.id)
                  } else {
                    assignMutation.mutate(profile.id)
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800/50 transition-colors disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-full bg-primary-900/50 border border-neutral-700 flex items-center justify-center text-xs font-medium text-primary-300 overflow-hidden shrink-0">
                  {profile.image_url ? (
                    <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm text-white truncate">{profile.name}</p>
                  {profile.title && <p className="text-xs text-neutral-500 truncate">{profile.title}</p>}
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isAssigned
                    ? 'bg-primary-500 border-primary-400'
                    : 'border-neutral-600'
                }`}>
                  {isAssigned && <Check className="w-3 h-3 text-neutral-900" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
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
