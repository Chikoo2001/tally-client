import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

const fmt = n => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

export default function DayBook() {
  const { company } = useCompany()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!company) return
    setLoading(true)
    try {
      const { data } = await api.get('/reports/day-book', { params: { company: company._id, date } })
      setVouchers(data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company, date])

  const totalDr = vouchers.reduce((s, v) => s + v.entries.filter(e => e.type === 'Dr').reduce((a, e) => a + e.amount, 0), 0)

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>DAY BOOK — {company?.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="tally-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 140 }} />
          <button className="tally-btn primary" onClick={load} style={{ fontSize: 11 }}>Refresh</button>
        </div>
      </div>

      {loading ? <div style={{ color: '#8B9DC3' }}>Loading...</div> : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {vouchers.length === 0 ? (
            <div style={{ color: '#8B9DC3', textAlign: 'center', padding: 20 }}>No vouchers for this date</div>
          ) : vouchers.map((v, vi) => (
            <div key={v._id} style={{ marginBottom: 8, border: '1px solid #243358' }}>
              <div style={{ backgroundColor: '#1A2744', padding: '5px 10px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: '#FCAF1E', fontWeight: 700, marginRight: 12 }}>{v.voucherNumber}</span>
                  <span style={{ color: '#8B9DC3', fontSize: 11 }}>{v.voucherType}</span>
                  {v.partyLedger && <span style={{ color: '#E2E8F0', marginLeft: 12 }}>{v.partyLedger.name}</span>}
                </div>
                {v.narration && <span style={{ color: '#8B9DC3', fontSize: 11 }}>{v.narration}</span>}
              </div>
              <table className="tally-table">
                <tbody>
                  {v.entries.map((e, ei) => (
                    <tr key={ei} className="tally-tr">
                      <td className="tally-td" style={{ paddingLeft: 24 }}>{e.ledger?.name || '—'}</td>
                      <td className="tally-td" style={{ textAlign: 'right', width: 120 }}>
                        {e.type === 'Dr' ? <span className="amount-dr">{fmt(e.amount)} Dr</span> : ''}
                      </td>
                      <td className="tally-td" style={{ textAlign: 'right', width: 120 }}>
                        {e.type === 'Cr' ? <span className="amount-cr">{fmt(e.amount)} Cr</span> : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div style={{ padding: '8px 0', borderTop: '1px solid #243358', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#8B9DC3' }}>{vouchers.length} voucher(s)</span>
            <span style={{ color: '#FCAF1E', fontWeight: 700 }}>Total: ₹{fmt(totalDr)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
