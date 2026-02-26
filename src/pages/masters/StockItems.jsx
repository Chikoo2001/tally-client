import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'
import TallyTable from '../../components/TallyTable'

const COLS = [
  { key: 'name', label: 'Item Name', style: { width: '35%' } },
  { key: 'group', label: 'Group', style: { width: '20%' }, render: v => v?.name || '' },
  { key: 'unit', label: 'Unit', style: { width: '10%' }, render: v => v?.symbol || v?.name || '' },
  { key: 'hsnCode', label: 'HSN', style: { width: '12%' }, render: v => v || '—' },
  { key: 'gstRate', label: 'GST%', style: { width: '8%' }, tdStyle: { textAlign: 'right' }, render: v => v > 0 ? `${v}%` : '—' },
  { key: 'standardRate', label: 'Rate', style: { width: '15%' }, tdStyle: { textAlign: 'right' },
    render: v => v > 0 ? `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—' },
]

export default function StockItems() {
  const navigate = useNavigate()
  const { company } = useCompany()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!company) return
    setLoading(true)
    try { const { data } = await api.get('/stock/items', { params: { company: company._id, search } }); setItems(data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company, search])

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>STOCK ITEMS — {company.name}</div>
        <button className="tally-btn primary" onClick={() => navigate('/masters/stock/items/new')} style={{ fontSize: 11 }}>New Item</button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <input className="tally-input" style={{ maxWidth: 280 }} placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? <div style={{ color: '#8B9DC3' }}>Loading...</div> :
        <TallyTable columns={COLS} data={items} onRowDoubleClick={row => navigate(`/masters/stock/items/${row._id}`)} className="flex-1" />}
      <div style={{ marginTop: 8, color: '#8B9DC3', fontSize: 11 }}>{items.length} item(s). Double-click to edit.</div>
    </div>
  )
}
