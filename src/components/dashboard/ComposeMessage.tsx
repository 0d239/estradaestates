'use client'

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import type { Contact, ContactType } from '@/lib/database.types';

interface ComposeMessageProps {
  onClose: () => void;
}

export function ComposeMessage({ onClose }: ComposeMessageProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [message, setMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<ContactType | ''>('');
  const [search, setSearch] = useState('');

  const { data: contacts } = useQuery({
    queryKey: ['contacts', 'compose'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Contact[];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Create communication record
      const { data: comm, error: commError } = await supabase
        .from('communications')
        .insert({
          sent_by: user.id,
          channel,
          message,
          recipient_count: selectedIds.size,
        })
        .select()
        .single();

      if (commError) throw commError;

      // Create recipient records
      const recipients = Array.from(selectedIds).map((contact_id) => ({
        communication_id: comm.id,
        contact_id,
        status: 'sent' as const,
      }));

      const { error: recipError } = await supabase
        .from('communication_recipients')
        .insert(recipients);

      if (recipError) throw recipError;

      // TODO: Actually send via Twilio/email provider
      // For now, just log it in the database
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      onClose();
    },
  });

  // Filter contacts that have the right channel info
  const eligible = contacts?.filter((c) => {
    if (channel === 'sms' && !c.phone) return false;
    if (channel === 'email' && !c.email) return false;
    if (typeFilter && c.type !== typeFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
      );
    }
    return true;
  });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    if (!eligible) return;
    if (selectedIds.size === eligible.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligible.map((c) => c.id)));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Compose Message</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {sendMutation.error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {(sendMutation.error as Error).message}
            </div>
          )}

          {/* Channel selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Channel</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setChannel('sms');
                  setSelectedIds(new Set());
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channel === 'sms'
                    ? 'bg-primary-900/50 text-primary-300'
                    : 'text-neutral-400 hover:text-white bg-neutral-800'
                }`}
              >
                SMS
              </button>
              <button
                type="button"
                onClick={() => {
                  setChannel('email');
                  setSelectedIds(new Set());
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channel === 'email'
                    ? 'bg-primary-900/50 text-primary-300'
                    : 'text-neutral-400 hover:text-white bg-neutral-800'
                }`}
              >
                Email
              </button>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Type your message..."
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Recipient selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-300">
                Recipients ({selectedIds.size} selected)
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as ContactType | '')}
                  className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="client">Clients</option>
                  <option value="lead">Leads</option>
                  <option value="partner">Partners</option>
                </select>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-primary-400 hover:text-primary-300"
                >
                  {eligible && selectedIds.size === eligible.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 mb-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <div className="max-h-48 overflow-y-auto border border-neutral-800 rounded-lg divide-y divide-neutral-800">
              {!eligible?.length ? (
                <p className="p-3 text-sm text-neutral-500">
                  No contacts with {channel === 'sms' ? 'phone numbers' : 'email addresses'} found.
                </p>
              ) : (
                eligible.map((contact) => (
                  <label
                    key={contact.id}
                    onClick={() => toggleSelect(contact.id)}
                    className="flex items-center gap-3 p-3 hover:bg-neutral-800/50 cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        selectedIds.has(contact.id)
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-neutral-600'
                      }`}
                    >
                      {selectedIds.has(contact.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{contact.name}</p>
                      <p className="text-xs text-neutral-500 truncate">
                        {channel === 'sms' ? contact.phone : contact.email}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-600 capitalize">{contact.type}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Send */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!message.trim() || selectedIds.size === 0 || sendMutation.isPending}
              onClick={() => sendMutation.mutate()}
            >
              {sendMutation.isPending
                ? 'Sending...'
                : `Send to ${selectedIds.size} recipient${selectedIds.size !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
