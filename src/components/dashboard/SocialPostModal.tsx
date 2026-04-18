'use client'

import { useMemo, useState, useDeferredValue } from 'react'
import { X, Copy, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { renderCaption } from '@/lib/social/captions'
import {
  POST_TYPES,
  LAYOUT_IDS,
  POST_TYPE_LABELS,
  LAYOUT_LABELS,
  captionVariantIds,
  type PostType,
  type LayoutId,
} from '@/lib/social/types'
import type { Listing } from '@/lib/database.types'

interface SocialPostModalProps {
  listing: Listing
  onClose: () => void
}

const VARIANT_LABELS: Record<string, string> = {
  short: 'Short & punchy',
  detailed: 'Detailed & warm',
  hook: 'Question hook',
  invite: 'Direct invite',
  warm: 'Warm invite',
  direct: 'Direct',
  urgent: 'Urgent',
  celebrate: 'Celebratory',
  thanks: 'Thankful',
}

export function SocialPostModal({ listing, onClose }: SocialPostModalProps) {
  const [type, setType] = useState<PostType>('new-listing')
  const [layout, setLayout] = useState<LayoutId>('classic')
  const [photoIdx, setPhotoIdx] = useState(0)
  const [variantId, setVariantId] = useState<string>(captionVariantIds('new-listing')[0])
  const [captionOverride, setCaptionOverride] = useState<string | null>(null)
  const [openHouseAt, setOpenHouseAt] = useState<string>('')
  const [oldPrice, setOldPrice] = useState<string>('')
  const [hidePrice, setHidePrice] = useState(false)
  const [copied, setCopied] = useState(false)

  const extras = useMemo(
    () => ({
      openHouseAt: openHouseAt ? new Date(openHouseAt).toISOString() : null,
      oldPrice: oldPrice ? Number(oldPrice) : null,
      hidePrice,
    }),
    [openHouseAt, oldPrice, hidePrice],
  )

  const generatedCaption = useMemo(
    () => renderCaption(type, variantId, { listing, extras }),
    [type, variantId, listing, extras],
  )
  const captionText = captionOverride ?? generatedCaption
  const captionEdited = captionOverride !== null

  function handleTypeChange(next: PostType) {
    setType(next)
    const ids = captionVariantIds(next)
    if (!ids.includes(variantId)) setVariantId(ids[0])
    setCaptionOverride(null)
  }

  function handleVariantChange(next: string) {
    setVariantId(next)
    setCaptionOverride(null)
  }

  // Validation
  const needsPrice = type !== 'just-sold' || !hidePrice
  const missingPrice = needsPrice && listing.price == null
  const missingOpenHouseAt = type === 'open-house' && !openHouseAt
  const missingOldPrice = type === 'price-drop' && !oldPrice
  const canGenerate = !missingPrice && !missingOpenHouseAt && !missingOldPrice

  // Build preview URL (debounced via useDeferredValue for rapidly-changing inputs)
  const previewUrlParams = useMemo(() => {
    const params = new URLSearchParams({
      type,
      layout,
      photo: String(photoIdx),
    })
    if (openHouseAt) params.set('openHouseAt', new Date(openHouseAt).toISOString())
    if (oldPrice) params.set('oldPrice', oldPrice)
    if (hidePrice) params.set('hidePrice', '1')
    return params.toString()
  }, [type, layout, photoIdx, openHouseAt, oldPrice, hidePrice])

  const deferredParams = useDeferredValue(previewUrlParams)
  const previewUrl = canGenerate ? `/api/listings/${listing.id}/og?${deferredParams}` : null
  const downloadUrl = canGenerate ? `/api/listings/${listing.id}/og?${previewUrlParams}&download=1` : null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(captionText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const variantIds = captionVariantIds(type)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-5xl max-h-[92vh] overflow-hidden m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">Generate Social Post</h2>
            <p className="text-xs text-neutral-500 mt-0.5 truncate">{listing.address}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Preview column */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm aspect-[4/5] bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden flex items-center justify-center">
              {previewUrl ? (
<img
                  key={previewUrl}
                  src={previewUrl}
                  alt="Post preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-neutral-500 text-sm text-center px-6">
                  Fill in required fields to see a preview.
                </p>
              )}
            </div>
            {/* Photo picker */}
            {listing.photos.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-sm">
                {listing.photos.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setPhotoIdx(i)}
                    className={`w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                      photoIdx === i ? 'border-primary-400' : 'border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls column */}
          <div className="flex flex-col gap-5">
            {/* Post type */}
            <Section label="Post type">
              <div className="grid grid-cols-2 gap-2">
                {POST_TYPES.map((t) => (
                  <ChoicePill key={t} active={type === t} onClick={() => handleTypeChange(t)}>
                    {POST_TYPE_LABELS[t]}
                  </ChoicePill>
                ))}
              </div>
            </Section>

            {/* Layout */}
            <Section label="Layout">
              <div className="grid grid-cols-3 gap-2">
                {LAYOUT_IDS.map((l) => (
                  <ChoicePill key={l} active={layout === l} onClick={() => setLayout(l)}>
                    {LAYOUT_LABELS[l].split(' ')[0]}
                  </ChoicePill>
                ))}
              </div>
            </Section>

            {/* Conditional extras */}
            {type === 'open-house' && (
              <Section label="Open house date & time">
                <input
                  type="datetime-local"
                  value={openHouseAt}
                  onChange={(e) => setOpenHouseAt(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </Section>
            )}

            {type === 'price-drop' && (
              <Section label="Previous price ($)">
                <input
                  type="number"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="e.g. 1295000"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </Section>
            )}

            {type === 'just-sold' && (
              <Section label="Price display">
                <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hidePrice}
                    onChange={(e) => setHidePrice(e.target.checked)}
                    className="accent-primary-500"
                  />
                  Hide price (show &quot;SOLD&quot; stamp instead)
                </label>
              </Section>
            )}

            {/* Caption variant */}
            <Section label="Caption style">
              <div className="flex flex-wrap gap-2">
                {variantIds.map((v) => (
                  <ChoicePill key={v} active={variantId === v} onClick={() => handleVariantChange(v)}>
                    {VARIANT_LABELS[v] ?? v}
                  </ChoicePill>
                ))}
              </div>
            </Section>

            {/* Caption text */}
            <Section label="Caption">
              <textarea
                value={captionText}
                onChange={(e) => setCaptionOverride(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono"
              />
              {captionEdited && (
                <button
                  type="button"
                  onClick={() => setCaptionOverride(null)}
                  className="mt-1 text-[11px] text-neutral-500 hover:text-primary-400 transition-colors"
                >
                  Reset to template
                </button>
              )}
            </Section>

            {/* Validation messages */}
            {missingPrice && (
              <p className="text-xs text-amber-400">
                This listing has no price. Add one, or switch to Just Sold with &quot;Hide price&quot; enabled.
              </p>
            )}
            {missingOpenHouseAt && (
              <p className="text-xs text-amber-400">Enter an open house date &amp; time.</p>
            )}
            {missingOldPrice && (
              <p className="text-xs text-amber-400">Enter the previous price.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-800 shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handleCopy} disabled={!captionText}>
            {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? 'Copied' : 'Copy caption'}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (downloadUrl) window.open(downloadUrl, '_blank')
            }}
            disabled={!canGenerate}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Download image
          </Button>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  )
}

function ChoicePill({
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
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-900/50 text-primary-300 border border-primary-700/50'
          : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-neutral-200 hover:bg-neutral-750'
      }`}
    >
      {children}
    </button>
  )
}
