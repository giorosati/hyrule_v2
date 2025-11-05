import { useEffect, useMemo, useState } from 'react'
import { fetchList } from '../api/hyruleApi'
import './Dashboard.css'

// Small sample fallback data so the skeleton renders even if the API shape differs
const SAMPLE = [
  { id: '1', name: 'Hylian Shroom', category: 'material', description: 'A mushroom.' },
  { id: '2', name: 'Hylian Wheat', category: 'material', description: 'A stalk of wheat.' },
  { id: '3', name: 'Blue Bokoblin', category: 'monster', description: 'A common foe.' },
  { id: '4', name: 'Traveler Sword', category: 'weapon', description: 'A rusty sword.' },
  { id: '5', name: 'Soldier Shield', category: 'armor', description: 'A sturdy shield.' },
  { id: '6', name: 'Amber', category: 'material', description: 'A gem.' },
  { id: '7', name: 'Keese Wing', category: 'material', description: 'A wing.' },
  { id: '8', name: 'Lizalfos', category: 'monster', description: 'A lizard-like enemy.' },
  { id: '9', name: 'Hylian Shield', category: 'armor', description: 'A classic shield.' },
  { id: '10', name: 'Ancient Core', category: 'material', description: 'A machine part.' },
]

export default function Dashboard({ endpoint = 'creatures' }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  // category used for client-side filtering was removed in favor of
  // `fetchCategory` which tells the API which compendium category to return.
  const [fetchCategory, setFetchCategory] = useState('creatures')
  // track which items' long location lists are expanded
  const [expandedIds, setExpandedIds] = useState(new Set())
  // track images that failed to load so we can show a placeholder
  const [imageErrorIds, setImageErrorIds] = useState(new Set())

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        // fetch the selected category from the compendium API
        const data = await fetchList(fetchCategory || endpoint)
        if (!mounted) return
        // Normalise items to objects with id and name where possible
        const normalized = data.map((it, i) => {
          if (!it) return null
          if (typeof it === 'string') return { id: String(i), name: it }
          return {
            id: it.id ?? it.name ?? String(i),
            name: it.name ?? it.title ?? `item-${i}`,
            category: it.category ?? it.type ?? it.class ?? 'unknown',
            description: it.description ?? it.about ?? '',
            image: it.image ?? it.img ?? it.image_url ?? '',
            // normalise common locations which may be named `common_locations` or `commonLocations`
            common_locations: it.common_locations ?? it.commonLocations ?? it.commonLocation ?? [],
            raw: it,
          }
        }).filter(Boolean)
        if (normalized.length === 0) {
          setItems(SAMPLE)
          setError('API returned no items — showing example data.')
        } else {
          setItems(normalized)
        }
      } catch (err) {
        console.error('Dashboard fetch error', err)
        if (!mounted) return
        setError(String(err.message || err))
        setItems(SAMPLE)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [endpoint, fetchCategory])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(it => {
      if (!q) return true
      return (it.name || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q)
    })
  }, [items, query])

  const stats = useMemo(() => {
    const total = items.length
    const uniqueCats = new Set(items.map(i => i.category || 'unknown')).size
    const withDesc = items.filter(i => i.description && i.description.length > 0).length
    const withLocations = items.filter(i => {
      const v = i.common_locations
      if (Array.isArray(v)) return v.length > 0
      if (typeof v === 'string') return v.trim().length > 0
      return Boolean(v)
    }).length
    const percentWithLocations = total > 0 ? Math.round((withLocations / total) * 100) : 0
    return { total, uniqueCats, withDesc, withLocations, percentWithLocations }
  }, [items])

  return (
    <section className="dashboard">
      <header>
        <div>
          <h4><em>
          Filter and search an API serving data on all in-game items of
          <br />
          Zelda: Breath of the Wild and Zelda: Tears of the Kingdom
         </em></h4>
        </div>
         
        <div className="controls">
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="control-label" style={{ fontSize: '0.9rem' }}>Category:</span>
            <select aria-label="Select API category" value={fetchCategory} onChange={e => setFetchCategory(e.target.value)}>
              <option value="all">All</option>
              <option value="creatures">Creatures</option>
              <option value="equipment">Equipment</option>
              <option value="materials">Materials</option>
              <option value="monsters">Monsters</option>
              <option value="treasure">Treasure</option>
            </select>
            {loading && <span className="dropdown-spinner" aria-hidden="true" title="Loading"></span>}
          </label>

          <input
            aria-label="Search items"
            placeholder="Search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="stats">
        <span className="stat"><span className="stat-label"># of Items Retrieved:</span> <span className="stat-value">{stats.total}</span></span>
        <span className="stat"><span className="stat-label"># of Categories:</span> <span className="stat-value">{stats.uniqueCats}</span></span>
        <span className="stat"><span className="stat-label">% of Items with Common Locations Data:</span> <span className="stat-value">{stats.percentWithLocations}%</span></span>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <div>
          {error && <div className="error">{error}</div>}
          <table className="item-table">
            <thead>
                <tr>
                  <th style={{width: 64}}>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Common Locations</th>
                </tr>
            </thead>
            <tbody>
              {filtered.map(it => (
                  <tr key={it.id}>
                    <td className="thumb">
                      {it.image && !imageErrorIds.has(it.id) ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          loading="lazy"
                          onError={() => setImageErrorIds(prev => new Set([...prev, it.id]))}
                        />
                      ) : (
                        <div className="thumb-placeholder" aria-hidden="true" />
                      )}
                    </td>
                    <td><span className="field-label">Name: </span><span className="field-value">{it.name}</span></td>
                    <td><span className="field-label">Category: </span><span className="field-value">{it.category}</span></td>
                    <td>{it.description}</td>
                    <td>
                      {Array.isArray(it.common_locations) ? (
                        it.common_locations.length === 0 ? (
                          '—'
                        ) : (
                          (() => {
                            const list = it.common_locations
                            const isExpanded = expandedIds.has(it.id)
                            const visible = isExpanded ? list : list.slice(0, 3)
                            return (
                              <div>
                                <span className="locations-text" title={!isExpanded ? list.join(', ') : ''}>{visible.join(', ')}</span>
                                {list.length > 3 && (
                                  <button
                                    className="more-link"
                                    aria-expanded={isExpanded}
                                    onClick={() => {
                                      setExpandedIds(prev => {
                                        const next = new Set(prev)
                                        if (next.has(it.id)) next.delete(it.id)
                                        else next.add(it.id)
                                        return next
                                      })
                                    }}
                                  >
                                    {isExpanded ? ' show less' : ` …more (${list.length - 3})`}
                                  </button>
                                )}
                              </div>
                            )
                          })()
                        )
                      ) : (
                        it.common_locations || '—'
                      )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty">No results</div>}
        </div>
      )}
    </section>
  )
}
