import React, { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const RADIAN = Math.PI / 180
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE']

function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (cx == null || cy == null) return null
  // Position labels outside the pie slices by using a radius slightly
  // larger than the outerRadius.
  const or = outerRadius ?? 80
  const radius = or + 14
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

  return (
    <div style={{ width: '100%', height: 220, boxSizing: 'border-box' }}>
      <div className="pie-chart-wrap" style={{ display: 'flex', gap: 12, alignItems: 'center', height: '100%' }}>
        <div style={{ flex: '0 0 55%', minWidth: 160, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                labelLine={false}
                label={renderCustomizedLabel}
                dataKey="value"
                isAnimationActive={isAnimationActive}
                innerRadius={40}
                outerRadius={80}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="pie-legend" style={{ flex: '1 1 0', minWidth: 120 }}>
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
