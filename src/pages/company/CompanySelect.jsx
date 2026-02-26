import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

export default function CompanySelect() {
  const navigate = useNavigate()
  const { selectCompany, company: activeCompany } = useCompany()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/companies').then(r => { setCompanies(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleSelect = (c) => {
    selectCompany(c)
    toast.success(`Loaded: ${c.name}`)
    navigate('/')
  }

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <div style={{ color: '#FCAF1E', fontSize: 14, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        SELECT COMPANY
      </div>

      {loading ? (
        <div style={{ color: '#8B9DC3' }}>Loading...</div>
      ) : companies.length === 0 ? (
        <div style={{ color: '#8B9DC3', marginBottom: 16 }}>
          No companies found.{' '}
          <button className="tally-btn primary" onClick={() => navigate('/company/setup')} style={{ fontSize: 11 }}>
            Create Company
          </button>
        </div>
      ) : (
        <div style={{ border: '1px solid #243358' }}>
          {companies.map((c, idx) => (
            <div
              key={c._id}
              onClick={() => handleSelect(c)}
              style={{
                padding: '10px 14px',
                borderBottom: idx < companies.length - 1 ? '1px solid #243358' : 'none',
                cursor: 'pointer',
                backgroundColor: activeCompany?._id === c._id ? '#1E2F4D' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1E2F4D'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = activeCompany?._id === c._id ? '#1E2F4D' : 'transparent'}
            >
              <div>
                <div style={{ color: '#E2E8F0', fontWeight: 600 }}>{c.name}</div>
                {c.gstin && <div style={{ color: '#8B9DC3', fontSize: 11 }}>GSTIN: {c.gstin}</div>}
                {c.state && <div style={{ color: '#8B9DC3', fontSize: 11 }}>{c.state}</div>}
              </div>
              {activeCompany?._id === c._id && (
                <span style={{ color: '#34D399', fontSize: 11 }}>● Active</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className="tally-btn primary" onClick={() => navigate('/company/setup')} style={{ fontSize: 12 }}>
          Create New Company
        </button>
        <button className="tally-btn" onClick={() => navigate('/')} style={{ fontSize: 12 }}>Cancel</button>
      </div>
    </div>
  )
}
