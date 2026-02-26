import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

const fmt = n => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

export default function CashBook() {
  const { company } = useCompany()
  const now = new Date()
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const [from, setFrom] = useState(firstOfMonth)
  const [to, setTo] = useState(now.toISOString().slice(0, 10))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!company) return
    setLoading(true)
    try {
      const { data: res } = await api.get('/reports/cash-book', { params: { company: company._id, from, to } })
      setData(res)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company, from, to])

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>CASH BOOK — {company?.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="tally-input" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 140 }} />
          <span style={{ color: '#8B9DC3' }}>to</span>
          <input type="date" className="tally-input" value={to} onChange={e => setTo(e.target.value)} style={{ width: 140 }} />
          <button className="tally-btn primary" onClick={load} style={{ fontSize: 11 }}>Refresh</button>
        </div>
      </div>

      {loading ? <div style={{ color: '#8B9DC3' }}>Loading...</div> : !data ? null : (
        <>
          <div style={{ marginBottom: 8, display: 'flex', gap: 20 }}>
            <span style={{ color: '#8B9DC3' }}>Opening Balance: <span style={{ color: data.openingBalance >= 0 ? '#34D399' : '#F87171', fontWeight: 600 }}>₹{fmt(Math.abs(data.openingBalance))}</span></span>
            <span style={{ color: '#8B9DC3' }}>Closing Balance: <span style={{ color: data.closingBalance >= 0 ? '#34D399' : '#F87171', fontWeight: 600 }}>₹{fmt(Math.abs(data.closingBalance))}</span></span>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table className="tally-table">
              <thead>
                <tr>
                  <th className="tally-th">Date</th>
                  <th className="tally-th">Voucher No.</th>
                  <th className="tally-th">Type</th>
                  <th className="tally-th">Narration</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>Dr (Receipt)</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>Cr (Payment)</th>
                  <th className="tally-th" style={{ textAlign: 'right' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((t, i) => (
                  <tr key={i} className="tally-tr">
                    <td className="tally-td">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                    <td className="tally-td">{t.voucherNumber}</td>
                    <td className="tally-td" style={{ color: '#8B9DC3' }}>{t.voucherType}</td>
                    <td className="tally-td">{t.narration || '—'}</td>
                    <td className="tally-td" style={{ textAlign: 'right' }}>{t.debit > 0 ? <span className="amount-cr">{fmt(t.debit)}</span> : ''}</td>
                    <td className="tally-td" style={{ textAlign: 'right' }}>{t.credit > 0 ? <span className="amount-dr">{fmt(t.credit)}</span> : ''}</td>
                    <td className="tally-td" style={{ textAlign: 'right' }}>
                      <span className={t.balance >= 0 ? 'amount-cr' : 'amount-dr'}>{fmt(Math.abs(t.balance))} {t.balance >= 0 ? 'Dr' : 'Cr'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
