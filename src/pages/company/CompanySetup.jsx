import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
  'Chandigarh','Puducherry','Andaman & Nicobar','Dadra & Nagar Haveli','Lakshadweep',
]

export default function CompanySetup() {
  const navigate = useNavigate()
  const { selectCompany } = useCompany()
  const [form, setForm] = useState({
    name: '', alias: '', address: '', state: '', stateCode: '',
    pan: '', gstin: '', cin: '', currency: 'INR',
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Company name is required')
    setLoading(true)
    try {
      const { data } = await api.post('/companies', form)
      selectCompany(data)
      toast.success(`Company "${data.name}" created`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create company')
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

  return (
    <div style={{ padding: 20, maxWidth: 640 }}>
      <div style={{ color: '#FCAF1E', fontSize: 14, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        CREATE COMPANY
      </div>

      <form onSubmit={handleSubmit}>
        <div className="tally-panel" style={{ marginBottom: 12 }}>
          <div className="tally-section-header" style={{ margin: '-12px -12px 12px' }}>Basic Information</div>
          <F label="Company Name *"><input className="tally-input" value={form.name} onChange={e => set('name', e.target.value)} autoFocus /></F>
          <F label="Alias"><input className="tally-input" value={form.alias} onChange={e => set('alias', e.target.value)} /></F>
          <F label="Address"><input className="tally-input" value={form.address} onChange={e => set('address', e.target.value)} /></F>
          <F label="State">
            <select className="tally-input" value={form.state} onChange={e => set('state', e.target.value)} style={{ background: '#0D1B33' }}>
              <option value="">Select State</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </F>
          <F label="State Code"><input className="tally-input" value={form.stateCode} onChange={e => set('stateCode', e.target.value)} placeholder="e.g. 29" /></F>
          <F label="Currency">
            <select className="tally-input" value={form.currency} onChange={e => set('currency', e.target.value)} style={{ background: '#0D1B33' }}>
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="AED">AED - UAE Dirham</option>
            </select>
          </F>
        </div>

        <div className="tally-panel" style={{ marginBottom: 12 }}>
          <div className="tally-section-header" style={{ margin: '-12px -12px 12px' }}>Tax & Statutory</div>
          <F label="PAN"><input className="tally-input" value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" /></F>
          <F label="GSTIN"><input className="tally-input" value={form.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} placeholder="29ABCDE1234F1Z5" /></F>
          <F label="CIN"><input className="tally-input" value={form.cin} onChange={e => set('cin', e.target.value)} /></F>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="tally-btn primary" disabled={loading}>
            {loading ? 'Creating...' : 'Ctrl+A  Accept'}
          </button>
          <button type="button" className="tally-btn" onClick={() => navigate('/')}>Escape  Cancel</button>
        </div>
      </form>
    </div>
  )
}
