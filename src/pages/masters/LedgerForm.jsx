import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

export default function LedgerForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { company } = useCompany()
  const isEdit = !!id

  const [groups, setGroups] = useState([])
  const [form, setForm] = useState({
    name: '', alias: '', group: '', openingBalance: 0, openingBalanceType: 'Dr',
    partyType: '', address: '', state: '', phone: '', email: '', pan: '', gstin: '',
    gstRegistrationType: '', bankAccountNumber: '', bankName: '', ifscCode: '',
    taxType: '', gstRate: 0, hsnCode: '', sacCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('basic')

  useEffect(() => {
    if (!company) return
    api.get('/ledger-groups', { params: { company: company._id } }).then(r => setGroups(r.data))
    if (isEdit) {
      api.get(`/ledgers/${id}`).then(r => {
        const d = r.data
        setForm({
          name: d.name || '', alias: d.alias || '', group: d.group?._id || d.group || '',
          openingBalance: d.openingBalance || 0, openingBalanceType: d.openingBalanceType || 'Dr',
          partyType: d.partyType || '', address: d.address || '', state: d.state || '',
          phone: d.phone || '', email: d.email || '', pan: d.pan || '', gstin: d.gstin || '',
          gstRegistrationType: d.gstRegistrationType || '',
          bankAccountNumber: d.bankAccountNumber || '', bankName: d.bankName || '', ifscCode: d.ifscCode || '',
          taxType: d.taxType || '', gstRate: d.gstRate || 0, hsnCode: d.hsnCode || '', sacCode: d.sacCode || '',
        })
      })
    }
  }, [company, id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name required')
    if (!form.group) return toast.error('Please select a group')
    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/ledgers/${id}`, form)
        toast.success('Ledger updated')
      } else {
        await api.post('/ledgers', { ...form, company: company._id })
        toast.success('Ledger created')
      }
      navigate('/masters/ledgers')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving ledger')
    } finally {
      setLoading(false)
    }
  }

  const F = ({ label, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', marginBottom: 8 }}>
      <label className="tally-label">{label}</label>
      {children}
    </div>
  )

  const TABS = ['basic', 'party', 'gst', 'bank']

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, maxWidth: 680 }}>
      <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700, marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        {isEdit ? 'EDIT LEDGER' : 'CREATE LEDGER'}
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 12, borderBottom: '1px solid #243358' }}>
        {TABS.map(t => (
          <button key={t} className="tally-btn" onClick={() => setTab(t)}
            style={{ borderBottom: tab === t ? '2px solid #FCAF1E' : '2px solid transparent', color: tab === t ? '#FCAF1E' : '#8B9DC3', fontSize: 11, padding: '5px 14px' }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {tab === 'basic' && (
          <div className="tally-panel">
            <F label="Name *"><input className="tally-input" value={form.name} onChange={e => set('name', e.target.value)} autoFocus /></F>
            <F label="Alias"><input className="tally-input" value={form.alias} onChange={e => set('alias', e.target.value)} /></F>
            <F label="Under (Group) *">
              <select className="tally-input" value={form.group} onChange={e => set('group', e.target.value)} style={{ background: '#0D1B33' }}>
                <option value="">Select Group...</option>
                {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
              </select>
            </F>
            <F label="Opening Balance">
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" className="tally-input" value={form.openingBalance} onChange={e => set('openingBalance', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
                <select className="tally-input" value={form.openingBalanceType} onChange={e => set('openingBalanceType', e.target.value)} style={{ width: 60, background: '#0D1B33' }}>
                  <option value="Dr">Dr</option>
                  <option value="Cr">Cr</option>
                </select>
              </div>
            </F>
          </div>
        )}

        {tab === 'party' && (
          <div className="tally-panel">
            <F label="Party Type">
              <select className="tally-input" value={form.partyType} onChange={e => set('partyType', e.target.value)} style={{ background: '#0D1B33' }}>
                <option value="">None</option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="both">Both</option>
              </select>
            </F>
            <F label="Address"><input className="tally-input" value={form.address} onChange={e => set('address', e.target.value)} /></F>
            <F label="State"><input className="tally-input" value={form.state} onChange={e => set('state', e.target.value)} /></F>
            <F label="Phone"><input className="tally-input" value={form.phone} onChange={e => set('phone', e.target.value)} /></F>
            <F label="Email"><input className="tally-input" value={form.email} onChange={e => set('email', e.target.value)} /></F>
            <F label="PAN"><input className="tally-input" value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())} /></F>
          </div>
        )}

        {tab === 'gst' && (
          <div className="tally-panel">
            <F label="GSTIN"><input className="tally-input" value={form.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} /></F>
            <F label="GST Reg. Type">
              <select className="tally-input" value={form.gstRegistrationType} onChange={e => set('gstRegistrationType', e.target.value)} style={{ background: '#0D1B33' }}>
                <option value="">Not Applicable</option>
                <option value="Regular">Regular</option>
                <option value="Composition">Composition</option>
                <option value="Unregistered">Unregistered</option>
                <option value="Consumer">Consumer</option>
                <option value="Overseas">Overseas</option>
              </select>
            </F>
            <F label="Tax Type">
              <select className="tally-input" value={form.taxType} onChange={e => set('taxType', e.target.value)} style={{ background: '#0D1B33' }}>
                <option value="">None</option>
                <option value="GST">GST</option>
                <option value="TDS">TDS</option>
                <option value="TCS">TCS</option>
              </select>
            </F>
            <F label="GST Rate %"><input type="number" className="tally-input" value={form.gstRate} onChange={e => set('gstRate', parseFloat(e.target.value) || 0)} min="0" max="100" /></F>
            <F label="HSN Code"><input className="tally-input" value={form.hsnCode} onChange={e => set('hsnCode', e.target.value)} /></F>
            <F label="SAC Code"><input className="tally-input" value={form.sacCode} onChange={e => set('sacCode', e.target.value)} /></F>
          </div>
        )}

        {tab === 'bank' && (
          <div className="tally-panel">
            <F label="Bank Account No."><input className="tally-input" value={form.bankAccountNumber} onChange={e => set('bankAccountNumber', e.target.value)} /></F>
            <F label="Bank Name"><input className="tally-input" value={form.bankName} onChange={e => set('bankName', e.target.value)} /></F>
            <F label="IFSC Code"><input className="tally-input" value={form.ifscCode} onChange={e => set('ifscCode', e.target.value.toUpperCase())} /></F>
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button type="submit" className="tally-btn primary" disabled={loading}>{loading ? 'Saving...' : 'Ctrl+A  Accept'}</button>
          <button type="button" className="tally-btn" onClick={() => navigate('/masters/ledgers')}>Escape  Cancel</button>
        </div>
      </form>
    </div>
  )
}
