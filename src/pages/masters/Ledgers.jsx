import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'
import TallyTable from '../../components/TallyTable'

const COLS = [
  { key: 'name', label: 'Ledger Name', style: { width: '35%' } },
  { key: 'group', label: 'Under', style: { width: '25%' }, render: (v) => v?.name || '' },
  { key: 'openingBalance', label: 'Opening Balance', style: { width: '15%' }, tdStyle: { textAlign: 'right' },
    render: (v, row) => v > 0 ? <span className={row.openingBalanceType === 'Dr' ? 'amount-dr' : 'amount-cr'}>{v.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {row.openingBalanceType}</span> : '—'
  },
  { key: 'gstin', label: 'GSTIN', style: { width: '20%' }, render: v => v || '—' },
  { key: 'isSystem', label: '', style: { width: '5%' }, render: v => v ? <span style={{ color: '#243358', fontSize: 9 }}>SYS</span> : '' },
]

export default function Ledgers() {
  const navigate = useNavigate()
  const { company } = useCompany()
  const [ledgers, setLedgers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!company) return
    setLoading(true)
    try {
      const { data } = await api.get('/ledgers', { params: { company: company._id, search } })
      setLedgers(data)
    } catch { toast.error('Failed to load ledgers') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company, search])

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>LEDGERS — {company.name}</div>
        <button className="tally-btn primary" onClick={() => navigate('/masters/ledgers/new')} style={{ fontSize: 11 }}>Alt+C  New Ledger</button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <input
          className="tally-input"
          style={{ maxWidth: 300 }}
          placeholder="Search ledgers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ color: '#8B9DC3' }}>Loading...</div>
      ) : (
        <TallyTable
          columns={COLS}
          data={ledgers}
          onRowDoubleClick={row => navigate(`/masters/ledgers/${row._id}`)}
          className="flex-1"
        />
      )}

      <div style={{ marginTop: 8, color: '#8B9DC3', fontSize: 11 }}>
        {ledgers.length} ledger(s). Double-click to edit. <span className="shortcut-key">Alt+C</span> New  <span className="shortcut-key">↑↓</span> Navigate  <span className="shortcut-key">Enter</span> Select
      </div>
    </div>
  )
}
