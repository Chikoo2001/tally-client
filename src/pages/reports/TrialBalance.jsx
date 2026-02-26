import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

const fmt = n => n.toLocaleString('en-IN', { minimumFractionDigits: 2 })

export default function TrialBalance() {
  const { company } = useCompany()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!company) return
    setLoading(true)
    try {
      const { data: res } = await api.get('/reports/trial-balance', { params: { company: company._id, date } })
      setData(res)
    } catch (err) { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company, date])

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  // Group entries by group name
  const grouped = {}
  if (data) {
    for (const entry of data.entries) {
      if (entry.closingBalance === 0) continue
      const gname = entry.ledger.group?.name || 'Ungrouped'
      if (!grouped[gname]) grouped[gname] = []
      grouped[gname].push(entry)
    }
  }

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>TRIAL BALANCE — {company?.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label className="tally-label">As on</label>
          <input type="date" className="tally-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 140 }} />
          <button className="tally-btn primary" onClick={load} style={{ fontSize: 11 }}>Refresh</button>
        </div>
      </div>

      {loading ? <div style={{ color: '#8B9DC3' }}>Loading...</div> : !data ? null : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table className="tally-table">
            <thead>
              <tr>
                <th className="tally-th" style={{ width: '50%' }}>Particulars</th>
                <th className="tally-th" style={{ textAlign: 'right' }}>Closing Balance</th>
                <th className="tally-th" style={{ textAlign: 'right' }}>Dr</th>
                <th className="tally-th" style={{ textAlign: 'right' }}>Cr</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([gname, entries]) => (
                <>
                  <tr key={gname} style={{ backgroundColor: '#1A2744' }}>
                    <td className="tally-td" colSpan={4} style={{ color: '#FCAF1E', fontWeight: 600, paddingLeft: 8 }}>{gname}</td>
                  </tr>
                  {entries.map(e => (
                    <tr key={e.ledger._id} className="tally-tr">
                      <td className="tally-td" style={{ paddingLeft: 24 }}>{e.ledger.name}</td>
                      <td className="tally-td" style={{ textAlign: 'right' }}>
                        <span className={e.closingType === 'Dr' ? 'amount-dr' : 'amount-cr'}>
                          {fmt(e.closingBalance)} {e.closingType}
                        </span>
                      </td>
                      <td className="tally-td" style={{ textAlign: 'right', color: '#F87171' }}>{e.debitTotal > 0 ? fmt(e.debitTotal) : ''}</td>
                      <td className="tally-td" style={{ textAlign: 'right', color: '#34D399' }}>{e.creditTotal > 0 ? fmt(e.creditTotal) : ''}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#243358' }}>
                <td className="tally-td" style={{ fontWeight: 700, color: '#FCAF1E' }}>TOTAL</td>
                <td className="tally-td" style={{ textAlign: 'right' }}></td>
                <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>
                  <span className="amount-dr">{fmt(data.totalDr)}</span>
                </td>
                <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>
                  <span className="amount-cr">{fmt(data.totalCr)}</span>
                </td>
              </tr>
              <tr style={{ backgroundColor: '#1A2744' }}>
                <td className="tally-td" colSpan={4} style={{ textAlign: 'center' }}>
                  {data.balanced
                    ? <span style={{ color: '#34D399' }}>✓ Trial Balance is BALANCED</span>
                    : <span style={{ color: '#F87171' }}>✗ Difference: {fmt(Math.abs(data.totalDr - data.totalCr))}</span>}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
