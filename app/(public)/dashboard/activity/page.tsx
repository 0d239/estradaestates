'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Send, ShieldAlert } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/activity-log'
import { useAuth } from '@/contexts/AuthContext'
import type { ActivityLog, ActivityAction, ActivityEntityType, Profile } from '@/lib/database.types'

const PAGE_SIZE = 20

const ACTION_LABELS: Record<ActivityAction, string> = {
  listing_created: 'Listing created',
  listing_updated: 'Listing updated',
  listing_status_changed: 'Listing status changed',
  listing_deleted: 'Listing deleted',
  listing_assigned: 'Agent assigned to listing',
  listing_unassigned: 'Agent removed from listing',
  contact_created: 'Contact created',
  contact_updated: 'Contact updated',
  contact_deleted: 'Contact deleted',
  lead_created: 'Lead received',
  lead_converted: 'Lead converted',
  lead_deleted: 'Lead deleted',
  note_added: 'Note added',
}

const ACTION_COLORS: Partial<Record<ActivityAction, string>> = {
  listing_created: 'text-emerald-400',
  listing_status_changed: 'text-amber-400',
  listing_deleted: 'text-red-400',
  listing_assigned: 'text-blue-400',
  listing_unassigned: 'text-neutral-400',
  contact_created: 'text-emerald-400',
  contact_deleted: 'text-red-400',
  lead_created: 'text-primary-400',
  lead_converted: 'text-emerald-400',
  lead_deleted: 'text-red-400',
  note_added: 'text-primary-300',
}

const ENTITY_FILTERS: { value: ActivityEntityType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'listing', label: 'Listings' },
  { value: 'contact', label: 'Contacts' },
  { value: 'lead', label: 'Leads' },
]

export default function ActivityPage() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuth()
  const [entityFilter, setEntityFilter] = useState<ActivityEntityType | ''>('')
  const [page, setPage] = useState(0)
  const [noteText, setNoteText] = useState('')

  // Admin only
  if (profile && profile.role !== 'admin') {
    return (
      <div className="text-center py-16">
        <ShieldAlert className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
        <p className="text-neutral-400">Activity logs are restricted to admin accounts.</p>
      </div>
    )
  }

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('name')
      if (error) throw error
      return data as Profile[]
    },
  })

  const { data: logs, isLoading } = useQuery({
    queryKey: ['activity_logs', entityFilter, page],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (entityFilter) {
        query = query.eq('entity_type', entityFilter)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { logs: data as ActivityLog[], count: count ?? 0 }
    },
  })

  const addNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      await logActivity({
        actorId: user?.id ?? null,
        action: 'note_added',
        entityType: 'listing', // general note
        note,
      })
    },
    onSuccess: () => {
      setNoteText('')
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] })
    },
  })

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? [])
  const total = logs?.count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function formatDetail(log: ActivityLog): string {
    const m = log.metadata as Record<string, unknown>
    const parts: string[] = []

    if (m.address) parts.push(String(m.address))
    if (m.name) parts.push(String(m.name))

    if (log.action === 'listing_status_changed' && m.old_status && m.new_status) {
      parts.push(`${m.old_status} → ${m.new_status}`)
    }
    if (log.action === 'listing_assigned' && m.assigned_profile_name) {
      parts.push(String(m.assigned_profile_name))
    }
    if (log.action === 'listing_unassigned' && m.unassigned_profile_name) {
      parts.push(String(m.unassigned_profile_name))
    }
    if (log.action === 'lead_converted' && m.convert_to) {
      parts.push(`→ ${m.convert_to}`)
    }
    if (m.source) parts.push(String(m.source))

    return parts.join(' · ')
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <p className="text-sm text-neutral-500 mt-1">Audit trail and team notes.</p>
      </div>

      {/* Add note */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="Add a note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && noteText.trim()) {
              addNoteMutation.mutate(noteText.trim())
            }
          }}
          className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={() => noteText.trim() && addNoteMutation.mutate(noteText.trim())}
          disabled={!noteText.trim() || addNoteMutation.isPending}
          className="px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-40 text-neutral-900 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        {ENTITY_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setEntityFilter(value); setPage(0) }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              entityFilter === value
                ? 'bg-primary-900/50 text-primary-300'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Log feed */}
      {isLoading ? (
        <div className="text-center text-neutral-400 py-12">Loading activity...</div>
      ) : !logs?.logs.length ? (
        <div className="text-center text-neutral-400 py-12">No activity yet.</div>
      ) : (
        <>
          <div className="space-y-1">
            {logs.logs.map((log) => {
              const actor = log.actor_id ? profileMap.get(log.actor_id) : null
              const detail = formatDetail(log)
              const isNote = log.action === 'note_added'

              return (
                <div
                  key={log.id}
                  className={`flex gap-3 px-3 py-2.5 rounded-lg ${
                    isNote ? 'bg-primary-900/10 border border-primary-900/20' : 'hover:bg-neutral-800/30'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="pt-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${
                      isNote ? 'bg-primary-400' : 'bg-neutral-600'
                    }`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${ACTION_COLORS[log.action] ?? 'text-neutral-300'}`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                      {detail && (
                        <span className="text-xs text-neutral-500 truncate">{detail}</span>
                      )}
                    </div>

                    {log.note && (
                      <p className="text-sm text-neutral-300 mt-1 whitespace-pre-wrap">{log.note}</p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-neutral-600">
                        {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {actor && (
                        <span className="text-xs text-neutral-500">by {actor.name.split(' ')[0]}</span>
                      )}
                      {Boolean((log.metadata as Record<string, unknown>).backfilled) && (
                        <span className="text-xs text-neutral-700">backfilled</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-neutral-500">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-neutral-400 px-2">{page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 transition-colors"
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
