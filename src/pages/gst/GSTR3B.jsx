import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

const fmt = n => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

function Row({ label, cgst, sgst, igst, total, highlight }) {
  return (
    <tr className="tally-tr" style={highlight ? { backgroundColor: '#1A2744' } : {}}>
      <td className="tally-td" style={{ fontWeight: highlight ? 700 : 400, color: highlight ? '#FCAF1E' : '#E2E8F0' }}>{label}</td>
      <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(cgst)}</td>
      <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(sgst)}</td>
      <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(igst)}</td>
      <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(total !== undefined ? total : (cgst + sgst + igst))}</td>
    </tr>
  )
}

export default function GSTR3B() {
  const { company } = useCompany()
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!company) return
    setLoading(true)
    try {
      const { data: res } = await api.get('/gst/gstr3b', { params: { company: company._id, month, year } })
      setData(res)
    } catch { toast.error('Failed to load GSTR-3B') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company, month, year])

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>GSTR-3B — {company?.name}</div>
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

      {loading ? <div style={{ color: '#8B9DC3' }}>Loading...</div> : !data ? null : (
        <div style={{ flex: 1, overflow: 'auto', maxWidth: 800 }}>
          <div style={{ marginBottom: 16 }}>
            <div className="tally-section-header" style={{ marginBottom: 0 }}>TABLE 3.1 — OUTWARD SUPPLIES (TAX LIABILITY)</div>
            <table className="tally-table">
              <thead>
                <tr>
                  <th className="tally-th" style={{ width: '40%' }}>Nature of Supplies</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>CGST (₹)</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>SGST (₹)</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>IGST (₹)</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                <Row label="(a) Outward taxable supplies (other than zero rated, nil and exempted)" cgst={data.outward.cgst} sgst={data.outward.sgst} igst={data.outward.igst} />
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#243358' }}>
                  <td className="tally-td" style={{ fontWeight: 700, color: '#FCAF1E' }}>Total Tax Liability</td>
                  <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(data.outward.cgst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(data.outward.sgst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(data.outward.igst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(data.outward.cgst + data.outward.sgst + data.outward.igst)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className="tally-section-header" style={{ marginBottom: 0 }}>TABLE 4 — ITC ELIGIBLE (INPUT TAX CREDIT)</div>
            <table className="tally-table">
              <thead>
                <tr>
                  <th className="tally-th" style={{ width: '40%' }}>Details</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>CGST (₹)</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>SGST (₹)</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>IGST (₹)</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                <Row label="(A) ITC Available - All other ITC" cgst={data.itc.cgst} sgst={data.itc.sgst} igst={data.itc.igst} />
              </tbody>
            </table>
          </div>

          <div className="tally-panel" style={{ maxWidth: 500 }}>
            <div className="tally-section-header" style={{ margin: '-12px -12px 12px' }}>NET TAX PAYABLE</div>
            <table className="tally-table">
              <thead>
                <tr>
                  <th className="tally-th">Tax Head</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>Liability</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>ITC</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>Net Payable</th>
                </tr>
              </thead>
              <tbody>
                <tr className="tally-tr">
                  <td className="tally-td">CGST</td>
                  <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(data.outward.cgst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(data.itc.cgst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right' }}><span className={data.netPayable.cgst > 0 ? 'amount-dr' : 'amount-cr'}>{fmt(data.netPayable.cgst)}</span></td>
                </tr>
                <tr className="tally-tr">
                  <td className="tally-td">SGST/UTGST</td>
                  <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(data.outward.sgst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(data.itc.sgst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right' }}><span className={data.netPayable.sgst > 0 ? 'amount-dr' : 'amount-cr'}>{fmt(data.netPayable.sgst)}</span></td>
                </tr>
                <tr className="tally-tr">
                  <td className="tally-td">IGST</td>
                  <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(data.outward.igst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right' }}>{fmt(data.itc.igst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right' }}><span className={data.netPayable.igst > 0 ? 'amount-dr' : 'amount-cr'}>{fmt(data.netPayable.igst)}</span></td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#243358' }}>
                  <td className="tally-td" style={{ fontWeight: 700, color: '#FCAF1E' }}>TOTAL</td>
                  <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(data.outward.cgst + data.outward.sgst + data.outward.igst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(data.itc.cgst + data.itc.sgst + data.itc.igst)}</td>
                  <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}><span className={data.netPayable.total > 0 ? 'amount-dr' : 'amount-cr'}>{fmt(data.netPayable.total)}</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
