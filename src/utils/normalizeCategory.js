// Normalize various category strings to the compendium API's expected slugs.
export default function normalizeCategory(raw) {
  if (!raw) return 'all'
  const s = String(raw).trim().toLowerCase()
  const map = {
    // materials
    'material': 'materials',
    'materials': 'materials',
    // monsters
    'monster': 'monsters',
    'monsters': 'monsters',
    // creatures
    'creature': 'creatures',
    'creatures': 'creatures',
    // equipment (we map weapons/armor to equipment)
    'equipment': 'equipment',
    'weapon': 'equipment',
    'weapons': 'equipment',
    'armor': 'equipment',
    'armour': 'equipment',
    'armors': 'equipment',
    // treasure
    'treasure': 'treasure',
    // allow explicit all
    'all': 'all',
  }
  return map[s] || s
}
