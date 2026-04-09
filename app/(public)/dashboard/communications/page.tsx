'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Plus, Clock, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ComposeMessage } from '@/components/dashboard/ComposeMessage'
import type { Communication } from '@/lib/database.types'

export default function CommunicationsPage() {
  const [showCompose, setShowCompose] = useState(false)

  const { data: communications, isLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Communication[]
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="hidden md:block text-2xl font-bold text-white">Messages</h1>
        <Button variant="primary" onClick={() => setShowCompose(true)} className="ml-auto">
          <Plus className="w-4 h-4 mr-2" /> Compose
        </Button>
      </div>

      {showCompose && <ComposeMessage onClose={() => setShowCompose(false)} />}

      {/* Message history */}
      {isLoading ? (
        <div className="text-center text-neutral-400 py-12">Loading messages...</div>
      ) : !communications?.length ? (
        <div className="text-center text-neutral-400 py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No messages sent yet.</p>
          <p className="text-sm mt-1">Compose a message to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {communications.map((comm) => (
            <div
              key={comm.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-neutral-800 text-neutral-300">
                    {comm.channel}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-neutral-500">
                    <Users className="w-3 h-3" /> {comm.recipient_count} recipients
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <Clock className="w-3 h-3" />
                  {new Date(comm.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-neutral-300 whitespace-pre-wrap">{comm.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
