import { useEffect, useRef, useState } from 'react'

export default function TallyTable({ columns, data, onRowClick, onRowDoubleClick, className = '' }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const tableRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!data || data.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx(i => Math.min(i + 1, data.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        const row = data[selectedIdx]
        if (row) (onRowDoubleClick || onRowClick)?.(row, selectedIdx)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [data, selectedIdx, onRowClick, onRowDoubleClick])

  useEffect(() => {
    if (!tableRef.current) return
    const rows = tableRef.current.querySelectorAll('tbody tr')
    rows[selectedIdx]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx])

  if (!data || data.length === 0) {
    return <div style={{ padding: 20, color: '#8B9DC3', textAlign: 'center', fontSize: 12 }}>No records found</div>
  }

  return (
    <div className={`overflow-auto ${className}`}>
      <table className="tally-table" ref={tableRef}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="tally-th" style={col.style}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row._id || idx}
              className={`tally-tr${selectedIdx === idx ? ' selected' : ''}`}
              onClick={() => { setSelectedIdx(idx); onRowClick?.(row, idx) }}
              onDoubleClick={() => onRowDoubleClick?.(row, idx)}
              style={{ cursor: onRowClick || onRowDoubleClick ? 'pointer' : 'default' }}
            >
              {columns.map(col => (
                <td key={col.key} className="tally-td" style={col.tdStyle}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
