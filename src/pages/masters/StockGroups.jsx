import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'
import TallyTable from '../../components/TallyTable'
import Modal from '../../components/Modal'

const COLS = [
  { key: 'name', label: 'Name', style: { width: '50%' } },
  { key: 'parent', label: 'Under', render: v => v?.name || 'Primary' },
  { key: 'isSystem', label: '', render: v => v ? <span style={{ color: '#8B9DC3', fontSize: 10 }}>SYS</span> : '' },
]

export default function StockGroups() {
  const { company } = useCompany()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', parent: '' })

  const load = async () => {
    if (!company) return
    setLoading(true)
    try { const { data } = await api.get('/stock/groups', { params: { company: company._id } }); setGroups(data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company])

  const openEdit = (row) => {
    if (row.isSystem) return toast.error('Cannot edit system items')
    setEditItem(row); setForm({ name: row.name, parent: row.parent?._id || '' }); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name required')
    try {
      if (editItem) await api.put(`/stock/groups/${editItem._id}`, form)
      else await api.post('/stock/groups', { ...form, company: company._id })
      toast.success('Saved'); setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>STOCK GROUPS</div>
        <button className="tally-btn primary" onClick={() => { setEditItem(null); setForm({ name: '', parent: '' }); setShowModal(true) }} style={{ fontSize: 11 }}>New Group</button>
      </div>
      {loading ? <div style={{ color: '#8B9DC3' }}>Loading...</div> :
        <TallyTable columns={COLS} data={groups} onRowDoubleClick={openEdit} className="flex-1" />}
      {showModal && (
        <Modal title={editItem ? 'EDIT GROUP' : 'NEW GROUP'} onClose={() => setShowModal(false)} width={380}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
            <label className="tally-label">Name</label>
            <input className="tally-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            <label className="tally-label">Under</label>
            <select className="tally-input" value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))} style={{ background: '#0D1B33' }}>
              <option value="">Primary</option>
              {groups.filter(g => !g.isSystem).map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
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
