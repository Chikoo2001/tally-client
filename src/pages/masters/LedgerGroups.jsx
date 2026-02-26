import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'
import Modal from '../../components/Modal'

function GroupNode({ node, depth = 0, onEdit }) {
  const [open, setOpen] = useState(true)

  const natureColor = {
    assets: '#34D399', liabilities: '#F87171', income: '#60A5FA', expenses: '#FBBF24'
  }

  return (
    <div>
      <div
        style={{
          paddingLeft: 8 + depth * 16,
          paddingTop: 4, paddingBottom: 4, paddingRight: 8,
          borderBottom: '1px solid #243358',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
        }}
        onClick={() => setOpen(!open)}
        onDoubleClick={() => onEdit(node)}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1E2F4D'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {node.children?.length > 0 && (
          <span style={{ color: '#8B9DC3', fontSize: 10, width: 12, textAlign: 'center' }}>{open ? '▼' : '▶'}</span>
        )}
        {!node.children?.length && <span style={{ width: 12 }} />}
        <span style={{ color: '#E2E8F0', fontSize: 12, flex: 1 }}>{node.name}</span>
        <span style={{ fontSize: 10, color: natureColor[node.nature] || '#8B9DC3' }}>{node.nature}</span>
        {node.isSystem && <span style={{ fontSize: 9, color: '#243358', backgroundColor: '#1A2744', padding: '1px 4px', border: '1px solid #243358' }}>SYS</span>}
      </div>
      {open && node.children?.map(child => (
        <GroupNode key={child._id} node={child} depth={depth + 1} onEdit={onEdit} />
      ))}
    </div>
  )
}

export default function LedgerGroups() {
  const { company } = useCompany()
  const [tree, setTree] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editGroup, setEditGroup] = useState(null)
  const [form, setForm] = useState({ name: '', nature: 'assets', parent: '', affectsGrossProfit: false })

  const load = async () => {
    if (!company) return
    setLoading(true)
    try {
      const { data } = await api.get('/ledger-groups/tree', { params: { company: company._id } })
      setTree(data)
    } catch (err) {
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [company])

  const openNew = () => {
    setEditGroup(null)
    setForm({ name: '', nature: 'assets', parent: '', affectsGrossProfit: false })
    setShowModal(true)
  }

  const openEdit = (g) => {
    if (g.isSystem) return toast.error('System groups cannot be edited')
    setEditGroup(g)
    setForm({ name: g.name, nature: g.nature, parent: g.parent?._id || '', affectsGrossProfit: g.affectsGrossProfit })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name required')
    try {
      if (editGroup) {
        await api.put(`/ledger-groups/${editGroup._id}`, form)
        toast.success('Group updated')
      } else {
        await api.post('/ledger-groups', { ...form, company: company._id })
        toast.success('Group created')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving group')
    }
  }

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>LEDGER GROUPS — {company.name}</div>
        <button className="tally-btn primary" onClick={openNew} style={{ fontSize: 11 }}>Alt+C  New Group</button>
      </div>

      {loading ? (
        <div style={{ color: '#8B9DC3' }}>Loading...</div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', border: '1px solid #243358' }}>
          {tree.map(node => <GroupNode key={node._id} node={node} onEdit={openEdit} />)}
        </div>
      )}

      <div style={{ marginTop: 8, color: '#8B9DC3', fontSize: 11 }}>
        Double-click to edit. <span className="shortcut-key">Alt+C</span> New  <span className="shortcut-key">Esc</span> Back
      </div>

      {showModal && (
        <Modal title={editGroup ? 'EDIT GROUP' : 'CREATE GROUP'} onClose={() => setShowModal(false)} width={400}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
            <label className="tally-label">Name</label>
            <input className="tally-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            <label className="tally-label">Nature</label>
            <select className="tally-input" value={form.nature} onChange={e => setForm(f => ({ ...f, nature: e.target.value }))} style={{ background: '#0D1B33' }}>
              <option value="assets">Assets</option>
              <option value="liabilities">Liabilities</option>
              <option value="income">Income</option>
              <option value="expenses">Expenses</option>
            </select>
            <label className="tally-label">Affects GP</label>
            <input type="checkbox" checked={form.affectsGrossProfit} onChange={e => setForm(f => ({ ...f, affectsGrossProfit: e.target.checked }))} />
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button className="tally-btn primary" onClick={handleSave}>Accept</button>
            <button className="tally-btn" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
