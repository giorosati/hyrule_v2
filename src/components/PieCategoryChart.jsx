import React, { useMemo, useEffect, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const RADIAN = Math.PI / 180
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE']

function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (cx == null || cy == null) return null
  // Position labels outside the pie slices by using a radius slightly
  // larger than the outerRadius. On narrow screens we reduce the offset
  // so labels don't fall outside the chart viewport.
  const or = outerRadius ?? 80
  // use a smaller extra offset for smaller pies (keeps labels inside)
  const extra = or > 70 ? 14 : 8
  const radius = or + extra
  const ncx = Number(cx)
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN)
  const ncy = Number(cy)
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN)

  return (
    <text x={x} y={y} fill="black" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central">
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  )
}

// Expected categories and display names
const CATEGORY_KEYS = [
  { key: 'creatures', label: 'Creatures' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'materials', label: 'Materials' },
  { key: 'monsters', label: 'Monsters' },
  { key: 'treasure', label: 'Treasure' },
]

export default function PieCategoryChart({ items = [], isAnimationActive = true }) {
  // items is the normalized array coming from Dashboard (each item has .category)
  const data = useMemo(() => {
    const counts = {}
    for (const c of CATEGORY_KEYS) counts[c.key] = 0
    for (const it of items) {
      const cat = String(it.category || 'unknown').toLowerCase()
      if (counts[cat] != null) counts[cat]++
      else {
        // ignore unknown categories
      }
    }
    return CATEGORY_KEYS.map((c) => ({ key: c.key, name: c.label, value: counts[c.key] || 0 }))
  }, [items])

  // Track narrow view so we can reduce pie size on small screens and keep
  // labels inside the visible area.
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = () => setIsNarrow(mq.matches)
    onChange()
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])

  const outerRadius = isNarrow ? 64 : 80
  const innerRadius = isNarrow ? 34 : 40

  return (
    // add bottom padding so percentage labels that render outside the
    // pie don't get clipped and so the visual center sits higher
    <div className="pie-chart-container" style={{ paddingBottom: 28 }}>
      <div className="chart-title" style={{ textAlign: 'center', marginBottom: 6, paddingTop: 4 }}>Relative %'s of Hyrule Items</div>
      <div className="pie-chart-wrap" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ flex: '0 0 55%', minWidth: 160, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                labelLine={false}
                label={renderCustomizedLabel}
                dataKey="value"
                isAnimationActive={isAnimationActive}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                // keep the pie vertically centered inside its column;
                // on wide screens nudge it slightly upward (45%) so the
                // pie+legend visual center sits higher in the card while
                // still leaving room at the bottom for labels.
                cy={isNarrow ? '50%' : '45%'}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

  <div className="pie-legend" style={{ flex: '1 1 0', minWidth: 120, alignSelf: 'center' }}>
          {data.map((d, i) => (
            <div key={d.key} className="pie-legend-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ width: 14, height: 14, display: 'inline-block', background: COLORS[i % COLORS.length], borderRadius: 3 }} />
              <span style={{ fontWeight: 600 }}>{d.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
