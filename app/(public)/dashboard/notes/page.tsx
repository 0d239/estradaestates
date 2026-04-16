'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2, Save, Eye, StickyNote, Building2, Users, Archive, UserCheck, ArrowDownUp, List, LayoutGrid } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { DashboardPageHeader } from '../layout'
import type { Note, Profile, Listing, Contact } from '@/lib/database.types'

type NoteWithRelations = Note & {
  profiles: Pick<Profile, 'name' | 'image_url'>
  assigned_profile: Pick<Profile, 'name' | 'image_url'> | null
  listings: Pick<Listing, 'address' | 'city'> | null
  contacts: Pick<Contact, 'name' | 'type'> | null
}

type FilterTarget = '' | 'listing' | 'contact' | 'general' | 'assigned_to_me'
type ViewMode = 'list' | 'grouped'
type SortBy = 'newest' | 'oldest'

export default function DashboardNotesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [targetFilter, setTargetFilter] = useState<FilterTarget>('')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editPublic, setEditPublic] = useState(false)
  const [editAssignedTo, setEditAssignedTo] = useState<string>('')

  // New note form state
  const [newContent, setNewContent] = useState('')
  const [newPublic, setNewPublic] = useState(false)
  const [newTargetType, setNewTargetType] = useState<'general' | 'listing' | 'contact'>('general')
  const [newTargetId, setNewTargetId] = useState('')
  const [newAssignedTo, setNewAssignedTo] = useState('')

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*, profiles!notes_author_id_fkey(name, image_url), assigned_profile:profiles!notes_assigned_to_fkey(name, image_url), listings(address, city), contacts(name, type)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as NoteWithRelations[]
    },
  })

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('name')
      if (error) throw error
      return data as Profile[]
    },
  })

  const { data: listings } = useQuery({
    queryKey: ['listings', 'dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('id, address, city')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Pick<Listing, 'id' | 'address' | 'city'>[]
    },
  })

  const { data: contacts } = useQuery({
    queryKey: ['contacts', 'dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, type')
        .order('name')
      if (error) throw error
      return data as Pick<Contact, 'id' | 'name' | 'type'>[]
    },
  })

  const createNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('notes').insert({
        author_id: user!.id,
        assigned_to: newAssignedTo || null,
        listing_id: newTargetType === 'listing' ? newTargetId : null,
        contact_id: newTargetType === 'contact' ? newTargetId : null,
        content: newContent,
        is_public: newPublic,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      resetAddForm()
    },
  })

  const updateNote = useMutation({
    mutationFn: async ({ id, content, is_public, assigned_to }: { id: string; content: string; is_public: boolean; assigned_to: string | null }) => {
      const { error } = await supabase
        .from('notes')
        .update({ content, is_public, assigned_to, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setEditing(null)
    },
  })

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  function resetAddForm() {
    setAdding(false)
    setNewContent('')
    setNewPublic(false)
    setNewTargetType('general')
    setNewTargetId('')
    setNewAssignedTo('')
  }

  function startEdit(note: NoteWithRelations) {
    setEditing(note.id)
    setEditContent(note.content)
    setEditPublic(note.is_public)
    setEditAssignedTo(note.assigned_to ?? '')
  }

  function getNoteTarget(note: NoteWithRelations) {
    if (note.listing_id && note.listings) return 'listing' as const
    if (note.contact_id && note.contacts) return 'contact' as const
    return 'general' as const
  }

  function getGroupKey(note: NoteWithRelations) {
    if (note.listing_id && note.listings) return `listing:${note.listing_id}`
    if (note.contact_id && note.contacts) return `contact:${note.contact_id}`
    return 'general'
  }

  function getGroupLabel(note: NoteWithRelations) {
    if (note.listing_id && note.listings) return note.listings.address + (note.listings.city ? `, ${note.listings.city}` : '')
    if (note.contact_id && note.contacts) return `${note.contacts.name} (${note.contacts.type})`
    return 'General'
  }

  function getGroupIcon(note: NoteWithRelations) {
    if (note.listing_id) return Building2
    if (note.contact_id) return Users
    return Archive
  }

  const filtered = useMemo(() => {
    let result = notes?.filter((n) => {
      if (targetFilter === 'assigned_to_me') {
        if (n.assigned_to !== user?.id) return false
      } else if (targetFilter) {
        const target = getNoteTarget(n)
        if (targetFilter !== target) return false
      }
      if (search) {
        const term = search.toLowerCase()
        const matchContent = n.content.toLowerCase().includes(term)
        const matchAuthor = n.profiles.name.toLowerCase().includes(term)
        const matchListing = n.listings?.address.toLowerCase().includes(term)
        const matchContact = n.contacts?.name.toLowerCase().includes(term)
        if (!matchContent && !matchAuthor && !matchListing && !matchContact) return false
      }
      return true
    })

    if (result && sortBy === 'oldest') {
      result = [...result].reverse()
    }

    return result
  }, [notes, targetFilter, search, sortBy, user?.id])

  // Group notes by entity
  const grouped = useMemo(() => {
    if (!filtered) return []
    const map = new Map<string, { key: string; label: string; Icon: React.ElementType; notes: NoteWithRelations[] }>()
    for (const note of filtered) {
      const key = getGroupKey(note)
      if (!map.has(key)) {
        map.set(key, { key, label: getGroupLabel(note), Icon: getGroupIcon(note), notes: [] })
      }
      map.get(key)!.notes.push(note)
    }
    return Array.from(map.values())
  }, [filtered])

  const assignedToMeCount = notes?.filter((n) => n.assigned_to === user?.id).length ?? 0

  return (
    <div>
      <DashboardPageHeader
        icon={StickyNote}
        label="Notes"
        description="Internal notes on listings, contacts, and general archive"
        action={
          <Button variant="primary" size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filter pills + view/sort controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterPill active={targetFilter === ''} onClick={() => setTargetFilter('')}>All</FilterPill>
          <FilterPill active={targetFilter === 'listing'} onClick={() => setTargetFilter('listing')}>
            <Building2 className="w-3 h-3" /> Listings
          </FilterPill>
          <FilterPill active={targetFilter === 'contact'} onClick={() => setTargetFilter('contact')}>
            <Users className="w-3 h-3" /> Contacts
          </FilterPill>
          <FilterPill active={targetFilter === 'general'} onClick={() => setTargetFilter('general')}>
            <Archive className="w-3 h-3" /> General
          </FilterPill>
          <FilterPill active={targetFilter === 'assigned_to_me'} onClick={() => setTargetFilter('assigned_to_me')}>
            <UserCheck className="w-3 h-3" /> Assigned to me
            {assignedToMeCount > 0 && (
              <span className="ml-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {assignedToMeCount}
              </span>
            )}
          </FilterPill>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 hover:text-white transition-colors"
            title={`Sort by ${sortBy === 'newest' ? 'oldest' : 'newest'}`}
          >
            <ArrowDownUp className="w-3 h-3" />
            {sortBy === 'newest' ? 'Newest' : 'Oldest'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 hover:text-white transition-colors"
            title={viewMode === 'list' ? 'Group by entity' : 'Show as list'}
          >
            {viewMode === 'list' ? <LayoutGrid className="w-3 h-3" /> : <List className="w-3 h-3" />}
            {viewMode === 'list' ? 'Group' : 'List'}
          </button>
        </div>
      </div>

      {/* Add note form */}
      {adding && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4 space-y-3">
          <h3 className="text-sm font-semibold text-white">New Note</h3>

          {/* Target selector */}
          <div className="flex flex-wrap gap-2">
            <TargetPill active={newTargetType === 'general'} onClick={() => { setNewTargetType('general'); setNewTargetId('') }}>
              <Archive className="w-3 h-3" /> General
            </TargetPill>
            <TargetPill active={newTargetType === 'listing'} onClick={() => { setNewTargetType('listing'); setNewTargetId('') }}>
              <Building2 className="w-3 h-3" /> Listing
            </TargetPill>
            <TargetPill active={newTargetType === 'contact'} onClick={() => { setNewTargetType('contact'); setNewTargetId('') }}>
              <Users className="w-3 h-3" /> Contact
            </TargetPill>
          </div>

          {/* Target dropdown */}
          {newTargetType === 'listing' && (
            <select
              value={newTargetId}
              onChange={(e) => setNewTargetId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">Select a listing...</option>
              {listings?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.address}{l.city ? `, ${l.city}` : ''}
                </option>
              ))}
            </select>
          )}
          {newTargetType === 'contact' && (
            <select
              value={newTargetId}
              onChange={(e) => setNewTargetId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">Select a contact...</option>
              {contacts?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          )}

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write your note..."
            rows={4}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500 resize-none"
            autoFocus
          />

          {/* Assign to + public toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-500">Assign to:</label>
              <select
                value={newAssignedTo}
                onChange={(e) => setNewAssignedTo(e.target.value)}
                className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">Nobody</option>
                {profiles?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {newTargetType === 'listing' && (
              <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newPublic}
                  onChange={(e) => setNewPublic(e.target.checked)}
                  className="rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                />
                <Eye className="w-3.5 h-3.5" />
                Show on public listing page
              </label>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={resetAddForm}
              className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => createNote.mutate()}
              disabled={!newContent.trim() || (newTargetType !== 'general' && !newTargetId) || createNote.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      {isLoading ? (
        <div className="text-center text-neutral-400 py-12">Loading notes...</div>
      ) : !filtered?.length ? (
        <div className="text-center text-neutral-400 py-12">
          {notes?.length ? 'No notes match your filters.' : 'No notes yet. Add your first note to get started.'}
        </div>
      ) : viewMode === 'grouped' ? (
        /* Grouped view */
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.key}>
              <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-neutral-800">
                <group.Icon className="w-4 h-4 text-neutral-500" />
                <h3 className="text-sm font-semibold text-neutral-300">{group.label}</h3>
                <span className="text-xs text-neutral-600">{group.notes.length}</span>
              </div>
              <div className="space-y-2">
                {group.notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isOwn={note.author_id === user?.id}
                    isEditing={editing === note.id}
                    editContent={editContent}
                    editPublic={editPublic}
                    editAssignedTo={editAssignedTo}
                    profiles={profiles}
                    onStartEdit={() => startEdit(note)}
                    onCancelEdit={() => setEditing(null)}
                    onSaveEdit={() => updateNote.mutate({ id: note.id, content: editContent, is_public: editPublic, assigned_to: editAssignedTo || null })}
                    onDelete={() => { if (confirm('Delete this note?')) deleteNote.mutate(note.id) }}
                    onEditContentChange={setEditContent}
                    onEditPublicChange={setEditPublic}
                    onEditAssignedToChange={setEditAssignedTo}
                    isPending={updateNote.isPending}
                    getNoteTarget={getNoteTarget}
                    showTarget={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="space-y-2">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isOwn={note.author_id === user?.id}
              isEditing={editing === note.id}
              editContent={editContent}
              editPublic={editPublic}
              editAssignedTo={editAssignedTo}
              profiles={profiles}
              onStartEdit={() => startEdit(note)}
              onCancelEdit={() => setEditing(null)}
              onSaveEdit={() => updateNote.mutate({ id: note.id, content: editContent, is_public: editPublic, assigned_to: editAssignedTo || null })}
              onDelete={() => { if (confirm('Delete this note?')) deleteNote.mutate(note.id) }}
              onEditContentChange={setEditContent}
              onEditPublicChange={setEditPublic}
              onEditAssignedToChange={setEditAssignedTo}
              isPending={updateNote.isPending}
              getNoteTarget={getNoteTarget}
              showTarget
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NoteCard({
  note,
  isOwn,
  isEditing,
  editContent,
  editPublic,
  editAssignedTo,
  profiles,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditContentChange,
  onEditPublicChange,
  onEditAssignedToChange,
  isPending,
  getNoteTarget,
  showTarget,
}: {
  note: NoteWithRelations
  isOwn: boolean
  isEditing: boolean
  editContent: string
  editPublic: boolean
  editAssignedTo: string
  profiles: Profile[] | undefined
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDelete: () => void
  onEditContentChange: (v: string) => void
  onEditPublicChange: (v: boolean) => void
  onEditAssignedToChange: (v: string) => void
  isPending: boolean
  getNoteTarget: (n: NoteWithRelations) => 'listing' | 'contact' | 'general'
  showTarget: boolean
}) {
  const target = getNoteTarget(note)

  if (isEditing) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
        <textarea
          value={editContent}
          onChange={(e) => onEditContentChange(e.target.value)}
          rows={4}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 resize-none"
          autoFocus
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-500">Assign to:</label>
            <select
              value={editAssignedTo}
              onChange={(e) => onEditAssignedToChange(e.target.value)}
              className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">Nobody</option>
              {profiles?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {note.listing_id && (
            <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editPublic}
                onChange={(e) => onEditPublicChange(e.target.checked)}
                className="rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
              />
              <Eye className="w-3.5 h-3.5" />
              Public
            </label>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onCancelEdit} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={onSaveEdit}
            disabled={!editContent.trim() || isPending}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-neutral-900 border rounded-xl p-4',
        note.is_public ? 'border-primary-800/50' : 'border-neutral-800'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {note.profiles.image_url && (
            <img src={note.profiles.image_url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
          )}
          <span className="text-sm font-medium text-white">{note.profiles.name}</span>

          {/* Target badge */}
          {showTarget && target === 'listing' && note.listings && (
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
              <Building2 className="w-3 h-3" />
              <span className="truncate max-w-[180px]">{note.listings.address}</span>
            </span>
          )}
          {showTarget && target === 'contact' && note.contacts && (
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
              <Users className="w-3 h-3" />
              <span className="truncate max-w-[180px]">{note.contacts.name}</span>
            </span>
          )}
          {showTarget && target === 'general' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
              <Archive className="w-3 h-3" /> General
            </span>
          )}

          {note.is_public && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-primary-400 bg-primary-900/30 px-1.5 py-0.5 rounded-full">
              <Eye className="w-2.5 h-2.5" /> Public
            </span>
          )}

          {note.assigned_profile && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-900/20 px-2 py-0.5 rounded-full">
              <UserCheck className="w-3 h-3" />
              {note.assigned_profile.name.split(' ')[0]}
            </span>
          )}
        </div>

        {isOwn && (
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={onStartEdit} className="p-1.5 text-neutral-600 hover:text-white transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-neutral-300 whitespace-pre-wrap">{note.content}</p>

      {/* Timestamp */}
      <p className="text-[11px] text-neutral-600 mt-2">
        {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
        {note.updated_at !== note.created_at && ' (edited)'}
      </p>
    </div>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
        active
          ? 'bg-primary-900/50 text-primary-300'
          : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
      )}
    >
      {children}
    </button>
  )
}

function TargetPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
        active
          ? 'border-primary-500 bg-primary-900/30 text-primary-300'
          : 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600'
      )}
    >
      {children}
    </button>
  )
}
