import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'

const fmt = n => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

function Section({ title, items, total, totalLabel, positive }) {
  return (
    <div>
      <div className="tally-section-header" style={{ marginBottom: 0 }}>{title}</div>
      <table className="tally-table">
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="tally-tr">
              <td className="tally-td" style={{ paddingLeft: 16 }}>{item.name}</td>
              <td className="tally-td" style={{ textAlign: 'right', color: positive ? '#34D399' : '#F87171' }}>{fmt(Math.abs(item.amount))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#1A2744' }}>
            <td className="tally-td" style={{ fontWeight: 700 }}>{totalLabel || 'Total'}</td>
            <td className="tally-td" style={{ textAlign: 'right', fontWeight: 700, color: positive ? '#34D399' : '#F87171' }}>{fmt(Math.abs(total))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function ProfitLoss() {
  const { company } = useCompany()
  const now = new Date()
  const fyStart = now.getMonth() >= 3
    ? `${now.getFullYear()}-04-01`
    : `${now.getFullYear() - 1}-04-01`
  const [from, setFrom] = useState(fyStart)
  const [to, setTo] = useState(now.toISOString().slice(0, 10))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!company) return
    setLoading(true)
    try {
      const { data: res } = await api.get('/reports/profit-loss', { params: { company: company._id, from, to } })
      setData(res)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [company, from, to])

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>PROFIT & LOSS — {company?.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="tally-input" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 140 }} />
          <span style={{ color: '#8B9DC3' }}>to</span>
          <input type="date" className="tally-input" value={to} onChange={e => setTo(e.target.value)} style={{ width: 140 }} />
          <button className="tally-btn primary" onClick={load} style={{ fontSize: 11 }}>Refresh</button>
        </div>
      </div>

      {loading ? <div style={{ color: '#8B9DC3' }}>Loading...</div> : !data ? null : (
        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Debit side */}
          <div style={{ border: '1px solid #243358' }}>
            <div style={{ padding: '4px 8px', backgroundColor: '#0F1A2E', color: '#FCAF1E', fontWeight: 700, textAlign: 'center', fontSize: 11 }}>TRADING ACCOUNT — Dr</div>
            <Section title="PURCHASES" items={data.tradingExpenses || []} total={data.tradingExpenses?.reduce((s, i) => s + i.amount, 0) || 0} positive={false} />
            <Section title="GROSS PROFIT C/D" items={[]} total={Math.max(0, data.grossProfit)} totalLabel="Gross Profit c/d" positive={true} />
            <div style={{ backgroundColor: '#243358', padding: '4px 8px', fontSize: 11, fontWeight: 700, textAlign: 'center', color: '#E2E8F0', marginTop: 12 }}>P & L ACCOUNT — Dr</div>
            <Section title="INDIRECT EXPENSES" items={data.otherExpenses || []} total={data.otherExpenses?.reduce((s, i) => s + i.amount, 0) || 0} positive={false} />
            {data.netProfit > 0 && (
              <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#1A3A2A', borderTop: '1px solid #243358' }}>
                <span style={{ color: '#34D399', fontWeight: 700 }}>NET PROFIT</span>
                <span style={{ color: '#34D399', fontWeight: 700 }}>{fmt(data.netProfit)}</span>
              </div>
            )}
          </div>

          {/* Credit side */}
          <div style={{ border: '1px solid #243358' }}>
            <div style={{ padding: '4px 8px', backgroundColor: '#0F1A2E', color: '#FCAF1E', fontWeight: 700, textAlign: 'center', fontSize: 11 }}>TRADING ACCOUNT — Cr</div>
            <Section title="SALES" items={data.tradingIncome || []} total={data.tradingIncome?.reduce((s, i) => s + i.amount, 0) || 0} positive={true} />
            {data.grossProfit < 0 && (
              <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#3A1A1A', borderTop: '1px solid #243358' }}>
                <span style={{ color: '#F87171', fontWeight: 700 }}>GROSS LOSS B/D</span>
                <span style={{ color: '#F87171', fontWeight: 700 }}>{fmt(Math.abs(data.grossProfit))}</span>
              </div>
            )}
            <div style={{ backgroundColor: '#243358', padding: '4px 8px', fontSize: 11, fontWeight: 700, textAlign: 'center', color: '#E2E8F0', marginTop: 12 }}>P & L ACCOUNT — Cr</div>
            <Section title="INDIRECT INCOME" items={data.otherIncome || []} total={data.otherIncome?.reduce((s, i) => s + i.amount, 0) || 0} positive={true} />
            {data.grossProfit > 0 && (
              <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#1A2744', borderTop: '1px solid #243358' }}>
                <span style={{ color: '#E2E8F0' }}>Gross Profit b/d</span>
                <span style={{ color: '#34D399' }}>{fmt(data.grossProfit)}</span>
              </div>
            )}
            {data.netProfit < 0 && (
              <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#3A1A1A', borderTop: '1px solid #243358' }}>
                <span style={{ color: '#F87171', fontWeight: 700 }}>NET LOSS</span>
                <span style={{ color: '#F87171', fontWeight: 700 }}>{fmt(Math.abs(data.netProfit))}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
