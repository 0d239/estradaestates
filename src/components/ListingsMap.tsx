'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { Bed, Bath, Maximize, MapPin, DollarSign, Calendar, X, Minus, Plus, LocateFixed } from 'lucide-react'
import type { Listing, ListingStatus } from '@/lib/database.types'
import { COUNTY_BOUNDARIES, COUNTY_KEYS, type CountyKey } from '@/data/county-boundaries'

// California state outline [lng, lat]
const CA_BORDER: [number, number][] = [
  [-123.233256,42.006186],[-122.378853,42.011663],[-121.037003,41.995232],
  [-120.001861,41.995232],[-119.996384,40.264519],[-120.001861,38.999346],
  [-118.71478,38.101128],[-117.498899,37.21934],[-116.540435,36.501861],
  [-115.85034,35.970598],[-114.634459,35.00118],[-114.634459,34.87521],
  [-114.470151,34.710902],[-114.333228,34.448009],[-114.136058,34.305608],
  [-114.256551,34.174162],[-114.415382,34.108438],[-114.535874,33.933176],
  [-114.497536,33.697668],[-114.524921,33.54979],[-114.727567,33.40739],
  [-114.661844,33.034958],[-114.524921,33.029481],[-114.470151,32.843265],
  [-114.524921,32.755634],[-114.72209,32.717295],[-116.04751,32.624187],
  [-117.126467,32.536556],[-117.24696,32.668003],[-117.252437,32.876127],
  [-117.329114,33.122589],[-117.471515,33.297851],[-117.7837,33.538836],
  [-118.183517,33.763391],[-118.260194,33.703145],[-118.413548,33.741483],
  [-118.391641,33.840068],[-118.566903,34.042715],[-118.802411,33.998899],
  [-119.218659,34.146777],[-119.278905,34.26727],[-119.558229,34.415147],
  [-119.875891,34.40967],[-120.138784,34.475393],[-120.472878,34.448009],
  [-120.64814,34.579455],[-120.609801,34.858779],[-120.670048,34.902595],
  [-120.631709,35.099764],[-120.894602,35.247642],[-120.905556,35.450289],
  [-121.004141,35.461243],[-121.168449,35.636505],[-121.283465,35.674843],
  [-121.332757,35.784382],[-121.716143,36.195153],[-121.896882,36.315645],
  [-121.935221,36.638785],[-121.858544,36.6114],[-121.787344,36.803093],
  [-121.929744,36.978355],[-122.105006,36.956447],[-122.335038,37.115279],
  [-122.417192,37.241248],[-122.400761,37.361741],[-122.515777,37.520572],
  [-122.515777,37.783465],[-122.329561,37.783465],[-122.406238,38.15042],
  [-122.488392,38.112082],[-122.504823,37.931343],[-122.701993,37.893004],
  [-122.937501,38.029928],[-122.97584,38.265436],[-123.129194,38.451652],
  [-123.331841,38.566668],[-123.44138,38.698114],[-123.737134,38.95553],
  [-123.687842,39.032208],[-123.824765,39.366301],[-123.764519,39.552517],
  [-123.85215,39.831841],[-124.109566,40.105688],[-124.361506,40.259042],
  [-124.410798,40.439781],[-124.158859,40.877937],[-124.109566,41.025814],
  [-124.158859,41.14083],[-124.065751,41.442061],[-124.147905,41.715908],
  [-124.257444,41.781632],[-124.213628,42.000709],[-123.233256,42.006186],
]

const CA_BOUNDS = {
  minLng: -124.5,
  maxLng: -114.0,
  minLat: 32.5,
  maxLat: 42.1,
}

const STATUS_COLORS: Record<ListingStatus, string> = {
  active: '#34d399',
  pending: '#fbbf24',
  sold: '#C4A96E',
  off_market: '#737373',
}

const STATUS_LABELS: Record<ListingStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  sold: 'Sold',
  off_market: 'Off Market',
}

// Mercator projection
const toRad = (d: number) => (d * Math.PI) / 180
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + toRad(lat) / 2))
const Y_MIN = mercY(CA_BOUNDS.minLat)
const Y_MAX = mercY(CA_BOUNDS.maxLat)

function project(lng: number, lat: number) {
  const x = (lng - CA_BOUNDS.minLng) / (CA_BOUNDS.maxLng - CA_BOUNDS.minLng)
  const y = 1 - (mercY(lat) - Y_MIN) / (Y_MAX - Y_MIN)
  return { x, y }
}

// SVG internal canvas size
const W = 500
const H = 620
const PAD = 30

function toSVG(lng: number, lat: number) {
  const { x, y } = project(lng, lat)
  return {
    x: PAD + x * (W - PAD * 2),
    y: PAD + y * (H - PAD * 2),
  }
}

// Zoom limits
const MIN_ZOOM = 1
const MAX_ZOOM = 8

export function ListingsMap({ listings }: { listings: Listing[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activeCounties, setActiveCounties] = useState<Set<CountyKey>>(new Set())
  const [hoveredCounty, setHoveredCounty] = useState<CountyKey | null>(null)
  const containerRef = useRef<SVGSVGElement>(null)

  // Pan/zoom state as viewBox
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: W, h: H })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null)

  const zoom = W / viewBox.w

  const mappable = useMemo(
    () => listings.filter((l) => l.latitude != null && l.longitude != null),
    [listings],
  )

  const selected = useMemo(
    () => mappable.find((l) => l.id === selectedId) ?? null,
    [mappable, selectedId],
  )

  const borderPath = useMemo(() => {
    return CA_BORDER.map((coord, i) => {
      const { x, y } = toSVG(coord[0], coord[1])
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ') + ' Z'
  }, [])

  const pins = useMemo(
    () =>
      mappable.map((listing) => ({
        listing,
        ...toSVG(listing.longitude!, listing.latitude!),
      })),
    [mappable],
  )

  // County boundary SVG paths
  const countyPaths = useMemo(() => {
    return COUNTY_KEYS.map((key) => {
      const county = COUNTY_BOUNDARIES[key]
      const rings = county.coordinates.map((ring) =>
        ring
          .map((coord, i) => {
            const { x, y } = toSVG(coord[0], coord[1])
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
          })
          .join(' ') + ' Z',
      )
      return { key, name: county.name, d: rings.join(' ') }
    })
  }, [])

  const toggleCounty = useCallback((key: CountyKey) => {
    setActiveCounties((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // Convert screen pixel to SVG coordinate
  const screenToSVG = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current
      if (!el) return { sx: viewBox.x + viewBox.w / 2, sy: viewBox.y + viewBox.h / 2 }
      const rect = el.getBoundingClientRect()
      const rx = (clientX - rect.left) / rect.width
      const ry = (clientY - rect.top) / rect.height
      return {
        sx: viewBox.x + rx * viewBox.w,
        sy: viewBox.y + ry * viewBox.h,
      }
    },
    [viewBox],
  )

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 0.85 : 1.18
      setViewBox((vb) => {
        const newW = Math.min(W, Math.max(W / MAX_ZOOM, vb.w * factor))
        const newH = Math.min(H, Math.max(H / MAX_ZOOM, vb.h * factor))
        const { sx, sy } = screenToSVG(e.clientX, e.clientY)
        // Keep cursor position stable
        const ratioW = newW / vb.w
        const ratioH = newH / vb.h
        return {
          x: sx - (sx - vb.x) * ratioW,
          y: sy - (sy - vb.y) * ratioH,
          w: newW,
          h: newH,
        }
      })
    },
    [screenToSVG],
  )

  // Drag pan
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      setIsDragging(true)
      dragStart.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [viewBox],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStart.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const dx = ((e.clientX - dragStart.current.x) / rect.width) * viewBox.w
      const dy = ((e.clientY - dragStart.current.y) / rect.height) * viewBox.h
      setViewBox((vb) => ({
        ...vb,
        x: dragStart.current!.vx - dx,
        y: dragStart.current!.vy - dy,
      }))
    },
    [isDragging, viewBox.w, viewBox.h],
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    dragStart.current = null
  }, [])

  // Zoom controls
  const zoomIn = () =>
    setViewBox((vb) => {
      const cx = vb.x + vb.w / 2
      const cy = vb.y + vb.h / 2
      const newW = Math.max(W / MAX_ZOOM, vb.w * 0.7)
      const newH = Math.max(H / MAX_ZOOM, vb.h * 0.7)
      return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH }
    })

  const zoomOut = () =>
    setViewBox((vb) => {
      const cx = vb.x + vb.w / 2
      const cy = vb.y + vb.h / 2
      const newW = Math.min(W, vb.w * 1.4)
      const newH = Math.min(H, vb.h * 1.4)
      return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH }
    })

  const resetView = () => setViewBox({ x: 0, y: 0, w: W, h: H })

  // Select a pin
  const handlePinClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  // Deselect when clicking empty map area (only if not dragging)
  const dragMoved = useRef(false)
  const handleMapPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragMoved.current = false
      handlePointerDown(e)
    },
    [handlePointerDown],
  )
  const handleMapPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) dragMoved.current = true
      handlePointerMove(e)
    },
    [isDragging, handlePointerMove],
  )
  const handleMapClick = useCallback(() => {
    if (!dragMoved.current) setSelectedId(null)
  }, [])

  // Pin radius scales inversely with zoom so they don't become huge
  const pinR = Math.max(2.5, 4 / Math.sqrt(zoom))
  const hitR = Math.max(6, 12 / Math.sqrt(zoom))

  // CSS keyframes for selected pulse
  const pulseCSS = `
    @keyframes pin-pulse {
      0%, 100% { r: ${pinR + 4}; opacity: 0.5; }
      50% { r: ${pinR + 10}; opacity: 0; }
    }
  `

  return (
    <div className="relative w-full h-full flex rounded-xl border border-neutral-800 overflow-hidden bg-neutral-950/50">
      <style>{pulseCSS}</style>

      {/* Map pane */}
      <div
        className={`relative h-full transition-all duration-300 ease-in-out ${
          selected ? 'w-[55%]' : 'w-full'
        }`}
      >
        {/* County toggles + Legend */}
        <div className="absolute top-3 left-3 z-10 flex gap-4">
          {/* County list */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-0.5">Counties</span>
            {countyPaths.map(({ key, name }) => {
              const isActive = activeCounties.has(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleCounty(key)}
                  onPointerEnter={() => setHoveredCounty(key)}
                  onPointerLeave={() => setHoveredCounty(null)}
                  className={`flex items-center gap-2 text-left text-[11px] py-0.5 transition-all duration-200 ${
                    isActive
                      ? 'text-primary-300'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-sm border transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500/60 border-primary-500'
                        : 'border-neutral-600 bg-transparent'
                    }`}
                  />
                  {name}
                </button>
              )
            })}
          </div>

          {/* Status legend */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-0.5">Status</span>
            {(['active', 'pending', 'sold', 'off_market'] as ListingStatus[]).map((status) => {
              const count = mappable.filter((l) => l.status === status).length
              if (count === 0) return null
              return (
                <div key={status} className="flex items-center gap-2 py-0.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[status] }}
                  />
                  <span className="text-[11px] text-neutral-500 capitalize">
                    {status.replace('_', ' ')} ({count})
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
          <button
            onClick={zoomIn}
            className="w-7 h-7 bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 rounded-md flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={zoomOut}
            className="w-7 h-7 bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 rounded-md flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          {zoom > 1.05 && (
            <button
              onClick={resetView}
              className="w-7 h-7 bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 rounded-md flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors mt-1"
            >
              <LocateFixed className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* SVG Canvas */}
        <svg
          ref={containerRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onWheel={handleWheel}
          onPointerDown={handleMapPointerDown}
          onPointerMove={handleMapPointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleMapClick}
          style={{ touchAction: 'none' }}
        >
          <defs>
            <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="county-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#C4A96E" floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feComposite in="SourceGraphic" in2="shadow" operator="over" />
            </filter>
            {(['active', 'pending', 'sold', 'off_market'] as ListingStatus[]).map((s) => (
              <filter key={s} id={`glow-${s}`} x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor={STATUS_COLORS[s]} floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="shadow" />
                <feComposite in="SourceGraphic" in2="shadow" operator="over" />
              </filter>
            ))}
          </defs>

          {/* California border — glow */}
          <path
            d={borderPath}
            fill="none"
            stroke="rgba(196, 169, 110, 0.15)"
            strokeWidth="6"
            filter="url(#gold-glow)"
          />

          {/* California border — solid */}
          <path
            d={borderPath}
            fill="rgba(196, 169, 110, 0.03)"
            stroke="#C4A96E"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* County boundaries */}
          {countyPaths.map(({ key, d }) => {
            const isActive = activeCounties.has(key)
            const isHovered = hoveredCounty === key
            return (
              <path
                key={key}
                d={d}
                fill={
                  isActive
                    ? 'rgba(196, 169, 110, 0.12)'
                    : isHovered
                      ? 'rgba(196, 169, 110, 0.06)'
                      : 'transparent'
                }
                stroke={isActive ? '#C4A96E' : 'rgba(196, 169, 110, 0.25)'}
                strokeWidth={isActive ? 1.2 : 0.6}
                strokeLinejoin="round"
                filter={isActive ? 'url(#county-glow)' : undefined}
                className="transition-all duration-300"
                style={{ pointerEvents: 'none' }}
              />
            )
          })}

          {/* Listing pins */}
          {pins.map(({ listing, x, y }) => {
            const isSelected = selectedId === listing.id
            const isHovered = hoveredId === listing.id
            const isHighlighted = isSelected || isHovered

            return (
              <g
                key={listing.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePinClick(listing.id)
                }}
                onPointerEnter={() => setHoveredId(listing.id)}
                onPointerLeave={() => setHoveredId(null)}
              >
                {/* Hit area */}
                <circle cx={x} cy={y} r={hitR} fill="transparent" />

                {/* Selected pulse ring */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    fill="none"
                    stroke={STATUS_COLORS[listing.status]}
                    strokeWidth={1}
                    style={{ animation: 'pin-pulse 2s ease-in-out infinite' }}
                  />
                )}

                {/* Selected / hover outer ring */}
                {isHighlighted && (
                  <circle
                    cx={x}
                    cy={y}
                    r={pinR + 3}
                    fill="none"
                    stroke={STATUS_COLORS[listing.status]}
                    strokeWidth={isSelected ? 1.5 : 1}
                    opacity={isSelected ? 0.7 : 0.4}
                  />
                )}

                {/* Pin dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHighlighted ? pinR + 1 : pinR}
                  fill={STATUS_COLORS[listing.status]}
                  stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.7)'}
                  strokeWidth={isSelected ? 2 / Math.sqrt(zoom) : 1.5 / Math.sqrt(zoom)}
                  filter={`url(#glow-${listing.status})`}
                />
              </g>
            )
          })}
        </svg>

        {/* Empty state */}
        {mappable.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-neutral-500">No listings with coordinates.</p>
          </div>
        )}
      </div>

      {/* Detail panel */}
      <div
        className={`h-full border-l border-neutral-800 bg-neutral-900/80 backdrop-blur-sm overflow-y-auto transition-all duration-300 ease-in-out ${
          selected ? 'w-[45%] opacity-100' : 'w-0 opacity-0'
        }`}
      >
        {selected && <DetailPanel listing={selected} onClose={() => setSelectedId(null)} />}
      </div>
    </div>
  )
}

function DetailPanel({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white leading-tight">{listing.address}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {[listing.city, listing.state, listing.zip].filter(Boolean).join(', ')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status + Price */}
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold capitalize"
          style={{
            backgroundColor: STATUS_COLORS[listing.status] + '22',
            color: STATUS_COLORS[listing.status],
          }}
        >
          {STATUS_LABELS[listing.status]}
        </span>
        {listing.price && (
          <span className="text-lg font-semibold text-white">
            ${listing.price.toLocaleString()}
          </span>
        )}
      </div>

      {/* Key metrics grid */}
      {(listing.bedrooms != null || listing.bathrooms != null || listing.sqft != null) && (
        <div className="grid grid-cols-3 gap-2">
          {listing.bedrooms != null && (
            <MetricCard icon={Bed} label="Beds" value={listing.bedrooms.toString()} />
          )}
          {listing.bathrooms != null && (
            <MetricCard icon={Bath} label="Baths" value={listing.bathrooms.toString()} />
          )}
          {listing.sqft != null && (
            <MetricCard icon={Maximize} label="Sq Ft" value={listing.sqft.toLocaleString()} />
          )}
        </div>
      )}

      {/* Details */}
      <div className="space-y-2.5">
        {listing.lot_size && (
          <DetailRow icon={MapPin} label="Lot Size" value={listing.lot_size} />
        )}
        {listing.year_built && (
          <DetailRow icon={Calendar} label="Year Built" value={listing.year_built.toString()} />
        )}
        {listing.mls_number && (
          <DetailRow icon={DollarSign} label="MLS #" value={listing.mls_number} />
        )}
      </div>

      {/* Description */}
      {listing.description && (
        <div className="pt-2 border-t border-neutral-800">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
            Description
          </p>
          <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {listing.description}
          </p>
        </div>
      )}

      {/* Coordinates */}
      <div className="pt-2 border-t border-neutral-800">
        <p className="text-[11px] text-neutral-600">
          {listing.latitude?.toFixed(5)}, {listing.longitude?.toFixed(5)}
        </p>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-2.5 text-center">
      <Icon className="w-4 h-4 text-neutral-500 mx-auto mb-1" />
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-[10px] text-neutral-500 uppercase">{label}</p>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-xs text-neutral-300 ml-auto">{value}</span>
    </div>
  )
}
