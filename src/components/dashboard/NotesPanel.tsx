'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, StickyNote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { Note, Profile } from '@/lib/database.types';

type NoteWithAuthor = Note & { profiles: Pick<Profile, 'name' | 'image_url'> };

interface NotesPanelProps {
  listingId?: string;
  contactId?: string;
}

/**
 * Inline notes panel for listings or contacts.
 * If neither listingId nor contactId is provided, shows general/archive notes.
 */
export default function NotesPanel({ listingId, contactId }: NotesPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editPublic, setEditPublic] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newPublic, setNewPublic] = useState(false);

  const queryKey = ['notes', listingId ?? null, contactId ?? null];

  const { data: notes, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('notes')
        .select('*, profiles!notes_author_id_fkey(name, image_url)')
        .order('created_at', { ascending: false });

      if (listingId) query = query.eq('listing_id', listingId);
      else query = query.is('listing_id', null);

      if (contactId) query = query.eq('contact_id', contactId);
      else query = query.is('contact_id', null);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as NoteWithAuthor[];
    },
  });

  const createNote = useMutation({
    mutationFn: async ({ content, is_public }: { content: string; is_public: boolean }) => {
      const { error } = await supabase.from('notes').insert({
        author_id: user!.id,
        listing_id: listingId ?? null,
        contact_id: contactId ?? null,
        content,
        is_public,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setAdding(false);
      setNewContent('');
      setNewPublic(false);
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, content, is_public }: { id: string; content: string; is_public: boolean }) => {
      const { error } = await supabase
        .from('notes')
        .update({ content, is_public, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setEditing(null);
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const startEdit = (note: NoteWithAuthor) => {
    setEditing(note.id);
    setEditContent(note.content);
    setEditPublic(note.is_public);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5 text-primary-400" />
          Notes
        </h3>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add note
          </button>
        )}
      </div>

      {/* Add new note form */}
      {adding && (
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 space-y-2">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write a note..."
            rows={3}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500 resize-none"
            autoFocus
          />
          <div className="flex items-center justify-between">
            {listingId && (
              <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newPublic}
                  onChange={(e) => setNewPublic(e.target.checked)}
                  className="rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                />
                <Eye className="w-3.5 h-3.5" />
                Show on listing page
              </label>
            )}
            {!listingId && <div />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setAdding(false); setNewContent(''); setNewPublic(false); }}
                className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => createNote.mutate({ content: newContent, is_public: newPublic })}
                disabled={!newContent.trim() || createNote.isPending}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 transition-colors"
              >
                <Save className="w-3 h-3" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      {isLoading ? (
        <p className="text-xs text-neutral-600">Loading notes...</p>
      ) : notes && notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note) => {
            const isOwn = note.author_id === user?.id;
            const isEditing = editing === note.id;

            return (
              <div
                key={note.id}
                className={cn(
                  'bg-neutral-800/50 border rounded-lg p-3',
                  note.is_public ? 'border-primary-800/50' : 'border-neutral-700/50'
                )}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 resize-none"
                      autoFocus
                    />
                    <div className="flex items-center justify-between">
                      {listingId && (
                        <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editPublic}
                            onChange={(e) => setEditPublic(e.target.checked)}
                            className="rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                          />
                          <Eye className="w-3.5 h-3.5" />
                          Public
                        </label>
                      )}
                      {!listingId && <div />}
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setEditing(null)} className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white transition-colors">
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => updateNote.mutate({ id: note.id, content: editContent, is_public: editPublic })}
                          disabled={!editContent.trim() || updateNote.isPending}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 transition-colors"
                        >
                          <Save className="w-3 h-3" /> Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {note.profiles.image_url && (
                          <img src={note.profiles.image_url} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                        )}
                        <span className="text-xs font-medium text-neutral-300 truncate">{note.profiles.name}</span>
                        {note.is_public && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-primary-400 bg-primary-900/30 px-1.5 py-0.5 rounded-full shrink-0">
                            <Eye className="w-2.5 h-2.5" /> Public
                          </span>
                        )}
                      </div>
                      {isOwn && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" onClick={() => startEdit(note)} className="p-1 text-neutral-600 hover:text-white transition-colors">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => { if (confirm('Delete this note?')) deleteNote.mutate(note.id); }}
                            className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-neutral-300 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-[10px] text-neutral-600 mt-1.5">
                      {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {note.updated_at !== note.created_at && ' (edited)'}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : !adding ? (
        <p className="text-xs text-neutral-600">No notes yet.</p>
      ) : null}
    </div>
  );
}
