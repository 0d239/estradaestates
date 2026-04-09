'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Note, Profile } from '@/lib/database.types';

type NoteWithAuthor = Note & { profiles: Pick<Profile, 'name' | 'title' | 'image_url'> };

export default function AgentNotes({ listingId }: { listingId: string }) {
  const [index, setIndex] = useState(0);

  const { data: notes } = useQuery({
    queryKey: ['notes', 'public', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*, profiles!notes_author_id_fkey(name, title, image_url)')
        .eq('listing_id', listingId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data as unknown as NoteWithAuthor[];
    },
  });

  if (!notes || notes.length === 0) return null;

  const note = notes[index];
  const author = note.profiles;
  const firstName = author.name.split(' ')[0];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-3">
        <Quote className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
        <h2 className="text-lg font-semibold text-white">
          A word from {firstName}
        </h2>
      </div>

      <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap mb-4">
        {note.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {author.image_url && (
            <img
              src={author.image_url}
              alt={author.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium text-white">{author.name}</p>
            {author.title && (
              <p className="text-xs text-neutral-500">{author.title}</p>
            )}
          </div>
        </div>

        {notes.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + notes.length) % notes.length)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Previous note"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-neutral-600 tabular-nums">
              {index + 1}/{notes.length}
            </span>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % notes.length)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Next note"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
