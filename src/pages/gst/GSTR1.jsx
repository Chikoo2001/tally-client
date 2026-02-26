import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

const fmt = n => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

const TABS = ['B2B', 'B2CL', 'B2CS', 'HSN']

export default function GSTR1() {
  const { company } = useCompany()
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('B2B')

  const load = async () => {
    if (!company) return
    setLoading(true)
    try {
      const { data: res } = await api.get('/gst/gstr1', { params: { company: company._id, month, year } })
      setData(res)
    } catch { toast.error('Failed to load GSTR-1') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company, month, year])

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>GSTR-1 — {company?.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="tally-input" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 80, background: '#0D1B33' }}>
            {MONTHS.map((m, i) => <option key={i} value={String(i+1).padStart(2,'0')}>{m}</option>)}
          </select>
          <select className="tally-input" value={year} onChange={e => setYear(e.target.value)} style={{ width: 80, background: '#0D1B33' }}>
            {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="tally-btn primary" onClick={load} style={{ fontSize: 11 }}>Refresh</button>
        </div>
      </div>

      <div style={{ display: 'flex', marginBottom: 12, borderBottom: '1px solid #243358' }}>
        {TABS.map(t => (
          <button key={t} className="tally-btn" onClick={() => setTab(t)}
            style={{ borderBottom: tab === t ? '2px solid #FCAF1E' : '2px solid transparent', color: tab === t ? '#FCAF1E' : '#8B9DC3', fontSize: 11 }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <div style={{ color: '#8B9DC3' }}>Loading...</div> : !data ? null : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {tab === 'B2B' && (
            data.b2b.length === 0 ? <div style={{ color: '#8B9DC3', textAlign: 'center', padding: 20 }}>No B2B transactions</div> :
            data.b2b.map((party, pi) => (
              <div key={pi} style={{ marginBottom: 12, border: '1px solid #243358' }}>
                <div style={{ backgroundColor: '#1A2744', padding: '5px 10px' }}>
                  <span style={{ color: '#FCAF1E', fontWeight: 700 }}>{party.partyName}</span>
                  <span style={{ color: '#8B9DC3', marginLeft: 12, fontSize: 11 }}>GSTIN: {party.gstin}</span>
                </div>
                <table className="tally-table">
                  <thead>
                    <tr>
                      <th className="tally-th">Invoice No.</th>
                      <th className="tally-th">Date</th>
                      <th className="tally-th" style={{ textAlign: 'right' }}>Taxable Value</th>
                      <th className="tally-th" style={{ textAlign: 'right' }}>CGST</th>
                      <th className="tally-th" style={{ textAlign: 'right' }}>SGST</th>
                      <th className="tally-th" style={{ textAlign: 'right' }}>IGST</th>
                      <th className="tally-th" style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {party.invoices.map((inv, ii) => (
                      <tr key={ii} className="tally-tr">
                        <td className="tally-td" style={{ color: inv.isCredit ? '#F87171' : '#E2E8F0' }}>{inv.voucherNumber}</td>
                        <td className="tally-td">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                        <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(inv.taxableAmount)}</td>
                        <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(inv.cgstAmount)}</td>
                        <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(inv.sgstAmount)}</td>
                        <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(inv.igstAmount)}</td>
                        <td className="tally-td" style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(inv.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}

          {tab === 'B2CL' && (
            data.b2cl.length === 0 ? <div style={{ color: '#8B9DC3', textAlign: 'center', padding: 20 }}>No B2C Large transactions (>₹2.5L)</div> :
            <table className="tally-table">
              <thead>
                <tr>
                  <th className="tally-th">Invoice No.</th>
                  <th className="tally-th">Date</th>
                  <th className="tally-th">State</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>Taxable Value</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>IGST</th>
                </tr>
              </thead>
              <tbody>
                {data.b2cl.map((inv, i) => (
                  <tr key={i} className="tally-tr">
                    <td className="tally-td">{inv.voucherNumber}</td>
                    <td className="tally-td">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                    <td className="tally-td">{inv.state}</td>
                    <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(inv.taxableAmount)}</td>
                    <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(inv.igstAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'B2CS' && (
            <div className="tally-panel" style={{ maxWidth: 400 }}>
              <div className="tally-section-header" style={{ margin: '-12px -12px 12px' }}>B2C Small Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div className="tally-label">Taxable Value</div><div style={{ textAlign: 'right' }}>₹{fmt(data.b2cs.taxableValue)}</div>
                <div className="tally-label">CGST</div><div style={{ textAlign: 'right' }}>₹{fmt(data.b2cs.cgst)}</div>
                <div className="tally-label">SGST</div><div style={{ textAlign: 'right' }}>₹{fmt(data.b2cs.sgst)}</div>
                <div className="tally-label">IGST</div><div style={{ textAlign: 'right' }}>₹{fmt(data.b2cs.igst)}</div>
              </div>
            </div>
          )}

          {tab === 'HSN' && (
            data.hsnSummary.length === 0 ? <div style={{ color: '#8B9DC3', textAlign: 'center', padding: 20 }}>No HSN data</div> :
            <table className="tally-table">
              <thead>
                <tr>
                  <th className="tally-th">HSN Code</th>
                  <th className="tally-th">Description</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>Qty</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>Taxable Value</th>
                </tr>
              </thead>
              <tbody>
                {data.hsnSummary.map((h, i) => (
                  <tr key={i} className="tally-tr">
                    <td className="tally-td">{h.hsnCode}</td>
                    <td className="tally-td">{h.description}</td>
                    <td className="tally-td" style={{ textAlign: 'right' }}>{h.quantity}</td>
                    <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(h.taxableValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
