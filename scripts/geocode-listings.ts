/**
 * Geocode all listings that don't have coordinates yet.
 * Uses Mapbox Geocoding API + Supabase service role key.
 *
 * Usage: bun scripts/geocode-listings.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY!
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function geocode(address: string, city: string | null, state: string, zip: string | null) {
  const query = [address, city, state, zip].filter(Boolean).join(', ')
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&country=us&limit=1&access_token=${MAPBOX_TOKEN}`

  const res = await fetch(url)
  if (!res.ok) {
    console.error(`  Geocode API error ${res.status}: ${await res.text()}`)
    return null
  }

  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null

  const [lng, lat] = feature.geometry.coordinates
  return { latitude: lat as number, longitude: lng as number }
}

async function main() {
  // Fetch listings missing coordinates
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, address, city, state, zip')
    .is('latitude', null)

  if (error) {
    console.error('Failed to fetch listings:', error.message)
    process.exit(1)
  }

  if (!listings.length) {
    console.log('All listings already have coordinates.')
    return
  }

  console.log(`Found ${listings.length} listings to geocode.\n`)

  let success = 0
  let failed = 0

  for (const listing of listings) {
    const label = `${listing.address}, ${[listing.city, listing.state, listing.zip].filter(Boolean).join(', ')}`
    process.stdout.write(`Geocoding: ${label} ... `)

    const coords = await geocode(listing.address, listing.city, listing.state, listing.zip)

    if (!coords) {
      console.log('NOT FOUND')
      failed++
      continue
    }

    const { error: updateError } = await supabase
      .from('listings')
      .update(coords)
      .eq('id', listing.id)

    if (updateError) {
      console.log(`UPDATE FAILED: ${updateError.message}`)
      failed++
    } else {
      console.log(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`)
      success++
    }
  }

  console.log(`\nDone. ${success} geocoded, ${failed} failed.`)
}

main()
