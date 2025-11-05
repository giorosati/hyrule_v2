// Count unique common locations from the Hyrule Compendium API (compendium/all)
// Usage: node --version must be >=18 (global fetch required)
// Run from project root: node scripts/countCommonLocations.mjs

const API_ALL = 'https://botw-compendium.herokuapp.com/api/v3/compendium/all'

function normalizeLocation(s) {
  if (!s) return null
  const t = String(s).trim()
  if (!t) return null
  // Normalize spacing and capitalization to reduce duplicates
  return t.replace(/\s+/g, ' ').replace(/,\s*/g, ', ').trim()
}

async function main() {
  console.log('Fetching full compendium (this may take a moment)...')
  const res = await fetch(API_ALL)
  if (!res.ok) {
    console.error('Network error', res.status, res.statusText)
    process.exit(2)
  }
  const json = await res.json()
  const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : Object.values(json).find(v => Array.isArray(v)) || [])
  console.log(`Received ${items.length} items from API`)

  const set = new Set()
  for (const it of items) {
    // prefer known common location fields
    const candidates = []
    if (Array.isArray(it.common_locations)) candidates.push(...it.common_locations)
    if (Array.isArray(it.commonLocations)) candidates.push(...it.commonLocations)
    if (Array.isArray(it.locations)) candidates.push(...it.locations)
    if (Array.isArray(it.spawn_locations)) candidates.push(...it.spawn_locations)

    // also if a field is a string with comma-separated locations
    for (const key of ['common_locations', 'commonLocations', 'locations', 'spawn_locations', 'location']) {
      if (typeof it[key] === 'string') {
        candidates.push(...it[key].split(',').map(s => s.trim()).filter(Boolean))
      }
    }

    for (const c of candidates) {
      const n = normalizeLocation(c)
      if (n) set.add(n)
    }
  }

  const arr = [...set].sort((a,b) => a.localeCompare(b))
  console.log('\nUnique common locations count:', arr.length)
  console.log('\nSample locations (first 40):')
  for (const s of arr.slice(0, 40)) console.log('-', s)
  console.log(`\nTo inspect all locations, write them to a file by piping output: node scripts/countCommonLocations.mjs > locations.txt`)
}

main().catch(err => { console.error(err); process.exit(1) })
