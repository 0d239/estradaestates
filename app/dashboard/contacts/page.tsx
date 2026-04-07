'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Users, Building, Handshake, Trash2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ContactForm } from '@/components/dashboard/ContactForm'
import type { Contact, ContactType } from '@/lib/database.types'

const typeConfig: Record<ContactType, { label: string; icon: typeof Users }> = {
  client: { label: 'Clients', icon: Users },
  lead: { label: 'Leads', icon: Building },
  partner: { label: 'Partners', icon: Handshake },
}

export default function ContactsPage() {
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState<ContactType | ''>('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select('*')
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Contacts</h1>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <FilterButton active={typeFilter === ''} onClick={() => setTypeFilter('')}>
            All
          </FilterButton>
          {(Object.entries(typeConfig) as [ContactType, typeof typeConfig[ContactType]][]).map(
            ([type, { label, icon: Icon }]) => (
              <FilterButton
                key={type}
                active={typeFilter === type}
                onClick={() => setTypeFilter(type)}
              >
                <Icon className="w-4 h-4 mr-1" /> {label}
              </FilterButton>
            )
          )}
        </div>
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
      ) : !filtered?.length ? (
        <div className="text-center text-neutral-400 py-12">
          No contacts found. Add your first contact to get started.
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Address</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filtered.map((contact) => (
                <tr key={contact.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white">{contact.name}</p>
                    {contact.company && (
                      <p className="text-xs text-neutral-500">{contact.company}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize bg-neutral-800 text-neutral-300">
                      {contact.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-400 hidden md:table-cell">
                    {contact.phone || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-400 hidden md:table-cell">
                    {contact.email || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-400 hidden lg:table-cell truncate max-w-[200px]">
                    {contact.address || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this contact?')) {
                            deleteMutation.mutate(contact.id)
                          }
                        }}
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-900/50 text-primary-300'
          : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
      }`}
    >
      {children}
    </button>
  )
}
