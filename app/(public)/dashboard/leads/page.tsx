'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2, UserCheck, Building2, ArrowRightLeft, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/activity-log'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import type { Contact } from '@/lib/database.types'
import { INTEREST_BUYING, INTEREST_SELLING, INTEREST_DESIGN } from '@/lib/schemas/lead'

const PAGE_SIZE = 15

function interestLabels(flags: number): string[] {
  const labels: string[] = []
  if (flags & INTEREST_BUYING) labels.push('Buying')
  if (flags & INTEREST_SELLING) labels.push('Selling')
  if (flags & INTEREST_DESIGN) labels.push('Design')
  return labels
}

const flagColors: Record<number, string> = {
  [INTEREST_BUYING]: 'bg-blue-900/50 text-blue-300',
  [INTEREST_SELLING]: 'bg-emerald-900/50 text-emerald-300',
  [INTEREST_DESIGN]: 'bg-violet-900/50 text-violet-300',
}

export default function LeadsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [interestFilter, setInterestFilter] = useState<number>(0)
  const [viewingLead, setViewingLead] = useState<Contact | null>(null)
  const [convertingLead, setConvertingLead] = useState<Contact | null>(null)
  const [page, setPage] = useState(0)

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', interestFilter],
    queryFn: async () => {
      const query = supabase
        .from('contacts')
        .select('*')
        .eq('type', 'lead')
        .order('created_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      return data as Contact[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const lead = leads?.find((l) => l.id === id)
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) throw error

      await logActivity({
        actorId: user?.id ?? null,
        action: 'lead_deleted',
        entityType: 'lead',
        entityId: id,
        metadata: { name: lead?.name, interest_flags: lead?.interest_flags },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })

  const filtered = leads?.filter((l) => {
    if (interestFilter && !(l.interest_flags & interestFilter)) return false
    if (!search) return true
    const term = search.toLowerCase()
    return (
      l.name.toLowerCase().includes(term) ||
      l.email?.toLowerCase().includes(term) ||
      l.phone?.includes(term)
    )
  })

  const total = filtered?.length ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages - 1, 0))
  const paginated = filtered?.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  return (
    <div>
      <div className="hidden md:block mb-4">
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Incoming leads from the contact form.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        <FilterPill active={interestFilter === 0} onClick={() => { setInterestFilter(0); setPage(0) }}>All</FilterPill>
        <FilterPill active={interestFilter === INTEREST_BUYING} onClick={() => { setInterestFilter(INTEREST_BUYING); setPage(0) }}>Buying</FilterPill>
        <FilterPill active={interestFilter === INTEREST_SELLING} onClick={() => { setInterestFilter(INTEREST_SELLING); setPage(0) }}>Selling</FilterPill>
        <FilterPill active={interestFilter === INTEREST_DESIGN} onClick={() => { setInterestFilter(INTEREST_DESIGN); setPage(0) }}>Design</FilterPill>
      </div>

      {/* Leads table */}
      {isLoading ? (
        <div className="text-center text-neutral-400 py-12">Loading leads...</div>
      ) : !paginated?.length ? (
        <div className="text-center text-neutral-400 py-12">
          No leads yet. They&apos;ll appear here when someone submits the contact form.
        </div>
      ) : (
        <>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Name</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Interest</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Contact</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Details</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Submitted</th>
                  <th className="text-right px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {paginated.map((lead) => (
                  <tr key={lead.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-3 sm:px-4 py-3">
                      <p className="text-sm font-medium text-white">{lead.name}</p>
                      {/* Show contact info on mobile */}
                      <div className="md:hidden text-xs text-neutral-500 mt-0.5 space-y-0.5">
                        {lead.phone && <p>{lead.phone}</p>}
                        {lead.email && <p className="truncate max-w-[180px]">{lead.email}</p>}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      {lead.interest_flags ? (
                        <div className="flex flex-wrap gap-1">
                          {[INTEREST_BUYING, INTEREST_SELLING, INTEREST_DESIGN].map((flag) =>
                            lead.interest_flags & flag ? (
                              <span key={flag} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${flagColors[flag]}`}>
                                {flag === INTEREST_BUYING ? 'Buy' : flag === INTEREST_SELLING ? 'Sell' : 'Design'}
                              </span>
                            ) : null
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-500">—</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                      <div className="text-sm text-neutral-400">
                        {lead.phone && <p>{lead.phone}</p>}
                        {lead.email && <p className="truncate max-w-[180px]">{lead.email}</p>}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">
                      <div className="text-xs text-neutral-500 space-y-0.5">
                        {lead.budget && <p>Budget: ${lead.budget.toLocaleString()}</p>}
                        {lead.preferred_zipcodes?.length > 0 && <p>Zip: {lead.preferred_zipcodes.join(', ')}</p>}
                        {lead.property_zipcode && <p>Property: {lead.property_zipcode}</p>}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs text-neutral-500 hidden lg:table-cell">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingLead(lead)}
                          className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConvertingLead(lead)}
                          className="p-1.5 text-neutral-500 hover:text-primary-400 transition-colors"
                          title="Convert lead"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this lead?')) {
                              deleteMutation.mutate(lead.id)
                            }
                          }}
                          className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                          title="Delete"
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

      {/* View detail modal */}
      {viewingLead && (
        <LeadDetailModal lead={viewingLead} onClose={() => setViewingLead(null)} />
      )}

      {/* Convert modal */}
      {convertingLead && (
        <ConvertLeadModal lead={convertingLead} onClose={() => setConvertingLead(null)} />
      )}
    </div>
  )
}

function LeadDetailModal({ lead, onClose }: { lead: Contact; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg m-4">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Lead Details</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <DetailRow label="Name" value={lead.name} />
          <DetailRow label="Phone" value={lead.phone} />
          <DetailRow label="Email" value={lead.email} />
          <DetailRow label="Interest" value={interestLabels(lead.interest_flags).join(', ') || null} />

          {(lead.interest_flags & INTEREST_BUYING) !== 0 && (
            <div className="border-t border-neutral-800 pt-3">
              <p className="text-xs font-medium text-neutral-500 uppercase mb-2">Buyer Preferences</p>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Budget" value={lead.budget ? `$${lead.budget.toLocaleString()}` : null} />
                <DetailRow label="Min Beds" value={lead.bedrooms_min?.toString()} />
                <DetailRow label="Min Baths" value={lead.bathrooms_min?.toString()} />
                <DetailRow label="Zip Codes" value={lead.preferred_zipcodes?.join(', ')} />
                <DetailRow label="Search Radius" value={lead.search_radius_miles ? `${lead.search_radius_miles} mi` : null} />
              </div>
            </div>
          )}

          {(lead.interest_flags & INTEREST_SELLING) !== 0 && (
            <div className="border-t border-neutral-800 pt-3">
              <p className="text-xs font-medium text-neutral-500 uppercase mb-2">Seller Details</p>
              <DetailRow label="Property Zip" value={lead.property_zipcode} />
            </div>
          )}

          {(lead.interest_flags & INTEREST_DESIGN) !== 0 && (
            <div className="border-t border-neutral-800 pt-3">
              <p className="text-xs font-medium text-neutral-500 uppercase mb-2">Design Interest</p>
              <DetailRow label="Services" value={lead.design_services?.length ? lead.design_services.join(', ') : 'General inquiry'} />
            </div>
          )}

          {lead.notes && (
            <div className="border-t border-neutral-800 pt-3">
              <p className="text-xs font-medium text-neutral-500 uppercase mb-1">Notes</p>
              <p className="text-sm text-neutral-300 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          <div className="border-t border-neutral-800 pt-3">
            <p className="text-xs text-neutral-600">
              Submitted {new Date(lead.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-sm text-white">{value || '—'}</p>
    </div>
  )
}

function ConvertLeadModal({ lead, onClose }: { lead: Contact; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [convertTo, setConvertTo] = useState<'contact' | 'listing' | 'both'>('contact')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const actorId = user?.id ?? null

      if (convertTo === 'contact' || convertTo === 'both') {
        const { error } = await supabase
          .from('contacts')
          .update({ type: 'client' as const })
          .eq('id', lead.id)
        if (error) throw error
      }

      if (convertTo === 'listing' || convertTo === 'both') {
        const zip = lead.property_zipcode || (lead.preferred_zipcodes?.length ? lead.preferred_zipcodes[0] : null)
        const { data: inserted, error } = await supabase.from('listings').insert({
          address: 'TBD',
          status: 'off_market' as const,
          state: 'CA',
          zip,
          price: lead.budget,
          bedrooms: lead.bedrooms_min,
          bathrooms: lead.bathrooms_min,
          description: `Listing created from lead: ${lead.name}${lead.notes ? `\n\n${lead.notes}` : ''}`,
        }).select('id').single()
        if (error) throw error

        await logActivity({
          actorId,
          action: 'listing_created',
          entityType: 'listing',
          entityId: inserted.id,
          metadata: { source: 'lead_conversion', lead_name: lead.name },
        })

        if (convertTo === 'listing') {
          const { error: deleteError } = await supabase
            .from('contacts')
            .delete()
            .eq('id', lead.id)
          if (deleteError) throw deleteError
        }
      }

      await logActivity({
        actorId,
        action: 'lead_converted',
        entityType: 'lead',
        entityId: lead.id,
        metadata: { name: lead.name, convert_to: convertTo },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      onClose()
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Convert Lead</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-neutral-400">
            Convert <span className="text-white font-medium">{lead.name}</span> to:
          </p>

          <div className="space-y-2">
            <ConvertOption
              active={convertTo === 'contact'}
              onClick={() => setConvertTo('contact')}
              icon={<UserCheck className="w-5 h-5" />}
              title="Contact"
              description="Move to contacts as a client."
            />
            <ConvertOption
              active={convertTo === 'listing'}
              onClick={() => setConvertTo('listing')}
              icon={<Building2 className="w-5 h-5" />}
              title="Listing"
              description="Create listing from property info. Lead removed."
            />
            <ConvertOption
              active={convertTo === 'both'}
              onClick={() => setConvertTo('both')}
              icon={<ArrowRightLeft className="w-5 h-5" />}
              title="Contact + Listing"
              description="Create both a client and a listing."
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Converting...' : 'Convert'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConvertOption({
  active,
  onClick,
  icon,
  title,
  description,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
        active
          ? 'bg-primary-900/30 border-primary-500 text-white'
          : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600'
      }`}
    >
      <div className={`mt-0.5 ${active ? 'text-primary-400' : 'text-neutral-500'}`}>{icon}</div>
      <div>
        <p className={`text-sm font-medium ${active ? 'text-white' : 'text-neutral-300'}`}>{title}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>
    </button>
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
