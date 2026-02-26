import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'
import { useCompany } from '../context/CompanyContext'

export default function LedgerSearch({ value, onChange, placeholder = 'Select Ledger...', groupNature, autoFocus }) {
  const { company } = useCompany()
  const [query, setQuery] = useState(value?.name || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { setQuery(value?.name || '') }, [value])
  useEffect(() => { if (autoFocus && inputRef.current) inputRef.current.focus() }, [autoFocus])

  const search = (q) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!company) return
      setLoading(true)
      try {
        const params = { company: company._id, search: q }
        if (groupNature) params.nature = groupNature
        const { data } = await api.get('/ledgers', { params })
        setResults(data.slice(0, 20))
      } catch {}
      setLoading(false)
    }, 200)
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        className="tally-input"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); search(e.target.value); if (!e.target.value) onChange(null) }}
        onFocus={() => { setOpen(true); search(query) }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
      />
      {open && (results.length > 0 || loading) && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#0F1A2E', border: '1px solid #243358', zIndex: 100, maxHeight: 200, overflowY: 'auto' }}>
          {loading && <div style={{ padding: '6px 10px', color: '#8B9DC3' }}>Searching...</div>}
          {results.map(l => (
            <div
              key={l._id}
              onMouseDown={() => { setQuery(l.name); onChange(l); setOpen(false); setResults([]) }}
              style={{ padding: '5px 10px', cursor: 'pointer', borderBottom: '1px solid #1A2744', color: '#E2E8F0' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1E2F4D'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ fontSize: 13 }}>{l.name}</div>
              {l.group && <div style={{ fontSize: 10, color: '#8B9DC3' }}>{l.group.name}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
