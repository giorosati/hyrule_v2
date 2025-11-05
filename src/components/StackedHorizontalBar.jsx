import React, { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts'

// Colors for the stacks
const COLORS = {
  edible: '#82ca9d', // green
  notEdible: '#8884d8', // purple
}

function isEdible(item) {
  if (!item) return false
  const raw = item.raw ?? item
  // Prefer explicit edible flag
  if (raw && raw.edible === true) return true
  // Materials may indicate hearts_recovered when edible
  if (raw && raw.hearts_recovered != null) {
    const v = Number(raw.hearts_recovered)
    if (!Number.isNaN(v) && v > 0) return true
  }
  return false
}

export default function StackedHorizontalBar({ items = [] }) {
  const data = useMemo(() => {
    const cats = ['creatures', 'materials']
    const rows = []
    for (const c of cats) {
      const subset = items.filter(it => String(it.category || '').toLowerCase() === c)
      const total = subset.length
      const edibleCount = subset.filter(isEdible).length
      const notEdible = total - edibleCount
      rows.push({ name: c === 'creatures' ? 'Creatures' : 'Materials', edible: edibleCount, notEdible, total })
    }
    return rows
  }, [items])

  return (
    <div style={{ width: '100%', height: 220, boxSizing: 'border-box' }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* layout='vertical' makes the bars horizontal (one bar per Y category) */}
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 16, left: 16, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={120} />
          <Tooltip />
          {/*
            Keep the legend items in the original order (Not Edible, Edible)
            while rendering the bars with Edible first so the stacked bars
            show Edible at the beginning (left). We provide a custom
            payload to Legend to control item order independently of Bar order.
          */}
          <Legend payload={[
            { value: 'Not Edible', type: 'square', color: COLORS.notEdible, id: 'notEdible' },
            { value: 'Edible', type: 'square', color: COLORS.edible, id: 'edible' },
          ]} />
          {/* Render edible first so it appears at the left of each horizontal bar */}
          <Bar dataKey="edible" stackId="a" name="Edible" fill={COLORS.edible} />
          <Bar dataKey="notEdible" stackId="a" name="Not Edible" fill={COLORS.notEdible} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
