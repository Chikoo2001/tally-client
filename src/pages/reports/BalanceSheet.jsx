import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

const fmt = n => Math.abs(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

function GroupRow({ node, depth = 0 }) {
  const [open, setOpen] = useState(true)
  const balance = Math.abs(node.balance || 0)
  if (balance < 0.01 && !node.children?.length) return null
  return (
    <>
      <tr className="tally-tr" onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        <td className="tally-td" style={{ paddingLeft: 8 + depth * 16 }}>
          {node.children?.length > 0 && <span style={{ color: '#8B9DC3', marginRight: 6 }}>{open ? '▼' : '▶'}</span>}
          <span style={{ fontWeight: depth === 0 ? 700 : 400, color: depth === 0 ? '#E2E8F0' : '#E2E8F0' }}>{node.name}</span>
        </td>
        <td className="tally-td" style={{ textAlign: 'right', fontWeight: depth === 0 ? 700 : 400 }}>
          {balance > 0.01 ? fmt(balance) : ''}
        </td>
      </tr>
      {open && node.children?.map(child => <GroupRow key={child._id} node={child} depth={depth + 1} />)}
      {open && node.ledgers?.map(e => (
        <tr key={e.ledger._id} className="tally-tr">
          <td className="tally-td" style={{ paddingLeft: 8 + (depth + 1) * 16, color: '#8B9DC3' }}>{e.ledger.name}</td>
          <td className="tally-td" style={{ textAlign: 'right', color: '#8B9DC3' }}>{e.closingBalance > 0.01 ? fmt(e.closingBalance) : ''}</td>
        </tr>
      ))}
    </>
  )
}

export default function BalanceSheet() {
  const { company } = useCompany()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!company) return
    setLoading(true)
    try {
      const { data: res } = await api.get('/reports/balance-sheet', { params: { company: company._id, date } })
      setData(res)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company, date])

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>BALANCE SHEET — {company?.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label className="tally-label">As on</label>
          <input type="date" className="tally-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 140 }} />
          <button className="tally-btn primary" onClick={load} style={{ fontSize: 11 }}>Refresh</button>
        </div>
      </div>

      {loading ? <div style={{ color: '#8B9DC3' }}>Loading...</div> : !data ? null : (
        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Liabilities */}
          <div style={{ border: '1px solid #243358' }}>
            <div className="tally-section-header">LIABILITIES & CAPITAL</div>
            <table className="tally-table">
              <thead><tr>
                <th className="tally-th">Particulars</th>
                <th className="tally-th" style={{ textAlign: 'right' }}>Amount (₹)</th>
              </tr></thead>
              <tbody>
                {data.liabilities?.map(g => <GroupRow key={g._id} node={g} />)}
                {data.netProfit > 0 && (
                  <tr style={{ backgroundColor: '#1A2744' }}>
                    <td className="tally-td" style={{ fontWeight: 600, color: '#34D399' }}>Net Profit (P&L)</td>
                    <td className="tally-td" style={{ textAlign: 'right', fontWeight: 600 }}><span className="amount-cr">{fmt(data.netProfit)}</span></td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#243358' }}>
                  <td className="tally-td" style={{ fontWeight: 700, color: '#FCAF1E' }}>TOTAL</td>
                  <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt((data.totalLiabilities || 0) + Math.max(0, data.netProfit || 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Assets */}
          <div style={{ border: '1px solid #243358' }}>
            <div className="tally-section-header">ASSETS</div>
            <table className="tally-table">
              <thead><tr>
                <th className="tally-th">Particulars</th>
                <th className="tally-th" style={{ textAlign: 'right' }}>Amount (₹)</th>
              </tr></thead>
              <tbody>
                {data.assets?.map(g => <GroupRow key={g._id} node={g} />)}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#243358' }}>
                  <td className="tally-td" style={{ fontWeight: 700, color: '#FCAF1E' }}>TOTAL</td>
                  <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(data.totalAssets || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
