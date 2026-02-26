import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'
import TallyTable from '../../components/TallyTable'
import Modal from '../../components/Modal'

const COLS = [
  { key: 'name', label: 'Name', style: { width: '40%' } },
  { key: 'symbol', label: 'Symbol', style: { width: '20%' } },
  { key: 'isCompound', label: 'Compound', render: v => v ? 'Yes' : 'No' },
  { key: 'isSystem', label: '', render: v => v ? <span style={{ color: '#8B9DC3', fontSize: 10 }}>SYS</span> : '' },
]

export default function StockUnits() {
  const { company } = useCompany()
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', symbol: '', isCompound: false })

  const load = async () => {
    if (!company) return
    setLoading(true)
    try { const { data } = await api.get('/stock/units', { params: { company: company._id } }); setUnits(data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company])

  const openEdit = (row) => {
    if (row.isSystem) return toast.error('Cannot edit system items')
    setEditItem(row); setForm({ name: row.name, symbol: row.symbol || '', isCompound: row.isCompound }); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name required')
    try {
      if (editItem) await api.put(`/stock/units/${editItem._id}`, form)
      else await api.post('/stock/units', { ...form, company: company._id })
      toast.success('Saved'); setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>STOCK UNITS</div>
        <button className="tally-btn primary" onClick={() => { setEditItem(null); setForm({ name: '', symbol: '', isCompound: false }); setShowModal(true) }} style={{ fontSize: 11 }}>New Unit</button>
      </div>
      {loading ? <div style={{ color: '#8B9DC3' }}>Loading...</div> :
        <TallyTable columns={COLS} data={units} onRowDoubleClick={openEdit} className="flex-1" />}
      {showModal && (
        <Modal title={editItem ? 'EDIT UNIT' : 'NEW UNIT'} onClose={() => setShowModal(false)} width={380}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
            <label className="tally-label">Name</label>
            <input className="tally-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            <label className="tally-label">Symbol</label>
            <input className="tally-input" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="tally-btn primary" onClick={handleSave}>Accept</button>
            <button className="tally-btn" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
