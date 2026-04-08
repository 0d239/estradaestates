'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ContactForm } from '@/components/dashboard/ContactForm'
import type { Contact, ContactType } from '@/lib/database.types'

const PAGE_SIZE = 15

export default function ContactsPage() {
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState<Exclude<ContactType, 'lead'> | ''>('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [page, setPage] = useState(0)

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select('*')
        .neq('type', 'lead')
        .order('created_at', { ascending: false })

      if (typeFilter) {
        query = query.eq('type', typeFilter)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Contact[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  const filtered = contacts?.filter((c) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.includes(term) ||
      c.address?.toLowerCase().includes(term) ||
      c.company?.toLowerCase().includes(term)
    )
  })

  const total = filtered?.length ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages - 1, 0))
  const paginated = filtered?.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  function handleEdit(contact: Contact) {
    setEditingContact(contact)
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingContact(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Contacts</h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        <FilterPill active={typeFilter === ''} onClick={() => { setTypeFilter(''); setPage(0) }}>All</FilterPill>
        <FilterPill active={typeFilter === 'client'} onClick={() => { setTypeFilter('client'); setPage(0) }}>Clients</FilterPill>
        <FilterPill active={typeFilter === 'partner'} onClick={() => { setTypeFilter('partner'); setPage(0) }}>Partners</FilterPill>
      </div>

      {/* Contact form modal */}
      {showForm && (
        <ContactForm
          contact={editingContact}
          onClose={handleCloseForm}
        />
      )}

      {/* Contacts table */}
      {isLoading ? (
        <div className="text-center text-neutral-400 py-12">Loading contacts...</div>
      ) : !paginated?.length ? (
        <div className="text-center text-neutral-400 py-12">
          No contacts found. Add your first contact to get started.
        </div>
      ) : (
        <>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Name</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Type</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Phone</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Email</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Address</th>
                  <th className="text-right px-3 sm:px-4 py-3 text-xs font-medium text-neutral-500 uppercase w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {paginated.map((contact) => (
                  <tr key={contact.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-3 sm:px-4 py-3">
                      <p className="text-sm font-medium text-white">{contact.name}</p>
                      {contact.company && (
                        <p className="text-xs text-neutral-500">{contact.company}</p>
                      )}
                      {/* Show contact info inline on mobile */}
                      <div className="md:hidden text-xs text-neutral-500 mt-0.5 space-y-0.5">
                        {contact.phone && <p>{contact.phone}</p>}
                        {contact.email && <p className="truncate max-w-[200px]">{contact.email}</p>}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize bg-neutral-800 text-neutral-300">
                        {contact.type}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-neutral-400 hidden md:table-cell">
                      {contact.phone || '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-neutral-400 hidden md:table-cell">
                      {contact.email || '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-neutral-400 hidden lg:table-cell truncate max-w-[200px]">
                      {contact.address || '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this contact?')) {
                              deleteMutation.mutate(contact.id)
                            }
                          }}
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
