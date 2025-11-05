import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { fetchItem, fetchList } from '../api/hyruleApi'
import './Dashboard.css'
import normalizeCategory from '../utils/normalizeCategory'

function PrettyValue({ value }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <>—</>
    return <ul>{value.map((v, i) => <li key={i}>{String(v)}</li>)}</ul>
  }
  if (value && typeof value === 'object') {
    return (
      <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
    )
  }
  if (value === '' || value == null) return <>—</>
  return <span>{String(value)}</span>
}

export default function ItemDetail() {
  const { id, category } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [item, setItem] = useState(location.state?.item ?? null)
  const [loading, setLoading] = useState(!item)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (item) return
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        // Normalize the category to the API expected slug (e.g. 'material' -> 'materials')
        const cat = normalizeCategory(category || 'all')
        let data
        try {
          data = await fetchItem(cat, id)
        } catch (err) {
          // If the category-based fetch fails (404 endpoint does not exist),
          // fall back to searching the 'all' endpoint for the item by id.
          console.warn('fetchItem failed, falling back to search all:', err)
          const list = await fetchList('all')
          // Try to match by id or name
          const found = list.find(it => String(it.id) === String(id) || String(it.name) === String(id))
          if (found) data = found
          else throw err
        }
        if (!mounted) return
        setItem(data)
      } catch (err) {
        console.error('fetch item error', err)
        if (!mounted) return
        setError(String(err.message || err))
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id, category, item])

  // When returning to dashboard explicitly, prefer history back because it
  // When returning to dashboard, prefer using the explicit dashboardState
  // (if provided) so the dashboard can rehydrate its filters (including the
  // selected category). If no dashboardState is available, fall back to
  // history back which preserves scroll. If neither applies, navigate to '/'.
  function goBack() {
    if (location.state && location.state.dashboardState) {
      navigate('/', { state: { dashboardState: location.state.dashboardState } })
      return
    }
    if (location.state && location.state.fromHistory) {
      navigate(-1)
      return
    }
    navigate('/')
  }

  return (
    <section className="dashboard" aria-live="polite">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>{item?.name ?? 'Item detail'}</h2>
        <div>
          <button onClick={goBack} style={{ padding: '0.4rem 0.7rem' }}>← Back</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : item ? (
        <div className="item-detail">
          <div className="detail-container">
            {item.image && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <img src={item.image} alt={item.name} style={{ maxWidth: '100%', width: 240, borderRadius: 8 }} />
              </div>
            )}

            <table className="detail-table" style={{ width: '100%', borderCollapse: 'collapse', margin: '0 auto' }}>
              <tbody>
                {Object.keys(item)
                  .filter(k => String(k).toLowerCase() !== 'dlc')
                  .map(key => {
                    // Human-friendly label for the key (visible to user).
                    // Special-case some fields (e.g. edible) and otherwise
                    // convert snake_case / camelCase to Title Case.
                    const rawKey = String(key)
                    let label
                    if (rawKey.toLowerCase() === 'edible') label = 'Edible'
                    else {
                      // replace underscores with spaces, split camelCase, then title-case
                      const spaced = rawKey
                        .replace(/_/g, ' ')
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                      label = spaced.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                    }
                    return (
                      <tr key={key} style={{ borderTop: '1px solid #eee' }}>
                        <td className="detail-key" style={{ padding: '0.5rem 0.75rem', width: '28%', verticalAlign: 'top' }}>{label}</td>
                        <td className="detail-value" style={{ padding: '0.5rem 0.75rem' }}><PrettyValue value={item[key]} /></td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty">No item data available</div>
      )}
    </section>
  )
}
