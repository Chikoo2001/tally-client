import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

export default function StockItemForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { company } = useCompany()
  const isEdit = !!id

  const [groups, setGroups] = useState([])
  const [units, setUnits] = useState([])
  const [form, setForm] = useState({
    name: '', group: '', unit: '', hsnCode: '', gstRate: 0, taxability: 'Taxable',
    costingMethod: 'Average', standardRate: 0, openingQuantity: 0, openingRate: 0, openingValue: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!company) return
    Promise.all([
      api.get('/stock/groups', { params: { company: company._id } }),
      api.get('/stock/units', { params: { company: company._id } }),
    ]).then(([g, u]) => { setGroups(g.data); setUnits(u.data) })
    if (isEdit) {
      api.get(`/stock/items/${id}`).then(r => {
        const d = r.data
        setForm({
          name: d.name || '', group: d.group?._id || '', unit: d.unit?._id || '',
          hsnCode: d.hsnCode || '', gstRate: d.gstRate || 0, taxability: d.taxability || 'Taxable',
          costingMethod: d.costingMethod || 'Average', standardRate: d.standardRate || 0,
          openingQuantity: d.openingQuantity || 0, openingRate: d.openingRate || 0, openingValue: d.openingValue || 0,
        })
      })
    }
  }, [company, id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name required')
    setLoading(true)
    try {
      if (isEdit) await api.put(`/stock/items/${id}`, form)
      else await api.post('/stock/items', { ...form, company: company._id })
      toast.success('Saved')
      navigate('/masters/stock/items')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setLoading(false) }
  }

  const F = ({ label, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', marginBottom: 8 }}>
      <label className="tally-label">{label}</label>
      {children}
    </div>
  )

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, maxWidth: 600 }}>
      <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700, marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        {isEdit ? 'EDIT STOCK ITEM' : 'CREATE STOCK ITEM'}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="tally-panel" style={{ marginBottom: 12 }}>
          <div className="tally-section-header" style={{ margin: '-12px -12px 12px' }}>Item Details</div>
          <F label="Name *"><input className="tally-input" value={form.name} onChange={e => set('name', e.target.value)} autoFocus /></F>
          <F label="Group">
            <select className="tally-input" value={form.group} onChange={e => set('group', e.target.value)} style={{ background: '#0D1B33' }}>
              <option value="">Select Group</option>
              {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
          </F>
          <F label="Unit">
            <select className="tally-input" value={form.unit} onChange={e => set('unit', e.target.value)} style={{ background: '#0D1B33' }}>
              <option value="">Select Unit</option>
              {units.map(u => <option key={u._id} value={u._id}>{u.name} ({u.symbol})</option>)}
            </select>
          </F>
          <F label="HSN Code"><input className="tally-input" value={form.hsnCode} onChange={e => set('hsnCode', e.target.value)} /></F>
          <F label="GST Rate %"><input type="number" className="tally-input" value={form.gstRate} onChange={e => set('gstRate', parseFloat(e.target.value) || 0)} min="0" max="100" /></F>
          <F label="Taxability">
            <select className="tally-input" value={form.taxability} onChange={e => set('taxability', e.target.value)} style={{ background: '#0D1B33' }}>
              <option value="Taxable">Taxable</option>
              <option value="Nil Rated">Nil Rated</option>
              <option value="Exempt">Exempt</option>
              <option value="Non-GST">Non-GST</option>
            </select>
          </F>
          <F label="Standard Rate (₹)"><input type="number" className="tally-input" value={form.standardRate} onChange={e => set('standardRate', parseFloat(e.target.value) || 0)} min="0" step="0.01" /></F>
        </div>

        <div className="tally-panel" style={{ marginBottom: 12 }}>
          <div className="tally-section-header" style={{ margin: '-12px -12px 12px' }}>Opening Balance</div>
          <F label="Quantity"><input type="number" className="tally-input" value={form.openingQuantity} onChange={e => set('openingQuantity', parseFloat(e.target.value) || 0)} min="0" /></F>
          <F label="Rate (₹)"><input type="number" className="tally-input" value={form.openingRate} onChange={e => set('openingRate', parseFloat(e.target.value) || 0)} min="0" step="0.01" /></F>
          <F label="Value (₹)"><input type="number" className="tally-input" value={form.openingValue} onChange={e => set('openingValue', parseFloat(e.target.value) || 0)} min="0" step="0.01" /></F>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="tally-btn primary" disabled={loading}>{loading ? 'Saving...' : 'Ctrl+A  Accept'}</button>
          <button type="button" className="tally-btn" onClick={() => navigate('/masters/stock/items')}>Escape  Cancel</button>
        </div>
      </form>
    </div>
  )
}
