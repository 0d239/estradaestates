'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface DeleteConfirmModalProps {
  label: string
  confirmText: string
  onConfirm: () => void
  onClose: () => void
  isPending?: boolean
}

export function DeleteConfirmModal({
  label,
  confirmText,
  onConfirm,
  onClose,
  isPending,
}: DeleteConfirmModalProps) {
  const [typed, setTyped] = useState('')
  const matches = typed.trim().toLowerCase() === confirmText.trim().toLowerCase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Delete {label}</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-neutral-400">
            This action cannot be undone. To confirm, type{' '}
            <span className="font-medium text-white">{confirmText}</span>{' '}
            below.
          </p>

          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirmText}
            autoFocus
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
          />

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <button
              disabled={!matches || isPending}
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
